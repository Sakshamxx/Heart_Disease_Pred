"use client";

import { motion } from "motion/react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "./SectionHeading";

const TECH = [
  { name: "Python", role: "ML & API language" },
  { name: "Scikit-learn", role: "Model training" },
  { name: "FastAPI", role: "Prediction API" },
  { name: "Next.js", role: "Application layer" },
  { name: "React", role: "UI library" },
  { name: "TypeScript", role: "Type safety" },
  { name: "Tailwind CSS", role: "Styling" },
];

export function TechStack() {
  return (
    <section id="tech" className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow="Technology" title="Built With Modern Tools." align="center" />
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {TECH.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05} y={14}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-xl border border-line bg-surface px-5 py-3.5 shadow-soft transition-shadow hover:shadow-lift"
              >
                <p className="font-display text-lg font-medium text-burgundy-deep">{t.name}</p>
                <p className="text-xs text-ink-2">{t.role}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
