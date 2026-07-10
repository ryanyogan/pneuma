import { useState } from "react";
import { Outlet } from "react-router";
import { SessionShell } from "../components/session-shell";

export type SessionChrome = {
  /** Toggle the shell's loading spinner from a child route. */
  setLoading: (loading: boolean) => void;
};

/**
 * Persistent chrome for the session flow. Because this layout route wraps both
 * `sessions/new` and `sessions/:id`, its `<scrollbox>` stays mounted across that
 * transition — only the `<Outlet/>` content swaps. That's what removes the
 * scrollbar flicker: the scrollbox is no longer torn down and rebuilt (which
 * re-runs OpenTUI's first-frame visibility toggle) on every navigation.
 */
export function SessionLayout() {
  // Every entry into the session flow starts pending: we're either creating a
  // new session or fetching an existing one. Children flip this to `false`.
  const [loading, setLoading] = useState(true);

  return (
    <SessionShell onSubmit={() => {}} inputDisabled loading={loading}>
      <Outlet context={{ setLoading } satisfies SessionChrome} />
    </SessionShell>
  );
}
