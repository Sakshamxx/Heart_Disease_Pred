"use client";

import { motion } from "motion/react";
import { BrainCircuit, Database, Zap } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "./SectionHeading";

const FEATURES = [
  { icon: BrainCircuit, title: "Machine Learning", text: "Uses trained classification algorithms to analyse health-related features and learn patterns from real patient records." },
  { icon: Database, title: "Data-Driven Analysis", text: "Processes seven selected input variables: age, sex, chest pain type, blood pressure, cholesterol, heart rate and ST depression." },
  { icon: Zap, title: "Instant Prediction", text: "Communicates with the FastAPI backend, which runs the trained model and returns a prediction with class probabilities." },
];

export function About() {
  return (
    <section id="about" className="section-y bg-bg-2/60">
      <div className="container-x">
        <SectionHeading eyebrow="About the project" title="Intelligence Behind Every Insight.">
          Heart disease is among the leading causes of death worldwide. This project explores how a machine learning
          model can estimate the likelihood of heart disease from a handful of routine clinical measurements, and how
          that model can be put behind a clean, usable interface.
        </SectionHeading>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group h-full rounded-2xl border border-line bg-surface p-7 shadow-soft transition-shadow duration-300 hover:shadow-lift"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-blush/60 text-burgundy transition-colors duration-300 group-hover:bg-burgundy group-hover:text-bg">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 text-2xl font-medium text-burgundy-deep">{title}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
