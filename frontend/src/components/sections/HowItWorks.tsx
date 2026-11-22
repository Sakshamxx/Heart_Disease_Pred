"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { ClipboardList, Cpu, FileCheck2, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { icon: ClipboardList, title: "Enter Health Information", text: "Provide the seven values the model was trained on." },
  { icon: ShieldCheck, title: "Validate and Process Input", text: "Every value is checked against the allowed ranges before it is sent." },
  { icon: Cpu, title: "Analyze Using the ML Model", text: "The FastAPI backend applies the saved scikit-learn pipeline." },
  { icon: FileCheck2, title: "Display Prediction Results", text: "See the predicted class and the probability of each class." },
];

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <section id="how-it-works" className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow="How it works" title="From Your Numbers to a Prediction." align="center">
          Four steps, usually under a second.
        </SectionHeading>

        <ol ref={ref} className="relative mt-20 grid gap-12 md:grid-cols-4 md:gap-6">
          {/* timeline rail: horizontal on desktop, vertical on mobile */}
          <div aria-hidden className="absolute top-6 bottom-6 left-6 w-px bg-line md:top-6 md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:h-px md:w-auto">
            <motion.div style={{ scaleY: progress }} className="size-full origin-top bg-burgundy md:hidden" />
            <motion.div style={{ scaleX: progress }} className="hidden size-full origin-left bg-burgundy md:block" />
          </div>

          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative pl-20 md:pl-0 md:text-center">
              <Reveal delay={i * 0.08}>
                <span className="absolute top-0 left-0 grid size-12 place-items-center rounded-full border border-line bg-surface text-burgundy shadow-soft md:static md:mx-auto">
                  <Icon className="size-5" />
                </span>
                <p className="mt-0 font-mono text-xs tracking-widest text-burgundy-light md:mt-5">STEP 0{i + 1}</p>
                <h3 className="mt-2 text-xl font-medium text-burgundy-deep">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2 md:mx-auto md:max-w-[15rem]">{text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
