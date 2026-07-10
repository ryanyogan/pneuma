import { zValidator } from "@hono/zod-validator";
import { findSupportedChatModel } from "@pneuma/shared";
import { Hono } from "hono";
import { z } from "zod";

type Message = {
  id: string;
  role: string;
  content: string;
  mode: string;
  model: string;
  status: string;
  parts: null;
  duration: null;
  createdAt: string;
  sessionId: string;
};

type Session = {
  id: string;
  title: string;
  cwd: string | null;
  userId: string;
  createdAt: string;
  messages: Message[];
};

const sessions: Session[] = [];
let nextId = 1;

const createSessionSchema = z.object({
  title: z.string(),
  cwd: z.string().optional(),
  initialMessage: z
    .object({
      role: z.string(),
      content: z.string(),
      mode: z.string(),
      model: z
        .string()
        .refine((id) => !!findSupportedChatModel(id), "Unsupported model"),
    })
    .optional(),
});

const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  },
);

const app = new Hono()
  .get("/", (c) => {
    return c.json(
      sessions.map(({ id, title, createdAt }) => ({ id, title, createdAt })),
    );
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const session = sessions.find((session) => session.id === id);

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {
    const { initialMessage, ...data } = c.req.valid("json");

    const id = String(nextId++);
    const now = new Date().toISOString();

    const messages: Message[] = [];
    if (initialMessage) {
      messages.push({
        id: String(nextId++),
        role: initialMessage.role,
        content: initialMessage.content,
        mode: initialMessage.mode,
        model: initialMessage.model,
        status: "COMPLETE",
        parts: null,
        duration: null,
        createdAt: now,
        sessionId: id,
      });
    }

    const session: Session = {
      id,
      title: data.title,
      cwd: data.cwd ?? null,
      userId: "mock-user",
      createdAt: now,
      messages,
    };

    sessions.push(session);
    return c.json(session, 201);
  });

export default app;
