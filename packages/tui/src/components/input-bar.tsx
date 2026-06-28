import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { StatusBar } from "./status-bar";
import { CommandMenu } from "./command-menu";
import { useCallback, useRef } from "react";
import { useRenderer } from "@opentui/react";
import { useCommandMenu } from "./command-menu/use-command-menu";
import type { Command } from "./command-menu/types";

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
  const textareaRef = useRef<TextareaRenderable>(null);
  const renderer = useRenderer();
  const {
    handleContentChange,
    resolveCommand,
    selectedIndex,
    showCommandMenu,
    scrollRef,
    setSelectedIndex,
    filteredCommands,
  } = useCommandMenu();

  const runCommand = useCallback(
    (command: Command | undefined) => {
      const textarea = textareaRef.current;
      if (!textarea || !command) return;

      textarea.setText("");

      if (command.action) {
        command.action({ exit: () => renderer.destroy() });
      } else {
        textarea.insertText(command.value + " ");
      }
    },
    [renderer],
  );

  const handleCommandExecute = useCallback(
    (index: number) => {
      runCommand(resolveCommand(index));
    },
    [runCommand, resolveCommand],
  );

  const handleContentChangeEvent = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    handleContentChange(textarea.plainText);
  }, [handleContentChange]);

  // Single submit path: when the menu is open, Enter runs the highlighted
  // command (same operation as clicking it); otherwise it submits the text.
  const handleSubmit = useCallback(() => {
    if (disabled) return;

    if (showCommandMenu) {
      handleCommandExecute(selectedIndex);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.plainText.trim();
    if (text.length === 0) return;

    onSubmit(text);
    textarea.setText("");
  }, [
    disabled,
    showCommandMenu,
    handleCommandExecute,
    selectedIndex,
    onSubmit,
  ]);

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
          {showCommandMenu && (
            <box
              position="absolute"
              bottom="100%"
              left={0}
              width="100%"
              backgroundColor="#1A1A24"
              zIndex={10}
            >
              <CommandMenu
                selectedIndex={selectedIndex}
                scrollRef={scrollRef}
                onSelect={setSelectedIndex}
                onExecute={handleCommandExecute}
                commands={filteredCommands}
              />
            </box>
          )}
          <textarea
            ref={textareaRef}
            onSubmit={handleSubmit}
            keyBindings={TEXTAREA_KEY_BINDINGS}
            onContentChange={handleContentChangeEvent}
            focused={!disabled}
            placeholder={`Let's build... "What are we using today?!`}
          />

          <StatusBar />
        </box>
      </box>
    </box>
  );
}
