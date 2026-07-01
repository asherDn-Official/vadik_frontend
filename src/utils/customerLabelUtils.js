export const MAX_CUSTOMER_LABELS = 5;

export const normalizeCustomerLabels = (labels) => {
  const rawValues = Array.isArray(labels)
    ? labels
    : String(labels || "")
        .split(",")
        .map((label) => label.trim());

  const uniqueLabels = [];
  const seen = new Set();

  rawValues.forEach((label) => {
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    uniqueLabels.push(label);
  });

  return uniqueLabels;
};

export const formatCustomerLabels = (labels) =>
  normalizeCustomerLabels(labels).join(", ");

