import test from "node:test";
import assert from "node:assert/strict";
import { canBuildActivityWithAI } from "../../src/components/customeroppertunites/activityAICapabilities.js";

test("eligible authenticated business capability shows Build with AI", async () => {
  const api = { get: async (path) => ({ data: { features: { activityQuizDraft: true }, path } }) };
  assert.equal(await canBuildActivityWithAI(api), true);
});

test("ineligible business capability hides Build with AI", async () => {
  const api = { get: async () => ({ data: { features: { activityQuizDraft: false } } }) };
  assert.equal(await canBuildActivityWithAI(api), false);
});

test("capability fetch failure hides Build with AI", async () => {
  const api = { get: async () => { throw new Error("temporary network failure"); } };
  assert.equal(await canBuildActivityWithAI(api), false);
});
