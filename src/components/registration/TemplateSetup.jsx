import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../api/apiconfig";

const BASE_TEMPLATES = [
  {
    id: "customer_otp",
    label: "OTP Verification",
    category: "UTILITY",
    defaultText: "Your verification code for {{2}} is {{1}}. Valid for 5 minutes.",
    vars: ["Code", "Store Name"],
    usedIn: "Used during customer verification flows and login-related confirmation steps.",
  },
  {
    id: "optin_optout",
    label: "Opt-in / Opt-out Request",
    category: "MARKETING",
    defaultText: "Hello {{1}}, welcome to {{2}}. Would you like to receive updates from us?",
    vars: ["Name", "Store Name"],
    usedIn: "Used when asking customers for communication consent.",
  },
  {
    id: "opt_in_success_1",
    label: "Opt-in Success",
    category: "MARKETING",
    defaultText: "Thank you {{1}} for opting in to updates from {{2}}!",
    vars: ["Name", "Store Name"],
    usedIn: "Sent after a customer successfully opts in.",
  },
  {
    id: "opt_in_confirmation_2",
    label: "Opt-in Confirmation",
    category: "MARKETING",
    defaultText: "Hi {{1}}, please confirm your subscription to {{2}} by replying YES.",
    vars: ["Name", "Store Name"],
    usedIn: "Used in double opt-in confirmation flows.",
  },
  {
    id: "opt_out_acknowledged",
    label: "Opt-out Acknowledged",
    category: "MARKETING",
    defaultText: "Hi {{1}}, you have been successfully unsubscribed from {{2}} updates.",
    vars: ["Name", "Store Name"],
    usedIn: "Sent after a customer unsubscribes from updates.",
  },
  {
    id: "birthday_greeting",
    label: "Birthday Greeting",
    category: "MARKETING",
    defaultText: "Happy Birthday {{1}}! To celebrate, {{2}} has a special gift for you.",
    vars: ["Name", "Store Name"],
    usedIn: "Used in birthday automation campaigns.",
  },
  {
    id: "anniversary_greeting",
    label: "Anniversary Greeting",
    category: "MARKETING",
    defaultText: "Happy Anniversary {{1}}! Thank you for being with {{2}} for another year.",
    vars: ["Name", "Store Name"],
    usedIn: "Used in customer anniversary automations.",
  },
  {
    id: "custom_event_greeting",
    label: "Custom Event Greeting",
    category: "MARKETING",
    defaultText: "Hello {{1}}, we are excited to have you at our event with {{2}}!",
    vars: ["Name", "Store Name"],
    usedIn: "Used in event-driven outreach and special campaigns.",
  },
  {
    id: "customer_appreciation",
    label: "Customer Appreciation",
    category: "MARKETING",
    defaultText: "Thank you {{1}} for shopping at {{2}}! We appreciate your business.",
    vars: ["Name", "Store Name"],
    usedIn: "Used for thank-you messages after purchases and loyalty actions.",
  },
  {
    id: "sale_reminder",
    label: "Sale Reminder",
    category: "MARKETING",
    defaultText: "Hi {{1}}, our big sale at {{2}} is starting soon! Don't miss out.",
    vars: ["Name", "Store Name"],
    usedIn: "Used for promotional reminders and campaign broadcasts.",
  },
  {
    id: "spinwheel_offer",
    label: "Spin Wheel Offer",
    category: "MARKETING",
    defaultText: "Congratulations {{1}}! You won a special offer at {{2}}. Claim it here: {{3}}",
    vars: ["Name", "Store Name", "Link"],
    usedIn: "Used when campaign activities generate a reward link.",
  },
  {
    id: "scratch_card_offer",
    label: "Scratch Card Offer",
    category: "MARKETING",
    defaultText: "Hi {{1}}, you have a new scratch card from {{2}}! Scratch it here: {{3}}",
    vars: ["Name", "Store Name", "Link"],
    usedIn: "Used for scratch card campaign flows.",
  },
  {
    id: "quiz_link_message",
    label: "Quiz Message",
    category: "MARKETING",
    defaultText: "Hello {{1}}, try our new {{3}} quiz at {{2}} and win rewards! {{4}}",
    vars: ["Name", "Store Name", "Quiz Name", "Link"],
    usedIn: "Used when sharing quiz campaigns and activity links.",
  },
];

const sanitizeTemplateName = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^(\d)/, "v_$1")
    .replace(/_+$/, "");

const getVariableCount = (text) => {
  const matches = text.match(/\{\{(\d+)\}\}/g);
  return matches ? new Set(matches).size : 0;
};

const validateVariableStructure = (text, expectedCount) => {
  const matches = text.match(/\{\{(\d+)\}\}/g);
  const varIndices = matches ? matches.map((match) => parseInt(match.match(/\d+/)[0], 10)) : [];
  const uniqueIndices = [...new Set(varIndices)].sort((a, b) => a - b);

  for (let index = 0; index < uniqueIndices.length; index += 1) {
    if (uniqueIndices[index] !== index + 1) {
      return {
        valid: false,
        reason: `Variables must stay sequential. Missing {{${index + 1}}} before {{${uniqueIndices[index]}}}.`,
      };
    }
  }

  if (uniqueIndices.length > expectedCount) {
    return {
      valid: false,
      reason: `Too many variables. This template supports only ${expectedCount} variable values.`,
    };
  }

  return { valid: true };
};

const createEditableTemplates = () =>
  BASE_TEMPLATES.map((template) => ({
    ...template,
    text: template.defaultText,
    customName: template.id,
  }));

const TemplateSetup = ({
  isUsingOwnWhatsapp = false,
  markTemplateSetupComplete,
  goToNextStep,
  goToPreviousStep,
}) => {
  const [templates, setTemplates] = useState(createEditableTemplates);
  const [existingTemplates, setExistingTemplates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);

  const invalidTemplates = useMemo(
    () =>
      templates.filter(
        (template) => !validateVariableStructure(template.text, template.vars.length).valid,
      ),
    [templates],
  );

  useEffect(() => {
    if (!isUsingOwnWhatsapp) {
      return;
    }

    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.status) {
          setExistingTemplates(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching existing onboarding templates:", error);
      }
    };

    fetchTemplates();
  }, [isUsingOwnWhatsapp]);

  const runTemplateProvisioning = async (useDefaultContent) => {
    if (!isUsingOwnWhatsapp) {
      markTemplateSetupComplete();
      goToNextStep();
      return;
    }

    const sourceTemplates = useDefaultContent ? createEditableTemplates() : templates;

    if (!useDefaultContent && invalidTemplates.length > 0) {
      toast.error("Please fix the template variable format before continuing.");
      return;
    }

    setSubmitting(true);
    setResults([]);

    const token = localStorage.getItem("token");
    const nextResults = [];

    for (const template of sourceTemplates) {
      const sanitizedName = sanitizeTemplateName(template.customName || template.id);
      const validation = validateVariableStructure(template.text, template.vars.length);

      if (!validation.valid) {
        nextResults.push({ name: template.label, status: "error", message: validation.reason });
        continue;
      }

      try {
        const existing = existingTemplates.find(
          (item) => item.name?.toLowerCase() === sanitizedName,
        );

        if (!existing) {
          const variableCount = getVariableCount(template.text);
          const payload = {
            templateData: {
              name: sanitizedName,
              category: template.category,
              language: "en_US",
              components: [
                {
                  type: "BODY",
                  text: template.text.trim(),
                  example:
                    variableCount > 0
                      ? {
                          body_text: [
                            Array.from({ length: variableCount }, (_, index) => `Sample${index + 1}`),
                          ],
                        }
                      : undefined,
                },
              ],
            },
          };

          await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        await axios.put(
          `${API_BASE_URL}/api/integrationManagement/whatsapp/templates/mapping`,
          {
            mappings: { [template.id]: sanitizedName },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        nextResults.push({
          name: template.label,
          status: "success",
          message: existing ? "Mapped existing template" : "Created and mapped",
        });
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error?.message ||
          "Failed to create template";
        nextResults.push({ name: template.label, status: "error", message });
      }
    }

    setResults(nextResults);
    setSubmitting(false);

    const hasError = nextResults.some((item) => item.status === "error");
    if (hasError) {
      toast.warning("Some templates could not be created. Review the results and try again if needed.");
      return;
    }

    toast.success("Templates are ready in your WhatsApp account.");
    markTemplateSetupComplete();
    goToNextStep();
  };

  if (!isUsingOwnWhatsapp) {
    return (
      <div className="space-y-8">
        <div className="step-container">
          <h2 className="step-header">Template Review</h2>
          <p className="step-description">
            You chose Vadik&apos;s default WhatsApp account, so Vadik&apos;s managed templates will be used automatically for now.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-4">
          <h3 className="text-2xl font-bold text-[#313166]">Default template setup is already handled</h3>
          <p className="text-sm text-gray-600 leading-7">
            When you continue, your business will use Vadik&apos;s default WhatsApp account and its standard approved templates. You can connect your own account later from Integration Management whenever you&apos;re ready.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="min-w-[150px] text-[#CB376D] py-2 px-4 rounded-[10px] bg-white border-2 border-[#CB376D] hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => runTemplateProvisioning(true)}
            className="min-w-[180px] text-white py-2 px-4 rounded-[10px] bg-gradient-to-r from-[#CB376D] to-[#A72962] hover:opacity-95 transition-opacity"
          >
            Finish setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="step-container">
        <h2 className="step-header">Review WhatsApp Templates</h2>
        <p className="step-description">
          These are the templates Vadik will create in your own Meta account. You can edit the content and template name now, but keep the variables unchanged.
        </p>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
        Each variable badge shows data that Vadik fills automatically during campaigns and automations. You can change the wording around the variables, but do not change the variable numbers.
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {templates.map((template, index) => {
          const validation = validateVariableStructure(template.text, template.vars.length);

          return (
            <div key={template.id} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#313166]">{template.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{template.usedIn}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F3F4F6] text-[#313166]">
                  {template.category}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Meta template name
                  </label>
                  <input
                    type="text"
                    value={template.customName}
                    onChange={(event) => {
                      const next = [...templates];
                      next[index].customName = event.target.value;
                      setTemplates(next);
                    }}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#CB376D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Template content
                  </label>
                  <textarea
                    value={template.text}
                    onChange={(event) => {
                      const next = [...templates];
                      next[index].text = event.target.value;
                      setTemplates(next);
                    }}
                    className={`w-full min-h-[140px] border rounded-2xl px-4 py-3 text-sm outline-none ${
                      validation.valid ? "border-gray-200 focus:border-[#CB376D]" : "border-red-300"
                    }`}
                  />
                  {!validation.valid && (
                    <p className="text-xs text-red-600 mt-2">{validation.reason}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Locked variables
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.vars.map((variable, variableIndex) => (
                      <span
                        key={`${template.id}-${variable}`}
                        className="text-[11px] px-3 py-1 rounded-full bg-[#F9E8EF] text-[#CB376D] font-semibold"
                      >
                        {`{{${variableIndex + 1}}}`} {variable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#313166] mb-4">Last template creation result</h3>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={`${result.name}-${result.message}`}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  result.status === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                <strong>{result.name}:</strong> {result.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={goToPreviousStep}
          disabled={submitting}
          className="min-w-[150px] text-[#CB376D] py-2 px-4 rounded-[10px] bg-white border-2 border-[#CB376D] hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => runTemplateProvisioning(true)}
          disabled={submitting}
          className="min-w-[220px] text-[#313166] py-2 px-4 rounded-[10px] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating templates..." : "Skip edits and use default content"}
        </button>
        <button
          type="button"
          onClick={() => runTemplateProvisioning(false)}
          disabled={submitting || invalidTemplates.length > 0}
          className="min-w-[220px] text-white py-2 px-4 rounded-[10px] bg-gradient-to-r from-[#CB376D] to-[#A72962] hover:opacity-95 transition-opacity disabled:opacity-60"
        >
          {submitting ? "Creating templates..." : "Create templates and finish"}
        </button>
      </div>
    </div>
  );
};

export default TemplateSetup;

TemplateSetup.propTypes = {
  isUsingOwnWhatsapp: PropTypes.bool,
  markTemplateSetupComplete: PropTypes.func.isRequired,
  goToNextStep: PropTypes.func.isRequired,
  goToPreviousStep: PropTypes.func.isRequired,
};
