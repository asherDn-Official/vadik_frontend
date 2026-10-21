// src/utils/errorMapper.js

export const getCustomerFriendlyError = (error, defaultMessage = "Something went wrong. Please try again.") => {
  const rawMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "";

  const lower = rawMessage.toLowerCase();

  // Wallet & AI Credit Errors
  if (lower.includes("insufficient") || lower.includes("credit exhausted") || lower.includes("balance low")) {
    return "Your AI balance is too low to complete this action. Please top up your AI Wallet to continue.";
  }
  if (lower.includes("reservation") || lower.includes("ledger")) {
    return "Unable to reserve AI credits right now. Please check your balance and try again.";
  }

  // Rate Limits & OpenAI API Issues
  if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("429")) {
    return "AI servers are currently busy. Please wait a few seconds and try again.";
  }
  if (lower.includes("openai") || lower.includes("provider") || lower.includes("timeout")) {
    return "The AI service experienced a momentary delay. Please try generating again.";
  }

  // Customer Profile & Data Errors
  if (lower.includes("invalid customer preference") || lower.includes("validation")) {
    return "Some details could not be saved. Please double-check the form values and try again.";
  }
  if (lower.includes("mobile number already exists") || lower.includes("duplicate")) {
    return "A customer with this mobile number is already registered in your store.";
  }
  if (lower.includes("file") || lower.includes("2 mb")) {
    return "The uploaded image file is too large. Please upload an image under 2 MB.";
  }

  return defaultMessage;
};