import { TriangleAlert } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { DISCLAIMER } from "@/lib/content";

export function Disclaimer() {
  return (
    <section aria-label="Disclaimer" className="pb-24">
      <div className="container-x">
        <Reveal>
          <div role="note" className="flex gap-4 rounded-2xl border border-burgundy/25 bg-blush/40 p-6 sm:p-8">
            <TriangleAlert className="mt-0.5 size-6 shrink-0 text-burgundy" aria-hidden />
            <div>
              <h2 className="font-sans text-sm font-semibold tracking-[0.14em] text-burgundy-deep uppercase">Disclaimer</h2>
              <p className="mt-2 text-lg leading-relaxed text-burgundy-deep">{DISCLAIMER}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
