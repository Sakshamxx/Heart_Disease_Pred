"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight, BarChart3, Cpu, Layers, ListChecks, ShieldCheck, Split } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HeartVisual } from "@/components/visuals/HeartVisual";
import { FloatingCard } from "@/components/visuals/FloatingCard";
import { cn } from "@/lib/utils";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "60%", rotateX: -40 },
  show: { opacity: 1, y: "0%", rotateX: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const LINES = [["Understand", "Your", "Heart."], ["Predict", "With", "Intelligence."]];

const TRUST = [
  { icon: Cpu, label: "ML-Powered Analysis" },
  { icon: BarChart3, label: "Data-Driven Insights" },
  { icon: ShieldCheck, label: "Secure API Communication" },
];

const ctaBase = "h-12 rounded-full px-6 text-[0.95rem] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* drifting ambient gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 size-[38rem] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(139_58_80/0.20),transparent)]" />
        <div className="absolute -bottom-52 -left-40 size-[34rem] animate-drift-slow rounded-full bg-[radial-gradient(closest-side,rgb(236_213_217/0.9),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="eyebrow rounded-full border border-line bg-surface/70 px-3.5 py-1.5">
            <span className="size-1.5 rounded-full bg-burgundy" />
            Machine Learning Powered Health Analysis
          </motion.span>

          <h1 className="mt-7 text-[clamp(2.6rem,6.2vw,4.8rem)] leading-[1.02] font-medium text-burgundy-deep [perspective:800px]">
            {LINES.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, wi) => (
                  <span key={wi} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                    <motion.span variants={word} className={cn("inline-block", li === 1 && "text-burgundy italic")}>
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            CardioSense uses a trained machine learning model to analyse seven health indicators — age, sex, chest pain
            type, blood pressure, cholesterol, maximum heart rate and ST depression — and estimates the likelihood of
            heart disease in seconds.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#prediction" className={cn(buttonVariants(), ctaBase, "bg-burgundy text-bg shadow-lift hover:bg-burgundy-deep")}>
              Check Heart Health <ArrowRight className="size-4" />
            </a>
            <a href="#how-it-works" className={cn(buttonVariants({ variant: "outline" }), ctaBase, "border-burgundy/25 bg-transparent text-burgundy hover:bg-blush/50")}>
              Explore How It Works
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-2">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-burgundy" aria-hidden /> {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[30rem] lg:max-w-none"
        >
          <HeartVisual />
          <FloatingCard className="top-[8%] left-0 sm:-left-2" icon={<ListChecks className="size-4" />} value="7" label="Input features" delay={0} />
          <FloatingCard className="top-[40%] right-0 sm:-right-3" icon={<Split className="size-4" />} value="2 classes" label="Binary classification" delay={0.6} float={10} />
          <FloatingCard className="bottom-[6%] left-[6%]" icon={<Layers className="size-4" />} value="5" label="Algorithms evaluated" delay={1.2} />
        </motion.div>
      </div>
    </section>
  );
}
