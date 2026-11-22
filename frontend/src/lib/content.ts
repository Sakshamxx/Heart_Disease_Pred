/** Static copy that is verifiable from the project (notebook + backend). */
export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Prediction", href: "#prediction" },
] as const;

export const SEX_OPTIONS = [
  { value: "0", label: "Female (0)" },
  { value: "1", label: "Male (1)" },
] as const;

/** The dataset encodes chest pain as the codes 0–3; the project does not document their clinical names. */
export const CP_OPTIONS = [
  { value: "0", label: "Type 0" },
  { value: "1", label: "Type 1" },
  { value: "2", label: "Type 2" },
  { value: "3", label: "Type 3" },
] as const;

export const FEATURE_LABELS: Record<string, string> = {
  age: "Age",
  sex: "Sex",
  cp: "Chest pain type",
  trestbps: "Resting blood pressure",
  chol: "Cholesterol",
  thalach: "Max heart rate",
  oldpeak: "ST depression",
};

export const ALGORITHMS_EVALUATED = [
  "Logistic Regression",
  "K-Nearest Neighbors",
  "Random Forest",
  "Support Vector Machine",
  "Gradient Boosting",
];

export const DISCLAIMER =
  "This application is an educational machine learning project. Its predictions are not medical diagnoses and should not replace professional medical evaluation.";
