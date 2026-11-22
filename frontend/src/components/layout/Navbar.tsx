"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Brand } from "@/components/visuals/Logo";
import { NAV_LINKS } from "@/lib/content";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["home", "about", "how-it-works", "prediction"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // highlight the section currently in view
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "border-b border-line bg-background/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Primary">
        <a href="#home" aria-label="CardioSense home" onClick={() => setOpen(false)}>
          <Brand />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={cn(
                    "group relative px-3.5 py-2 text-sm transition-colors",
                    isActive ? "text-burgundy" : "text-ink-2 hover:text-burgundy",
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "absolute inset-x-3.5 -bottom-px h-px origin-left bg-burgundy transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#prediction"
            className={cn(buttonVariants(), "hidden h-10 rounded-full bg-burgundy px-5 text-bg transition-all hover:-translate-y-0.5 hover:bg-burgundy-deep sm:inline-flex")}
          >
            Start Assessment
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line text-burgundy md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <ul className="container-x flex flex-col gap-1 pt-2 pb-6">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-display text-xl text-burgundy-deep hover:bg-blush/40">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-3">
                <a href="#prediction" onClick={() => setOpen(false)} className={cn(buttonVariants(), "h-12 w-full rounded-full bg-burgundy text-bg")}>
                  Start Assessment
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
