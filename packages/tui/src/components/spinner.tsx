import "opentui-spinner/react";
import { useTheme } from "../providers/theme";
import { Mode } from "@pneuma/database/enums";

export function Spinner({ mode = Mode.BUILD }: { mode?: Mode }) {
  const { colors } = useTheme();
  const activeColor = mode === Mode.PLAN ? colors.planMode : colors.primary;
  return <spinner name="aesthetic" color={activeColor} />;
}
