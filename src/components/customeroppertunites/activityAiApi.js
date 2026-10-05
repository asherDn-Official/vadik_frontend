export function planActivity(api, payload) {
  return api.post("/api/quiz/ai/plan", payload);
}
