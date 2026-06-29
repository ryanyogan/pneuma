import { useKeyboard, useRenderer } from "@opentui/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * A responder claims a key event by returning `true` ("I handled it, stop").
 * Returning `false` passes the event down to the next layer in the chain.
 */
type Responder = () => boolean;

type KeyboardLayerContextValue = {
  push: (id: string, responder?: Responder) => void;
  pop: (id: string) => void;
  isTopLayer: (id: string) => boolean;
  setResponder: (id: string, responder: Responder | null) => void;
};

const KeyboardLayerContext = createContext<KeyboardLayerContextValue | null>(
  null,
);

// "base" is a permanent sentinel layer: it sits at the bottom of the stack and
// is never popped, so the stack is never empty.
const BASE_LAYER = "base";

export function KeyboardLayerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([BASE_LAYER]);

  // The keyboard handler below is registered once but must always see the
  // current stack, so we mirror state into a ref to dodge a stale closure.
  const stackRef = useRef(stack);
  stackRef.current = stack;

  // Responders live in a ref, not state: swapping a callback should never
  // trigger a re-render.
  const responders = useRef<Map<string, Responder>>(new Map());
  const renderer = useRenderer();

  // The single place that mutates the responder map; push/pop delegate here.
  const setResponder = useCallback(
    (id: string, responder: Responder | null) => {
      if (responder) {
        responders.current.set(id, responder);
      } else {
        responders.current.delete(id);
      }
    },
    [],
  );

  const push = useCallback(
    (id: string, responder?: Responder) => {
      if (responder) {
        setResponder(id, responder);
      }

      setStack((stack) => (stack.includes(id) ? stack : [...stack, id]));
    },
    [setResponder],
  );

  const pop = useCallback(
    (id: string) => {
      setResponder(id, null);
      setStack((stack) => stack.filter((layer) => layer !== id));
    },
    [setResponder],
  );

  const isTopLayer = useCallback((id: string) => stack.at(-1) === id, [stack]);

  useKeyboard((key) => {
    if (!key.ctrl || key.name !== "c") return;

    // Responder chain: walk layers front-to-back (topmost first) and let the
    // first one that claims Ctrl+C consume it. `.some` short-circuits on the
    // first `true`, so layers below a handler are never called.
    const handled = [...stackRef.current]
      .reverse()
      .some((layer) => responders.current.get(layer)?.() === true);

    // Nothing intercepted it, so Ctrl+C means "quit".
    if (!handled) {
      renderer.destroy();
    }
  });

  const value = useMemo<KeyboardLayerContextValue>(
    () => ({ push, pop, isTopLayer, setResponder }),
    [push, pop, isTopLayer, setResponder],
  );

  return (
    <KeyboardLayerContext.Provider value={value}>
      {children}
    </KeyboardLayerContext.Provider>
  );
}

export function useKeyboardLayer() {
  const context = useContext(KeyboardLayerContext);
  if (!context) {
    throw new Error(
      "useKeyboardLayer must be used within a KeyboardLayerProvider",
    );
  }

  return context;
}
