import type { RefObject } from "react";
import { COMMANDS } from "./commands";
import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { Command } from "./types";
import { useTheme } from "../../providers/theme";

const MAX_VISIBLE_ITEMS = 8;

const COMMAND_COL_WIDTH =
  COMMANDS.reduce((max, command) => Math.max(max, command.name.length), 0) + 4;

type CommandMenuProps = {
  commands: Command[];
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
  onSelect: (index: number) => void;
  onExecute: (index: number) => void;
};

export function CommandMenu({
  commands,
  selectedIndex,
  scrollRef,
  onExecute,
  onSelect,
}: CommandMenuProps) {
  const visibleHeight = Math.min(commands.length, MAX_VISIBLE_ITEMS);
  const { colors } = useTheme();

  if (commands.length === 0) {
    return (
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>No matching commands</text>
      </box>
    );
  }

  return (
    <scrollbox ref={scrollRef} height={visibleHeight}>
      {commands.map((command, idx) => {
        const isSelected = idx === selectedIndex;

        return (
          <box
            key={command.value}
            flexDirection="row"
            paddingX={1}
            height={1}
            overflow="hidden"
            backgroundColor={isSelected ? colors.selection : undefined}
            onMouseMove={() => onSelect(idx)}
            onMouseDown={() => onExecute(idx)}
          >
            <box width={COMMAND_COL_WIDTH} flexShrink={0}>
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                /{command.name}
              </text>
            </box>

            <box flexGrow={1} flexShrink={1} overflow="hidden">
              <text selectable={false} fg={isSelected ? "black" : "gray"}>
                {command.description}
              </text>
            </box>
          </box>
        );
      })}
    </scrollbox>
  );
}
