# pneuma

A terminal coding agent built from scratch, as a way to learn how these tools work. Second iteration of [nightcode](https://github.com/ryanyogan/nightcode).

**Status: prototype.** It runs locally for one user. There are no tests, no auth, and no packaged release.

## What works today

- A terminal UI (React on OpenTUI) that talks to a local Hono server over HTTP and server-sent events.
- A streaming agent loop on the Vercel AI SDK (`streamText`), capped at 50 steps per request, with Anthropic and OpenAI models.
- Seven tools scoped to the session's working directory: `readFile`, `listDirectory`, `grep`, `glob`, `writeFile`, `editFile`, `bash`.
- Two modes. **Plan** gets only the four read-only tools. **Build** gets all seven.
- Sessions and messages stored in PostgreSQL through Prisma, so a session can be reopened.
- Interrupting a response, switching models, and switching themes from the command menu.

## What is not implemented

- **Memory.** Nothing persists between sessions beyond the saved message history; there is no long-term or cross-session memory.
- Approval prompts. In Build mode the `bash` tool runs commands without asking, so only point it at a directory you are willing to have changed.
- Accounts. The `/login`, `/logout`, `/upgrade` and `/usage` menu entries are placeholders; every session belongs to a hard-coded mock user.

## Running it

Requires [Bun](https://bun.sh), a PostgreSQL database, and an `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` in the environment.

```sh
cp .env.example .env        # set DATABASE_URL; API_URL defaults to http://localhost:3000
bun install                 # also generates the Prisma client
cd packages/database && bunx prisma db push && cd ../..   # create the tables (no migrations are committed)

bun run dev:server          # API on port 3000
bun run dev:tui             # in a second terminal
```

## Layout

```
packages/
  tui/        terminal UI
  server/     Hono API, agent loop, tools
  shared/     model list and zod schemas
  database/   Prisma schema and client
```
