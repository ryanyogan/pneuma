import type { AppType } from "@pneuma/server";
import { hc } from "hono/client";

export const apiClient = hc<AppType>(
  process.env.API_URL ?? "http://localhost:3000",
);
