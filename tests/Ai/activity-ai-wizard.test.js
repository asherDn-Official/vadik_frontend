import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { planActivity } from "../../src/components/customeroppertunites/activityAiApi.js";
import {
  ACTIVITY_AI_LANGUAGES,
  buildPlanPayload,
  moveItem,
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
  assert.deepEqual(validateWizardStep(3, { ...validValues, questionCount: 21 }), { questionCount: "Choose between 1 and 20 questions." });
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

test("AI wizard is separate from manual create/edit and does not call paid draft", async () => {
  const quiz = await readFile(new URL("../../src/components/customeroppertunites/Quiz.jsx", import.meta.url), "utf8");
  const form = await readFile(new URL("../../src/components/customeroppertunites/QuizForm.jsx", import.meta.url), "utf8");
  const wizard = await readFile(new URL("../../src/components/customeroppertunites/ActivityAiWizard.jsx", import.meta.url), "utf8");
  const apiHelper = await readFile(new URL("../../src/components/customeroppertunites/activityAiApi.js", import.meta.url), "utf8");
  assert.match(quiz, /buildWithAI \? \(/);
  assert.match(quiz, /<ActivityAiWizard/);
  assert.match(quiz, /<QuizForm/);
  assert.doesNotMatch(form, /\/api\/quiz\/ai\/draft/);
  assert.match(apiHelper, /\/api\/quiz\/ai\/plan/);
  assert.doesNotMatch(wizard, /\/api\/quiz\/ai\/draft/);
  assert.match(wizard, /disabled className=.*Generate Activity/);
});

test("only the approved English, Tamil, and Hindi languages are exposed", () => {
  assert.deepEqual(ACTIVITY_AI_LANGUAGES.map(({ value }) => value), ["English", "Tamil", "Hindi"]);
});
