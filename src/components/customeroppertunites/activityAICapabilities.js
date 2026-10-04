export async function canBuildActivityWithAI(apiClient) {
  try {
    const response = await apiClient.get("/api/quiz/ai/capabilities");
    return response.data?.features?.activityQuizDraft === true;
  } catch {
    return false;
  }
}
