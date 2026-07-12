import { MessageStatus, Mode, Role } from "@pneuma/database/enums";
import { db } from "@pneuma/database/client";
import { z } from "zod";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";
import { zValidator } from "@hono/zod-validator";
import { streamSSE } from "hono/streaming";
import { streamText } from "ai";
import type { ChatStreamEvent } from "@pneuma/shared";
import { Hono } from "hono";
import type { Context } from "hono";

type StreamParams = {
  sessionId: string;
  model: string;
  history: {
    role: "user" | "assistant";
    content: string;
  }[];
  mode: Mode;
  abortController: AbortController;
};

const mutateSchema = z.object({
  content: z.string(),
  mode: z.enum(Mode),
  model: z.string().refine(isSupportedChatModel, "Unsupported model"),
});

const mutationValidator = zValidator("json", mutateSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

const activeResumeSessions = new Set<string>();

// Upper bound on model turns kept per request. Sending the whole session every
// turn makes each request's memory (and token cost) grow without limit and
// eventually trips the provider's context window. Keep a sliding window of the
// most recent turns instead.
const MAX_HISTORY_MESSAGES = 40;

// Hard cap on concurrent in-flight model streams. Each stream holds the request
// history plus the streamed response (buffered twice by the AI SDK's tee), so
// unbounded fan-out is what turns a traffic burst into a lasting memory plateau.
const MAX_CONCURRENT_STREAMS = 32;

// Count of model streams currently being produced. Bun runs JS on a single
// thread, so plain increments/decrements around the synchronous admission check
// are race-free.
let activeStreamCount = 0;

type ConversationHistory = {
  role: "user" | "assistant";
  content: string;
}[];

function buildConversationHistory(
  messages: {
    role: Role;
    content: string;
    status: MessageStatus;
  }[],
): ConversationHistory {
  return messages.flatMap((message) => {
    if (message.role === "ERROR") return [];
    if (message.role === "ASSISTANT" && message.content.length === 0) return [];

    return [
      {
        role:
          message.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: message.content,
      },
    ];
  });
}

// Trim the history to the most recent MAX_HISTORY_MESSAGES turns. Anthropic (and
// most providers) require the first message to be a user turn, so if the window
// happens to start on an assistant turn we drop leading assistant messages until
// it begins with a user turn.
function windowConversationHistory(
  history: ConversationHistory,
): ConversationHistory {
  if (history.length <= MAX_HISTORY_MESSAGES) return history;

  const windowed = history.slice(-MAX_HISTORY_MESSAGES);
  const firstUserIndex = windowed.findIndex(
    (message) => message.role === "user",
  );

  return firstUserIndex <= 0 ? windowed : windowed.slice(firstUserIndex);
}

function getResumableUserMessage(
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    model: string;
    mode: Mode;
  }[],
) {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "USER") {
    return null;
  }

  return lastMessage;
}

async function streamAIResponse(
  stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
  params: StreamParams,
) {
  const { sessionId, mode, model, history, abortController } = params;
  const startTime = Date.now();
  const resolvedModel = resolveChatModel(model);

  // yeah... it's really that simple
  let fullText = "";

  const persistInterruptedMessage = async () => {
    if (fullText.length === 0) return;

    const elapsedMs = Date.now() - startTime;

    await db.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.INTERRUPTED,
        model,
        content: fullText,
        mode,
        duration: Math.round(elapsedMs / 1_000),
      },
    });
  };

  try {
    const result = streamText({
      model: resolvedModel.model,
      messages: history,
      abortSignal: abortController.signal,
    });

    for await (const part of result.fullStream) {
      if (stream.aborted || abortController.signal.aborted) break;

      if (part.type === "text-delta") {
        fullText += part.text;
        const event: ChatStreamEvent = { type: "text-delta", text: part.text };
        await stream.writeSSE({
          event: "text-delta",
          data: JSON.stringify(event),
        });
      }

      if (part.type === "error") {
        throw part.error;
      }
    }

    if (stream.aborted || abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }

    const elapsedMs = Date.now() - startTime;

    const assistantMessage = await db.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.COMPLETE,
        model,
        content: fullText,
        mode,
        duration: Math.round(elapsedMs / 1000),
      },
    });

    const doneEvent: ChatStreamEvent = {
      type: "done",
      messageId: assistantMessage.id,
      durationMs: elapsedMs,
    };

    await stream.writeSSE({ event: "done", data: JSON.stringify(doneEvent) });
  } catch (error) {
    if (abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }

    const message = error instanceof Error ? error.message : String(error);

    await db.message.create({
      data: {
        sessionId,
        role: "ERROR",
        status: MessageStatus.COMPLETE,
        model,
        content: message,
        mode,
      },
    });

    const errorEvent: ChatStreamEvent = { type: "error", text: message };
    await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) });
  } finally {
    // Ensure the model generation is always torn down. `streamText` runs the
    // provider request in a background task and, via `fullStream`, tees the
    // response into a second branch we never drain — that branch buffers the
    // entire response until the result is collected. Aborting here severs the
    // provider fetch and lets those buffers release promptly instead of
    // lingering (until GC, or up to `idleTimeout` for a half-open connection).
    if (!abortController.signal.aborted) {
      abortController.abort();
    }
  }
}

// Wires up an SSE model stream: accounts for it against the concurrency cap,
// owns the AbortController, and guarantees the counter (and any caller cleanup)
// is released exactly once on every terminal path — success, error, interrupt,
// or a synchronous failure to start the stream.
function runChatStream(
  c: Context,
  params: {
    sessionId: string;
    model: string;
    mode: Mode;
    history: ConversationHistory;
  },
  onSettled?: () => void,
) {
  activeStreamCount++;
  const abortController = new AbortController();

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    activeStreamCount--;
    onSettled?.();
  };

  try {
    return streamSSE(
      c,
      async (stream) => {
        stream.onAbort(() => {
          abortController.abort();
        });

        try {
          await streamAIResponse(stream, { ...params, abortController });
        } finally {
          settle();
        }
      },
      async (err, stream) => {
        settle();
        const message = err instanceof Error ? err.message : String(err);
        const errorEvent: ChatStreamEvent = { type: "error", text: message };
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify(errorEvent),
        });
      },
    );
  } catch (error) {
    settle();
    throw error;
  }
}

const app = new Hono()
  .post("/:sessionId/resume", async (c) => {
    const sessionId = c.req.param("sessionId");
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const resumableMessage = getResumableUserMessage(session.messages);
    if (!resumableMessage) {
      return c.json(
        { error: "Session has no pending user messages to resume" },
        409,
      );
    }

    if (!isSupportedChatModel(resumableMessage.model)) {
      return c.json(
        { error: `Session uses unsupported model: ${resumableMessage.model}` },
        409,
      );
    }

    if (activeResumeSessions.has(sessionId)) {
      return c.json({ error: "Session already has an active resume" }, 409);
    }

    if (activeStreamCount >= MAX_CONCURRENT_STREAMS) {
      return c.json({ error: "Server is busy, please retry shortly" }, 503);
    }

    activeResumeSessions.add(sessionId);

    return runChatStream(
      c,
      {
        sessionId,
        model: resumableMessage.model,
        mode: resumableMessage.mode,
        history: windowConversationHistory(
          buildConversationHistory(session.messages),
        ),
      },
      () => activeResumeSessions.delete(sessionId),
    );
  })
  .post("/:sessionId", mutationValidator, async (c) => {
    const sessionId = c.req.param("sessionId");
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const data = c.req.valid("json");

    // Persist the user turn before the admission check so an overload response
    // never loses the message — it stays resumable via the resume endpoint.
    await db.message.create({
      data: {
        sessionId,
        role: "USER",
        status: MessageStatus.COMPLETE,
        model: data.model,
        content: data.content,
        mode: data.mode,
      },
    });

    if (activeStreamCount >= MAX_CONCURRENT_STREAMS) {
      return c.json({ error: "Server is busy, please retry shortly" }, 503);
    }

    const history = windowConversationHistory(
      buildConversationHistory([
        ...session.messages,
        {
          role: "USER" as const,
          content: data.content,
          status: MessageStatus.COMPLETE,
        },
      ]),
    );

    return runChatStream(c, {
      sessionId,
      model: data.model,
      mode: data.mode,
      history,
    });
  });

export default app;
