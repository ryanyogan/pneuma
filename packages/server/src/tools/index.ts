import type { Mode } from "@pneuma/database/enums";
import { createReadFileTool } from "./read-file";
import { createListDirectoryTool } from "./list-directory";
import { createGrepTool } from "./grep";
import { createGlobTool } from "./glob";
import { createWriteFileTool } from "./write-file";
import { creaateEditFileTool } from "./edit-file";
import { createBashTool } from "./bash";

export function createTools(cwd: string, mode: Mode) {
  const reaaOnlyTools = {
    readFile: createReadFileTool(cwd),
    listDirectory: createListDirectoryTool(cwd),
    grep: createGrepTool(cwd),
    glob: createGlobTool(cwd),
  };

  if (mode === "PLAN") {
    return reaaOnlyTools;
  }

  return {
    ...reaaOnlyTools,
    writeFile: createWriteFileTool(cwd),
    editFile: creaateEditFileTool(cwd),
    bash: createBashTool(cwd),
  };
}
