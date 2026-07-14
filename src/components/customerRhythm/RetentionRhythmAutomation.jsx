/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Phone,
  Settings2,
  Tag,
  Trash2,
  UserPlus,
  Users,
  Webhook,
  X,
  Zap,
  Clock,
  History,
  Smartphone,
} from "lucide-react";
import api from "../../api/apiconfig";
import ConfirmationDialog from "../common/ConfirmationDialog";
import showToast from "../../utils/ToastNotification";
import { renderWhatsAppFormattedText } from "../../utils/whatsappTextFormatter";

const dashboardStats = [
  {
    key: "total",
    filter: "all",
    label: "Total automations",
    tone: "text-[#313166]",
  },
  {
    key: "active",
    filter: "active",
    label: "Active",
    tone: "text-emerald-600",
  },
  { key: "paused", filter: "paused", label: "Paused", tone: "text-amber-600" },
  { key: "draft", filter: "draft", label: "Draft", tone: "text-[#CB376D]" },
];

const triggerGroups = [
  {
    name: "Customer",
    color: "#CB376D",
    items: [
      // { id: "all_customers", name: "All Customers", icon: Users },
      { id: "new_customer", name: "New Customer", icon: UserPlus },
      {
        id: "customer_field_date",
        name: "Customer Date Field",
        icon: Calendar,
      },
    ],
  },
  {
    name: "WhatsApp",
    color: "#16A34A",
    items: [{ id: "whatsapp_keyword", name: "Keyword Match", icon: Tag }],
  },
  {
    name: "Activity",
    color: "#D97706",
    items: [
      {
        id: "customer_activity_completed",
        name: "Activity Completed",
        icon: CheckCircle2,
      },
    ],
  },
  {
    name: "Recurring",
    color: "#7C3AED",
    items: [
      { id: "scheduled_recurring", name: "Scheduled Recurring", icon: Webhook },
    ],
  },
];

const triggerIcons = {
  all_customers: Users,
  new_customer: UserPlus,
  customer_field_date: Calendar,
  inactive_for_days: Calendar,
  whatsapp_keyword: MessageCircle,
  customer_activity_completed: CheckCircle2,
  scheduled_recurring: Webhook,
};

const activityOptions = [
  { value: "spinWheel", label: "Spin Wheel" },
  { value: "scratchCard", label: "Scratch Card" },
  { value: "quiz", label: "Quiz" },
];

const campaignLabelKeys = {
  spinWheel: "name",
  scratchCard: "name",
  quiz: "campaignName",
};

const weekdayOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// const stepLabels = ["Journey", "Trigger", "Audience", "Action", "Review"];
const getStepLabels = (triggerType) => {
  if (triggerType === "new_customer") {
    return ["Journey", "Trigger", "Action", "Review"]; // skip Audience
  }
  return ["Journey", "Trigger", "Audience", "Action", "Review"];
};
const getTotalSteps = (triggerType) =>
  triggerType === "new_customer" ? 4 : 5;
const getAudienceStep = (triggerType) =>
  triggerType === "new_customer" ? null : 3;
const getActionStep = (triggerType) =>
  triggerType === "new_customer" ? 3 : 4;
const getReviewStep = (triggerType) =>
  triggerType === "new_customer" ? 4 : 5;
const previewQuickSegments = [
  {
    key: "all",
    label: "All Customers",
    rules: { logic: "AND", conditions: [] },
  },
  {
    key: "opted_in",
    label: "Started",
    rules: {
      logic: "AND",
      conditions: [{ fieldKey: "isOptedIn", operator: "is_true" }],
    },
  },
  {
    key: "new_7d",
    label: "New 7d",
    rules: {
      logic: "AND",
      conditions: [
        { fieldKey: "createdAt", operator: "in_last_days", value: 7 },
      ],
    },
  },
  {
    key: "active_30d",
    label: "Active 30d",
    rules: {
      logic: "AND",
      conditions: [
        { fieldKey: "firstVisit", operator: "in_last_days", value: 30 },
      ],
    },
  },
];

const delayOptions = [
  { label: "Immediate", mode: "immediate", value: 0, unit: "minutes" },
  { label: "After 5 minutes", mode: "delay", value: 5, unit: "minutes" },
  { label: "After 1 hour", mode: "delay", value: 1, unit: "hours" },
  { label: "After 2 hours", mode: "delay", value: 2, unit: "hours" },
  { label: "After 1 day", mode: "delay", value: 1, unit: "days" },
  { label: "After 3 days", mode: "delay", value: 3, unit: "days" },
];

const delayUnitOptions = [
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
];

const formatDelayLabel = (delay = {}) => {
  if (delay?.mode === "immediate" || Number(delay?.value) <= 0) {
    return "Immediate";
  }

  const value = Number(delay.value) || 0;
  const unit = String(delay.unit || "minutes");
  const unitLabel =
    value === 1
      ? unit.replace(/s$/, "")
      : unit;

  return `After ${value} ${unitLabel}`;
};

const operatorLabels = {
  equals: "Equals",
  not_equals: "Not equals",
  contains: "Contains",
  starts_with: "Starts with",
  greater_than: "Greater than",
  less_than: "Less than",
  between: "Between",
  is_empty: "Is empty",
  is_not_empty: "Is not empty",
  is_true: "Is true",
  is_false: "Is false",
  on: "On",
  before: "Before",
  after: "After",
  today: "Today",
  in_next_days: "In next days",
  in_last_days: "In last days",
  day_month_match: "Day / month match",
  in_list: "In list",
  not_in_list: "Not in list",
};

const ruleNeedsValue = (operator = "") =>
  ![
    "is_true",
    "is_false",
    "today",
    "is_empty",
    "is_not_empty",
  ].includes(operator);

const validateRuleDraft = (draftRule = {}, fields = []) => {
  const selectedField = fields.find(
    (field) => field.fieldKey === draftRule.fieldKey,
  );

  if (!draftRule.fieldKey) {
    return { valid: false, message: "Select a field before adding a rule" };
  }

  if (!selectedField) {
    return { valid: false, message: "Select a valid field before adding a rule" };
  }

  if (!draftRule.operator) {
    return { valid: false, message: "Select an operator before adding a rule" };
  }

  if (!ruleNeedsValue(draftRule.operator)) {
    return { valid: true, message: "" };
  }

  const value = String(draftRule.value ?? "").trim();
  const valueTo = String(draftRule.valueTo ?? "").trim();

  if (draftRule.operator === "between") {
    if (!value || !valueTo) {
      return { valid: false, message: "Provide both values for a between rule" };
    }

    if (
      selectedField.type === "number" &&
      Number.isFinite(Number(value)) &&
      Number.isFinite(Number(valueTo)) &&
      Number(value) > Number(valueTo)
    ) {
      return { valid: false, message: "The first value must be smaller than the second value" };
    }

    return { valid: true, message: "" };
  }

  if (
    selectedField.type === "date" &&
    ["in_next_days", "in_last_days"].includes(draftRule.operator)
  ) {
    if (!value || Number(value) <= 0) {
      return { valid: false, message: "Enter a positive number of days" };
    }
    return { valid: true, message: "" };
  }

  if (selectedField.type === "options" && draftRule.operator === "equals" && !value) {
    return { valid: false, message: "Select a value for this option field" };
  }

  if (!value) {
    return { valid: false, message: "Enter a value for this rule" };
  }

  return { valid: true, message: "" };
};

const createEmptyAutomation = () => ({
  name: "Untitled Automation",
  status: "draft",
  journeyType: "winback",
  triggerType: "new_customer",
  triggerConfig: {
    fieldKey: "",
    keyword: "",
    dateTriggerMode: "field",
    activityScope: "all",
    activityType: "",
    activityCampaignScope: "all",
    activityCampaignId: "",
    activityTypes: ["spinWheel", "scratchCard", "quiz"],
    scheduleType: "daily",
    scheduleTime: "09:00",
    scheduleDayOfWeek: new Date().getDay(),
    scheduleDayOfMonth: new Date().getDate(),
    scheduleTimezone: "Asia/Calcutta",
    days: 30,
    daysBefore: 0,
    triggerTime: "09:00",
    timezone: "Asia/Calcutta",
  },
  audienceRules: { logic: "AND", conditions: [] },
  actionConfig: {
    templateId: "",
    templateName: "",
    languageCode: "en_US",
    variableMappings: [],
    mediaUrl: "",
    mediaType: "",
  },
  delay: { mode: "immediate", value: 0, unit: "minutes" },
  safetyFlags: { preventDuplicateWindowHours: 24, stopIfOptedOut: true },
});

const formatDate = (value) => {
  if (!value) return "Not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet";
  return date.toLocaleDateString();
};

const formatScheduleTime = (value = "09:00") => {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "09:00";
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = ((hour + 11) % 12) + 1;
  return `${normalizedHour}:${minute} ${suffix}`;
};

const getCampaignLabel = (campaign = {}, type = "") =>
  campaign?.[campaignLabelKeys[type] || "name"] || campaign?.name || campaign?.campaignName || "Untitled";

const getCampaignList = (campaigns = {}, type = "") =>
  Array.isArray(campaigns?.[type]) ? campaigns[type] : [];

const getCampaignSelectValue = (campaigns = {}, type = "", campaignId = "") =>
  getCampaignList(campaigns, type).some((campaign) => String(campaign?._id) === String(campaignId))
    ? String(campaignId)
    : "";

const getDateTriggerMode = (automation = {}) =>
  automation.triggerType === "inactive_for_days"
    ? "inactive"
    : automation.triggerConfig?.dateTriggerMode || "field";

const normalizeTemplateVariableToken = (value = "") => {
  const match = String(value).match(/\d+/);
  return match ? `{{${match[0]}}}` : String(value);
};

const getTemplateHeaderMediaType = (template) => {
  const header = template?.components?.find(
    (component) => component.type === "HEADER",
  );
  return header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format)
    ? header.format
    : "";
};

const getTemplateHeaderComponent = (template) =>
  template?.components?.find((component) => component.type === "HEADER") ||
  null;

const extractTemplateVariables = (template) => {
  const values = [];
  (template?.components || []).forEach((component) => {
    if (!["HEADER", "BODY"].includes(component?.type)) return;

    const textSources = [
      component?.text || "",
      ...(Array.isArray(component?.example?.body_text)
        ? component.example.body_text.flat()
        : []),
    ].filter(Boolean);

    const matches = textSources.join(" ").match(/\{\{\s*\d+\s*\}\}/g) || [];
    const uniqueMatches = [
      ...new Set(matches.map(normalizeTemplateVariableToken)),
    ].sort(
      (left, right) =>
        Number(left.replace(/\D/g, "")) - Number(right.replace(/\D/g, "")),
    );

    uniqueMatches.forEach((variable) => {
      values.push({
        key: `${component.type}:${variable}`,
        componentType: component.type,
        variable,
      });
    });
  });
  return values;
};

const findVariableMapping = (mappings = [], descriptor = {}) =>
  mappings.find(
    (mapping) =>
      (mapping.componentType || "BODY") === descriptor.componentType &&
      mapping.variable === descriptor.variable,
  ) ||
  mappings.find(
    (mapping) =>
      !mapping.componentType &&
      descriptor.componentType === "BODY" &&
      mapping.variable === descriptor.variable,
  );

const upsertVariableMapping = (
  mappings = [],
  descriptor = {},
  updates = {},
) => {
  const nextMappings = [...mappings];
  const index = nextMappings.findIndex(
    (mapping) =>
      ((mapping.componentType || "BODY") === descriptor.componentType &&
        mapping.variable === descriptor.variable) ||
      (!mapping.componentType &&
        descriptor.componentType === "BODY" &&
        mapping.variable === descriptor.variable),
  );
  const nextMapping = {
    componentType: descriptor.componentType,
    variable: descriptor.variable,
    sourceType: "customer_field",
    value: "firstname",
    ...(index >= 0 ? nextMappings[index] : {}),
    ...updates,
  };

  if (index >= 0) {
    nextMappings[index] = nextMapping;
  } else {
    nextMappings.push(nextMapping);
  }

  return nextMappings;
};

const getTemplatePreviewText = (
  text = "",
  componentType = "BODY",
  mappings = [],
  fields = [],
) => {
  const fallbackText =
    componentType === "BODY"
      ? "Choose a template to preview the WhatsApp message."
      : "";
  const sourceText = text || fallbackText;

  if (!sourceText) return "";

  let previewText = sourceText;
  mappings
    .filter(
      (mapping) => (mapping.componentType || "BODY") === componentType,
    )
    .forEach((mapping) => {
      const field = fields.find((item) => item.fieldKey === mapping.value);
      const replacement =
        mapping.sourceType === "static"
          ? mapping.value || "value"
          : mapping.sourceType === "derived"
            ? mapping.value || "derived"
            : field?.label || "customer field";

      previewText = previewText.replaceAll(
        mapping.variable,
        `{{${replacement}}}`,
      );
    });

  return previewText;
};

function WhatsAppTemplatePreviewCard({
  template,
  headerComponent,
  headerText = "",
  bodyText,
  footerText = "",
  buttons = [],
  mediaType = "",
  mediaUrl = "",
}) {
  const headerFormat = headerComponent?.format || mediaType || "";
  const resolvedMediaUrl =
    mediaUrl?.trim() ||
    headerComponent?.mediaUrl ||
    headerComponent?.example?.header_handle?.[0] ||
    "";

  return (
    <div className="rounded-3xl bg-[#313166] p-5 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/60">
            Live Preview
          </div>
          <h3 className="mt-2 text-lg font-semibold">
            {template?.name || "WhatsApp Template"}
          </h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          Template
        </div>
      </div>

      <div className="mt-5 rounded-[28px] bg-[#171717] p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[22px] bg-[#0a0a0a]">
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Vadik Business</div>
              <div className="text-xs text-white/75">template preview</div>
            </div>
          </div>

          <div
            className="min-h-[320px] space-y-3 px-4 py-4"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #0d1418 0px, #0d1418 10px, #0e1519 10px, #0e1519 20px)",
            }}
          >
            <div className="flex justify-end">
              <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tr-md bg-white shadow-sm">
                {headerComponent ? (
                  headerFormat === "TEXT" ? (
                    <div
                      className="border-b border-gray-100 px-3 pb-2 pt-3 text-sm font-semibold text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: renderWhatsAppFormattedText(headerText || ""),
                      }}
                    />
                  ) : (
                    <div className="border-b border-gray-100 bg-[#111827]">
                      {resolvedMediaUrl ? (
                        headerFormat === "IMAGE" ? (
                          <img
                            src={resolvedMediaUrl}
                            alt="Template header preview"
                            className="max-h-64 w-full object-cover"
                          />
                        ) : headerFormat === "VIDEO" ? (
                          <video
                            src={resolvedMediaUrl}
                            controls
                            className="max-h-64 w-full bg-black object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-3 py-4 text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium">
                                Document attachment
                              </div>
                              <div className="truncate text-xs text-white/70">
                                {resolvedMediaUrl}
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="flex min-h-[148px] flex-col items-center justify-center gap-2 px-4 py-6 text-center text-white/70">
                          {headerFormat === "IMAGE" && (
                            <ImageIcon className="h-7 w-7" />
                          )}
                          {headerFormat === "VIDEO" && (
                            <Play className="h-7 w-7" />
                          )}
                          {headerFormat === "DOCUMENT" && (
                            <FileText className="h-7 w-7" />
                          )}
                          <div className="text-xs font-medium">
                            {headerFormat
                              ? `${headerFormat.toLowerCase()} header will appear here`
                              : "Template header will appear here"}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : null}

                <div className="p-3">
                  <div
                    className="whitespace-pre-wrap text-sm text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: renderWhatsAppFormattedText(bodyText || ""),
                    }}
                  />
                  {footerText ? (
                    <div
                      className="mt-2 text-[11px] text-gray-500"
                      dangerouslySetInnerHTML={{
                        __html: renderWhatsAppFormattedText(footerText),
                      }}
                    />
                  ) : null}
                  {buttons.length > 0 ? (
                    <div className="mt-3 border-t border-gray-100">
                      {buttons.map((button, index) => (
                        <div
                          key={`${button.text || "button"}-${index}`}
                          className="flex items-center justify-center gap-2 border-b border-gray-50 py-2.5 text-center text-sm font-medium text-[#00a884] last:border-b-0"
                        >
                          {button.type === "URL" ? (
                            <ExternalLink className="h-4 w-4" />
                          ) : null}
                          {button.type === "PHONE_NUMBER" ? (
                            <Phone className="h-4 w-4" />
                          ) : null}
                          <span>{button.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-1 text-right text-xs text-gray-400">
                    12:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatPhone = (countryCode = "", mobileNumber = "") => {
  const phone = `${countryCode || ""}${mobileNumber || ""}`.trim();
  return phone ? (phone.startsWith("+") ? phone : `+${phone}`) : "No mobile";
};

const formatRuleGroupSummary = (ruleGroup = {}) => {
  const rules = Array.isArray(ruleGroup?.conditions)
    ? ruleGroup.conditions
    : [];
  if (!rules.length) return "All";
  return `${ruleGroup.logic || "AND"} • ${rules.length} rule${rules.length === 1 ? "" : "s"}`;
};

const formatExecutionSummary = (log) => {
  const triggerSnapshot = log?.triggerSnapshot || {};
  if (triggerSnapshot.triggerType === "all_customers") return "All customers";
  if (triggerSnapshot.customerCreatedAt) return "New customer";
  if (triggerSnapshot.keyword) return `Keyword: ${triggerSnapshot.keyword}`;
  if (triggerSnapshot.activityScope === "all") return "All activities";
  if (triggerSnapshot.activityType) return `Activity: ${triggerSnapshot.activityType}`;

  const audienceSummary = formatRuleGroupSummary(
    log?.conditionSnapshot?.audienceRules,
  );
  return `Audience ${audienceSummary}`;
};

const describeTriggerConfig = (automation = {}, campaigns = {}) => {
  const triggerConfig = automation.triggerConfig || {};

  if (automation.triggerType === "scheduled_recurring") {
    const label = triggerConfig.scheduleType || "daily";
    const time = formatScheduleTime(triggerConfig.scheduleTime || "09:00");
    if (label === "weekly") {
      return `Weekly at ${time}`;
    }
    if (label === "monthly") {
      return `Monthly at ${time}`;
    }
    return `Daily at ${time}`;
  }

  if (automation.triggerType === "all_customers") {
    const time = formatScheduleTime(triggerConfig.scheduleTime || "09:00");
    return `All customers daily at ${time}`;
  }

  if (automation.triggerType === "customer_activity_completed") {
    if ((triggerConfig.activityScope || "all") === "all") {
      return "All completed activities";
    }
    const activityLabel =
      activityOptions.find((option) => option.value === triggerConfig.activityType)?.label ||
      "Specific activity";
    if ((triggerConfig.activityCampaignScope || "all") === "specific") {
      const campaign = getCampaignList(campaigns, triggerConfig.activityType).find(
        (item) => String(item?._id) === String(triggerConfig.activityCampaignId),
      );
      return campaign
        ? `${activityLabel}: ${getCampaignLabel(campaign, triggerConfig.activityType)}`
        : `${activityLabel}: specific campaign`;
    }
    return activityLabel;
  }

  if (automation.triggerType === "whatsapp_keyword") {
    return triggerConfig.keyword ? `Keyword: ${triggerConfig.keyword}` : "Keyword trigger";
  }

  if (automation.triggerType === "customer_field_date" || automation.triggerType === "inactive_for_days") {
    if (getDateTriggerMode(automation) === "inactive") {
      return `Inactive for ${triggerConfig.days || 30} days`;
    }
    const fieldLabel = triggerConfig.fieldKey || "Date field";
    const offset = Number(triggerConfig.daysBefore) || 0;
    const timeLabel = formatScheduleTime(triggerConfig.triggerTime || "09:00");
    if (!triggerConfig.fieldKey) return "Date field trigger";
    const dateText = offset > 0 ? `${offset} days before` : "same day";
    return `${fieldLabel}, ${dateText} at ${timeLabel}`;
  }

  return "Trigger configured";
};

const normalizeAutomationForForm = (automation) => {
  if (!automation) return createEmptyAutomation();
  const restAutomation = { ...automation };
  delete restAutomation.conditionRules;
  const existingTriggerConfig = restAutomation.triggerConfig || {};
  const inferredDateTriggerMode =
    restAutomation.triggerType === "inactive_for_days"
      ? "inactive"
      : existingTriggerConfig.dateTriggerMode || "field";
  const inferredActivityScope =
    (existingTriggerConfig.activityCampaignScope === "specific" ||
    existingTriggerConfig.activityCampaignId
      ? "specific"
      : undefined) ||
    existingTriggerConfig.activityScope ||
    (Array.isArray(existingTriggerConfig.activityTypes) &&
    existingTriggerConfig.activityTypes.length > 1
      ? "all"
      : existingTriggerConfig.activityType
        ? "specific"
        : "all");

  return {
    ...createEmptyAutomation(),
    ...restAutomation,
    triggerType:
      restAutomation.triggerType === "inactive_for_days"
        ? "customer_field_date"
        : restAutomation.triggerType || createEmptyAutomation().triggerType,
    actionConfig: {
      ...createEmptyAutomation().actionConfig,
      ...(restAutomation.actionConfig || {}),
      templateId:
        restAutomation.actionConfig?.templateId?._id ||
        restAutomation.actionConfig?.templateId ||
        "",
      variableMappings: restAutomation.actionConfig?.variableMappings || [],
    },
    triggerConfig: {
      ...createEmptyAutomation().triggerConfig,
      ...(restAutomation.triggerConfig || {}),
      dateTriggerMode: inferredDateTriggerMode,
      activityScope: inferredActivityScope,
      activityType:
        inferredActivityScope === "specific"
          ? restAutomation.triggerConfig?.activityType || ""
          : Array.isArray(restAutomation.triggerConfig?.activityTypes) &&
              restAutomation.triggerConfig.activityTypes.length === 1
            ? restAutomation.triggerConfig.activityTypes[0]
            : restAutomation.triggerConfig?.activityType || "",
      activityCampaignScope:
        restAutomation.triggerConfig?.activityCampaignScope ||
        (restAutomation.triggerConfig?.activityCampaignId ? "specific" : "all"),
      activityCampaignId: restAutomation.triggerConfig?.activityCampaignId || "",
      scheduleTime:
        restAutomation.triggerConfig?.scheduleTime ||
        createEmptyAutomation().triggerConfig.scheduleTime,
      scheduleDayOfWeek:
        restAutomation.triggerConfig?.scheduleDayOfWeek ??
        createEmptyAutomation().triggerConfig.scheduleDayOfWeek,
      scheduleDayOfMonth:
        restAutomation.triggerConfig?.scheduleDayOfMonth ??
        createEmptyAutomation().triggerConfig.scheduleDayOfMonth,
      scheduleTimezone:
        restAutomation.triggerConfig?.scheduleTimezone ||
        restAutomation.triggerConfig?.timezone ||
        createEmptyAutomation().triggerConfig.scheduleTimezone,
      daysBefore:
        restAutomation.triggerConfig?.daysBefore ??
        createEmptyAutomation().triggerConfig.daysBefore,
      days:
        restAutomation.triggerConfig?.days ??
        createEmptyAutomation().triggerConfig.days,
      triggerTime:
        restAutomation.triggerConfig?.triggerTime ||
        createEmptyAutomation().triggerConfig.triggerTime,
    },
    audienceRules: restAutomation.audienceRules || {
      logic: "AND",
      conditions: [],
    },
    delay: restAutomation.delay || {
      mode: "immediate",
      value: 0,
      unit: "minutes",
    },
    safetyFlags: restAutomation.safetyFlags || {
      preventDuplicateWindowHours: 24,
      stopIfOptedOut: true,
    },
  };
};

function AutomationDashboardView({
  automations,
  activityCampaigns,
  selectedView,
  onSelectView,
  onCreateNew,
  onEdit,
  onToggleStatus,
  onDuplicate,
  onDelete,
  loading,
  onViewLogs,
}) {
  const filteredAutomations =
    selectedView === "all"
      ? automations
      : automations.filter((automation) => automation.status === selectedView);

  const summary = {
    total: automations.length,
    active: automations.filter((automation) => automation.status === "active")
      .length,
    paused: automations.filter((automation) => automation.status === "paused")
      .length,
    draft: automations.filter((automation) => automation.status === "draft")
      .length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-r from-[#313166] to-[#3d3b83] px-6 py-6 text-white shadow-lg">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Retention Rhythm
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Automation dashboard
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-white/75">
                Build reusable WhatsApp retention journeys using dynamic
                customer fields, typed conditions, and approved templates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["WhatsApp-first", "Dynamic fields", "Retention automation"].map(
              (badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80"
                >
                  {badge}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => {
              const isSelected = selectedView === stat.filter;
              return (
                <button
                  key={stat.key}
                  type="button"
                  onClick={() => onSelectView(stat.filter)}
                  className="rounded-2xl border p-4 text-left transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.16)"
                      : "rgba(255,255,255,0.08)",
                    borderColor: isSelected
                      ? "rgba(255,255,255,0.22)"
                      : "transparent",
                  }}
                >
                  <div className="text-white/70 text-sm">{stat.label}</div>
                  <div className={`mt-2 text-3xl font-semibold ${stat.tone}`}>
                    {summary[stat.key]}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#CB376D] to-[#A72962] px-6 text-[15px] font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto lg:ml-auto"
          >
            <Plus className="h-4 w-4" />
            Create Automation
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#313166]">
              Automations
            </h3>
            <p className="text-sm text-gray-500">
              These flows are now backed by the retention automation APIs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["all", "active", "paused", "draft"].map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => onSelectView(view)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    selectedView === view ? "#313166" : "#F4F5F9",
                  color: selectedView === view ? "white" : "#313166",
                }}
              >
                {view === "all"
                  ? "All"
                  : view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-[#F4F5F9] p-8 text-center text-sm text-gray-500">
              Loading retention automations...
            </div>
          ) : filteredAutomations.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-[#F4F5F9] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#313166]">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-[#313166]">
                No automations found
              </h4>
              <p className="mt-2 text-sm text-gray-500">
                Create your first retention flow to start automating customer
                follow-ups.
              </p>
              <button
                type="button"
                onClick={onCreateNew}
                className="mt-5 inline-flex items-center rounded-xl bg-[#CB376D] px-4 py-2.5 text-sm font-medium text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Automation
              </button>
            </div>
          ) : (
            filteredAutomations.map((automation) => {
              const TriggerIcon =
                triggerIcons[automation.triggerType] || Activity;
              const statusTone =
                automation.status === "active"
                  ? { background: "#16A34A15", color: "#16A34A" }
                  : automation.status === "paused"
                    ? { background: "#D9770615", color: "#D97706" }
                    : { background: "#CB376D15", color: "#CB376D" };

              return (
                <div
                  key={automation._id}
                  className="rounded-2xl border border-gray-100 bg-[#FCFCFF] p-5 shadow-[0_10px_30px_rgba(49,49,102,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => onEdit(automation)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#31316610] text-[#313166]">
                          <TriggerIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-[#313166]">
                            {automation.name}
                          </h4>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {automation.triggerType.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {describeTriggerConfig(automation, activityCampaigns)}
                          </p>
                        </div>
                      </div>
                    </button>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={statusTone}
                    >
                      {automation.status.charAt(0).toUpperCase() +
                        automation.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-[#F4F5F9] p-3">
                      <div className="text-xs uppercase text-gray-400">
                        Audience
                      </div>
                      <div className="mt-1 font-semibold text-[#313166]">
                        {automation.audienceSize || 0}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F4F5F9] p-3">
                      <div className="text-xs uppercase text-gray-400">
                        Delivered
                      </div>
                      <div className="mt-1 font-semibold text-[#313166]">
                        {automation.delivered || 0}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F4F5F9] p-3">
                      <div className="text-xs uppercase text-gray-400">
                        Replied
                      </div>
                      <div className="mt-1 font-semibold text-[#313166]">
                        {automation.replied || 0}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>Created {formatDate(automation.createdAt)}</span>
                    <span>Last run {formatDate(automation.lastRunAt)}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => onEdit(automation)}
                      className="inline-flex items-center rounded-xl bg-[#313166] px-3 py-2 text-xs font-medium text-white"
                    >
                      <Settings2 className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewLogs(automation)}
                      className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
                    >
                      <History className="mr-2 h-4 w-4" />
                      View History
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(automation)}
                      className="inline-flex items-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-[#313166]"
                    >
                      {automation.status === "active" ? (
                        <Pause className="mr-2 h-4 w-4" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      {automation.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(automation)}
                      className="inline-flex items-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-[#313166]"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(automation)}
                      className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function RuleComposer({
  label,
  fields,
  rules,
  draftRule,
  onDraftChange,
  onAddRule,
  onRemoveRule,
  logic,
  onLogicChange,
  canAddRule = true,
  addRuleHint = "",
}) {
  const selectedField = fields.find(
    (field) => field.fieldKey === draftRule.fieldKey,
  );
  const operators = selectedField?.operators || [];

  const renderValueInput = () => {
    if (!selectedField) return null;
    if (
      ["is_true", "is_false", "today", "is_empty", "is_not_empty"].includes(
        draftRule.operator,
      )
    )
      return null;

    if (draftRule.operator === "between") {
      const inputType = selectedField.type === "number" ? "number" : "date";
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type={inputType}
            value={draftRule.value || ""}
            onChange={(event) =>
              onDraftChange({ ...draftRule, value: event.target.value })
            }
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="From"
          />
          <input
            type={inputType}
            value={draftRule.valueTo || ""}
            onChange={(event) =>
              onDraftChange({ ...draftRule, valueTo: event.target.value })
            }
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="To"
          />
        </div>
      );
    }

    if (selectedField.type === "boolean") return null;

    if (selectedField.type === "date") {
      if (["in_next_days", "in_last_days"].includes(draftRule.operator)) {
        return (
          <input
            type="number"
            value={draftRule.value || ""}
            onChange={(event) =>
              onDraftChange({ ...draftRule, value: event.target.value })
            }
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Number of days"
          />
        );
      }

      return (
        <input
          type="date"
          value={draftRule.value || ""}
          onChange={(event) =>
            onDraftChange({ ...draftRule, value: event.target.value })
          }
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      );
    }

    if (selectedField.type === "options" && draftRule.operator === "equals") {
      return (
        <select
          value={draftRule.value || ""}
          onChange={(event) =>
            onDraftChange({ ...draftRule, value: event.target.value })
          }
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Select value</option>
          {selectedField.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={selectedField.type === "number" ? "number" : "text"}
        value={draftRule.value || ""}
        onChange={(event) =>
          onDraftChange({ ...draftRule, value: event.target.value })
        }
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        placeholder={
          selectedField.type === "options" ? "Comma separated values" : "Value"
        }
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#313166]">{label}</div>
          <div className="text-xs text-gray-500">
            Choose dynamic customer fields and typed operators.
          </div>
        </div>
        <select
          value={logic}
          onChange={(event) => onLogicChange(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={draftRule.fieldKey}
          onChange={(event) =>
            onDraftChange({
              fieldKey: event.target.value,
              operator: "",
              value: "",
              valueTo: "",
            })
          }
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Select field</option>
          {fields.map((field) => (
            <option key={field.fieldKey} value={field.fieldKey}>
              {field.label} ({field.sourceSection})
            </option>
          ))}
        </select>

        <select
          value={draftRule.operator}
          onChange={(event) =>
            onDraftChange({
              ...draftRule,
              operator: event.target.value,
              value: "",
              valueTo: "",
            })
          }
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          disabled={!selectedField}
        >
          <option value="">Select operator</option>
          {operators.map((operator) => (
            <option key={operator} value={operator}>
              {operatorLabels[operator] || operator}
            </option>
          ))}
        </select>

        {renderValueInput() || (
          <div className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-400">
            No extra value needed
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onAddRule}
        disabled={!canAddRule}
        className="rounded-xl bg-[#CB376D] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add Rule
      </button>
      {addRuleHint ? (
        <div className="text-xs text-amber-600">{addRuleHint}</div>
      ) : null}

      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule, index) => {
            const field = fields.find(
              (item) => item.fieldKey === rule.fieldKey,
            );
            return (
              <div
                key={`${rule.fieldKey}-${index}`}
                className="flex items-center justify-between rounded-xl bg-[#F4F5F9] px-4 py-3 text-sm text-[#313166]"
              >
                <span>
                  <b>{field?.label || rule.fieldKey}</b>{" "}
                  {operatorLabels[rule.operator] || rule.operator}{" "}
                  <b>
                    {rule.valueTo
                      ? `${rule.value} to ${rule.valueTo}`
                      : rule.value || ""}
                  </b>
                </span>
                <button type="button" onClick={() => onRemoveRule(index)}>
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RetentionBuilderView({
  initialAutomation,
  fields,
  templates,
  activityCampaigns,
  onBack,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() =>
    normalizeAutomationForForm(initialAutomation),
  );
  const steps = getStepLabels(form.triggerType);
  const totalSteps = getTotalSteps(form.triggerType);
  const audienceStep = getAudienceStep(form.triggerType);
  const actionStep = getActionStep(form.triggerType);
  const reviewStep = getReviewStep(form.triggerType);
  const [audienceDraftRule, setAudienceDraftRule] = useState({
    fieldKey: "",
    operator: "",
    value: "",
    valueTo: "",
  });
  const [audiencePreview, setAudiencePreview] = useState({
    loading: false,
    count: 0,
    customers: [],
    error: "",
    page: 1,
    totalPages: 1,
    limit: 5,
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const hasAudienceDraftInput = Object.values(audienceDraftRule).some((value) =>
    Boolean(String(value || "").trim()),
  );

  useEffect(() => {
    setForm(normalizeAutomationForForm(initialAutomation));
  }, [initialAutomation]);

  useEffect(() => {
    setStep((current) => Math.min(current, totalSteps));
  }, [totalSteps]);

  const goToStep = (nextStep) => {
    const movingPastAudienceStep =
      audienceStep && nextStep > audienceStep;

    if (movingPastAudienceStep) {
      const hasDraftRuleReady = audienceRuleValidation.valid;

      if (hasAudienceDraftInput) {
        showToast(
          hasDraftRuleReady
            ? "Click Add Rule to add this audience rule before continuing."
            : audienceRuleValidation.message ||
              "Finish the current rule, then click Add Rule before continuing.",
          "warning"
        );
        return;
      }
    }

    setStep(Math.min(totalSteps, nextStep));
  };

  const selectedTriggerGroup =
    triggerGroups.find((group) =>
      group.items.some((item) => item.id === form.triggerType),
    ) || triggerGroups[0];
  const selectedTemplate = templates.find(
    (template) => template._id === form.actionConfig.templateId,
  );
  const selectedActivityCampaigns = getCampaignList(
    activityCampaigns,
    form.triggerConfig.activityType,
  );
  const selectedActivityCampaign = selectedActivityCampaigns.find(
    (campaign) =>
      String(campaign?._id) === String(form.triggerConfig.activityCampaignId),
  );
  const dateFields = fields.filter((field) => field.type === "date");
  const selectedDateField = dateFields.find(
    (field) => field.fieldKey === form.triggerConfig.fieldKey,
  );
  const templateVariables = extractTemplateVariables(selectedTemplate);
  const templateHeaderMediaType = getTemplateHeaderMediaType(selectedTemplate);
  const templateHeader = getTemplateHeaderComponent(selectedTemplate);
  const templateBody = selectedTemplate?.components?.find(
    (component) => component.type === "BODY",
  );
  const templateFooter = selectedTemplate?.components?.find(
    (component) => component.type === "FOOTER",
  );
  const templateButtons =
    selectedTemplate?.components?.find((component) => component.type === "BUTTONS")
      ?.buttons || [];
  const previewHeaderText = getTemplatePreviewText(
    templateHeader?.text || "",
    "HEADER",
    form.actionConfig.variableMappings || [],
    fields,
  );
  const previewBodyText = getTemplatePreviewText(
    templateBody?.text || "",
    "BODY",
    form.actionConfig.variableMappings || [],
    fields,
  );
  const previewFooterText = getTemplatePreviewText(
    templateFooter?.text || "",
    "FOOTER",
    form.actionConfig.variableMappings || [],
    fields,
  );
  const isEditingAutomation = Boolean(initialAutomation?._id);

  // Updated audience preview fetch function with pagination
  const fetchAudiencePreview = async (page = 1) => {
    try {
      setAudiencePreview((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));

      const response = await api.post("/api/retention-automations/preview-audience", {
        audienceRules: form.audienceRules,
        search: "",
        limit: audiencePreview.limit,
        page: page,
      });

      setAudiencePreview((previous) => ({
        ...previous,
        loading: false,
        count: response.data?.data?.count || 0,
        customers: response.data?.data?.customers || [],
        totalPages: response.data?.data?.totalPages || 1,
        page: response.data?.data?.page || page,
        error: "",
      }));
    } catch (error) {
      setAudiencePreview((previous) => ({
        ...previous,
        loading: false,
        error:
          error.response?.data?.message ||
          "Failed to preview the current audience",
      }));
    }
  };

  // Effect to fetch audience preview when step changes
  useEffect(() => {
    if (step !== audienceStep) return undefined;

    const timer = setTimeout(() => {
      fetchAudiencePreview(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [step, audienceStep, form.audienceRules, form.triggerType, form.triggerConfig]);

  const updateTemplate = (templateId) => {
    const template = templates.find((item) => item._id === templateId);
    const nextVariables = extractTemplateVariables(template);
    const nextMappings = nextVariables.map(
      (descriptor) =>
        findVariableMapping(form.actionConfig.variableMappings, descriptor) || {
          componentType: descriptor.componentType,
          variable: descriptor.variable,
          sourceType: "customer_field",
          value: "firstname",
        },
    );
    const mediaType = getTemplateHeaderMediaType(template);

    setForm({
      ...form,
      actionConfig: {
        ...form.actionConfig,
        templateId,
        templateName: template?.name || "",
        languageCode: template?.language || "en_US",
        variableMappings: nextMappings,
        mediaType,
        mediaUrl:
          mediaType === form.actionConfig.mediaType
            ? form.actionConfig.mediaUrl
            : "",
      },
    });
  };

  const handleMediaUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation for images
    if (templateHeaderMediaType === "IMAGE") {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          "Unsupported image format. Please upload a JPG, JPEG, PNG, or WebP file.",
          "error",
        );
        event.target.value = "";
        return;
      }
      const maxImgSize = 1 * 1024 * 1024; // 1MB for consistency with other modules
      if (file.size > maxImgSize) {
        showToast(
          "Image size exceeds the maximum allowed limit. Please upload an image within the permitted size.",
          "error",
        );
        event.target.value = "";
        return;
      }
    } else {
      // Validation for other media (VIDEO, DOCUMENT)
      const maxSize =
        templateHeaderMediaType === "VIDEO"
          ? 64 * 1024 * 1024
          : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast(
          `File too large. Max ${maxSize / (1024 * 1024)}MB.`,
          "warning",
        );
        event.target.value = "";
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingMedia(true);
      const response = await api.post(
        "/api/integrationManagement/whatsapp/media/upload",
        formData,
      );
      if (response.data?.status) {
        setForm((previous) => ({
          ...previous,
          actionConfig: {
            ...previous.actionConfig,
            mediaUrl: response.data.url || "",
            mediaType: templateHeaderMediaType,
          },
        }));
        showToast("Media uploaded successfully", "success");
      }
    } catch (error) {
      console.error("Error uploading template media:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Image upload failed. Please verify the file and try again.";
      showToast(errorMsg, "error");
    } finally {
      setUploadingMedia(false);
      event.target.value = "";
    }
  };

  const addRule = (ruleType, draftRule) => {
    const validation = validateRuleDraft(draftRule, fields);
    if (!validation.valid) {
      showToast(validation.message, "warning");
      return;
    }

    setForm((previous) => ({
      ...previous,
      [ruleType]: {
        ...previous[ruleType],
        conditions: [...previous[ruleType].conditions, draftRule],
      },
    }));

    if (ruleType === "audienceRules") {
      setAudienceDraftRule({
        fieldKey: "",
        operator: "",
        value: "",
        valueTo: "",
      });
    }
  };

  const removeRule = (ruleType, index) => {
    setForm((previous) => ({
      ...previous,
      [ruleType]: {
        ...previous[ruleType],
        conditions: previous[ruleType].conditions.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
    }));
  };

  const applyQuickSegment = (segment) => {
    setForm((previous) => ({
      ...previous,
      audienceRules: segment.rules,
    }));
  };

  const handleSave = () => {
    if (!form.actionConfig.templateId) {
      showToast("Choose a WhatsApp template before saving", "warning");
      return;
    }

    if (form.triggerType === "customer_activity_completed") {
      if (
        (form.triggerConfig.activityScope || "all") === "specific" &&
        !form.triggerConfig.activityType
      ) {
        showToast("Choose a specific activity type", "warning");
        return;
      }
      if (
        (form.triggerConfig.activityCampaignScope || "all") === "specific" &&
        !form.triggerConfig.activityCampaignId
      ) {
        showToast("Choose a specific campaign for the selected activity", "warning");
        return;
      }
    }

    if (form.triggerType === "scheduled_recurring" && !form.triggerConfig.scheduleTime) {
      showToast("Choose an exact time for the recurring trigger", "warning");
      return;
    }

    if (
      form.triggerType === "whatsapp_keyword" &&
      !String(form.triggerConfig.keyword || "").trim()
    ) {
      showToast("Enter a keyword before saving this automation", "warning");
      return;
    }

    if (form.triggerType === "customer_field_date") {
      if ((form.triggerConfig.dateTriggerMode || "field") === "inactive") {
        if (Number(form.triggerConfig.days) < 1) {
          showToast("Enter how many inactive days should trigger this automation", "warning");
          return;
        }
      } else if (!form.triggerConfig.fieldKey) {
        showToast("Choose a date field for the trigger", "warning");
        return;
      }
    }

    const missingMappings = templateVariables.filter((descriptor) => {
      const mapping = findVariableMapping(
        form.actionConfig.variableMappings,
        descriptor,
      );
      return !mapping?.value?.trim();
    });

    if (missingMappings.length > 0) {
      showToast("Fill all template variables before saving", "warning");
      return;
    }

    if (templateHeaderMediaType && !form.actionConfig.mediaUrl?.trim()) {
      showToast(
        `Add a ${templateHeaderMediaType.toLowerCase()} header URL or upload media before saving`,
        "warning",
      );
      return;
    }

    setShowSaveConfirm(true);
  };

  const audienceRuleValidation = validateRuleDraft(audienceDraftRule, fields);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > audiencePreview.totalPages) return;
    fetchAudiencePreview(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setAudiencePreview((previous) => ({
      ...previous,
      limit: newLimit,
      page: 1,
    }));
    fetchAudiencePreview(1);
  };

  return (
    <>
    <div className="space-y-6">
            <div className="rounded-[28px] bg-gradient-to-r from-[#313166] to-[#3d3b83] px-6 py-6 text-white shadow-lg">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                      {isEditingAutomation
                        ? "Edit automation"
                        : "Create automation"}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">{form.name}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-white/75">
                      This builder now uses the real retention APIs, dynamic field
                      registry, and template catalog.
                    </p>
                  </div>
                </div>
    
                <div className="flex flex-wrap gap-2">
                  {steps.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goToStep(index + 1)}
                      className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          step === index + 1 ? "white" : "rgba(255,255,255,0.1)",
                        color:
                          step === index + 1 ? "#313166" : "rgba(255,255,255,0.8)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
    
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/15"
                >
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back to dashboard
                </button>
    
                <div className="text-xs uppercase tracking-[0.22em] text-white/55">
                  Retention rhythm automation builder
                </div>
              </div>
            </div>
    
            <div
              className={`grid gap-6 ${step === actionStep || step === reviewStep ? "xl:grid-cols-[1.05fr_0.95fr]" : "grid-cols-1"}`}
            >
              <div className="space-y-6">
                <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-gray-400">
                        Step {step} of {totalSteps}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-[#313166]">
                        {steps[step - 1]}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Use dynamic fields, typed operators, and approved templates.
                      </p>
                    </div>
    
                    <div className="flex flex-wrap gap-2">
                      {steps.map((label, index) => (
                      <button
                          key={label}
                          type="button"
                          onClick={() => goToStep(index + 1)}
                          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                          style={{
                            backgroundColor:
                              step === index + 1 ? "#313166" : "#F4F5F9",
                            color: step === index + 1 ? "white" : "#313166",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
    
                  {step === 1 && (
                    <div className="space-y-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#313166]">
                          Automation name
                        </span>
                        <input
                          value={form.name}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#313166]"
                          placeholder="Enter automation name"
                        />
                      </label>
    
                      {/* <div className="grid gap-3 md:grid-cols-3">
                      {journeyOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setForm({ ...form, journeyType: option.id })}
                          className="rounded-2xl border p-4 text-left transition-all"
                          style={{
                            borderColor: form.journeyType === option.id ? "#CB376D" : "#E5E7EB",
                            backgroundColor: form.journeyType === option.id ? "#CB376D08" : "white",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-[#313166]">{option.title}</div>
                              <div className="mt-1 text-sm text-gray-500">{option.note}</div>
                            </div>
                            {form.journeyType === option.id ? <CheckCircle2 className="h-5 w-5 text-[#CB376D]" /> : null}
                          </div>
                        </button>
                      ))}
                    </div> */}
                    </div>
                  )}
    
                  {step === 2 && (
                    <div className="space-y-4">
                      {triggerGroups.map((group) => (
                        <div key={group.name}>
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                              {group.name}
                            </h4>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              const active = form.triggerType === item.id;
    
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      triggerType: item.id,
                                    }));
    
                                    // 🚀 ADD THIS
                                    if (item.id === "new_customer") {
                                      setStep(3); // skip Audience for new customer
                                    }
                                  }}
                                  className="rounded-2xl border p-4 text-left transition-all"
                                  style={{
                                    borderColor: active ? group.color : "#E5E7EB",
                                    backgroundColor: active
                                      ? `${group.color}08`
                                      : "white",
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                                      style={{
                                        backgroundColor: `${group.color}15`,
                                      }}
                                    >
                                      <Icon
                                        className="h-5 w-5"
                                        style={{ color: group.color }}
                                      />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-[#313166]">
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Trigger this flow
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
    
                      {form.triggerType === "customer_field_date" && (
                        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Trigger on
                            </label>
                            <select
                              value={form.triggerConfig.dateTriggerMode || "field"}
                              onChange={(event) =>
                                setForm((previous) => ({
                                  ...previous,
                                  triggerConfig: {
                                    ...previous.triggerConfig,
                                    dateTriggerMode: event.target.value,
                                    fieldKey:
                                      event.target.value === "inactive"
                                        ? ""
                                        : previous.triggerConfig.fieldKey || "",
                                    days:
                                      event.target.value === "inactive"
                                        ? Number(previous.triggerConfig.days) || 30
                                        : previous.triggerConfig.days ?? 30,
                                  },
                                }))
                              }
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                            >
                              <option value="field">Customer date field</option>
                              <option value="inactive">Inactive days</option>
                            </select>
                          </div>
    
                          {(form.triggerConfig.dateTriggerMode || "field") === "field" ? (
                            <>
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Date field
                                </label>
                                <select
                                  value={form.triggerConfig.fieldKey}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        fieldKey: event.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                >
                                  <option value="">Choose a date field</option>
                                  {dateFields.map((field) => (
                                    <option key={field.fieldKey} value={field.fieldKey}>
                                      {field.label} ({field.sourceSection})
                                    </option>
                                  ))}
                                </select>
                              </div>
    
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Days before
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={form.triggerConfig.daysBefore ?? 0}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        daysBefore: Math.max(
                                          0,
                                          Number(event.target.value) || 0,
                                        ),
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                  placeholder="0"
                                />
                              </div>
    
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Trigger time
                                </label>
                                <input
                                  type="time"
                                  value={form.triggerConfig.triggerTime || "09:00"}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        triggerTime: event.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                />
                              </div>
    
                              <div className="rounded-xl bg-[#F4F5F9] px-4 py-3 text-xs text-gray-500">
                                <div>
                                  {selectedDateField
                                    ? `${selectedDateField.label} will trigger ${Number(form.triggerConfig.daysBefore) || 0} day${Number(form.triggerConfig.daysBefore) === 1 ? "" : "s"} before the date at ${formatScheduleTime(form.triggerConfig.triggerTime || "09:00")}.`
                                    : "Pick a date field and set how many days before it should trigger."}
                                </div>
                                {selectedDateField &&
                                  (String(selectedDateField.fieldKey).toLowerCase().includes("birthday") ||
                                    String(selectedDateField.fieldKey).toLowerCase().includes("anniversary")) && (
                                    <div className="mt-1">
                                      Birthday and anniversary fields repeat every year.
                                    </div>
                                  )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Inactive for how many days?
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={form.triggerConfig.days || ""}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        days: Math.max(1, Number(event.target.value) || 0),
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                  placeholder="30"
                                />
                              </div>
    
                              <div className="rounded-xl bg-[#F4F5F9] px-4 py-3 text-xs text-gray-500">
                                Customers who have been inactive for this many days will enter the flow.
                              </div>
                            </>
                          )}
                        </div>
                      )}
    
                      {form.triggerType === "whatsapp_keyword" && (
                        <input
                          value={form.triggerConfig.keyword || ""}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              triggerConfig: {
                                ...form.triggerConfig,
                                keyword: event.target.value,
                              },
                            })
                          }
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          placeholder="Enter keyword"
                        />
                      )}
    
                      {form.triggerType === "customer_activity_completed" && (
                        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Activity selection
                              </label>
                              <select
                                value={form.triggerConfig.activityScope || "all"}
                                onChange={(event) =>
                                  setForm((previous) => ({
                                    ...previous,
                                    triggerConfig: {
                                      ...previous.triggerConfig,
                                      activityScope: event.target.value,
                                      activityType:
                                        event.target.value === "all"
                                          ? ""
                                          : previous.triggerConfig.activityType || "spinWheel",
                                      activityCampaignScope:
                                        event.target.value === "all"
                                          ? "all"
                                          : previous.triggerConfig.activityCampaignScope || "all",
                                      activityCampaignId:
                                        event.target.value === "all"
                                          ? ""
                                          : previous.triggerConfig.activityCampaignId || "",
                                    },
                                  }))
                                }
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              >
                                <option value="all">All activities</option>
                                <option value="specific">Specific activity</option>
                              </select>
                            </div>
    
                            {form.triggerConfig.activityScope === "specific" && (
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Activity type
                                </label>
                                <select
                                  value={form.triggerConfig.activityType || "spinWheel"}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        activityType: event.target.value,
                                        activityCampaignId: "",
                                        activityCampaignScope:
                                          previous.triggerConfig.activityCampaignScope || "all",
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                >
                                  <option value="spinWheel">Spin Wheel</option>
                                  <option value="scratchCard">Scratch Card</option>
                                  <option value="quiz">Quiz</option>
                                </select>
                              </div>
                            )}
                          </div>
    
                          {(form.triggerConfig.activityScope || "all") === "specific" && (
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Campaign scope
                                </label>
                                <select
                                  value={form.triggerConfig.activityCampaignScope || "all"}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        activityCampaignScope: event.target.value,
                                        activityCampaignId:
                                          event.target.value === "all" ? "" : previous.triggerConfig.activityCampaignId || "",
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                >
                                  <option value="all">All campaigns</option>
                                  <option value="specific">Specific campaign</option>
                                </select>
                              </div>
    
                              {(form.triggerConfig.activityCampaignScope || "all") === "specific" && (
                                <div>
                                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Select {activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label || "activity"} campaign
                                  </label>
                                  <select
                                    value={
                                      getCampaignSelectValue(
                                        activityCampaigns,
                                        form.triggerConfig.activityType,
                                        form.triggerConfig.activityCampaignId,
                                      )
                                    }
                                    onChange={(event) =>
                                      setForm((previous) => ({
                                        ...previous,
                                        triggerConfig: {
                                          ...previous.triggerConfig,
                                          activityCampaignId: event.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                  >
                                    <option value="">
                                      Select a {activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label?.toLowerCase() || "campaign"}
                                    </option>
                                    {selectedActivityCampaigns.map((campaign) => (
                                      <option key={campaign._id} value={campaign._id}>
                                        {getCampaignLabel(campaign, form.triggerConfig.activityType)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}
    
                          <div className="text-xs text-gray-500">
                            {(form.triggerConfig.activityScope || "all") === "all"
                              ? "Watching all completed activities."
                              : (form.triggerConfig.activityCampaignScope || "all") === "specific"
                                ? `Watching ${activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label || "a specific activity"}: ${selectedActivityCampaign ? getCampaignLabel(selectedActivityCampaign, form.triggerConfig.activityType) : "specific campaign"}.`
                                : `Watching ${activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label || "a specific activity"}.`}
                          </div>
                        </div>
                      )}
    
                      {form.triggerType === "scheduled_recurring" && (
                        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Repeat
                              </label>
                              <select
                                value={form.triggerConfig.scheduleType || "daily"}
                                onChange={(event) =>
                                  setForm((previous) => ({
                                    ...previous,
                                    triggerConfig: {
                                      ...previous.triggerConfig,
                                      scheduleType: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Exact time
                              </label>
                              <input
                                type="time"
                                value={form.triggerConfig.scheduleTime || "09:00"}
                                onChange={(event) =>
                                  setForm((previous) => ({
                                    ...previous,
                                    triggerConfig: {
                                      ...previous.triggerConfig,
                                      scheduleTime: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
    
                          <div className="grid gap-3 md:grid-cols-2">
                            {form.triggerConfig.scheduleType === "weekly" && (
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Weekday
                                </label>
                                <select
                                  value={form.triggerConfig.scheduleDayOfWeek ?? 1}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        scheduleDayOfWeek: Number(event.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                >
                                  {weekdayOptions.map((day) => (
                                    <option key={day.value} value={day.value}>
                                      {day.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
    
                            {form.triggerConfig.scheduleType === "monthly" && (
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Date
                                </label>
                                <select
                                  value={form.triggerConfig.scheduleDayOfMonth ?? 1}
                                  onChange={(event) =>
                                    setForm((previous) => ({
                                      ...previous,
                                      triggerConfig: {
                                        ...previous.triggerConfig,
                                        scheduleDayOfMonth: Number(event.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                >
                                  {Array.from({ length: 31 }, (_, index) => index + 1).map(
                                    (day) => (
                                      <option key={day} value={day}>
                                        {day}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </div>
                            )}
                          </div>
    
                          <div className="rounded-xl bg-[#F4F5F9] px-4 py-3 text-xs text-gray-500">
                            {form.triggerConfig.scheduleType === "daily" &&
                              `Runs every day at ${formatScheduleTime(form.triggerConfig.scheduleTime)}`}
                            {form.triggerConfig.scheduleType === "weekly" &&
                              `Runs every ${weekdayOptions.find((day) => day.value === Number(form.triggerConfig.scheduleDayOfWeek))?.label || "week day"} at ${formatScheduleTime(form.triggerConfig.scheduleTime)}`}
                            {form.triggerConfig.scheduleType === "monthly" &&
                              `Runs on day ${form.triggerConfig.scheduleDayOfMonth || 1} at ${formatScheduleTime(form.triggerConfig.scheduleTime)}`}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
      {/* ... rest of your JSX remains the same until the audience preview section ... */}

      {audienceStep && step === audienceStep && (
        <div className="space-y-4">
          <RuleComposer
            label="Audience rules"
            fields={fields}
            rules={form.audienceRules.conditions}
            draftRule={audienceDraftRule}
            onDraftChange={setAudienceDraftRule}
            onAddRule={() =>
              addRule("audienceRules", audienceDraftRule)
            }
            onRemoveRule={(index) => removeRule("audienceRules", index)}
            logic={form.audienceRules.logic}
            onLogicChange={(logic) =>
              setForm((previous) => ({
                ...previous,
                audienceRules: { ...previous.audienceRules, logic },
              }))
            }
            canAddRule={audienceRuleValidation.valid}
            addRuleHint={audienceRuleValidation.message}
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {previewQuickSegments.map((segment) => (
              <button
                key={segment.key}
                type="button"
                onClick={() => applyQuickSegment(segment)}
                className="rounded-2xl border px-4 py-3 text-left transition-all"
                style={{
                  borderColor:
                    form.audienceRules.conditions.length ===
                    segment.rules.conditions.length
                      ? "#313166"
                      : "#E5E7EB",
                  backgroundColor: "#fff",
                }}
              >
                <div className="font-semibold text-[#313166]">
                  {segment.label}
                </div>
                <div className="text-xs text-gray-500">
                  Audience preset
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
            <div className="mb-2 text-sm font-semibold text-[#313166]">
              Dynamic customer fields
            </div>
            <div className="flex flex-wrap gap-2">
              {fields.map((field) => (
                <span
                  key={field.fieldKey}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#313166]"
                >
                  {field.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-[#313166]">
                  Audience preview
                </div>
                <div className="text-xs text-gray-500">
                  Live estimate based on the current audience rules.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* <select
                  value={audiencePreview.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select> */}
                <button
                  type="button"
                  onClick={() => fetchAudiencePreview(audiencePreview.page)}
                  className="inline-flex items-center rounded-xl border border-[#313166] px-3 py-2 text-xs font-medium text-[#313166]"
                >
                  Refresh preview
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#313166] px-4 py-4 text-white">
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Matching customers
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {audiencePreview.loading ? "..." : audiencePreview.count}
                </div>
              </div>
              <div className="rounded-2xl bg-[#F4F5F9] px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Preview state
                </div>
                <div className="mt-2 text-sm font-medium text-[#313166]">
                  {audiencePreview.loading
                    ? "Refreshing preview"
                    : audiencePreview.error
                      ? "Preview unavailable"
                      : "Preview ready"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {audiencePreview.error || "Shows the latest filtered audience."}
                </div>
              </div>
              <div className="rounded-2xl bg-[#F4F5F9] px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Showing
                </div>
                <div className="mt-2 text-lg font-semibold text-[#313166]">
                  {audiencePreview.customers?.length || 0} customers
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Page {audiencePreview.page} of {audiencePreview.totalPages}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Sample customers
                </div>
                <span className="text-xs text-gray-400">
                  Page {audiencePreview.page} of {audiencePreview.totalPages}
                </span>
              </div>
              {audiencePreview.customers?.length ? (
                <div className="space-y-2">
                  {audiencePreview.customers.map((customer) => (
                    <div
                      key={customer._id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FCFCFF] px-4 py-3 text-sm"
                    >
                      <div>
                        <div className="font-medium text-[#313166]">
                          {[customer.firstname, customer.lastname]
                            .filter(Boolean)
                            .join(" ") || "Unknown Customer"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPhone(customer.countryCode, customer.mobileNumber)}
                        </div>
                      </div>
                      <span className="rounded-full bg-[#31316610] px-3 py-1 text-[11px] font-medium text-[#313166]">
                        Preview
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-[#FCFCFF] px-4 py-5 text-sm text-gray-500">
                  {audiencePreview.loading
                    ? "Loading matching customers..."
                    : "No customers match the current preview."}
                </div>
              )}

              {/* Pagination Controls */}
              {!audiencePreview.loading && audiencePreview.customers?.length > 0 && (
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handlePageChange(audiencePreview.page - 1)}
                    disabled={audiencePreview.page <= 1}
                    className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[#313166] transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page {audiencePreview.page} of {audiencePreview.totalPages}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({audiencePreview.count} total)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePageChange(audiencePreview.page + 1)}
                    disabled={audiencePreview.page >= audiencePreview.totalPages}
                    className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[#313166] transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
 {step === actionStep && (
                <div className="space-y-4">
                  <select
                    value={form.actionConfig.templateId}
                    onChange={(event) => updateTemplate(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">Choose WhatsApp template</option>
                    {templates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name} ({template.status})
                      </option>
                    ))}
                  </select>

                  {templateHeaderMediaType && (
                    <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
                      <div className="text-sm font-semibold text-[#313166]">
                        {templateHeaderMediaType} header media
                      </div>
                      <p className="text-sm text-gray-500">
                        This template uses a media header. Add the file URL or
                        upload the media that should be sent with the
                        automation.
                      </p>
                      <input
                        value={form.actionConfig.mediaUrl || ""}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            actionConfig: {
                              ...form.actionConfig,
                              mediaUrl: event.target.value,
                              mediaType: templateHeaderMediaType,
                            },
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                        placeholder={`Paste ${templateHeaderMediaType.toLowerCase()} URL here...`}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#313166] px-4 py-2 text-sm font-medium text-[#313166]">
                          <input
                            type="file"
                            className="hidden"
                            accept={
                              templateHeaderMediaType === "IMAGE"
                                ? "image/*"
                                : templateHeaderMediaType === "VIDEO"
                                  ? "video/*"
                                  : ".pdf,.doc,.docx"
                            }
                            onChange={handleMediaUpload}
                          />
                          {uploadingMedia
                            ? "Uploading..."
                            : form.actionConfig.mediaUrl
                              ? "Replace File"
                              : "Upload File"}
                        </label>
                        {form.actionConfig.mediaUrl ? (
                          <span className="truncate text-xs text-gray-500">
                            {form.actionConfig.mediaUrl}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
                    <div className="flex flex-wrap gap-2">
                      {delayOptions.map((item) => {
                        const isSelected =
                          form.delay.mode === item.mode &&
                          form.delay.value === item.value &&
                          form.delay.unit === item.unit;

                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() =>
                              setForm((previous) => ({
                                ...previous,
                                delay: {
                                  mode: item.mode,
                                  value: item.value,
                                  unit: item.unit,
                                },
                              }))
                            }
                            className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                            style={{
                              backgroundColor: isSelected ? "#313166" : "white",
                              color: isSelected ? "white" : "#313166",
                              borderColor: isSelected ? "#313166" : "#E5E7EB",
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Custom delay
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.delay.value}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              delay: {
                                ...previous.delay,
                                mode: Number(event.target.value) > 0 ? "delay" : "immediate",
                                value: Number(event.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          placeholder="Enter a value"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Unit
                        </div>
                        <select
                          value={form.delay.unit}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              delay: {
                                ...previous.delay,
                                mode: Number(previous.delay.value) > 0 ? "delay" : "immediate",
                                unit: event.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                        >
                          {delayUnitOptions.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Use the quick options above, or set a custom after delay in minutes, hours, or days.
                    </div>
                  </div>

                  {templateVariables.length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
                      <div className="text-sm font-semibold text-[#313166]">
                        Template variable mapping
                      </div>
                      {templateVariables.map((descriptor) => {
                        const mapping = findVariableMapping(
                          form.actionConfig.variableMappings,
                          descriptor,
                        ) || {
                          componentType: descriptor.componentType,
                          variable: descriptor.variable,
                          sourceType: "customer_field",
                          value: "firstname",
                        };
                        return (
                          <div
                            key={descriptor.key}
                            className="grid gap-3 md:grid-cols-3"
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {descriptor.componentType}
                              </div>
                              <input
                                value={descriptor.variable}
                                readOnly
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                            <select
                              value={mapping.sourceType}
                              onChange={(event) => {
                                const nextMappings = upsertVariableMapping(
                                  form.actionConfig.variableMappings,
                                  descriptor,
                                  {
                                    ...mapping,
                                    sourceType: event.target.value,
                                    value: "",
                                  },
                                );
                                setForm({
                                  ...form,
                                  actionConfig: {
                                    ...form.actionConfig,
                                    variableMappings: nextMappings,
                                  },
                                });
                              }}
                              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                            >
                              <option value="customer_field">
                                Customer field
                              </option>
                              <option value="static">Static value</option>
                              <option value="derived">Derived value</option>
                            </select>
                            {mapping.sourceType === "customer_field" ? (
                              <select
                                value={mapping.value}
                                onChange={(event) => {
                                  const nextMappings = upsertVariableMapping(
                                    form.actionConfig.variableMappings,
                                    descriptor,
                                    {
                                      ...mapping,
                                      value: event.target.value,
                                    },
                                  );
                                  setForm({
                                    ...form,
                                    actionConfig: {
                                      ...form.actionConfig,
                                      variableMappings: nextMappings,
                                    },
                                  });
                                }}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              >
                                <option value="">Choose field</option>
                                {fields.map((field) => (
                                  <option
                                    key={field.fieldKey}
                                    value={field.fieldKey}
                                  >
                                    {field.label}
                                  </option>
                                ))}
                              </select>
                            ) : mapping.sourceType === "derived" ? (
                              <select
                                value={mapping.value}
                                onChange={(event) => {
                                  const nextMappings = upsertVariableMapping(
                                    form.actionConfig.variableMappings,
                                    descriptor,
                                    {
                                      ...mapping,
                                      value: event.target.value,
                                    },
                                  );
                                  setForm({
                                    ...form,
                                    actionConfig: {
                                      ...form.actionConfig,
                                      variableMappings: nextMappings,
                                    },
                                  });
                                }}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              >
                                <option value="">Choose derived value</option>
                                <option value="full_name">Full name</option>
                                <option value="first_name">First name</option>
                                <option value="last_name">Last name</option>
                                <option value="mobile_number">
                                  Mobile number
                                </option>
                                <option value="loyalty_points">
                                  Loyalty points
                                </option>
                                <option value="store_name">Store name</option>
                                <option value="current_date">
                                  Current date
                                </option>
                              </select>
                            ) : (
                              <input
                                value={mapping.value}
                                onChange={(event) => {
                                  const nextMappings = upsertVariableMapping(
                                    form.actionConfig.variableMappings,
                                    descriptor,
                                    {
                                      ...mapping,
                                      value: event.target.value,
                                    },
                                  );
                                  setForm({
                                    ...form,
                                    actionConfig: {
                                      ...form.actionConfig,
                                      variableMappings: nextMappings,
                                    },
                                  });
                                }}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                                placeholder="Static value"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {step === reviewStep && (
                <div className="space-y-8 py-4">
                  <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FBFBFE] via-white to-[#F5F6FC] p-4 sm:p-6">
                    <div className="pointer-events-none absolute left-[27px] top-10 bottom-10 w-0.5 border-l-2 border-dashed border-gray-200 lg:hidden" />

                    <div className="relative flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-4">
                      <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-[#D8DBEC] lg:block" />

                      {/* Trigger Node */}
                      <div className="z-10 flex flex-1 flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm outline outline-4 outline-white">
                          <Zap size={24} />
                        </div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Trigger
                          </div>
                          <div className="mt-1 text-sm font-bold text-[#313166]">
                            {form.triggerType.replaceAll("_", " ")}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            Starts the journey
                          </div>
                        </div>
                      </div>

                      {/* Delay Node */}
                      <div className="z-10 flex flex-1 flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm outline outline-4 outline-white">
                          <Clock size={24} />
                        </div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                            Delay
                          </div>
                          <div className="mt-1 text-sm font-bold text-[#313166]">
                            {formatDelayLabel(form.delay)}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            Wait before action
                          </div>
                        </div>
                      </div>

                      {/* Action Node */}
                      <div className="z-10 flex flex-1 flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#31316610] text-[#313166] shadow-sm outline outline-4 outline-white">
                          <MessageCircle size={24} />
                        </div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[#313166]">
                            Action
                          </div>
                          <div className="mt-1 text-sm font-bold text-[#313166]">
                            {selectedTemplate?.name || "WhatsApp Message"}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            Send template
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {audienceStep ? (
                      <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#313166]">
                            Audience Filtering
                          </h4>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {form.audienceRules.logic}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {form.audienceRules.conditions.length > 0 ? (
                            form.audienceRules.conditions.map((rule, idx) => {
                              const field = fields.find(
                                (f) => f.fieldKey === rule.fieldKey,
                              );
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-gray-600"
                                >
                                  <CheckCircle2
                                    size={12}
                                    className="text-emerald-500"
                                  />
                                  <span>
                                    <b>{field?.label || rule.fieldKey}</b>{" "}
                                    {operatorLabels[rule.operator] ||
                                      rule.operator}{" "}
                                    <b>{rule.value || ""}</b>
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              No audience rules (targeting all)
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-5">
                        <div className="text-sm font-bold text-[#313166]">
                          Audience step skipped
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          New customer journeys go straight from the trigger to
                          the action step.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl border border-[#313166] px-5 py-2.5 text-sm font-medium text-[#313166]"
                >
                  Back to dashboard
                </button>

                <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => goToStep(step + 1)}
                    className="rounded-xl bg-[#CB376D] px-5 py-2.5 text-sm font-medium text-white"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-[#CB376D] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : isEditingAutomation
                        ? "Update Automation"
                        : "Save Automation"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {step === actionStep && (
            <div className="space-y-6">
              <WhatsAppTemplatePreviewCard
                template={selectedTemplate}
                headerComponent={templateHeader}
                headerText={previewHeaderText}
                bodyText={previewBodyText}
                footerText={previewFooterText}
                buttons={templateButtons}
                mediaType={templateHeaderMediaType}
                mediaUrl={form.actionConfig.mediaUrl}
              />

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-gray-400">
                      Template Summary
                    </div>
                    <h4 className="mt-1 text-lg font-semibold text-[#313166]">
                      {selectedTemplate?.name || "No template selected"}
                    </h4>
                  </div>
                  <div className="rounded-full bg-[#F4F5F9] px-3 py-1 text-xs font-medium text-[#313166]">
                    Action step
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
                    <span>Body variables</span>
                    <span className="font-semibold text-[#313166]">
                      {templateVariables.filter((item) => item.componentType === "BODY").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
                    <span>Header type</span>
                    <span className="font-semibold text-[#313166]">
                      {templateHeader?.format || "TEXT"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
                    <span>Buttons</span>
                    <span className="font-semibold text-[#313166]">
                      {templateButtons.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
                    <span>Media status</span>
                    <span className="font-semibold text-[#313166]">
                      {templateHeaderMediaType
                        ? form.actionConfig.mediaUrl?.trim()
                          ? "Ready"
                          : "Missing media"
                        : "Not required"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === reviewStep && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-[#313166] p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-white/60">
                      Live Preview
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">
                      WhatsApp Retention Flow
                    </h3>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    {selectedTriggerGroup.name}
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] bg-[#171717] p-3 shadow-2xl">
                  <div className="overflow-hidden rounded-[22px] bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">
                        V
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Vadik Business</div>
                        <div className="text-xs text-white/75">
                          retention automation preview
                        </div>
                      </div>
                    </div>

                    <div
                      className="min-h-[300px] space-y-3 px-4 py-4"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, #0d1418 0px, #0d1418 10px, #0e1519 10px, #0e1519 20px)",
                      }}
                    >
                      <div className="flex justify-end">
                        <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tr-md bg-[#005c4b]">
                          {templateHeader?.format === "TEXT" &&
                          templateHeader?.text ? (
                            <div
                              className="border-b border-white/10 px-3 pb-2 pt-3 text-sm font-semibold text-white"
                              dangerouslySetInnerHTML={{
                                __html: renderWhatsAppFormattedText(
                                  templateHeader.text,
                                ),
                              }}
                            />
                          ) : null}

                          {templateHeaderMediaType ? (
                            <div className="border-b border-white/10 bg-black/10">
                              {form.actionConfig.mediaUrl ? (
                                templateHeaderMediaType === "IMAGE" ? (
                                  <img
                                    src={form.actionConfig.mediaUrl}
                                    alt="Template header preview"
                                    className="max-h-64 w-full object-cover"
                                  />
                                ) : templateHeaderMediaType === "VIDEO" ? (
                                  <video
                                    src={form.actionConfig.mediaUrl}
                                    controls
                                    className="max-h-64 w-full bg-black object-contain"
                                  />
                                ) : (
                                  <div className="flex items-center gap-3 px-3 py-4 text-white">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium">
                                        Document attachment
                                      </div>
                                      <div className="truncate text-xs text-white/70">
                                        {form.actionConfig.mediaUrl}
                                      </div>
                                    </div>
                                  </div>
                                )
                              ) : (
                                <div className="flex min-h-[148px] flex-col items-center justify-center gap-2 px-4 py-6 text-center text-white/70">
                                  {templateHeaderMediaType === "IMAGE" && (
                                    <ImageIcon className="h-7 w-7" />
                                  )}
                                  {templateHeaderMediaType === "VIDEO" && (
                                    <Play className="h-7 w-7" />
                                  )}
                                  {templateHeaderMediaType === "DOCUMENT" && (
                                    <FileText className="h-7 w-7" />
                                  )}
                                  <div className="text-xs font-medium">
                                    {templateHeaderMediaType.toLowerCase()}{" "}
                                    header will appear here
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}

                          <div className="p-3">
                            <div
                              className="whitespace-pre-wrap text-sm text-white"
                              dangerouslySetInnerHTML={{
                                __html:
                                  renderWhatsAppFormattedText(previewBodyText),
                              }}
                            />
                            <div className="mt-1 text-right text-xs text-white/60">
                              {formatScheduleTime(
                                form.triggerConfig.scheduleTime || "09:00",
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1f2c33] px-3 py-2">
                      <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-sm text-[#8696a0]">
                        Type a message
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884]">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title={isEditingAutomation ? "Update Automation?" : "Save Automation?"}
        message={
          isEditingAutomation
            ? "Do you want to save these changes to this automation?"
            : "Do you want to save this automation now?"
        }
        confirmLabel={isEditingAutomation ? "Yes, Update" : "Yes, Save"}
        cancelLabel="No"
        loading={saving}
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false);
          onSave(form);
        }}
      />
      {/* ... rest of your JSX remains the same ... */}
    </>
  );
}


// function RetentionBuilderView({
//   initialAutomation,
//   fields,
//   templates,
//   activityCampaigns,
//   onBack,
//   onSave,
//   saving,
// }) {
//   const [step, setStep] = useState(1);
//   const [form, setForm] = useState(() =>
//     normalizeAutomationForForm(initialAutomation),
//   );
//   const steps = getStepLabels(form.triggerType);
//   const totalSteps = getTotalSteps(form.triggerType);
//   const audienceStep = getAudienceStep(form.triggerType);
//   const actionStep = getActionStep(form.triggerType);
//   const reviewStep = getReviewStep(form.triggerType);
//   const [audienceDraftRule, setAudienceDraftRule] = useState({
//     fieldKey: "",
//     operator: "",
//     value: "",
//     valueTo: "",
//   });
//   const [audiencePreview, setAudiencePreview] = useState({
//     loading: false,
//     count: 0,
//     customers: [],
//     error: "",
//   });
//   const [uploadingMedia, setUploadingMedia] = useState(false);
//   const [showSaveConfirm, setShowSaveConfirm] = useState(false);
//  const hasAudienceDraftInput = Object.values(audienceDraftRule).some((value) =>
//     Boolean(String(value || "").trim()),
//   );
//   useEffect(() => {
//     setForm(normalizeAutomationForForm(initialAutomation));
//   }, [initialAutomation]);

//   useEffect(() => {
//     setStep((current) => Math.min(current, totalSteps));
//   }, [totalSteps]);

// const goToStep = (nextStep) => {
//   const movingPastAudienceStep =
//     audienceStep && nextStep > audienceStep;

//   if (movingPastAudienceStep) {
//     const hasDraftRuleReady = audienceRuleValidation.valid;

//     if (hasAudienceDraftInput) {
//       showToast(
//         hasDraftRuleReady
//           ? "Click Add Rule to add this audience rule before continuing."
//           : audienceRuleValidation.message ||
//             "Finish the current rule, then click Add Rule before continuing.",
//         "warning"
//       );
//       return;
//     }
//   }

//   setStep(Math.min(totalSteps, nextStep));
// };
//   const selectedTriggerGroup =
//     triggerGroups.find((group) =>
//       group.items.some((item) => item.id === form.triggerType),
//     ) || triggerGroups[0];
//   const selectedTemplate = templates.find(
//     (template) => template._id === form.actionConfig.templateId,
//   );
//   const selectedActivityCampaigns = getCampaignList(
//     activityCampaigns,
//     form.triggerConfig.activityType,
//   );
//   const selectedActivityCampaign = selectedActivityCampaigns.find(
//     (campaign) =>
//       String(campaign?._id) === String(form.triggerConfig.activityCampaignId),
//   );
//   const dateFields = fields.filter((field) => field.type === "date");
//   const selectedDateField = dateFields.find(
//     (field) => field.fieldKey === form.triggerConfig.fieldKey,
//   );
//   const templateVariables = extractTemplateVariables(selectedTemplate);
//   const templateHeaderMediaType = getTemplateHeaderMediaType(selectedTemplate);
//   const templateHeader = getTemplateHeaderComponent(selectedTemplate);
//   const templateBody = selectedTemplate?.components?.find(
//     (component) => component.type === "BODY",
//   );
//   const templateFooter = selectedTemplate?.components?.find(
//     (component) => component.type === "FOOTER",
//   );
//   const templateButtons =
//     selectedTemplate?.components?.find((component) => component.type === "BUTTONS")
//       ?.buttons || [];
//   const previewHeaderText = getTemplatePreviewText(
//     templateHeader?.text || "",
//     "HEADER",
//     form.actionConfig.variableMappings || [],
//     fields,
//   );
//   const previewBodyText = getTemplatePreviewText(
//     templateBody?.text || "",
//     "BODY",
//     form.actionConfig.variableMappings || [],
//     fields,
//   );
//   const previewFooterText = getTemplatePreviewText(
//     templateFooter?.text || "",
//     "FOOTER",
//     form.actionConfig.variableMappings || [],
//     fields,
//   );
//   const isEditingAutomation = Boolean(initialAutomation?._id);

//   useEffect(() => {
//     if (step !== audienceStep) return undefined;

//     const timer = setTimeout(() => {
//       const fetchAudiencePreview = async () => {
//         try {
//           setAudiencePreview((previous) => ({
//             ...previous,
//             loading: true,
//             error: "",
//           }));

//           const response = await api.post("/api/retention-automations/preview-audience", {
//             audienceRules: form.audienceRules,
//             search: "",
//             limit: 5,
//           });

//           setAudiencePreview({
//             loading: false,
//             count: response.data?.data?.count || 0,
//             customers: response.data?.data?.customers || [],
//             error: "",
//           });
//         } catch (error) {
//           setAudiencePreview((previous) => ({
//             ...previous,
//             loading: false,
//             error:
//               error.response?.data?.message ||
//               "Failed to preview the current audience",
//           }));
//         }
//       };

//       fetchAudiencePreview();
//     }, 350);

//     return () => clearTimeout(timer);
//   }, [step, audienceStep, form.audienceRules, form.triggerType, form.triggerConfig]);

//   const updateTemplate = (templateId) => {
//     const template = templates.find((item) => item._id === templateId);
//     const nextVariables = extractTemplateVariables(template);
//     const nextMappings = nextVariables.map(
//       (descriptor) =>
//         findVariableMapping(form.actionConfig.variableMappings, descriptor) || {
//           componentType: descriptor.componentType,
//           variable: descriptor.variable,
//           sourceType: "customer_field",
//           value: "firstname",
//         },
//     );
//     const mediaType = getTemplateHeaderMediaType(template);

//     setForm({
//       ...form,
//       actionConfig: {
//         ...form.actionConfig,
//         templateId,
//         templateName: template?.name || "",
//         languageCode: template?.language || "en_US",
//         variableMappings: nextMappings,
//         mediaType,
//         mediaUrl:
//           mediaType === form.actionConfig.mediaType
//             ? form.actionConfig.mediaUrl
//             : "",
//       },
//     });
//   };

//   const handleMediaUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // Validation for images
//     if (templateHeaderMediaType === "IMAGE") {
//       const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//       if (!allowedTypes.includes(file.type)) {
//         showToast(
//           "Unsupported image format. Please upload a JPG, JPEG, PNG, or WebP file.",
//           "error",
//         );
//         event.target.value = "";
//         return;
//       }
//       const maxImgSize = 1 * 1024 * 1024; // 1MB for consistency with other modules
//       if (file.size > maxImgSize) {
//         showToast(
//           "Image size exceeds the maximum allowed limit. Please upload an image within the permitted size.",
//           "error",
//         );
//         event.target.value = "";
//         return;
//       }
//     } else {
//       // Validation for other media (VIDEO, DOCUMENT)
//       const maxSize =
//         templateHeaderMediaType === "VIDEO"
//           ? 64 * 1024 * 1024
//           : 5 * 1024 * 1024;
//       if (file.size > maxSize) {
//         showToast(
//           `File too large. Max ${maxSize / (1024 * 1024)}MB.`,
//           "warning",
//         );
//         event.target.value = "";
//         return;
//       }
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setUploadingMedia(true);
//       const response = await api.post(
//         "/api/integrationManagement/whatsapp/media/upload",
//         formData,
//       );
//       if (response.data?.status) {
//         setForm((previous) => ({
//           ...previous,
//           actionConfig: {
//             ...previous.actionConfig,
//             mediaUrl: response.data.url || "",
//             mediaType: templateHeaderMediaType,
//           },
//         }));
//         showToast("Media uploaded successfully", "success");
//       }
//     } catch (error) {
//       console.error("Error uploading template media:", error);
//       const errorMsg =
//         error.response?.data?.message ||
//         "Image upload failed. Please verify the file and try again.";
//       showToast(errorMsg, "error");
//     } finally {
//       setUploadingMedia(false);
//       event.target.value = "";
//     }
//   };

//   const addRule = (ruleType, draftRule) => {
//     const validation = validateRuleDraft(draftRule, fields);
//     if (!validation.valid) {
//       showToast(validation.message, "warning");
//       return;
//     }

//     setForm((previous) => ({
//       ...previous,
//       [ruleType]: {
//         ...previous[ruleType],
//         conditions: [...previous[ruleType].conditions, draftRule],
//       },
//     }));

//     if (ruleType === "audienceRules") {
//       setAudienceDraftRule({
//         fieldKey: "",
//         operator: "",
//         value: "",
//         valueTo: "",
//       });
//     }
//   };

//   const removeRule = (ruleType, index) => {
//     setForm((previous) => ({
//       ...previous,
//       [ruleType]: {
//         ...previous[ruleType],
//         conditions: previous[ruleType].conditions.filter(
//           (_, itemIndex) => itemIndex !== index,
//         ),
//       },
//     }));
//   };

//   const applyQuickSegment = (segment) => {
//     setForm((previous) => ({
//       ...previous,
//       audienceRules: segment.rules,
//     }));
//   };

//   const handleSave = () => {
//     if (!form.actionConfig.templateId) {
//       showToast("Choose a WhatsApp template before saving", "warning");
//       return;
//     }

//     if (form.triggerType === "customer_activity_completed") {
//       if (
//         (form.triggerConfig.activityScope || "all") === "specific" &&
//         !form.triggerConfig.activityType
//       ) {
//         showToast("Choose a specific activity type", "warning");
//         return;
//       }
//       if (
//         (form.triggerConfig.activityCampaignScope || "all") === "specific" &&
//         !form.triggerConfig.activityCampaignId
//       ) {
//         showToast("Choose a specific campaign for the selected activity", "warning");
//         return;
//       }
//     }

//     if (form.triggerType === "scheduled_recurring" && !form.triggerConfig.scheduleTime) {
//       showToast("Choose an exact time for the recurring trigger", "warning");
//       return;
//     }

//     if (
//       form.triggerType === "whatsapp_keyword" &&
//       !String(form.triggerConfig.keyword || "").trim()
//     ) {
//       showToast("Enter a keyword before saving this automation", "warning");
//       return;
//     }

//     if (form.triggerType === "customer_field_date") {
//       if ((form.triggerConfig.dateTriggerMode || "field") === "inactive") {
//         if (Number(form.triggerConfig.days) < 1) {
//           showToast("Enter how many inactive days should trigger this automation", "warning");
//           return;
//         }
//       } else if (!form.triggerConfig.fieldKey) {
//         showToast("Choose a date field for the trigger", "warning");
//         return;
//       }
//     }

//     const missingMappings = templateVariables.filter((descriptor) => {
//       const mapping = findVariableMapping(
//         form.actionConfig.variableMappings,
//         descriptor,
//       );
//       return !mapping?.value?.trim();
//     });

//     if (missingMappings.length > 0) {
//       showToast("Fill all template variables before saving", "warning");
//       return;
//     }

//     if (templateHeaderMediaType && !form.actionConfig.mediaUrl?.trim()) {
//       showToast(
//         `Add a ${templateHeaderMediaType.toLowerCase()} header URL or upload media before saving`,
//         "warning",
//       );
//       return;
//     }

//     setShowSaveConfirm(true);
//   };

//   const audienceRuleValidation = validateRuleDraft(audienceDraftRule, fields);

//   return (
//     <>
//       <div className="space-y-6">
//         <div className="rounded-[28px] bg-gradient-to-r from-[#313166] to-[#3d3b83] px-6 py-6 text-white shadow-lg">
//           <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
//             <div className="flex items-start gap-4">
//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
//                 <Zap className="h-6 w-6" />
//               </div>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.24em] text-white/60">
//                   {isEditingAutomation
//                     ? "Edit automation"
//                     : "Create automation"}
//                 </p>
//                 <h2 className="mt-1 text-2xl font-semibold">{form.name}</h2>
//                 <p className="mt-2 max-w-3xl text-sm text-white/75">
//                   This builder now uses the real retention APIs, dynamic field
//                   registry, and template catalog.
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               {steps.map((label, index) => (
//                 <button
//                   key={label}
//                   type="button"
//                   onClick={() => goToStep(index + 1)}
//                   className="rounded-full px-3 py-1 text-xs font-medium transition-all"
//                   style={{
//                     backgroundColor:
//                       step === index + 1 ? "white" : "rgba(255,255,255,0.1)",
//                     color:
//                       step === index + 1 ? "#313166" : "rgba(255,255,255,0.8)",
//                   }}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
//             <button
//               type="button"
//               onClick={onBack}
//               className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/15"
//             >
//               <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
//               Back to dashboard
//             </button>

//             <div className="text-xs uppercase tracking-[0.22em] text-white/55">
//               Retention rhythm automation builder
//             </div>
//           </div>
//         </div>

//         <div
//           className={`grid gap-6 ${step === actionStep || step === reviewStep ? "xl:grid-cols-[1.05fr_0.95fr]" : "grid-cols-1"}`}
//         >
//           <div className="space-y-6">
//             <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
//               <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//                 <div>
//                   <div className="text-sm uppercase tracking-[0.22em] text-gray-400">
//                     Step {step} of {totalSteps}
//                   </div>
//                   <h3 className="mt-1 text-lg font-semibold text-[#313166]">
//                     {steps[step - 1]}
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     Use dynamic fields, typed operators, and approved templates.
//                   </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   {steps.map((label, index) => (
//                   <button
//                       key={label}
//                       type="button"
//                       onClick={() => goToStep(index + 1)}
//                       className="rounded-full px-3 py-1 text-xs font-medium transition-all"
//                       style={{
//                         backgroundColor:
//                           step === index + 1 ? "#313166" : "#F4F5F9",
//                         color: step === index + 1 ? "white" : "#313166",
//                       }}
//                     >
//                       {label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {step === 1 && (
//                 <div className="space-y-4">
//                   <label className="block">
//                     <span className="mb-2 block text-sm font-medium text-[#313166]">
//                       Automation name
//                     </span>
//                     <input
//                       value={form.name}
//                       onChange={(event) =>
//                         setForm((previous) => ({
//                           ...previous,
//                           name: event.target.value,
//                         }))
//                       }
//                       className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#313166]"
//                       placeholder="Enter automation name"
//                     />
//                   </label>

//                   {/* <div className="grid gap-3 md:grid-cols-3">
//                   {journeyOptions.map((option) => (
//                     <button
//                       key={option.id}
//                       type="button"
//                       onClick={() => setForm({ ...form, journeyType: option.id })}
//                       className="rounded-2xl border p-4 text-left transition-all"
//                       style={{
//                         borderColor: form.journeyType === option.id ? "#CB376D" : "#E5E7EB",
//                         backgroundColor: form.journeyType === option.id ? "#CB376D08" : "white",
//                       }}
//                     >
//                       <div className="flex items-start justify-between gap-3">
//                         <div>
//                           <div className="font-semibold text-[#313166]">{option.title}</div>
//                           <div className="mt-1 text-sm text-gray-500">{option.note}</div>
//                         </div>
//                         {form.journeyType === option.id ? <CheckCircle2 className="h-5 w-5 text-[#CB376D]" /> : null}
//                       </div>
//                     </button>
//                   ))}
//                 </div> */}
//                 </div>
//               )}

//               {step === 2 && (
//                 <div className="space-y-4">
//                   {triggerGroups.map((group) => (
//                     <div key={group.name}>
//                       <div className="mb-3 flex items-center gap-2">
//                         <span
//                           className="h-2.5 w-2.5 rounded-full"
//                           style={{ backgroundColor: group.color }}
//                         />
//                         <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
//                           {group.name}
//                         </h4>
//                       </div>
//                       <div className="grid gap-3 md:grid-cols-2">
//                         {group.items.map((item) => {
//                           const Icon = item.icon;
//                           const active = form.triggerType === item.id;

//                           return (
//                             <button
//                               key={item.id}
//                               type="button"
//                               onClick={() => {
//                                 setForm((prev) => ({
//                                   ...prev,
//                                   triggerType: item.id,
//                                 }));

//                                 // 🚀 ADD THIS
//                                 if (item.id === "new_customer") {
//                                   setStep(3); // skip Audience for new customer
//                                 }
//                               }}
//                               className="rounded-2xl border p-4 text-left transition-all"
//                               style={{
//                                 borderColor: active ? group.color : "#E5E7EB",
//                                 backgroundColor: active
//                                   ? `${group.color}08`
//                                   : "white",
//                               }}
//                             >
//                               <div className="flex items-center gap-3">
//                                 <div
//                                   className="flex h-10 w-10 items-center justify-center rounded-xl"
//                                   style={{
//                                     backgroundColor: `${group.color}15`,
//                                   }}
//                                 >
//                                   <Icon
//                                     className="h-5 w-5"
//                                     style={{ color: group.color }}
//                                   />
//                                 </div>
//                                 <div>
//                                   <div className="font-semibold text-[#313166]">
//                                     {item.name}
//                                   </div>
//                                   <div className="text-sm text-gray-500">
//                                     Trigger this flow
//                                   </div>
//                                 </div>
//                               </div>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   ))}

//                   {form.triggerType === "customer_field_date" && (
//                     <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
//                       <div>
//                         <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                           Trigger on
//                         </label>
//                         <select
//                           value={form.triggerConfig.dateTriggerMode || "field"}
//                           onChange={(event) =>
//                             setForm((previous) => ({
//                               ...previous,
//                               triggerConfig: {
//                                 ...previous.triggerConfig,
//                                 dateTriggerMode: event.target.value,
//                                 fieldKey:
//                                   event.target.value === "inactive"
//                                     ? ""
//                                     : previous.triggerConfig.fieldKey || "",
//                                 days:
//                                   event.target.value === "inactive"
//                                     ? Number(previous.triggerConfig.days) || 30
//                                     : previous.triggerConfig.days ?? 30,
//                               },
//                             }))
//                           }
//                           className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                         >
//                           <option value="field">Customer date field</option>
//                           <option value="inactive">Inactive days</option>
//                         </select>
//                       </div>

//                       {(form.triggerConfig.dateTriggerMode || "field") === "field" ? (
//                         <>
//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Date field
//                             </label>
//                             <select
//                               value={form.triggerConfig.fieldKey}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     fieldKey: event.target.value,
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             >
//                               <option value="">Choose a date field</option>
//                               {dateFields.map((field) => (
//                                 <option key={field.fieldKey} value={field.fieldKey}>
//                                   {field.label} ({field.sourceSection})
//                                 </option>
//                               ))}
//                             </select>
//                           </div>

//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Days before
//                             </label>
//                             <input
//                               type="number"
//                               min="0"
//                               value={form.triggerConfig.daysBefore ?? 0}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     daysBefore: Math.max(
//                                       0,
//                                       Number(event.target.value) || 0,
//                                     ),
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                               placeholder="0"
//                             />
//                           </div>

//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Trigger time
//                             </label>
//                             <input
//                               type="time"
//                               value={form.triggerConfig.triggerTime || "09:00"}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     triggerTime: event.target.value,
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             />
//                           </div>

//                           <div className="rounded-xl bg-[#F4F5F9] px-4 py-3 text-xs text-gray-500">
//                             <div>
//                               {selectedDateField
//                                 ? `${selectedDateField.label} will trigger ${Number(form.triggerConfig.daysBefore) || 0} day${Number(form.triggerConfig.daysBefore) === 1 ? "" : "s"} before the date at ${formatScheduleTime(form.triggerConfig.triggerTime || "09:00")}.`
//                                 : "Pick a date field and set how many days before it should trigger."}
//                             </div>
//                             {selectedDateField &&
//                               (String(selectedDateField.fieldKey).toLowerCase().includes("birthday") ||
//                                 String(selectedDateField.fieldKey).toLowerCase().includes("anniversary")) && (
//                                 <div className="mt-1">
//                                   Birthday and anniversary fields repeat every year.
//                                 </div>
//                               )}
//                           </div>
//                         </>
//                       ) : (
//                         <>
//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Inactive for how many days?
//                             </label>
//                             <input
//                               type="number"
//                               min="1"
//                               value={form.triggerConfig.days || ""}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     days: Math.max(1, Number(event.target.value) || 0),
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                               placeholder="30"
//                             />
//                           </div>

//                           <div className="rounded-xl bg-[#F4F5F9] px-4 py-3 text-xs text-gray-500">
//                             Customers who have been inactive for this many days will enter the flow.
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   )}

//                   {form.triggerType === "whatsapp_keyword" && (
//                     <input
//                       value={form.triggerConfig.keyword || ""}
//                       onChange={(event) =>
//                         setForm({
//                           ...form,
//                           triggerConfig: {
//                             ...form.triggerConfig,
//                             keyword: event.target.value,
//                           },
//                         })
//                       }
//                       className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                       placeholder="Enter keyword"
//                     />
//                   )}

//                   {form.triggerType === "customer_activity_completed" && (
//                     <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
//                       <div className="grid gap-3 md:grid-cols-2">
//                         <div>
//                           <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                             Activity selection
//                           </label>
//                           <select
//                             value={form.triggerConfig.activityScope || "all"}
//                             onChange={(event) =>
//                               setForm((previous) => ({
//                                 ...previous,
//                                 triggerConfig: {
//                                   ...previous.triggerConfig,
//                                   activityScope: event.target.value,
//                                   activityType:
//                                     event.target.value === "all"
//                                       ? ""
//                                       : previous.triggerConfig.activityType || "spinWheel",
//                                   activityCampaignScope:
//                                     event.target.value === "all"
//                                       ? "all"
//                                       : previous.triggerConfig.activityCampaignScope || "all",
//                                   activityCampaignId:
//                                     event.target.value === "all"
//                                       ? ""
//                                       : previous.triggerConfig.activityCampaignId || "",
//                                 },
//                               }))
//                             }
//                             className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                           >
//                             <option value="all">All activities</option>
//                             <option value="specific">Specific activity</option>
//                           </select>
//                         </div>

//                         {form.triggerConfig.activityScope === "specific" && (
//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Activity type
//                             </label>
//                             <select
//                               value={form.triggerConfig.activityType || "spinWheel"}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     activityType: event.target.value,
//                                     activityCampaignId: "",
//                                     activityCampaignScope:
//                                       previous.triggerConfig.activityCampaignScope || "all",
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             >
//                               <option value="spinWheel">Spin Wheel</option>
//                               <option value="scratchCard">Scratch Card</option>
//                               <option value="quiz">Quiz</option>
//                             </select>
//                           </div>
//                         )}
//                       </div>

//                       {(form.triggerConfig.activityScope || "all") === "specific" && (
//                         <div className="grid gap-3 md:grid-cols-2">
//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Campaign scope
//                             </label>
//                             <select
//                               value={form.triggerConfig.activityCampaignScope || "all"}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     activityCampaignScope: event.target.value,
//                                     activityCampaignId:
//                                       event.target.value === "all" ? "" : previous.triggerConfig.activityCampaignId || "",
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             >
//                               <option value="all">All campaigns</option>
//                               <option value="specific">Specific campaign</option>
//                             </select>
//                           </div>

//                           {(form.triggerConfig.activityCampaignScope || "all") === "specific" && (
//                             <div>
//                               <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                 Select {activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label || "activity"} campaign
//                               </label>
//                               <select
//                                 value={
//                                   getCampaignSelectValue(
//                                     activityCampaigns,
//                                     form.triggerConfig.activityType,
//                                     form.triggerConfig.activityCampaignId,
//                                   )
//                                 }
//                                 onChange={(event) =>
//                                   setForm((previous) => ({
//                                     ...previous,
//                                     triggerConfig: {
//                                       ...previous.triggerConfig,
//                                       activityCampaignId: event.target.value,
//                                     },
//                                   }))
//                                 }
//                                 className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                               >
//                                 <option value="">
//                                   Select a {activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label?.toLowerCase() || "campaign"}
//                                 </option>
//                                 {selectedActivityCampaigns.map((campaign) => (
//                                   <option key={campaign._id} value={campaign._id}>
//                                     {getCampaignLabel(campaign, form.triggerConfig.activityType)}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       <div className="text-xs text-gray-500">
//                         {(form.triggerConfig.activityScope || "all") === "all"
//                           ? "Watching all completed activities."
//                           : (form.triggerConfig.activityCampaignScope || "all") === "specific"
//                             ? `Watching ${activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label || "a specific activity"}: ${selectedActivityCampaign ? getCampaignLabel(selectedActivityCampaign, form.triggerConfig.activityType) : "specific campaign"}.`
//                             : `Watching ${activityOptions.find((item) => item.value === form.triggerConfig.activityType)?.label || "a specific activity"}.`}
//                       </div>
//                     </div>
//                   )}

//                   {form.triggerType === "scheduled_recurring" && (
//                     <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
//                       <div className="grid gap-3 md:grid-cols-2">
//                         <div>
//                           <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                             Repeat
//                           </label>
//                           <select
//                             value={form.triggerConfig.scheduleType || "daily"}
//                             onChange={(event) =>
//                               setForm((previous) => ({
//                                 ...previous,
//                                 triggerConfig: {
//                                   ...previous.triggerConfig,
//                                   scheduleType: event.target.value,
//                                 },
//                               }))
//                             }
//                             className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                           >
//                             <option value="daily">Daily</option>
//                             <option value="weekly">Weekly</option>
//                             <option value="monthly">Monthly</option>
//                           </select>
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                             Exact time
//                           </label>
//                           <input
//                             type="time"
//                             value={form.triggerConfig.scheduleTime || "09:00"}
//                             onChange={(event) =>
//                               setForm((previous) => ({
//                                 ...previous,
//                                 triggerConfig: {
//                                   ...previous.triggerConfig,
//                                   scheduleTime: event.target.value,
//                                 },
//                               }))
//                             }
//                             className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                           />
//                         </div>
//                       </div>

//                       <div className="grid gap-3 md:grid-cols-2">
//                         {form.triggerConfig.scheduleType === "weekly" && (
//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Weekday
//                             </label>
//                             <select
//                               value={form.triggerConfig.scheduleDayOfWeek ?? 1}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     scheduleDayOfWeek: Number(event.target.value),
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             >
//                               {weekdayOptions.map((day) => (
//                                 <option key={day.value} value={day.value}>
//                                   {day.label}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         )}

//                         {form.triggerConfig.scheduleType === "monthly" && (
//                           <div>
//                             <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                               Date
//                             </label>
//                             <select
//                               value={form.triggerConfig.scheduleDayOfMonth ?? 1}
//                               onChange={(event) =>
//                                 setForm((previous) => ({
//                                   ...previous,
//                                   triggerConfig: {
//                                     ...previous.triggerConfig,
//                                     scheduleDayOfMonth: Number(event.target.value),
//                                   },
//                                 }))
//                               }
//                               className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             >
//                               {Array.from({ length: 31 }, (_, index) => index + 1).map(
//                                 (day) => (
//                                   <option key={day} value={day}>
//                                     {day}
//                                   </option>
//                                 ),
//                               )}
//                             </select>
//                           </div>
//                         )}
//                       </div>

//                       <div className="rounded-xl bg-[#F4F5F9] px-4 py-3 text-xs text-gray-500">
//                         {form.triggerConfig.scheduleType === "daily" &&
//                           `Runs every day at ${formatScheduleTime(form.triggerConfig.scheduleTime)}`}
//                         {form.triggerConfig.scheduleType === "weekly" &&
//                           `Runs every ${weekdayOptions.find((day) => day.value === Number(form.triggerConfig.scheduleDayOfWeek))?.label || "week day"} at ${formatScheduleTime(form.triggerConfig.scheduleTime)}`}
//                         {form.triggerConfig.scheduleType === "monthly" &&
//                           `Runs on day ${form.triggerConfig.scheduleDayOfMonth || 1} at ${formatScheduleTime(form.triggerConfig.scheduleTime)}`}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {audienceStep && step === audienceStep && (
//                 <div className="space-y-4">
//                   <RuleComposer
//                     label="Audience rules"
//                     fields={fields}
//                     rules={form.audienceRules.conditions}
//                     draftRule={audienceDraftRule}
//                     onDraftChange={setAudienceDraftRule}
//                     onAddRule={() =>
//                       addRule("audienceRules", audienceDraftRule)
//                     }
//                     onRemoveRule={(index) => removeRule("audienceRules", index)}
//                     logic={form.audienceRules.logic}
//                     onLogicChange={(logic) =>
//                       setForm((previous) => ({
//                         ...previous,
//                         audienceRules: { ...previous.audienceRules, logic },
//                       }))
//                     }
//                     canAddRule={audienceRuleValidation.valid}
//                     addRuleHint={audienceRuleValidation.message}
//                   />
//                   <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
//                     {previewQuickSegments.map((segment) => (
//                       <button
//                         key={segment.key}
//                         type="button"
//                         onClick={() => applyQuickSegment(segment)}
//                         className="rounded-2xl border px-4 py-3 text-left transition-all"
//                         style={{
//                           borderColor:
//                             form.audienceRules.conditions.length ===
//                             segment.rules.conditions.length
//                               ? "#313166"
//                               : "#E5E7EB",
//                           backgroundColor: "#fff",
//                         }}
//                       >
//                         <div className="font-semibold text-[#313166]">
//                           {segment.label}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           Audience preset
//                         </div>
//                       </button>
//                     ))}
//                   </div>

//                   <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
//                     <div className="mb-2 text-sm font-semibold text-[#313166]">
//                       Dynamic customer fields
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {fields.map((field) => (
//                         <span
//                           key={field.fieldKey}
//                           className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#313166]"
//                         >
//                           {field.label}
//                         </span>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                       <div>
//                         <div className="text-sm font-semibold text-[#313166]">
//                           Audience preview
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           Live estimate based on the current audience rules.
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setAudiencePreview((previous) => ({
//                             ...previous,
//                             loading: true,
//                             error: "",
//                           }));
//                           api
//                             .post("/api/retention-automations/preview-audience", {
//                               audienceRules: form.audienceRules,
//                               search: "",
//                               limit: 5
//                             })
//                             .then((response) => {
//                               setAudiencePreview({
//                                 loading: false,
//                                 count: response.data?.data?.count || 0,
//                                 customers: response.data?.data?.customers || [],
//                                 error: "",
//                               });
//                             })
//                             .catch((error) => {
//                               setAudiencePreview((previous) => ({
//                                 ...previous,
//                                 loading: false,
//                                 error:
//                                   error.response?.data?.message ||
//                                   "Failed to preview the current audience",
//                               }));
//                             });
//                         }}
//                         className="inline-flex items-center rounded-xl border border-[#313166] px-3 py-2 text-xs font-medium text-[#313166]"
//                       >
//                         Refresh preview
//                       </button>
//                     </div>

//                     <div className="mt-4 grid gap-3 sm:grid-cols-3">
//                       <div className="rounded-2xl bg-[#313166] px-4 py-4 text-white">
//                         <div className="text-xs uppercase tracking-[0.2em] text-white/60">
//                           Matching customers
//                         </div>
//                         <div className="mt-2 text-3xl font-semibold">
//                           {audiencePreview.loading ? "..." : audiencePreview.count}
//                         </div>
//                       </div>
//                       <div className="rounded-2xl bg-[#F4F5F9] px-4 py-4">
//                         <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
//                           Preview state
//                         </div>
//                         <div className="mt-2 text-sm font-medium text-[#313166]">
//                           {audiencePreview.loading
//                             ? "Refreshing preview"
//                             : audiencePreview.error
//                               ? "Preview unavailable"
//                               : "Preview ready"}
//                         </div>
//                         <div className="mt-1 text-xs text-gray-500">
//                           {audiencePreview.error || "Shows the latest filtered audience."}
//                         </div>
//                       </div>
//                       <div className="rounded-2xl bg-[#F4F5F9] px-4 py-4">
//                         <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
//                           Sample size
//                         </div>
//                         <div className="mt-2 text-3xl font-semibold text-[#313166]">
//                           {audiencePreview.customers?.length || 0}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-4">
//                       <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
//                         Sample customers
//                       </div>
//                       {audiencePreview.customers?.length ? (
//                         <div className="space-y-2">
//                           {audiencePreview.customers.map((customer) => (
//                             <div
//                               key={customer._id}
//                               className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FCFCFF] px-4 py-3 text-sm"
//                             >
//                               <div>
//                                 <div className="font-medium text-[#313166]">
//                                   {[customer.firstname, customer.lastname]
//                                     .filter(Boolean)
//                                     .join(" ") || "Unknown Customer"}
//                                 </div>
//                                 <div className="text-xs text-gray-500">
//                                   {formatPhone(customer.countryCode, customer.mobileNumber)}
//                                 </div>
//                               </div>
//                               <span className="rounded-full bg-[#31316610] px-3 py-1 text-[11px] font-medium text-[#313166]">
//                                 Preview
//                               </span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="rounded-xl border border-dashed border-gray-200 bg-[#FCFCFF] px-4 py-5 text-sm text-gray-500">
//                           {audiencePreview.loading
//                             ? "Loading matching customers..."
//                             : "No customers match the current preview."}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                 </div>
//               )}

//               {step === actionStep && (
//                 <div className="space-y-4">
//                   <select
//                     value={form.actionConfig.templateId}
//                     onChange={(event) => updateTemplate(event.target.value)}
//                     className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                   >
//                     <option value="">Choose WhatsApp template</option>
//                     {templates.map((template) => (
//                       <option key={template._id} value={template._id}>
//                         {template.name} ({template.status})
//                       </option>
//                     ))}
//                   </select>

//                   {templateHeaderMediaType && (
//                     <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
//                       <div className="text-sm font-semibold text-[#313166]">
//                         {templateHeaderMediaType} header media
//                       </div>
//                       <p className="text-sm text-gray-500">
//                         This template uses a media header. Add the file URL or
//                         upload the media that should be sent with the
//                         automation.
//                       </p>
//                       <input
//                         value={form.actionConfig.mediaUrl || ""}
//                         onChange={(event) =>
//                           setForm({
//                             ...form,
//                             actionConfig: {
//                               ...form.actionConfig,
//                               mediaUrl: event.target.value,
//                               mediaType: templateHeaderMediaType,
//                             },
//                           })
//                         }
//                         className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                         placeholder={`Paste ${templateHeaderMediaType.toLowerCase()} URL here...`}
//                       />
//                       <div className="flex flex-wrap items-center gap-3">
//                         <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#313166] px-4 py-2 text-sm font-medium text-[#313166]">
//                           <input
//                             type="file"
//                             className="hidden"
//                             accept={
//                               templateHeaderMediaType === "IMAGE"
//                                 ? "image/*"
//                                 : templateHeaderMediaType === "VIDEO"
//                                   ? "video/*"
//                                   : ".pdf,.doc,.docx"
//                             }
//                             onChange={handleMediaUpload}
//                           />
//                           {uploadingMedia
//                             ? "Uploading..."
//                             : form.actionConfig.mediaUrl
//                               ? "Replace File"
//                               : "Upload File"}
//                         </label>
//                         {form.actionConfig.mediaUrl ? (
//                           <span className="truncate text-xs text-gray-500">
//                             {form.actionConfig.mediaUrl}
//                           </span>
//                         ) : null}
//                       </div>
//                     </div>
//                   )}

//                   <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
//                     <div className="flex flex-wrap gap-2">
//                       {delayOptions.map((item) => {
//                         const isSelected =
//                           form.delay.mode === item.mode &&
//                           form.delay.value === item.value &&
//                           form.delay.unit === item.unit;

//                         return (
//                           <button
//                             key={item.label}
//                             type="button"
//                             onClick={() =>
//                               setForm((previous) => ({
//                                 ...previous,
//                                 delay: {
//                                   mode: item.mode,
//                                   value: item.value,
//                                   unit: item.unit,
//                                 },
//                               }))
//                             }
//                             className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
//                             style={{
//                               backgroundColor: isSelected ? "#313166" : "white",
//                               color: isSelected ? "white" : "#313166",
//                               borderColor: isSelected ? "#313166" : "#E5E7EB",
//                             }}
//                           >
//                             {item.label}
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
//                       <div className="space-y-1">
//                         <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
//                           Custom delay
//                         </div>
//                         <input
//                           type="number"
//                           min="0"
//                           step="1"
//                           value={form.delay.value}
//                           onChange={(event) =>
//                             setForm((previous) => ({
//                               ...previous,
//                               delay: {
//                                 ...previous.delay,
//                                 mode: Number(event.target.value) > 0 ? "delay" : "immediate",
//                                 value: Number(event.target.value) || 0,
//                               },
//                             }))
//                           }
//                           className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                           placeholder="Enter a value"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
//                           Unit
//                         </div>
//                         <select
//                           value={form.delay.unit}
//                           onChange={(event) =>
//                             setForm((previous) => ({
//                               ...previous,
//                               delay: {
//                                 ...previous.delay,
//                                 mode: Number(previous.delay.value) > 0 ? "delay" : "immediate",
//                                 unit: event.target.value,
//                               },
//                             }))
//                           }
//                           className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                         >
//                           {delayUnitOptions.map((unit) => (
//                             <option key={unit.value} value={unit.value}>
//                               {unit.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       Use the quick options above, or set a custom after delay in minutes, hours, or days.
//                     </div>
//                   </div>

//                   {templateVariables.length > 0 && (
//                     <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
//                       <div className="text-sm font-semibold text-[#313166]">
//                         Template variable mapping
//                       </div>
//                       {templateVariables.map((descriptor) => {
//                         const mapping = findVariableMapping(
//                           form.actionConfig.variableMappings,
//                           descriptor,
//                         ) || {
//                           componentType: descriptor.componentType,
//                           variable: descriptor.variable,
//                           sourceType: "customer_field",
//                           value: "firstname",
//                         };
//                         return (
//                           <div
//                             key={descriptor.key}
//                             className="grid gap-3 md:grid-cols-3"
//                           >
//                             <div className="space-y-1">
//                               <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
//                                 {descriptor.componentType}
//                               </div>
//                               <input
//                                 value={descriptor.variable}
//                                 readOnly
//                                 className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
//                               />
//                             </div>
//                             <select
//                               value={mapping.sourceType}
//                               onChange={(event) => {
//                                 const nextMappings = upsertVariableMapping(
//                                   form.actionConfig.variableMappings,
//                                   descriptor,
//                                   {
//                                     ...mapping,
//                                     sourceType: event.target.value,
//                                     value: "",
//                                   },
//                                 );
//                                 setForm({
//                                   ...form,
//                                   actionConfig: {
//                                     ...form.actionConfig,
//                                     variableMappings: nextMappings,
//                                   },
//                                 });
//                               }}
//                               className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                             >
//                               <option value="customer_field">
//                                 Customer field
//                               </option>
//                               <option value="static">Static value</option>
//                               <option value="derived">Derived value</option>
//                             </select>
//                             {mapping.sourceType === "customer_field" ? (
//                               <select
//                                 value={mapping.value}
//                                 onChange={(event) => {
//                                   const nextMappings = upsertVariableMapping(
//                                     form.actionConfig.variableMappings,
//                                     descriptor,
//                                     {
//                                       ...mapping,
//                                       value: event.target.value,
//                                     },
//                                   );
//                                   setForm({
//                                     ...form,
//                                     actionConfig: {
//                                       ...form.actionConfig,
//                                       variableMappings: nextMappings,
//                                     },
//                                   });
//                                 }}
//                                 className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                               >
//                                 <option value="">Choose field</option>
//                                 {fields.map((field) => (
//                                   <option
//                                     key={field.fieldKey}
//                                     value={field.fieldKey}
//                                   >
//                                     {field.label}
//                                   </option>
//                                 ))}
//                               </select>
//                             ) : mapping.sourceType === "derived" ? (
//                               <select
//                                 value={mapping.value}
//                                 onChange={(event) => {
//                                   const nextMappings = upsertVariableMapping(
//                                     form.actionConfig.variableMappings,
//                                     descriptor,
//                                     {
//                                       ...mapping,
//                                       value: event.target.value,
//                                     },
//                                   );
//                                   setForm({
//                                     ...form,
//                                     actionConfig: {
//                                       ...form.actionConfig,
//                                       variableMappings: nextMappings,
//                                     },
//                                   });
//                                 }}
//                                 className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                               >
//                                 <option value="">Choose derived value</option>
//                                 <option value="full_name">Full name</option>
//                                 <option value="first_name">First name</option>
//                                 <option value="last_name">Last name</option>
//                                 <option value="mobile_number">
//                                   Mobile number
//                                 </option>
//                                 <option value="loyalty_points">
//                                   Loyalty points
//                                 </option>
//                                 <option value="store_name">Store name</option>
//                                 <option value="current_date">
//                                   Current date
//                                 </option>
//                               </select>
//                             ) : (
//                               <input
//                                 value={mapping.value}
//                                 onChange={(event) => {
//                                   const nextMappings = upsertVariableMapping(
//                                     form.actionConfig.variableMappings,
//                                     descriptor,
//                                     {
//                                       ...mapping,
//                                       value: event.target.value,
//                                     },
//                                   );
//                                   setForm({
//                                     ...form,
//                                     actionConfig: {
//                                       ...form.actionConfig,
//                                       variableMappings: nextMappings,
//                                     },
//                                   });
//                                 }}
//                                 className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                                 placeholder="Static value"
//                               />
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {step === reviewStep && (
//                 <div className="space-y-8 py-4">
//                   <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FBFBFE] via-white to-[#F5F6FC] p-4 sm:p-6">
//                     <div className="pointer-events-none absolute left-[27px] top-10 bottom-10 w-0.5 border-l-2 border-dashed border-gray-200 lg:hidden" />

//                     <div className="relative flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-4">
//                       <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-[#D8DBEC] lg:block" />

//                       {/* Trigger Node */}
//                       <div className="z-10 flex flex-1 flex-col items-center">
//                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm outline outline-4 outline-white">
//                           <Zap size={24} />
//                         </div>
//                         <div className="mt-3 text-center">
//                           <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
//                             Trigger
//                           </div>
//                           <div className="mt-1 text-sm font-bold text-[#313166]">
//                             {form.triggerType.replaceAll("_", " ")}
//                           </div>
//                           <div className="mt-0.5 text-xs text-gray-500">
//                             Starts the journey
//                           </div>
//                         </div>
//                       </div>

//                       {/* Delay Node */}
//                       <div className="z-10 flex flex-1 flex-col items-center">
//                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm outline outline-4 outline-white">
//                           <Clock size={24} />
//                         </div>
//                         <div className="mt-3 text-center">
//                           <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">
//                             Delay
//                           </div>
//                           <div className="mt-1 text-sm font-bold text-[#313166]">
//                             {formatDelayLabel(form.delay)}
//                           </div>
//                           <div className="mt-0.5 text-xs text-gray-500">
//                             Wait before action
//                           </div>
//                         </div>
//                       </div>

//                       {/* Action Node */}
//                       <div className="z-10 flex flex-1 flex-col items-center">
//                         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#31316610] text-[#313166] shadow-sm outline outline-4 outline-white">
//                           <MessageCircle size={24} />
//                         </div>
//                         <div className="mt-3 text-center">
//                           <div className="text-xs font-semibold uppercase tracking-wider text-[#313166]">
//                             Action
//                           </div>
//                           <div className="mt-1 text-sm font-bold text-[#313166]">
//                             {selectedTemplate?.name || "WhatsApp Message"}
//                           </div>
//                           <div className="mt-0.5 text-xs text-gray-500">
//                             Send template
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Configuration Summary Cards */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {audienceStep ? (
//                       <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-5">
//                         <div className="mb-3 flex items-center justify-between">
//                           <h4 className="text-sm font-bold text-[#313166]">
//                             Audience Filtering
//                           </h4>
//                           <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
//                             {form.audienceRules.logic}
//                           </span>
//                         </div>
//                         <div className="space-y-2">
//                           {form.audienceRules.conditions.length > 0 ? (
//                             form.audienceRules.conditions.map((rule, idx) => {
//                               const field = fields.find(
//                                 (f) => f.fieldKey === rule.fieldKey,
//                               );
//                               return (
//                                 <div
//                                   key={idx}
//                                   className="flex items-center gap-2 text-xs text-gray-600"
//                                 >
//                                   <CheckCircle2
//                                     size={12}
//                                     className="text-emerald-500"
//                                   />
//                                   <span>
//                                     <b>{field?.label || rule.fieldKey}</b>{" "}
//                                     {operatorLabels[rule.operator] ||
//                                       rule.operator}{" "}
//                                     <b>{rule.value || ""}</b>
//                                   </span>
//                                 </div>
//                               );
//                             })
//                           ) : (
//                             <div className="text-xs text-gray-500 italic">
//                               No audience rules (targeting all)
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-5">
//                         <div className="text-sm font-bold text-[#313166]">
//                           Audience step skipped
//                         </div>
//                         <div className="mt-2 text-xs text-gray-500">
//                           New customer journeys go straight from the trigger to
//                           the action step.
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
//                 <button
//                   type="button"
//                   onClick={onBack}
//                   className="rounded-xl border border-[#313166] px-5 py-2.5 text-sm font-medium text-[#313166]"
//                 >
//                   Back to dashboard
//                 </button>

//                 <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>

//                 {step < totalSteps ? (
//                   <button
//                     type="button"
//                     onClick={() => goToStep(step + 1)}
//                     className="rounded-xl bg-[#CB376D] px-5 py-2.5 text-sm font-medium text-white"
//                   >
//                     Next Step
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={handleSave}
//                     disabled={saving}
//                     className="rounded-xl bg-[#CB376D] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
//                   >
//                     {saving
//                       ? "Saving..."
//                       : isEditingAutomation
//                         ? "Update Automation"
//                         : "Save Automation"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {step === actionStep && (
//             <div className="space-y-6">
//               <WhatsAppTemplatePreviewCard
//                 template={selectedTemplate}
//                 headerComponent={templateHeader}
//                 headerText={previewHeaderText}
//                 bodyText={previewBodyText}
//                 footerText={previewFooterText}
//                 buttons={templateButtons}
//                 mediaType={templateHeaderMediaType}
//                 mediaUrl={form.actionConfig.mediaUrl}
//               />

//               <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-xs uppercase tracking-[0.22em] text-gray-400">
//                       Template Summary
//                     </div>
//                     <h4 className="mt-1 text-lg font-semibold text-[#313166]">
//                       {selectedTemplate?.name || "No template selected"}
//                     </h4>
//                   </div>
//                   <div className="rounded-full bg-[#F4F5F9] px-3 py-1 text-xs font-medium text-[#313166]">
//                     Action step
//                   </div>
//                 </div>

//                 <div className="mt-4 space-y-3 text-sm text-gray-600">
//                   <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
//                     <span>Body variables</span>
//                     <span className="font-semibold text-[#313166]">
//                       {templateVariables.filter((item) => item.componentType === "BODY").length}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
//                     <span>Header type</span>
//                     <span className="font-semibold text-[#313166]">
//                       {templateHeader?.format || "TEXT"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
//                     <span>Buttons</span>
//                     <span className="font-semibold text-[#313166]">
//                       {templateButtons.length}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F5F9] px-4 py-3">
//                     <span>Media status</span>
//                     <span className="font-semibold text-[#313166]">
//                       {templateHeaderMediaType
//                         ? form.actionConfig.mediaUrl?.trim()
//                           ? "Ready"
//                           : "Missing media"
//                         : "Not required"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {step === reviewStep && (
//             <div className="space-y-6">
//               <div className="rounded-3xl bg-[#313166] p-5 text-white shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-xs uppercase tracking-[0.25em] text-white/60">
//                       Live Preview
//                     </div>
//                     <h3 className="mt-2 text-lg font-semibold">
//                       WhatsApp Retention Flow
//                     </h3>
//                   </div>
//                   <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
//                     {selectedTriggerGroup.name}
//                   </div>
//                 </div>

//                 <div className="mt-5 rounded-[28px] bg-[#171717] p-3 shadow-2xl">
//                   <div className="overflow-hidden rounded-[22px] bg-[#0a0a0a]">
//                     <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">
//                         V
//                       </div>
//                       <div className="flex-1">
//                         <div className="font-semibold">Vadik Business</div>
//                         <div className="text-xs text-white/75">
//                           retention automation preview
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       className="min-h-[300px] space-y-3 px-4 py-4"
//                       style={{
//                         backgroundImage:
//                           "repeating-linear-gradient(45deg, #0d1418 0px, #0d1418 10px, #0e1519 10px, #0e1519 20px)",
//                       }}
//                     >
//                       <div className="flex justify-end">
//                         <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tr-md bg-[#005c4b]">
//                           {templateHeader?.format === "TEXT" &&
//                           templateHeader?.text ? (
//                             <div
//                               className="border-b border-white/10 px-3 pb-2 pt-3 text-sm font-semibold text-white"
//                               dangerouslySetInnerHTML={{
//                                 __html: renderWhatsAppFormattedText(
//                                   templateHeader.text,
//                                 ),
//                               }}
//                             />
//                           ) : null}

//                           {templateHeaderMediaType ? (
//                             <div className="border-b border-white/10 bg-black/10">
//                               {form.actionConfig.mediaUrl ? (
//                                 templateHeaderMediaType === "IMAGE" ? (
//                                   <img
//                                     src={form.actionConfig.mediaUrl}
//                                     alt="Template header preview"
//                                     className="max-h-64 w-full object-cover"
//                                   />
//                                 ) : templateHeaderMediaType === "VIDEO" ? (
//                                   <video
//                                     src={form.actionConfig.mediaUrl}
//                                     controls
//                                     className="max-h-64 w-full bg-black object-contain"
//                                   />
//                                 ) : (
//                                   <div className="flex items-center gap-3 px-3 py-4 text-white">
//                                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
//                                       <FileText className="h-5 w-5" />
//                                     </div>
//                                     <div className="min-w-0">
//                                       <div className="text-sm font-medium">
//                                         Document attachment
//                                       </div>
//                                       <div className="truncate text-xs text-white/70">
//                                         {form.actionConfig.mediaUrl}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )
//                               ) : (
//                                 <div className="flex min-h-[148px] flex-col items-center justify-center gap-2 px-4 py-6 text-center text-white/70">
//                                   {templateHeaderMediaType === "IMAGE" && (
//                                     <ImageIcon className="h-7 w-7" />
//                                   )}
//                                   {templateHeaderMediaType === "VIDEO" && (
//                                     <Play className="h-7 w-7" />
//                                   )}
//                                   {templateHeaderMediaType === "DOCUMENT" && (
//                                     <FileText className="h-7 w-7" />
//                                   )}
//                                   <div className="text-xs font-medium">
//                                     {templateHeaderMediaType.toLowerCase()}{" "}
//                                     header will appear here
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           ) : null}

//                           <div className="p-3">
//                             <div
//                               className="whitespace-pre-wrap text-sm text-white"
//                               dangerouslySetInnerHTML={{
//                                 __html:
//                                   renderWhatsAppFormattedText(previewBodyText),
//                               }}
//                             />
//                             <div className="mt-1 text-right text-xs text-white/60">
//                               {formatScheduleTime(
//                                 form.triggerConfig.scheduleTime || "09:00",
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 bg-[#1f2c33] px-3 py-2">
//                       <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-sm text-[#8696a0]">
//                         Type a message
//                       </div>
//                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884]">
//                         <ArrowRight className="h-5 w-5 text-white" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//             </div>
//           )}
//         </div>
//       </div>

//       <ConfirmationDialog
//         isOpen={showSaveConfirm}
//         title={isEditingAutomation ? "Update Automation?" : "Save Automation?"}
//         message={
//           isEditingAutomation
//             ? "Do you want to save these changes to this automation?"
//             : "Do you want to save this automation now?"
//         }
//         confirmLabel={isEditingAutomation ? "Yes, Update" : "Yes, Save"}
//         cancelLabel="No"
//         loading={saving}
//         onCancel={() => setShowSaveConfirm(false)}
//         onConfirm={() => {
//           setShowSaveConfirm(false);
//           onSave(form);
//         }}
//       />
//     </>
//   );
// }

function AutomationLogsView({ automation, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/retention-automations/${automation._id}/executions`,
        );
        setLogs(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        showToast("Failed to load execution logs", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [automation._id]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-r from-[#313166] to-[#3d3b83] px-6 py-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Execution History
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{automation.name}</h2>
            </div>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/15"
          >
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back to dashboard
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 pb-4">
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Customer
                </th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Triggered Condition
                </th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Triggered At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    Loading history...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No executions found for this automation.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const customer = log.customerId || {};
                  const messageLog = log.messageLogId || {};
                  const fullName =
                    [customer.firstname, customer.lastname]
                      .filter(Boolean)
                      .join(" ") ||
                    [messageLog.firstname, messageLog.lastname]
                      .filter(Boolean)
                      .join(" ") ||
                    customer.firstname ||
                    messageLog.firstname ||
                    "Unknown Customer";
                  const mobileNumber =
                    customer.mobileNumber || messageLog.mobileNumber || "";

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50">
                      <td className="py-4">
                        <div className="font-medium text-[#313166]">
                          {fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPhone(customer.countryCode, mobileNumber)}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="max-w-xs text-sm text-gray-600">
                          {formatExecutionSummary(log)}
                        </div>
                        {log.failureReason ? (
                          <div className="mt-1 text-xs text-red-500">
                            {log.failureReason}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                            log.sendResult === "delivered" ||
                            log.sendResult === "read"
                              ? "bg-emerald-100 text-emerald-600"
                              : log.sendResult === "failed"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {log.sendResult}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {new Date(log.runAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function RetentionRhythmAutomation() {
  const [view, setView] = useState("dashboard");
  const [selectedView, setSelectedView] = useState("all");
  const [automations, setAutomations] = useState([]);
  const [fields, setFields] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activityCampaigns, setActivityCampaigns] = useState({
    spinWheel: [],
    scratchCard: [],
    quiz: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);

  const fetchRetentionData = async () => {
    try {
      setLoading(true);
      const [automationsRes, fieldsRes, templatesRes] = await Promise.all([
        api.get("/api/retention-automations"),
        api.get("/api/retention-automations/field-registry/all"),
        api.get("/api/retention-automations/templates/all"),
      ]);

      setAutomations(automationsRes.data?.data || []);
      setFields(fieldsRes.data?.data || []);
      setTemplates(templatesRes.data?.data || []);
    } catch (error) {
      console.error("Error loading retention data:", error);
      showToast("Failed to load retention automation data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityCampaigns = async () => {
    try {
      const [quizRes, spinRes, scratchRes] = await Promise.allSettled([
        api.get("/api/quiz?fully=true"),
        api.get("/api/spinWheels/spinWheel/all?fully=true"),
        api.get("/api/scratchCards/scratchCard/all?fully=true"),
      ]);

      setActivityCampaigns({
        quiz: quizRes.status === "fulfilled" ? quizRes.value.data?.docs || [] : [],
        spinWheel: spinRes.status === "fulfilled" ? spinRes.value.data?.data || [] : [],
        scratchCard:
          scratchRes.status === "fulfilled" ? scratchRes.value.data?.data || [] : [],
      });
    } catch (error) {
      console.error("Error loading activity campaigns:", error);
    }
  };

  useEffect(() => {
    fetchRetentionData();
    fetchActivityCampaigns();
  }, []);

  const handleCreateNew = () => {
    setEditingAutomation(null);
    setView("builder");
  };

  const handleEdit = (automation) => {
    setEditingAutomation(automation);
    setView("builder");
  };

  const handleViewLogs = (automation) => {
    setEditingAutomation(automation);
    setView("logs");
  };

  const handleBack = () => {
    setView("dashboard");
    setEditingAutomation(null);
  };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      const payload = { ...form };
      delete payload.analyticsSummary;
      delete payload.audienceSize;
      delete payload.sent;
      delete payload.delivered;
      delete payload.read;
      delete payload.replied;
      delete payload.failed;

      if (editingAutomation?._id) {
        await api.put(
          `/api/retention-automations/${editingAutomation._id}`,
          payload,
        );
        showToast("Automation updated successfully", "success");
      } else {
        await api.post("/api/retention-automations", payload);
        showToast("Automation created successfully", "success");
      }

      await fetchRetentionData();
      setView("dashboard");
      setEditingAutomation(null);
    } catch (error) {
      console.error("Error saving automation:", error);
      showToast(
        error.response?.data?.message || "Failed to save automation",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (automation) => {
    try {
      const nextStatus = automation.status === "active" ? "paused" : "active";
      await api.patch(`/api/retention-automations/${automation._id}/status`, {
        status: nextStatus,
      });
      setAutomations((previous) =>
        previous.map((item) =>
          item._id === automation._id ? { ...item, status: nextStatus } : item,
        ),
      );
      showToast(
        `Automation ${nextStatus === "active" ? "activated" : "paused"}`,
        "success",
      );
    } catch (error) {
      console.error("Error updating automation status:", error);
      showToast("Failed to update automation status", "error");
    }
  };

  const handleDuplicate = async (automation) => {
    try {
      const copyPayload = normalizeAutomationForForm(automation);
      delete copyPayload._id;
      delete copyPayload.createdAt;
      delete copyPayload.updatedAt;
      copyPayload.name = `${automation.name} (Copy)`;
      copyPayload.status = "draft";
      copyPayload.analyticsSummary = {
        audienceSize: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
      };

      await api.post("/api/retention-automations", copyPayload);
      await fetchRetentionData();
      showToast("Automation duplicated successfully", "success");
    } catch (error) {
      console.error("Error duplicating automation:", error);
      showToast("Failed to duplicate automation", "error");
    }
  };

  const handleDelete = async (automation) => {
    if (!window.confirm(`Delete "${automation.name}"?`)) return;

    try {
      await api.delete(`/api/retention-automations/${automation._id}`);
      setAutomations((previous) =>
        previous.filter((item) => item._id !== automation._id),
      );
      showToast("Automation deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting automation:", error);
      showToast("Failed to delete automation", "error");
    }
  };

  return view === "dashboard" ? (
    <AutomationDashboardView
      automations={automations}
      activityCampaigns={activityCampaigns}
      selectedView={selectedView}
      onSelectView={setSelectedView}
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      loading={loading}
      onViewLogs={handleViewLogs}
    />
  ) : view === "builder" ? (
      <RetentionBuilderView
        key={editingAutomation?._id || "new"}
        initialAutomation={editingAutomation}
        fields={fields}
        templates={templates}
        activityCampaigns={activityCampaigns}
        onBack={handleBack}
        onSave={handleSave}
        saving={saving}
      />
  ) : (
    <AutomationLogsView automation={editingAutomation} onBack={handleBack} />
  );
}
