import type { ReactNode } from "react";
import { useTheme } from "../providers/theme";

export function ThemedRoot({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <box
      height="100%"
      width="100%"
      backgroundColor={colors.background}
      flexGrow={1}
    >
      {children}
    </box>
  );
}
