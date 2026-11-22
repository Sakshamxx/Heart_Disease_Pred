"use client";

import { motion } from "motion/react";
import { Layers, ListChecks, Split, Trophy } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { useModelInfo } from "@/hooks/useModelInfo";
import { ALGORITHMS_EVALUATED, FEATURE_LABELS } from "@/lib/content";
import { SectionHeading } from "./SectionHeading";

export function ModelInfo() {
  const { info, loading } = useModelInfo();
  const features = info?.features ?? Object.keys(FEATURE_LABELS);

  return (
    <section id="model" className="section-y bg-bg-2/60">
      <div className="container-x">
        <SectionHeading eyebrow="The model" title="What Powers the Prediction.">
          Everything below comes from the project&apos;s notebook and the live API.
        </SectionHeading>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-1">
            <div className="h-full rounded-2xl border border-line bg-surface p-7 shadow-soft">
              <ListChecks className="size-5 text-burgundy" />
              <h3 className="mt-4 text-2xl font-medium text-burgundy-deep">Seven input features</h3>
              <ul className="mt-5 divide-y divide-line text-sm">
                {features.map((f) => (
                  <li key={f} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span className="text-ink">{FEATURE_LABELS[f] ?? f}</span>
                    <code className="font-mono text-xs text-ink-2">{f}</code>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-1">
            <div className="h-full rounded-2xl border border-line bg-surface p-7 shadow-soft">
              <Split className="size-5 text-burgundy" />
              <h3 className="mt-4 text-2xl font-medium text-burgundy-deep">Binary classification</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                The model assigns each record to one of two classes:
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {Object.entries(info?.target_classes ?? { 0: "No heart disease", 1: "Heart disease" }).map(([k, v]) => (
                  <li key={k} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-md bg-blush/70 font-mono text-xs text-burgundy">{k}</span>
                    {v}
                  </li>
                ))}
              </ul>
              <Layers className="mt-8 size-5 text-burgundy" />
              <h3 className="mt-4 text-2xl font-medium text-burgundy-deep">Five algorithms evaluated</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ALGORITHMS_EVALUATED.map((a) => (
                  <li key={a} className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink-2">{a}</li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="lg:col-span-1">
            <div className="h-full rounded-2xl bg-burgundy-deep p-7 text-bg shadow-lift">
              <Trophy className="size-5 text-blush" />
              <h3 className="mt-4 font-display text-2xl font-medium">Best model, chosen by evaluation</h3>
              <p className="mt-3 text-sm leading-relaxed text-bg/70">
                Candidates were compared on accuracy, precision, recall and F1-score; the winner was selected by F1-score,
                because missing a positive case matters more than raw accuracy.
              </p>

              {info ? (
                <>
                  <p className="mt-6 text-xs tracking-[0.18em] text-blush/80 uppercase">Selected model</p>
                  <p className="font-display text-2xl">{info.model_name}</p>
                  {info.test_metrics && (
                    <dl className="mt-6 space-y-3">
                      {Object.entries(info.test_metrics).map(([k, v], i) => (
                        <div key={k}>
                          <div className="flex justify-between text-sm">
                            <dt className="text-bg/75">{k}</dt>
                            <dd className="font-mono">{(v * 100).toFixed(1)}%</dd>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg/10">
                            <motion.div
                              className="h-full rounded-full bg-blush"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${v * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </div>
                      ))}
                      <p className="pt-1 text-xs text-bg/55">Measured on a small held-out test set (20% of the data).</p>
                    </dl>
                  )}
                </>
              ) : (
                <p className="mt-6 rounded-lg border border-bg/15 p-3 text-sm text-bg/65">
                  {loading ? "Loading live model details…" : "Live model details are unavailable because the prediction service can't be reached."}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
