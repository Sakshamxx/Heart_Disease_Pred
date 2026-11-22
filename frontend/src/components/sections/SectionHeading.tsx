import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow, title, children, align = "left", className,
}: { eyebrow: string; title: string; children?: React.ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span className="eyebrow">
        <span className="h-px w-8 bg-burgundy" /> {eyebrow}
      </span>
      <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.08] font-medium text-burgundy-deep">{title}</h2>
      {children && <p className="mt-5 text-lg leading-relaxed text-ink-2">{children}</p>}
    </Reveal>
  );
}
