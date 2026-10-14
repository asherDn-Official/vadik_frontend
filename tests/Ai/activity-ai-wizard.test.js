import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { generateActivityDraft, planActivity } from "../../src/components/customeroppertunites/activityAiApi.js";
import {
  ACTIVITY_AI_LANGUAGES,
  buildPlanPayload,
  canRetryGeneration,
  generationErrorMessage,
  generationFailureReference,
  moveItem,
  resolveGenerationAttempt,
  toggleAudience,
  validateWizardStep,
} from "../../src/components/customeroppertunites/activityAiWizardUtils.js";

const validValues = {
  purposeCategory: "Festival / Occasion",
  purposeText: "Diwali sale and wishes",
  audience: ["Existing Customers", "Youth", "Families & Kids"],
  goal: "Give Diwali wishes and get date of birth",
  questionCount: 5,
  language: "Tamil",
  instructions: "Friendly festive tone",
};

test("wizard builds the planner request while preserving category and custom purpose", () => {
  assert.deepEqual(buildPlanPayload(validValues), {
    purpose: "Festival / Occasion: Diwali sale and wishes",
    audience: ["Existing Customers", "Youth", "Families & Kids"],
    goal: "Give Diwali wishes and get date of birth",
    questionCount: 5,
    language: "Tamil",
    instructions: "Friendly festive tone",
  });
  assert.equal("retailerId" in buildPlanPayload(validValues), false);
});

test("custom purpose category remains usable without text and category is optional with text", () => {
  assert.equal(buildPlanPayload({ ...validValues, purposeText: "  ", purposeCategory: "Other" }).purpose, "Other");
  assert.equal(buildPlanPayload({ ...validValues, purposeCategory: "" }).purpose, "Diwali sale and wishes");
});

test("purpose, goal, count, and language validation follows planner contract", () => {
  assert.deepEqual(validateWizardStep(1, { ...validValues, purposeText: "", purposeCategory: "" }), { purpose: "Choose a purpose or describe it in your own words." });
  assert.deepEqual(validateWizardStep(2, { ...validValues, goal: " " }), { goal: "Tell Vadik what you want this Activity to achieve." });
  assert.deepEqual(validateWizardStep(3, { ...validValues, questionCount: 11 }), { questionCount: "AI-planned Activities support 1 to 10 questions." });
  assert.deepEqual(validateWizardStep(3, { ...validValues, language: "Telugu" }), { language: "Choose English, Tamil, or Hindi." });
  assert.deepEqual(validateWizardStep(3, validValues), {});
});

test("audience selection toggles without losing other context", () => {
  const selected = toggleAudience(["Youth"], "Families & Kids");
  assert.deepEqual(selected, ["Youth", "Families & Kids"]);
  assert.deepEqual(toggleAudience(selected, "Youth"), ["Families & Kids"]);
});

test("plan review ordering is deterministic and bounded at list edges", () => {
  const items = [{ key: "Birthday" }, { key: "Location" }, { key: "Favourite Products" }];
  assert.deepEqual(moveItem(items, 0, 1).map((item) => item.key), ["Location", "Birthday", "Favourite Products"]);
  assert.equal(moveItem(items, 0, -1), items);
  assert.equal(moveItem(items, 2, 1), items);
});

test("planner API helper posts only to the deterministic plan endpoint", async () => {
  const calls = [];
  const client = { post: async (...args) => { calls.push(args); return { data: { status: "READY" } }; } };
  const payload = buildPlanPayload(validValues);
  const result = await planActivity(client, payload);
  assert.equal(result.data.status, "READY");
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "/api/quiz/ai/plan");
  assert.deepEqual(calls[0][1], payload);
});

test("generation helper sends reviewed selections and reuses the supplied idempotency key", async () => {
  const calls = [];
  const api = { post: async (...args) => { calls.push(args); return { data: { draft: {} } }; } };
  const payload = { purpose: "Diwali", audience: ["Existing Customers"], goal: "Birthday", questionCount: 1, language: "Tamil", instructions: "Friendly", reviewedPlan: { planVersion: "activity-plan-v1", catalogueFingerprint: "a".repeat(64), requestedQuestionCount: 5, selections: [{ key: "Birthday", section: "advancedDetails" }] } };
  await generateActivityDraft(api, payload, "same-generation-attempt");
  await generateActivityDraft(api, payload, "same-generation-attempt");
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], "/api/quiz/ai/draft");
  assert.deepEqual(calls[0][1], payload);
  assert.equal(calls[0][2].headers["Idempotency-Key"], "same-generation-attempt");
  assert.equal(calls[1][2].headers["Idempotency-Key"], calls[0][2].headers["Idempotency-Key"]);
});

test("generation retry keeps its request identity while regeneration creates a fresh one", () => {
  const keys = ["attempt-a", "attempt-b"];
  const createKey = () => keys.shift();
  const firstPayload = { questionCount: 3 };
  const attemptA = resolveGenerationAttempt(firstPayload, null, { createKey });
  const retryPayload = { questionCount: 2 };
  const retry = resolveGenerationAttempt(retryPayload, attemptA, { createKey });
  assert.equal(retry.key, "attempt-a");
  assert.deepEqual(retry.payload, firstPayload);
  const regenerated = resolveGenerationAttempt(retryPayload, retry, { newAttempt: true, createKey });
  assert.equal(regenerated.key, "attempt-b");
  assert.deepEqual(regenerated.payload, retryPayload);
});

test("generation errors are customer-friendly and do not expose provider/finance messages", () => {
  assert.match(generationErrorMessage({ response: { status: 409, data: { code: "AI_ACTIVITY_PLAN_STALE" } } }), /preferences changed/);
  assert.match(generationErrorMessage({ response: { status: 500, data: { message: "wallet reservation provider journal stack" } } }), /could not create/);
  assert.doesNotMatch(generationErrorMessage({ response: { status: 500, data: { message: "wallet reservation provider journal stack" } } }), /wallet|provider|journal/i);
});

test("invalid model output does not offer same-key retry and new generation requires explicit confirmation", async () => {
  const error = { response: { status: 500, data: { code: "AI_INVALID_RESPONSE", aiRequestId: `AI-REQ-${"b".repeat(32)}` } } };
  assert.equal(canRetryGeneration(error), false);
  assert.match(generationErrorMessage(error), /No AI allowance was used/);
  const wizard = await readFile(new URL("../../src/components/customeroppertunites/ActivityAiWizard.jsx", import.meta.url), "utf8");
  assert.match(wizard, /canRetryAttempt && <button[\s\S]*?Retry this request/);
  assert.match(wizard, /setConfirmNewGeneration\(true\)[\s\S]{0,200}Start a new generation/);
  assert.match(wizard, /Start a new AI generation\?/);
  assert.match(wizard, /onClick=\{\(\) => requestGeneration\(\{ newAttempt: true \}\)\}/);
});

test("transient network failures retain a safe same-attempt retry", () => {
  assert.equal(canRetryGeneration(new Error("network disconnected")), true);
  assert.equal(canRetryGeneration({ response: { status: 408 } }), true);
  assert.equal(canRetryGeneration({ response: { status: 500 } }), false);
});

test("Activity AI user-facing source contains no known mojibake sequences", async () => {
  const files = [
    "ActivityAiWizard.jsx", "ActivityAiResult.jsx", "activityAiWizardUtils.js",
    "activityAiApi.js", "Quiz.jsx", "QuizForm.jsx",
  ];
  const suspicious = /â€™|â€œ|â€|â€¦|Ã—|Â·|[ÃÂâ]|�/;
  for (const file of files) {
    const source = await readFile(new URL(`../../src/components/customeroppertunites/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, suspicious, `${file} contains a mojibake sequence`);
  }
});

test("generation failure retains only safe status, code, and AI request reference", () => {
  const details = generationFailureReference({ response: { status: 500, data: {
    code: "AI_INVALID_RESPONSE", aiRequestId: `AI-REQ-${"a".repeat(32)}`,
    message: "private generated question", providerRequestId: "provider-secret",
  } } });
  assert.deepEqual(details, { status: 500, code: "AI_INVALID_RESPONSE", aiRequestId: `AI-REQ-${"a".repeat(32)}` });
  assert.deepEqual(generationFailureReference({ response: { status: 500, data: {
    code: "unsafe code", aiRequestId: "provider-secret",
  } } }), { status: 500, code: null, aiRequestId: null });
});

test("AI wizard is separate from manual create/edit and does not call paid draft", async () => {
  const quiz = await readFile(new URL("../../src/components/customeroppertunites/Quiz.jsx", import.meta.url), "utf8");
  const form = await readFile(new URL("../../src/components/customeroppertunites/QuizForm.jsx", import.meta.url), "utf8");
  const wizard = await readFile(new URL("../../src/components/customeroppertunites/ActivityAiWizard.jsx", import.meta.url), "utf8");
  const apiHelper = await readFile(new URL("../../src/components/customeroppertunites/activityAiApi.js", import.meta.url), "utf8");
  const result = await readFile(new URL("../../src/components/customeroppertunites/ActivityAiResult.jsx", import.meta.url), "utf8");
  const quizForm = await readFile(new URL("../../src/components/customeroppertunites/QuizForm.jsx", import.meta.url), "utf8");
  assert.match(quiz, /buildWithAI \? \(/);
  assert.match(quiz, /<ActivityAiWizard/);
  assert.match(quiz, /<QuizForm/);
  assert.doesNotMatch(form, /\/api\/quiz\/ai\/draft/);
  assert.match(apiHelper, /\/api\/quiz\/ai\/plan/);
  assert.match(apiHelper, /\/api\/quiz\/ai\/draft/);
  assert.doesNotMatch(wizard, /\/api\/quiz\/ai\/draft/);
  assert.match(wizard, /onClick=\{\(\) => requestGeneration\(\{ newAttempt: true \}\)\}/);
  assert.match(wizard, /reviewedPlan:/);
  assert.match(wizard, /generationFailureReference\(error\)/);
  assert.match(wizard, /Reference: \{generationErrorDetails\.aiRequestId\}/);
  assert.match(result, />Regenerate</);
  assert.match(result, />Back to plan</);
  assert.match(result, />Use Activity</);
  assert.match(result, />Edit Questions</);
  assert.match(quizForm, /initialDraft\.questions/);
  assert.match(quizForm, /onSubmit/);
  assert.match(wizard, /generationLock\.current/);
});

test("only the approved English, Tamil, and Hindi languages are exposed", () => {
  assert.deepEqual(ACTIVITY_AI_LANGUAGES.map(({ value }) => value), ["English", "Tamil", "Hindi"]);
});
