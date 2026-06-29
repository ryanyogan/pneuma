import type { ScrollBoxRenderable } from "@opentui/core";
import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import type { Command } from "./types";
import { getFilteredCommands } from "./filter-commands";
import { useKeyboard } from "@opentui/react";
import { useKeyboardLayer } from "../../providers/keyboard-layer";

type UseCommandMenuReturn = {
  showCommandMenu: boolean;
  filteredCommands: Command[];
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
  handleContentChange: (text: string) => void;
  resolveCommand: (index: number) => Command | undefined;
  setSelectedIndex: (index: number) => void;
};

export function useCommandMenu(): UseCommandMenuReturn {
  // Mirror of the textarea text, kept in sync via handleContentChange. The
  // textarea itself is uncontrolled (OpenTUI owns its buffer); this state only
  // exists to derive the command query below.
  const [inputText, setInputText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const { push, pop, isTopLayer } = useKeyboardLayer();

  const commandQuery =
    showCommandMenu && inputText.startsWith("/") ? inputText.slice(1) : "";

  const filteredCommands = useMemo(
    () => getFilteredCommands(commandQuery),
    [commandQuery],
  );

  const handleContentChange = useCallback((text: string) => {
    setInputText(text);
    setSelectedIndex(0);
    scrollRef.current?.scrollTo(0);

    const prefix = text.startsWith("/") ? text.slice(1) : null;
    if (prefix !== null && !prefix.includes(" ")) {
      setShowCommandMenu(true);
      push("command", () => {
        setShowCommandMenu(false);
        pop("command");
        return true;
      });
    } else {
      setShowCommandMenu(false);
      pop("command");
    }
  }, []);

  const resolveCommand = useCallback(
    (index: number): Command | undefined => {
      const command = filteredCommands[index];
      if (command) {
        setShowCommandMenu(false);
        pop("command");
      }

      return command;
    },
    [filteredCommands],
  );

  useKeyboard((key) => {
    if (!showCommandMenu || !isTopLayer("command")) return;

    switch (key.name) {
      case "escape": {
        key.preventDefault();
        setShowCommandMenu(false);
        pop("command");

        break;
      }

      case "up": {
        key.preventDefault();
        setSelectedIndex((idx) => {
          const newIndex = Math.max(0, idx - 1);
          // keep the highlighted item visible when arrowing past the top edge
          const scrollbox = scrollRef.current;
          if (scrollbox && newIndex < scrollbox.scrollTop) {
            scrollbox.scrollTo(newIndex);
          }

          return newIndex;
        });

        break;
      }

      case "down": {
        key.preventDefault();
        setSelectedIndex((idx) => {
          if (filteredCommands.length === 0) {
            return 0;
          }

          const newIndex = Math.min(filteredCommands.length - 1, idx + 1);
          // keep the highlighted item visible when arrowing past the bottom edge
          const scrollbox = scrollRef.current;
          if (scrollbox) {
            const viewportHeight = scrollbox.viewport.height;
            const visibleEnd = scrollbox.scrollTop + viewportHeight - 1;
            if (newIndex > visibleEnd) {
              scrollbox.scrollTo(newIndex - viewportHeight + 1);
            }
          }

          return newIndex;
        });

        break;
      }
    }
  });

  return {
    showCommandMenu,
    filteredCommands,
    selectedIndex,
    scrollRef,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
  };
}
