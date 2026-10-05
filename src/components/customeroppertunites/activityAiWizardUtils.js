export const ACTIVITY_AI_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Tamil", label: "தமிழ் — Tamil" },
  { value: "Hindi", label: "हिन्दी — Hindi" },
];

export const PURPOSE_CATEGORIES = [
  "Festival / Occasion",
  "Sale / Promotion",
  "Customer Engagement",
  "Loyalty / Retention",
  "Learn About Customers",
  "Product Feedback",
  "Other",
];

export const AUDIENCE_SUGGESTIONS = [
  "Existing Customers", "New Customers", "Youth", "Families & Kids",
  "Loyal Customers", "Inactive Customers", "Everyone",
];

export function validateWizardStep(step, values) {
  if (step === 1 && !values.purposeText.trim() && !values.purposeCategory) {
    return { purpose: "Choose a purpose or describe it in your own words." };
  }
  if (step === 2 && !values.goal.trim()) {
    return { goal: "Tell Vadik what you want this Activity to achieve." };
  }
  if (step === 3) {
    const count = Number(values.questionCount);
    if (!Number.isInteger(count) || count < 1 || count > 10) {
      return { questionCount: "AI-planned Activities support 1 to 10 questions." };
    }
    if (!ACTIVITY_AI_LANGUAGES.some(({ value }) => value === values.language)) {
      return { language: "Choose English, Tamil, or Hindi." };
    }
  }
  return {};
}

export function buildPlanPayload(values) {
  const typedPurpose = values.purposeText.trim();
  const purpose = typedPurpose
    ? (values.purposeCategory && values.purposeCategory !== "Other"
      ? `${values.purposeCategory}: ${typedPurpose}`
      : typedPurpose)
    : values.purposeCategory;
  return {
    purpose,
    audience: [...values.audience],
    goal: values.goal.trim(),
    questionCount: Number(values.questionCount),
    language: values.language,
    instructions: values.instructions.trim(),
  };
}

export function toggleAudience(audience, item) {
  return audience.includes(item)
    ? audience.filter((value) => value !== item)
    : [...audience, item];
}

export function moveItem(items, index, direction) {
  const destination = index + direction;
  if (destination < 0 || destination >= items.length) return items;
  const next = [...items];
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}

export function resolveGenerationAttempt(payload, currentAttempt, { newAttempt = false, createKey = () => globalThis.crypto.randomUUID() } = {}) {
  if (newAttempt || !currentAttempt) return { key: createKey(), payload };
  return currentAttempt;
}

export function planErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Sign in and try again.";
  if (status === 403) return "Activity AI planning is not available for this account.";
  if (status === 429) return "Too many planning requests. Please wait a moment and try again.";
  if (status >= 500) return "Vadik could not plan this Activity right now. Please try again.";
  return error?.response?.data?.message || "We couldn't plan this Activity. Check your details and try again.";
}

export function generationErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Sign in and try again.";
  if (status === 403) return "Activity AI generation is not available for this account.";
  if (status === 402) return "This Activity could not be generated with the current AI allowance. Check your account and try again.";
  if (status === 409 && error?.response?.data?.code === "AI_ACTIVITY_PLAN_STALE") return "Your available customer preferences changed. Please review the updated plan.";
  if (status === 409) return "This generation request could not be safely repeated. Start a new generation to continue.";
  if (status === 422) return "The reviewed plan could not be generated. Review your selections and try again.";
  if (status === 429) return "A generation is already in progress or the service is busy. Please wait and try again.";
  if (status >= 500) return "Vadik could not create this Activity right now. Please try again.";
  return error?.response?.data?.message || "We couldn't create this Activity. Please try again.";
}
