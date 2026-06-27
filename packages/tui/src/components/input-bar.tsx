import type { KeyBinding } from "@opentui/core";
import { StatusBar } from "./status-bar";

type Props = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
};

export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
  // Shift+Enter inserts a newline (requires Kitty keyboard protocol; see index.tsx).
  { name: "return", shift: true, action: "newline" },
  { name: "enter", shift: true, action: "newline" },
  // Plain Enter submits.
  { name: "return", action: "submit" },
  { name: "enter", action: "submit" },
];

export function InputBar({ onSubmit, disabled = false }: Props) {
  return (
    <box width="100%" alignItems="center">
      <box width="100%" border={["left"]} borderColor="cyan">
        <box
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          width="100%"
          gap={1}
          backgroundColor="#1A1A24"
        >
          <textarea
            onSubmit={() => onSubmit("asd")}
            keyBindings={TEXTAREA_KEY_BINDINGS}
            focused={!disabled}
            placeholder={`Let's build... "What are we using today?!`}
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
}
