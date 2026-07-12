import { SUPPORTED_CHAT_MODELS } from "@pneuma/shared";
import {
  AgentDialogContext,
  SessionDialogContent,
  ThemeDialogContent,
} from "../dialogs";
import { ModelsDialogContext } from "../dialogs";
import type { Command } from "./types";

export const COMMANDS: Command[] = [
  {
    name: "new",
    description: "Start a new conversation",
    value: "/new",
    action: (context) => {
      context.navigate("/");
    },
  },
  {
    name: "agents",
    description: "Switch agents",
    value: "/agents",
    action: (context) => {
      context.dialog.open({
        title: "Select Agent",
        children: (
          <AgentDialogContext
            currentMode={context.mode}
            onSelectMode={context.setMode}
          />
        ),
      });
    },
  },
  {
    name: "models",
    description: "Select AI model for generation",
    value: "/models",
    action: (context) => {
      context.dialog.open({
        title: "Select Model",
        children: (
          <ModelsDialogContext
            models={SUPPORTED_CHAT_MODELS.map((model) => model.id)}
            onSelectModel={context.setModel}
          />
        ),
      });
    },
  },
  {
    name: "sessions",
    description: "Browse past sessions",
    value: "/sessions",
    action: (context) => {
      context.dialog.open({
        title: "Sessions",
        children: <SessionDialogContent />,
      });
    },
  },
  {
    name: "theme",
    description: "Change color theme",
    value: "/theme",
    action: (context) => {
      context.dialog.open({
        title: "Select theme",
        children: <ThemeDialogContent />,
      });
    },
  },
  {
    name: "login",
    description: "Sign in with your browser",
    value: "/login",
  },
  {
    name: "logout",
    description: "Sign out of your account",
    value: "/logout",
  },
  {
    name: "upgrade",
    description: "Buy more credits",
    value: "/upgrade",
  },
  {
    name: "usage",
    description: "Open billing portal in your browser",
    value: "/usage",
  },
  {
    name: "exit",
    description: "Quit the application",
    value: "/exit",
    action: (context) => {
      context.exit();
    },
  },
];
