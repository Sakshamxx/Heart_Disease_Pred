"use client";

import { motion } from "motion/react";
import { CircleAlert, HeartPulse, Info, WifiOff } from "lucide-react";
import type { ApiError } from "@/lib/api";
import { API_URL } from "@/lib/api";
import { CP_OPTIONS, FEATURE_LABELS, SEX_OPTIONS } from "@/lib/content";
import { FIELD_META } from "@/lib/validations";
import type { PatientInput, PredictionResponse } from "@/types/prediction";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const ease = [0.22, 1, 0.36, 1] as const;

function formatValue(key: keyof PatientInput, input: PatientInput): string {
  switch (key) {
    case "sex":
      return SEX_OPTIONS.find((o) => o.value === String(input.sex))?.label ?? String(input.sex);
    case "cp":
      return CP_OPTIONS.find((o) => o.value === String(input.cp))?.label ?? String(input.cp);
    case "age":
      return `${input.age} years`;
    case "trestbps":
      return `${input.trestbps} mm Hg`;
    case "chol":
      return `${input.chol} mg/dl`;
    case "thalach":
      return `${input.thalach} bpm`;
    case "oldpeak":
      return String(input.oldpeak);
  }
}

function outOfTrainingRange(input: PatientInput): string[] {
  return (Object.keys(FIELD_META) as (keyof typeof FIELD_META)[])
    .filter((k) => {
      const [lo, hi] = FIELD_META[k].trained;
      return input[k] < lo || input[k] > hi;
    })
    .map((k) => FEATURE_LABELS[k].toLowerCase());
}

function Gauge({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-36 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke="var(--burgundy)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-3xl leading-none font-semibold text-burgundy-deep">{Math.round(value * 100)}%</span>
        <span className="mt-1 text-[0.65rem] tracking-wide text-ink-2 uppercase">disease prob.</span>
      </div>
    </div>
  );
}

function ProbBar({ label, value, strong, delay }: { label: string; value: number; strong?: boolean; delay: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className={strong ? "font-medium text-burgundy-deep" : "text-ink-2"}>{label}</span>
        <span className="font-mono text-ink">{pct(value)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-2">
        <motion.div
          className={strong ? "h-full rounded-full bg-burgundy" : "h-full rounded-full bg-burgundy-light/45"}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1.1, ease, delay }}
        />
      </div>
    </div>
  );
}

export function PredictionResult({ input, data, modelName }: { input: PatientInput; data: PredictionResponse; modelName?: string }) {
  const positive = data.prediction === 1;
  const p = data.probability;
  const outside = outOfTrainingRange(input);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease }}
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
      aria-live="polite"
    >
      <div className="relative bg-linear-to-br from-burgundy-deep via-burgundy to-burgundy-light p-7 text-bg">
        <div aria-hidden className="absolute -top-16 -right-10 size-52 rounded-full bg-blush/15 blur-2xl" />
        <p className="relative flex items-center gap-2 text-xs tracking-[0.18em] text-blush uppercase">
          <HeartPulse className="size-4" /> Model prediction · Class {data.prediction}
        </p>
        <h3 className="relative mt-3 font-display text-3xl leading-tight font-medium sm:text-4xl">{data.result}</h3>
        <p className="relative mt-2 text-sm text-bg/70">
          {positive ? "The model places this profile in the heart disease class." : "The model places this profile in the no heart disease class."}
        </p>
      </div>

      <div className="space-y-8 p-7">
        {p ? (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Gauge value={p.disease} />
            <div className="w-full space-y-4">
              <ProbBar label="Heart disease" value={p.disease} strong={positive} delay={0.4} />
              <ProbBar label="No heart disease" value={p.no_disease} strong={!positive} delay={0.55} />
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-bg-2 p-3 text-sm text-ink-2">This model did not return class probabilities.</p>
        )}

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">How to read this</h4>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {p ? (
              <>
                {modelName ? `The ${modelName} model` : "The model"} estimated a {pct(p.disease)} probability for the heart
                disease class and {pct(p.no_disease)} for the no heart disease class. The reported result is simply the class
                with the higher probability.{" "}
              </>
            ) : (
              <>The reported result is the class chosen by the model. </>
            )}
            It reflects patterns the model learned from a public heart disease dataset, and says nothing certain about this
            individual.
          </p>
        </div>

        {outside.length > 0 && (
          <div className="flex gap-3 rounded-lg border border-line bg-bg-2 p-3.5 text-sm text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0 text-burgundy" aria-hidden />
            <p>
              Some values ({outside.join(", ")}) fall outside the range seen in the training data, so this prediction may be
              less reliable.
            </p>
          </div>
        )}

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">Submitted values</h4>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {(Object.keys(FEATURE_LABELS) as (keyof PatientInput)[]).map((k) => (
              <div key={k} className="border-b border-line pb-2">
                <dt className="text-xs text-ink-2">{FEATURE_LABELS[k]}</dt>
                <dd className="mt-0.5 font-medium text-ink">{formatValue(k, input)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs leading-relaxed text-ink-2">
          This is a machine learning model output, not a medical diagnosis.
        </p>
      </div>
    </motion.article>
  );
}

export function PredictionError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const offline = error.kind === "network";
  const Icon = offline ? WifiOff : CircleAlert;
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease }}
      className="rounded-2xl border border-destructive/30 bg-surface p-7 shadow-soft"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-2xl font-medium text-burgundy-deep">
        {offline ? "Can’t reach the prediction service" : error.kind === "validation" ? "Input rejected" : "Prediction unavailable"}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{error.message}</p>
      {error.fieldErrors.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-2">
          {error.fieldErrors.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
      {offline && (
        <p className="mt-4 rounded-lg bg-bg-2 p-3 font-mono text-xs break-all text-ink-2">
          Expected API: {API_URL}
          <br />
          Start it with: uvicorn backend.main:app
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center rounded-full border border-burgundy/30 px-5 text-sm text-burgundy transition-colors hover:bg-blush/50"
      >
        Try again
      </button>
    </motion.div>
  );
}
