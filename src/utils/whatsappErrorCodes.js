/**
 * Mapping of Meta WhatsApp Business API error codes to user-friendly descriptions.
 * Based on official Meta documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/
 */
export const getWhatsappErrorDescription = (code) => {
  const errorCode = parseInt(code);
  
  const errorMap = {
    100: "Invalid parameter or phone number not on WhatsApp.",
    130429: "Rate limit exceeded. Too many messages sent in a short period.",
    131001: "Generic error from Meta. Please try again later.",
    131006: "Access denied. Check your WhatsApp API permissions.",
    131007: "Required parameter missing in the request.",
    131010: "Recipient phone number is invalid.",
    131011: "Recipient phone number is not on WhatsApp.",
    131016: "Service temporarily unavailable. Meta is experiencing issues.",
    131021: "Sender and recipient are the same. You cannot message yourself.",
    131024: "Message failed. The customer needs to message you first (outside 24-hour window).",
    131026: "Message undeliverable. The recipient may have blocked you or cannot receive messages.",
    131030: "Recipient phone number not in allow list. (Common in Sandbox/Test mode)",
    131042: "Payment issue. Please check your payment method in Meta Business Suite.",
    131045: "Incorrect parameter type.",
    131047: "Re-engagement message expired. You must wait for the customer to message you first.",
    131051: "Message too long. Please reduce the content size.",
    131052: "Media format not supported.",
    131053: "Media download failed from the provided URL.",
    131056: "Unsupported media type.",
    131057: "Unsupported message type.",
    132000: "Template not found. Please check if the template is approved and exists.",
    132001: "Template language not available for this template.",
    132005: "Template parameter mismatch. Variables provided don't match the template.",
    132012: "Template is currently paused or disabled by Meta.",
    132015: "Template is rejected. It cannot be used until it's approved.",
    133000: "Business account restricted or disabled.",
    133004: "Server temporarily unavailable. Try again later.",
    133010: "Phone number not registered or disconnected from WhatsApp.",
    135000: "Generic user error.",
  };

  return errorMap[errorCode] || null;
};
