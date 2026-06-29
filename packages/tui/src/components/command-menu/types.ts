import type { ToastContextValue } from "../../providers/toast";

export type CommandContext = {
  exit: () => void;
  toast: ToastContextValue;
};

export type Command = {
  name: string;
  description: string;
  value: string;
  action?: (context: CommandContext) => void | Promise<void>;
};
