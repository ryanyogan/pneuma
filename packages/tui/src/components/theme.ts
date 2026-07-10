export type ThemeColors = {
  primary: string;
  planMode: string;
  selection: string;
  thinking: string;
  success: string;
  error: string;
  info: string;
  /** Primary foreground for text sitting on `background`/`surface`. */
  text: string;
  /** Secondary/de-emphasized foreground (metadata, descriptions). */
  textMuted: string;
  background: string;
  surface: string;
  dialogSurface: string;
  thinkingBorder: string;
  dimSeparator: string;
};

export type Theme = {
  name: string;
  colors: ThemeColors;
};

export const THEMES: Theme[] = [
  {
    name: "Catppuccin",
    colors: {
      primary: "#89b4fa",
      planMode: "#f5c2e7",
      selection: "#f5e0dc",
      thinking: "#94e2d5",
      success: "#a6e3a1",
      error: "#f38ba8",
      info: "#89b4fa",
      text: "#cdd6f4",
      textMuted: "#a6adc8",
      background: "#1e1e2e",
      surface: "#45475a",
      dialogSurface: "#45475a",
      thinkingBorder: "#585b70",
      dimSeparator: "#585b70",
    },
  },
  {
    name: "Catppuccin Latte",
    colors: {
      primary: "#1e66f5",
      planMode: "#ea76cb",
      selection: "#dc8a78",
      thinking: "#179299",
      success: "#40a02b",
      error: "#d20f39",
      info: "#1e66f5",
      text: "#4c4f69",
      textMuted: "#6c6f85",
      background: "#eff1f5",
      surface: "#bcc0cc",
      dialogSurface: "#bcc0cc",
      thinkingBorder: "#acb0be",
      dimSeparator: "#acb0be",
    },
  },
  {
    name: "Ethereal",
    colors: {
      primary: "#7d82d9",
      planMode: "#c89dc1",
      selection: "#ffcead",
      thinking: "#a3bfd1",
      success: "#92a593",
      error: "#ED5B5A",
      info: "#7d82d9",
      text: "#cdd3f0",
      textMuted: "#8189b5",
      background: "#060B1E",
      surface: "#3C486D",
      dialogSurface: "#3C486D",
      thinkingBorder: "#6d7db6",
      dimSeparator: "#6d7db6",
    },
  },
  {
    name: "Everforest",
    colors: {
      primary: "#7fbbb3",
      planMode: "#d699b6",
      selection: "#d3c6aa",
      thinking: "#83c092",
      success: "#a7c080",
      error: "#e67e80",
      info: "#7fbbb3",
      text: "#d3c6aa",
      textMuted: "#859289",
      background: "#2d353b",
      surface: "#475258",
      dialogSurface: "#475258",
      // Was identical to `surface`, so borders/separators vanished on panels.
      thinkingBorder: "#859289",
      dimSeparator: "#859289",
    },
  },
  {
    name: "Flexoki Light",
    colors: {
      primary: "#205EA6",
      planMode: "#CE5D97",
      selection: "#CECDC3",
      thinking: "#3AA99F",
      success: "#879A39",
      error: "#D14D41",
      info: "#205EA6",
      text: "#100F0F",
      textMuted: "#6F6E69",
      background: "#FFFCF0",
      surface: "#DAD8CE",
      dialogSurface: "#DAD8CE",
      thinkingBorder: "#100F0F",
      dimSeparator: "#100F0F",
    },
  },
  {
    name: "Gruvbox",
    colors: {
      primary: "#7daea3",
      planMode: "#d3869b",
      selection: "#d65d0e",
      thinking: "#89b482",
      success: "#a9b665",
      error: "#ea6962",
      info: "#7daea3",
      text: "#ebdbb2",
      textMuted: "#a89984",
      background: "#282828",
      surface: "#3c3836",
      dialogSurface: "#3c3836",
      // Was identical to `surface`; bumped to bg3 so borders read.
      thinkingBorder: "#665c54",
      dimSeparator: "#665c54",
    },
  },
  {
    name: "Hackerman",
    colors: {
      primary: "#82FB9C",
      planMode: "#86a7df",
      selection: "#ddf7ff",
      thinking: "#7cf8f7",
      success: "#4fe88f",
      // Was #50f872 (green) — indistinguishable from success/primary.
      error: "#ff5555",
      info: "#829dd4",
      text: "#cfefd8",
      textMuted: "#6a6e95",
      background: "#0B0C16",
      surface: "#3E4058",
      dialogSurface: "#3E4058",
      thinkingBorder: "#6a6e95",
      dimSeparator: "#6a6e95",
    },
  },
  {
    name: "Kanagawa",
    colors: {
      primary: "#7e9cd8",
      planMode: "#957fb8",
      selection: "#2d4f67",
      thinking: "#6a9589",
      success: "#76946a",
      error: "#c34043",
      info: "#7e9cd8",
      text: "#dcd7ba",
      textMuted: "#727169",
      background: "#1f1f28",
      // Was #090618 — darker than background, so panels read as holes.
      // Raised to sumiInk4 so surfaces sit above the base.
      surface: "#2a2a37",
      dialogSurface: "#2a2a37",
      thinkingBorder: "#727169",
      dimSeparator: "#727169",
    },
  },
  {
    name: "Lumon",
    colors: {
      primary: "#8bc9eb",
      planMode: "#8bc9eb",
      selection: "#4d9ed3",
      thinking: "#b4e4f6",
      success: "#5e95bc",
      error: "#4d86b0",
      info: "#6fb8e3",
      text: "#d6ecf7",
      textMuted: "#6f9fbd",
      background: "#16242d",
      surface: "#1b2d40",
      dialogSurface: "#1b2d40",
      thinkingBorder: "#304860",
      dimSeparator: "#304860",
    },
  },
  {
    name: "Matte Black",
    colors: {
      primary: "#e68e0d",
      planMode: "#D35F5F",
      selection: "#515151",
      thinking: "#bebebe",
      success: "#FFC107",
      error: "#D35F5F",
      info: "#e68e0d",
      text: "#e0e0e0",
      textMuted: "#8a8a8d",
      background: "#121212",
      surface: "#333333",
      dialogSurface: "#333333",
      thinkingBorder: "#8a8a8d",
      dimSeparator: "#8a8a8d",
    },
  },
  {
    name: "Miasma",
    colors: {
      primary: "#78824b",
      planMode: "#bb7744",
      selection: "#78824b",
      thinking: "#c9a554",
      success: "#5f875f",
      // Was #685742 (muted brown) — did not read as an error.
      error: "#c86a5e",
      info: "#78824b",
      text: "#e6d6a8",
      textMuted: "#8a8168",
      background: "#222222",
      // Was #000000 — darker than background, so panels read as holes.
      surface: "#2e2e2e",
      dialogSurface: "#2e2e2e",
      thinkingBorder: "#666666",
      dimSeparator: "#666666",
    },
  },
  {
    name: "Nord",
    colors: {
      primary: "#81a1c1",
      planMode: "#b48ead",
      selection: "#4c566a",
      thinking: "#88c0d0",
      success: "#a3be8c",
      error: "#bf616a",
      info: "#81a1c1",
      text: "#d8dee9",
      textMuted: "#7b88a1",
      background: "#2e3440",
      surface: "#3b4252",
      dialogSurface: "#3b4252",
      thinkingBorder: "#4c566a",
      dimSeparator: "#4c566a",
    },
  },
  {
    name: "Osaka Jade",
    colors: {
      primary: "#509475",
      planMode: "#D2689C",
      selection: "#C1C497",
      thinking: "#2DD5B7",
      success: "#549e6a",
      error: "#FF5345",
      info: "#509475",
      text: "#cfe3d4",
      textMuted: "#53685B",
      background: "#111c18",
      surface: "#23372B",
      dialogSurface: "#23372B",
      thinkingBorder: "#53685B",
      dimSeparator: "#53685B",
    },
  },
  {
    name: "Retro 82",
    colors: {
      primary: "#faa968",
      planMode: "#3f8f8a",
      selection: "#faa968",
      thinking: "#8cbfb8",
      success: "#028391",
      error: "#f85525",
      info: "#faa968",
      text: "#e6ddcf",
      textMuted: "#7d8aa0",
      background: "#05182e",
      surface: "#303442",
      dialogSurface: "#303442",
      thinkingBorder: "#134e5a",
      dimSeparator: "#134e5a",
    },
  },
  {
    name: "Ristretto",
    colors: {
      primary: "#f38d70",
      planMode: "#a8a9eb",
      selection: "#403e41",
      thinking: "#85dacc",
      success: "#adda78",
      error: "#fd6883",
      info: "#f38d70",
      text: "#e6d9db",
      textMuted: "#948a8b",
      background: "#2c2525",
      surface: "#72696a",
      dialogSurface: "#72696a",
      thinkingBorder: "#948a8b",
      dimSeparator: "#948a8b",
    },
  },
  {
    name: "Rosé Pine",
    colors: {
      primary: "#56949f",
      planMode: "#907aa9",
      selection: "#dfdad9",
      thinking: "#d7827e",
      success: "#286983",
      error: "#b4637a",
      info: "#56949f",
      text: "#575279",
      textMuted: "#797593",
      background: "#faf4ed",
      surface: "#f2e9e1",
      dialogSurface: "#f2e9e1",
      thinkingBorder: "#9893a5",
      dimSeparator: "#9893a5",
    },
  },
  {
    name: "Tokyo Night",
    colors: {
      primary: "#7aa2f7",
      planMode: "#ad8ee6",
      selection: "#7aa2f7",
      thinking: "#449dab",
      success: "#9ece6a",
      error: "#f7768e",
      info: "#7aa2f7",
      text: "#c0caf5",
      textMuted: "#787c99",
      background: "#1a1b26",
      surface: "#32344a",
      dialogSurface: "#32344a",
      thinkingBorder: "#444b6a",
      dimSeparator: "#444b6a",
    },
  },
  {
    name: "Vantablack",
    colors: {
      primary: "#8d8d8d",
      planMode: "#9b9b9b",
      selection: "#ffffff",
      thinking: "#b0b0b0",
      success: "#b6b6b6",
      error: "#a4a4a4",
      info: "#8d8d8d",
      text: "#d6d6d6",
      textMuted: "#8d8d8d",
      background: "#000000",
      surface: "#404040",
      dialogSurface: "#404040",
      thinkingBorder: "#5c5c5c",
      dimSeparator: "#5c5c5c",
    },
  },
  {
    name: "White",
    colors: {
      primary: "#6e6e6e",
      planMode: "#2e2e2e",
      selection: "#1a1a1a",
      thinking: "#3e3e3e",
      success: "#3a3a3a",
      error: "#2a2a2a",
      info: "#1a1a1a",
      text: "#1a1a1a",
      textMuted: "#5e5e5e",
      background: "#ffffff",
      surface: "#c0c0c0",
      dialogSurface: "#c0c0c0",
      // Was #c0c0c0 (== surface); darkened so separators are visible.
      thinkingBorder: "#999999",
      dimSeparator: "#999999",
    },
  },
];

export const DEFAULT_THEME = THEMES.find((theme) => theme.name === "Kanagawa")!;

// --- Color math -----------------------------------------------------------

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Pick whichever of `dark`/`light` reads best on `background`.
 *
 * Callers highlight rows with an arbitrary per-theme `selection` color, which
 * ranges from near-white to near-black. Deriving the text color from the
 * background's contrast means new themes can never introduce an unreadable
 * selected row — the failure mode this replaces (hardcoded `fg="black"`).
 */
export function readableTextColor(
  background: string,
  dark = "#000000",
  light = "#ffffff",
): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light)
    ? dark
    : light;
}
