import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import {
  DEFAULT_THEME,
  THEMES,
  type Theme,
  type ThemeColors,
} from "../../components/theme";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

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

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    persistTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ colors: currentTheme.colors, currentTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
