export function planActivity(api, payload) {
  return api.post("/api/quiz/ai/plan", payload);
}

export function generateActivityDraft(api, payload, idempotencyKey) {
  return api.post("/api/quiz/ai/draft", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
}
