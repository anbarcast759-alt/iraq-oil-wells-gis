"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface HighlightContextValue {
  highlightedSlugs: string[];
  highlightWells: (slugs: string[]) => void;
  clearHighlight: () => void;
}

const HighlightContext = createContext<HighlightContextValue | null>(null);

/**
 * ChatWidget lives in the root layout (every page); the big map with
 * all wells lives inside the home page's WellsExplorer. This context
 * is the bridge between them: the chat widget writes to it when an
 * answer is about specific wells, and the map reads it to fly to /
 * highlight those wells — without the two components knowing about
 * each other directly.
 */
export function HighlightProvider({ children }: { children: ReactNode }) {
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);

  return (
    <HighlightContext.Provider
      value={{
        highlightedSlugs,
        highlightWells: (slugs) => setHighlightedSlugs(slugs),
        clearHighlight: () => setHighlightedSlugs([]),
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight(): HighlightContextValue {
  const ctx = useContext(HighlightContext);
  if (!ctx) {
    throw new Error("useHighlight must be used within a HighlightProvider");
  }
  return ctx;
}
