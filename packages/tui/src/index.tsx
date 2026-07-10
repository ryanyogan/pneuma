import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { RootLayout } from "./layouts/root-layout";
import { SessionLayout } from "./layouts/session-layout";
import { Home } from "./screens/home";
import { NewSession } from "./screens/new-session";
import { Session } from "./screens/session";

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      // Pathless layout route: SessionLayout (and its scrollbox) stays mounted
      // across the new -> session transition, so the scrollbox is never torn
      // down and rebuilt — eliminating the scrollbar flicker on navigation.
      {
        element: <SessionLayout />,
        children: [
          { path: "sessions/new", element: <NewSession /> },
          { path: "sessions/:id", element: <Session /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

const renderer = await createCliRenderer({
  // Required so the terminal reports modifiers (shift/ctrl/alt) on keys like
  // Enter. Without `disambiguate`, Shift+Enter is indistinguishable from Enter
  useKittyKeyboard: {
    disambiguate: true,
    alternateKeys: true,
  },
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 20,
  },
  targetFps: 60,
  exitOnCtrlC: false,
});
createRoot(renderer).render(<App />);
