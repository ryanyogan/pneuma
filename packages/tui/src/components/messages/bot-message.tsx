import { Mode } from "@pneuma/database/enums";
import type { ClientMessagePart } from "../../hooks/use-chat";
import { useTheme } from "../../providers/theme";
import { TextAttributes } from "@opentui/core";

export function BotMessage({
  model,
  parts,
  mode,
  duration,
  streaming = false,
  interrupted = false,
}: {
  model: string;
  parts: ClientMessagePart[];
  mode: Mode;
  duration?: string;
  streaming?: boolean;
  interrupted?: boolean;
}) {
  const { colors } = useTheme();
  const text = parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <box width="100%" alignItems="center">
      <box paddingY={1} width="100%">
        <box paddingX={3} width="100%">
          <text fg={colors.text}>{text}</text>
        </box>
      </box>

      <box paddingX={3} paddingBottom={1} gap={1} width="100%">
        <box flexDirection="row" gap={1}>
          <text
            attributes={interrupted ? TextAttributes.DIM : 0}
            fg={
              interrupted
                ? undefined
                : mode === Mode.PLAN
                  ? colors.planMode
                  : colors.primary
            }
          >
            ◉
          </text>
          <box flexDirection="row" gap={1}>
            <text
              fg={colors.textMuted}
              attributes={interrupted ? TextAttributes.DIM : 0}
            >
              {mode === Mode.PLAN ? "Plan" : "Build"}
            </text>
            <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              &gt;
            </text>
            <text attributes={TextAttributes.DIM} fg={colors.textMuted}>
              {model}
            </text>
            {(duration || interrupted) && (
              <>
                <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
                  &gt;
                </text>
                <text attributes={TextAttributes.DIM} fg={colors.textMuted}>
                  {interrupted ? "interrupted" : duration}
                </text>
              </>
            )}
          </box>
        </box>
      </box>
    </box>
  );
}
