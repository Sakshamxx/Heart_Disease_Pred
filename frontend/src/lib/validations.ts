import { z } from "zod";
import type { PatientInput } from "@/types/prediction";

/**
 * Accepted ranges mirror backend/schemas.py (the API is the source of truth).
 * `trained` is the range actually observed in the training dataset, shown as a hint.
 */
export const FIELD_META = {
  age: { min: 1, max: 120, trained: [29, 77], unit: "years" },
  trestbps: { min: 50, max: 250, trained: [94, 200], unit: "mm Hg" },
  chol: { min: 50, max: 700, trained: [126, 564], unit: "mg/dl" },
  thalach: { min: 40, max: 250, trained: [71, 202], unit: "bpm" },
  oldpeak: { min: 0, max: 10, trained: [0, 6.2], unit: "" },
} as const;

const intField = (min: number, max: number, label: string) =>
  z
    .number({ error: `${label} is required` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`);

export const assessmentSchema = z.object({
  age: intField(FIELD_META.age.min, FIELD_META.age.max, "Age"),
  sex: z.enum(["0", "1"], { error: "Select an option" }),
  cp: z.enum(["0", "1", "2", "3"], { error: "Select an option" }),
  trestbps: intField(FIELD_META.trestbps.min, FIELD_META.trestbps.max, "Blood pressure"),
  chol: intField(FIELD_META.chol.min, FIELD_META.chol.max, "Cholesterol"),
  thalach: intField(FIELD_META.thalach.min, FIELD_META.thalach.max, "Heart rate"),
  oldpeak: z
    .number({ error: "ST depression is required" })
    .min(FIELD_META.oldpeak.min, "ST depression cannot be negative")
    .max(FIELD_META.oldpeak.max, `ST depression must be at most ${FIELD_META.oldpeak.max}`),
});

export type AssessmentFormValues = z.infer<typeof assessmentSchema>;

/** Convert validated form values to the exact request body the API expects. */
export function toPatientInput(v: AssessmentFormValues): PatientInput {
  return {
    age: v.age,
    sex: Number(v.sex) as PatientInput["sex"],
    cp: Number(v.cp) as PatientInput["cp"],
    trestbps: v.trestbps,
    chol: v.chol,
    thalach: v.thalach,
    oldpeak: v.oldpeak,
  };
}
