export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeVariableValues = (variableValues = {}) =>
  Object.entries(variableValues).reduce((acc, [key, value]) => {
    const normalizedKey = String(key).match(/^\{\{\d+\}\}$/)
      ? String(key)
      : `{{${key}}}`;
    acc[normalizedKey] = value;
    return acc;
  }, {});

export const renderWhatsAppFormattedText = (
  text = "",
  {
    variableValues = {},
    highlightVariables = false,
    variableClassName = "font-semibold text-blue-600",
  } = {},
) => {
  let formatted = escapeHtml(text);
  const codeBlocks = [];

  formatted = formatted.replace(/```([\s\S]+?)```/g, (_, content) => {
    const token = `%%CODEBLOCK${codeBlocks.length}%%`;
    codeBlocks.push(
      `<code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-700">${content}</code>`,
    );
    return token;
  });

  formatted = formatted
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/~([^~\n]+)~/g, '<span class="line-through">$1</span>');

  const normalizedValues = normalizeVariableValues(variableValues);
  const variables = new Set([
    ...(text.match(/\{\{\d+\}\}/g) || []),
    ...Object.keys(normalizedValues),
  ]);

  variables.forEach((variable) => {
    const replacement = escapeHtml(normalizedValues[variable] ?? variable);
    const safeVariable = escapeRegExp(escapeHtml(variable));
    const nextValue = highlightVariables
      ? `<span class="${variableClassName}">${replacement}</span>`
      : replacement;
    formatted = formatted.replace(new RegExp(safeVariable, "g"), nextValue);
  });

  codeBlocks.forEach((codeBlock, index) => {
    formatted = formatted.replace(`%%CODEBLOCK${index}%%`, codeBlock);
  });

  return formatted.replace(/\n/g, "<br/>");
};
