import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";
import { SessionShell } from "../components/session-shell";

export function NewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { message?: string } | null;

  useEffect(() => {
    if (!state?.message) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.message) return null;

  return (
    <SessionShell onSubmit={() => {}} inputDisabled loading>
      <UserMessage message={state.message} />

      <BotMessage
        content="This is a sample bot response message."
        model="fabel-5"
      />

      <ErrorMessage message="Sample error message and such" />
    </SessionShell>
  );
}
