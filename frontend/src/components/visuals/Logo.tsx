import { cn } from "@/lib/utils";

const HEART = "M12 21.2C5.4 16.3 2.5 12.6 2.5 8.9 2.5 6 4.6 4 7.1 4c1.9 0 3.7 1 4.9 2.8C13.2 5 15 4 16.9 4c2.5 0 4.6 2 4.6 4.9 0 3.7-2.900 7.400-9.500 12.300Z";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6", className)}>
      <path d={HEART} fill="currentColor" />
      <path d="M2.5 12h5l1.8-3.200 2.700 6.200 1.800-3H21.500" fill="none" stroke="var(--bg)" strokeWidth="1.400" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Brand({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={light ? "text-blush" : "text-burgundy"} />
      <span className={cn("font-display text-xl font-semibold tracking-tight", light ? "text-bg" : "text-burgundy-deep")}>
        CardioSense
      </span>
    </span>
  );
}
