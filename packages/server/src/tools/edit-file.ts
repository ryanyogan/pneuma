import { tool } from "ai";
import { resolve } from "bun";
import z from "zod";

export function creaateEditFileTool(cwd: string) {
  return tool({
    description: `Make a targeted edit to a file by replacing an exact string match.  The oldString
    must appear exactly once in the file (for safety).  Ue this for surgical edits
    instead of rewriting the entire file`,
    inputSchema: z.object({
      path: z.string().describe("Relative path to the file to edit"),
      oldString: z
        .string()
        .describe(
          "The exact text to find and replace (must be unique in the file)",
        ),
      newString: z.string().describe("The text to replace it with"),
    }),
    execute: async ({ path, oldString, newString }) => {
      const resolved = await resolve(cwd, path);
      if (!resolved.startsWith(cwd)) {
        return { error: "Path is outide the project directory" };
      }

      try {
        const file = Bun.file(resolved);
        const content = await file.text();
        const occurrences = content.split(oldString).length - 1;

        if (occurrences === 0) {
          return { error: "oldString not found in file" };
        }

        if (occurrences > 1) {
          return {
            error: `oldString is ambigious - found ${occurrences} matches. Provide
            more surrounding context to make it unique.`,
          };
        }

        const updated = content.replace(oldString, newString);

        Bun.write(resolved, updated);

        return {
          success: true as const,
          path: resolve(cwd, resolved),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `Failed to edit file: ${message}` };
      }
    },
  });
}
