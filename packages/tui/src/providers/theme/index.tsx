import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".pneuma");
const THEME_CONFIG_PATH = join(CONFIG_DIR, "config.json");

type ThemePreference = {
  themeName: string;
};
