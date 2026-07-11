import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";
import { z } from "zod";
import { useToast } from "../providers/toast";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-error";
import type { InferResponseType } from "hono";
import {
  DEFAULT_CHAT_MODEL_ID,
  type SupportedChatModelId,
} from "@pneuma/shared";
import { useChat, type Message } from "../hooks/use-chat";
import prettyMs from "pretty-ms";
import { SessionShell } from "../components/session-shell";

type SessionData = InferResponseType<
  (typeof apiClient.sessions)[":id"]["$get"],
  200
>;

const sessionLocationSchema = z.object({
  session: z.custom<SessionData>(
    (val) => val != null && typeof val === "object" && "id" in val,
  ),
});

function mapMessages(messages: SessionData["messages"]): Message[] {
  return messages.map((message): Message => {
    if (message.role === "ERROR") {
      return { id: message.id, role: "error", content: message.content };
    }

    if (message.role === "USER") {
      return {
        id: message.id,
        role: "user",
        content: message.content,
        mode: message.mode,
        model: message.model as SupportedChatModelId,
      };
    }

    return {
      id: message.id,
      role: "assistant",
      content: message.content,
      mode: message.mode,
      model: message.model as SupportedChatModelId,
      parts: [{ type: "text", text: message.content }],
      ...(message.duration != null
        ? { duration: prettyMs(message.duration * 1_000) }
        : {}),
    };
  });
}

function ChatMessage({ msg }: { msg: Message }) {
  switch (msg.role) {
    case "user": {
      return <UserMessage message={msg.content} />;
    }

    case "error": {
      return <ErrorMessage message={msg.content} />;
    }

    default: {
      return (
        <BotMessage
          parts={msg.parts}
          model={msg.model}
          mode={msg.mode}
          duration={msg.duration}
          streaming={false}
        />
      );
    }
  }
}

function SessionChat({ session }: { session: SessionData }) {
  const [initialMessages] = useState(() => mapMessages(session.messages));
  const { messages, streaming, submit, abort } = useChat(
    session.id,
    initialMessages,
  );

  useEffect(() => {
    return () => abort();
  }, [abort]);

  return (
    <SessionShell
      onSubmit={(text) =>
        submit({ userText: text, mode: "BUILD", model: DEFAULT_CHAT_MODEL_ID })
      }
      loading={streaming.status === "streaming"}
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} msg={message} />
      ))}

      {streaming.status === "streaming" && streaming.parts.length > 0 && (
        <BotMessage
          parts={streaming.parts}
          model={streaming.model}
          mode={streaming.mode}
          streaming
        />
      )}
    </SessionShell>
  );
}

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const prefetched = useMemo(() => {
    const parsed = sessionLocationSchema.safeParse(location.state);
    return parsed.success ? parsed.data.session : null;
  }, []);

  const [session, setSession] = useState<SessionData | null>(prefetched);

  useEffect(() => {
    if (prefetched) return;
    setSession(null);

    if (!id) return;

    let ignore = false;

    const fetchSession = async () => {
      if (ignore) return;

      try {
        const res = await apiClient.sessions[":id"].$get({
          param: { id },
        });

        if (!res.ok) {
          throw new Error(await getErrorMessage(res));
        }

        setSession(await res.json());
      } catch (error) {
        toast.show({
          variant: "error",
          message:
            error instanceof Error ? error.message : "Failed to load session",
        });

        navigate("/", { replace: true });
      }
    };

    fetchSession();

    return () => {
      ignore = true;
    };
  }, [navigate, toast, id, prefetched]);

  if (!session) {
    return <SessionShell onSubmit={() => {}} inputDisabled loading />;
  }

  return <SessionChat key={session.id} session={session} />;
}
