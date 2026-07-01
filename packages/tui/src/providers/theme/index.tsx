import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import {
  DEFAULT_THEME,
  THEMES,
  type Theme,
  type ThemeColors,
} from "../../components/theme";

const CONFIG_DIR = join(homedir(), ".pneuma");
const THEME_CONFIG_PATH = join(CONFIG_DIR, "config.json");

type ThemePreference = {
  themeName: string;
};

function getInitialTheme(): Theme {
  try {
    const config = JSON.parse(
      readFileSync(THEME_CONFIG_PATH, "utf8"),
    ) as Partial<ThemePreference>;

    const savedTheme = THEMES.find((theme) => theme.name === config.themeName);
    return savedTheme ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function persistTheme(theme: Theme) {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });

    writeFileSync(
      THEME_CONFIG_PATH,
      JSON.stringify(
        { themeName: theme.name } satisfies ThemePreference,
        null,
        2,
      ),
      "utf8",
    );
  } catch {
    // ignore write failures
  }
}

type ThemeContextValue = {
  colors: ThemeColors;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
};
