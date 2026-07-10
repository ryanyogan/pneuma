import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";
import type { SessionChrome } from "../layouts/session-layout";
import { z } from "zod";
import { useToast } from "../providers/toast";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-error";
import type { InferResponseType } from "hono";

type SessionData = InferResponseType<
  (typeof apiClient.sessions)[":id"]["$get"],
  200
>;

const sessionLocationSchema = z.object({
  session: z.custom<SessionData>(
    (val) => val != null && typeof val === "object" && "id" in val,
  ),
});

function ChatMessage({ msg }: { msg: SessionData["messages"][number] }) {
  switch (msg.role) {
    case "USER": {
      return <UserMessage message={msg.content} />;
    }

    case "ERROR": {
      return <ErrorMessage message={msg.content} />;
    }

    default: {
      return <BotMessage content={msg.content} model={msg.model} />;
    }
  }
}

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { setLoading } = useOutletContext<SessionChrome>();

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

  // Drive the shared shell's spinner: pending until the session is loaded.
  useEffect(() => {
    setLoading(!session);
  }, [session, setLoading]);

  // The shell lives in SessionLayout; while loading it already shows the
  // spinner, so render nothing until the session resolves.
  if (!session) return null;

  return (
    <>
      {session.messages.map((message) => (
        <ChatMessage key={message.id} msg={message} />
      ))}
    </>
  );
}
