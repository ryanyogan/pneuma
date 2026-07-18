import { tool } from "ai";
import { resolve } from "bun";
import z from "zod";
import { dirname, relative } from "path";
import { mkdir, writeFile } from "fs/promises";

export function createWriteFileTool(cwd: string) {
  return tool({
    description: `Create or overwrite a file in the project.  Creates parent directories if 
    they do not exist.`,
    inputSchema: z.object({
      path: z.string().describe("Relative path to the file to write"),
      content: z.string().describe("The full content to write to the file"),
    }),
    execute: async ({ path, content }) => {
      const resolved = await resolve(cwd, path);
      if (!resolved.startsWith(cwd)) {
        return { error: "Path is outside the project directory" };
      }

      try {
        await mkdir(dirname(resolved), { recursive: true });
        await writeFile(resolved, content, "utf-8");

        return {
          success: true as const,
          path: relative(cwd, resolved),
          bytesWritten: Buffer.byteLength(content, "utf-8"),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `Failed to execute command: ${message}` };
      }
    },
  });
}
