"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

interface Scroller {
  /** Smooth-scroll to an element (Lenis when active, native smooth scroll otherwise). */
  scrollTo: (el: HTMLElement, offset?: number) => void;
}

const ScrollerContext = createContext<Scroller>({
  scrollTo: (el) => el.scrollIntoView({ behavior: "smooth", block: "start" }),
});
export const useScroller = () => useContext(ScrollerContext);

/**
 * Lenis smooth scrolling. Skipped entirely for reduced-motion users, who get native scrolling.
 * `anchors` lets Lenis handle in-page #links (the header offset comes from CSS scroll-padding-top) so they animate smoothly
 * instead of fighting the native jump; without Lenis the browser's own anchor scrolling applies.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
    lenis.current = instance;
    return () => {
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  const scroller = useMemo<Scroller>(
    () => ({
      scrollTo: (el, offset = 0) => {
        if (lenis.current) lenis.current.scrollTo(el, { offset });
        else el.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    }),
    [],
  );

  return <ScrollerContext.Provider value={scroller}>{children}</ScrollerContext.Provider>;
}
