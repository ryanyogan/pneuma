import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Header } from "./components/header";
import { InputBar } from "./components/input-bar";

function App() {
  return (
    <box
      alignItems="center"
      justifyContent="center"
      backgroundColor="#0D0D12"
      height="100%"
      width="100%"
      gap={2}
    >
      <Header />

      <box width="100%" maxWidth={78} paddingX={2}>
        <InputBar onSubmit={(text: string) => console.log(text)} />
      </box>
    </box>
  );
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
