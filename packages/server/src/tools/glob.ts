import { tool } from "ai";
import { resolve } from "bun";
import { relative } from "path";
import z from "zod";

const MAX_RESULTS = 200;

export function createGlobTool(cwd: string) {
  return tool({
    description: `Find files matching a glob pattern.  Returns file paths relative to the object
    root.  Skipps node_modules and hidden directories.`,
    inputSchema: z.object({
      pattern: z
        .string()
        .describe("Glob pattern to match (e.g. '**/*.ts', 'src/**/*.tsx')"),
      path: z
        .string()
        .describe("Relative directory to search in (defaults to project root)")
        .default("."),
    }),
    execute: async ({ path, pattern }) => {
      const resolved = await resolve(cwd, path);
      if (!resolved.startsWith(cwd)) {
        return { error: "Path is outside the project directory" };
      }

      try {
        const glob = new Bun.Glob(pattern);
        const files: string[] = [];
        let truncated = false;

        for await (const match of glob.scan({
          cwd: resolved,
          dot: false,
          onlyFiles: true,
        })) {
          if (match.includes("node_modules")) continue;

          if (files.length >= MAX_RESULTS) {
            truncated = true;
            break;
          }

          const absPath = await resolve(resolved, match);
          files.push(relative(cwd, absPath));

          files.sort();

          return {
            files,
            ...(truncated ? { truncated: true } : {}),
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `Failed to execute command: ${message}` };
      }
    },
  });
}
