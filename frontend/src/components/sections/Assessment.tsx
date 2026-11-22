"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity, Droplets, Gauge, HeartPulse, Loader2, RotateCcw, Stethoscope, TrendingDown, UserRound, Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScroller } from "@/components/smooth-scroll";
import { useModelInfo } from "@/hooks/useModelInfo";
import { usePrediction } from "@/hooks/usePrediction";
import { CP_OPTIONS, SEX_OPTIONS } from "@/lib/content";
import { assessmentSchema, FIELD_META, toPatientInput, type AssessmentFormValues } from "@/lib/validations";
import { SectionHeading } from "./SectionHeading";
import { PredictionError, PredictionResult } from "./PredictionResult";

type NumericName = keyof typeof FIELD_META;

const EMPTY: Partial<AssessmentFormValues> = {
  age: undefined, sex: undefined, cp: undefined, trestbps: undefined, chol: undefined, thalach: undefined, oldpeak: undefined,
};

const inputClass =
  "h-12 rounded-xl border-line bg-bg px-3.5 text-base transition-shadow focus-visible:border-burgundy-light focus-visible:ring-burgundy-light/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function NumberField({
  control, name, label, icon: Icon, description, step = 1,
}: { control: Control<AssessmentFormValues>; name: NumericName; label: string; icon: LucideIcon; description: string; step?: number }) {
  const meta = FIELD_META[name];
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="gap-2 text-[0.9rem]">
            <Icon className="size-4 text-burgundy" aria-hidden /> {label}
          </FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type="number"
                inputMode={step < 1 ? "decimal" : "numeric"}
                step={step}
                min={meta.min}
                max={meta.max}
                placeholder={`${meta.trained[0]}–${meta.trained[1]}`}
                className={`${inputClass} ${meta.unit ? "pr-16" : ""}`}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
              />
            </FormControl>
            {meta.unit && (
              <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-ink-2">{meta.unit}</span>
            )}
          </div>
          <FormDescription>
            {description} Accepted {meta.min}–{meta.max}; training data {meta.trained[0]}–{meta.trained[1]}.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({
  control, name, label, icon: Icon, description, options,
}: {
  control: Control<AssessmentFormValues>; name: "sex" | "cp"; label: string; icon: LucideIcon; description: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="gap-2 text-[0.9rem]">
            <Icon className="size-4 text-burgundy" aria-hidden /> {label}
          </FormLabel>
          <Select items={[...options]} value={field.value ?? null} onValueChange={(v) => field.onChange(v ?? undefined)} onOpenChange={(o) => !o && field.onBlur()}>
            <FormControl>
              <SelectTrigger className="h-12 w-full rounded-xl border-line bg-bg px-3.5 text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="mb-1 flex w-full items-center gap-3 font-sans text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">
        {title} <span className="h-px flex-1 bg-line" />
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Assessment() {
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    mode: "onChange",
    defaultValues: EMPTY,
  });
  const { state, run, reset } = usePrediction();
  const { info } = useModelInfo();
  const scroller = useScroller();
  const resultRef = useRef<HTMLDivElement>(null);
  const loading = state.status === "loading";

  const onSubmit = form.handleSubmit((values) => run(toPatientInput(values)));

  // On narrow screens the result sits below the form: bring it into view when it arrives.
  useEffect(() => {
    if (state.status !== "success" && state.status !== "error") return;
    if (!window.matchMedia("(max-width: 1023px)").matches || !resultRef.current) return;
    scroller.scrollTo(resultRef.current, -88);
  }, [state.status, scroller]);

  const clearAll = () => {
    form.reset(EMPTY);
    reset();
  };

  return (
    <section id="prediction" className="section-y relative">
      <div className="container-x">
        <SectionHeading eyebrow="Heart health assessment" title="Check Your Heart Health." align="center">
          Enter the seven values below. They are validated, sent to the prediction service, and scored by the trained model.
        </SectionHeading>

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-9"
          >
            <Form {...form}>
              <form onSubmit={onSubmit} noValidate className="space-y-9" aria-busy={loading}>
                <Group title="Patient profile">
                  <NumberField control={form.control} name="age" label="Age" icon={UserRound} description="Age in whole years." />
                  <SelectField control={form.control} name="sex" label="Sex" icon={Users} description="Biological sex, as encoded in the dataset." options={SEX_OPTIONS} />
                  <div className="sm:col-span-2">
                    <SelectField control={form.control} name="cp" label="Chest pain type" icon={Stethoscope} description="Categorical code 0–3 exactly as encoded in the dataset." options={CP_OPTIONS} />
                  </div>
                </Group>

                <Group title="Clinical measurements">
                  <NumberField control={form.control} name="trestbps" label="Resting blood pressure" icon={Gauge} description="Resting blood pressure, whole number." />
                  <NumberField control={form.control} name="chol" label="Cholesterol" icon={Droplets} description="Serum cholesterol, whole number." />
                  <NumberField control={form.control} name="thalach" label="Maximum heart rate" icon={Activity} description="Maximum heart rate achieved." />
                  <NumberField control={form.control} name="oldpeak" label="ST depression" icon={TrendingDown} description="ST depression induced by exercise; decimals allowed." step={0.1} />
                </Group>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearAll}
                    disabled={loading}
                    className="h-12 rounded-full border-line px-6 text-ink-2 transition-all hover:-translate-y-0.5 hover:border-burgundy/40 hover:text-burgundy"
                  >
                    <RotateCcw className="size-4" /> Clear All
                  </Button>
                  <motion.div whileTap={{ scale: 0.97 }} className="sm:min-w-56">
                    <Button
                      type="submit"
                      disabled={!form.formState.isValid || loading}
                      className="h-12 w-full rounded-full bg-burgundy px-7 text-base text-bg shadow-lift transition-all hover:-translate-y-0.5 hover:bg-burgundy-deep disabled:translate-y-0 disabled:shadow-none"
                    >
                      {loading ? (<><Loader2 className="size-4 animate-spin" /> Analysing…</>) : (<><HeartPulse className="size-4" /> Submit Assessment</>)}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Form>
          </motion.div>

          <div ref={resultRef} className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {state.status === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid min-h-72 place-content-center rounded-2xl border border-dashed border-burgundy/25 bg-bg-2/50 p-8 text-center">
                  <HeartPulse className="mx-auto size-10 text-burgundy/40" aria-hidden />
                  <h3 className="mt-4 text-2xl font-medium text-burgundy-deep">Your result will appear here</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-ink-2">Complete the form and submit it. Nothing is shown until the model has produced a real prediction.</p>
                </motion.div>
              )}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid min-h-72 place-content-center rounded-2xl border border-line bg-surface p-8 text-center shadow-soft" role="status">
                  <svg viewBox="0 0 200 50" className="mx-auto w-48" aria-hidden>
                    <motion.path d="M0 25 L60 25 L70 12 L82 40 L94 5 L106 45 L116 25 L200 25" fill="none" stroke="var(--burgundy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
                  </svg>
                  <p className="mt-4 font-display text-xl text-burgundy-deep">Analysing with the model…</p>
                </motion.div>
              )}
              {state.status === "success" && (
                <PredictionResult key="success" input={state.input} data={state.data} modelName={info?.model_name} />
              )}
              {state.status === "error" && <PredictionError key="error" error={state.error} onRetry={() => void onSubmit()} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
