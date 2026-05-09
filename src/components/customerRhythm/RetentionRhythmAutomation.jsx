/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  Eye,
  LayoutGrid,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Settings2,
  Tag,
  Trash2,
  UserPlus,
  Webhook,
  X,
  Zap,
  Clock,
  ChevronRight,
  History,
} from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const dashboardStats = [
  { key: "total", filter: "all", label: "Total automations", tone: "text-[#313166]" },
  { key: "active", filter: "active", label: "Active", tone: "text-emerald-600" },
  { key: "paused", filter: "paused", label: "Paused", tone: "text-amber-600" },
  { key: "draft", filter: "draft", label: "Draft", tone: "text-[#CB376D]" },
];

const journeyOptions = [
  { id: "winback", title: "Win Back Customers", note: "Bring dormant customers back with offers and reminders." },
  { id: "welcome", title: "Welcome Flow", note: "Start automated communication right after customer signup." },
  { id: "loyalty", title: "Loyalty Nudge", note: "Reward repeat customers based on points, visits, or milestones." },
];

const triggerGroups = [
  {
    name: "Customer",
    color: "#CB376D",
    items: [
      { id: "new_customer", name: "New Customer", icon: UserPlus },
      { id: "customer_field_date", name: "Customer Date Field", icon: Calendar },
      { id: "inactive_for_days", name: "Inactive for Days", icon: Activity },
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
    items: [{ id: "customer_activity_completed", name: "Activity Completed", icon: CheckCircle2 }],
  },
  {
    name: "Recurring",
    color: "#7C3AED",
    items: [{ id: "scheduled_recurring", name: "Scheduled Recurring", icon: Webhook }],
  },
];

const triggerIcons = {
  new_customer: UserPlus,
  customer_field_date: Calendar,
  inactive_for_days: Activity,
  whatsapp_keyword: MessageCircle,
  customer_activity_completed: CheckCircle2,
  scheduled_recurring: Webhook,
};

const stepLabels = ["Journey", "Trigger", "Audience", "Conditions", "Action", "Review"];
const previewQuickSegments = [
  {
    key: "all",
    label: "All Customers",
    rules: { logic: "AND", conditions: [] },
  },
  {
    key: "opted_in",
    label: "Opted-In",
    rules: { logic: "AND", conditions: [{ fieldKey: "isOptedIn", operator: "is_true" }] },
  },
  {
    key: "new_7d",
    label: "New 7d",
    rules: { logic: "AND", conditions: [{ fieldKey: "createdAt", operator: "in_last_days", value: 7 }] },
  },
  {
    key: "active_30d",
    label: "Active 30d",
    rules: { logic: "AND", conditions: [{ fieldKey: "firstVisit", operator: "in_last_days", value: 30 }] },
  },
];

const delayOptions = [
  { label: "Immediate", mode: "immediate", value: 0, unit: "minutes" },
  { label: "5m", mode: "delay", value: 5, unit: "minutes" },
  { label: "1h", mode: "delay", value: 1, unit: "hours" },
  { label: "1d", mode: "delay", value: 1, unit: "days" },
  { label: "3d", mode: "delay", value: 3, unit: "days" },
];

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

const createEmptyAutomation = () => ({
  name: "Untitled Automation",
  status: "draft",
  journeyType: "winback",
  triggerType: "new_customer",
  triggerConfig: {
    fieldKey: "",
    keyword: "",
    activityType: "",
    scheduleType: "daily",
    days: 30,
    timezone: "Asia/Calcutta",
  },
  audienceRules: { logic: "AND", conditions: [] },
  conditionRules: { logic: "AND", conditions: [] },
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

const normalizeTemplateVariableToken = (value = "") => {
  const match = String(value).match(/\d+/);
  return match ? `{{${match[0]}}}` : String(value);
};

const getTemplateHeaderMediaType = (template) => {
  const header = template?.components?.find((component) => component.type === "HEADER");
  return header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) ? header.format : "";
};

const extractTemplateVariables = (template) => {
  const values = [];
  (template?.components || []).forEach((component) => {
    if (!["HEADER", "BODY"].includes(component?.type)) return;

    const textSources = [
      component?.text || "",
      ...(Array.isArray(component?.example?.body_text) ? component.example.body_text.flat() : []),
    ].filter(Boolean);

    const matches = textSources.join(" ").match(/\{\{\s*\d+\s*\}\}/g) || [];
    const uniqueMatches = [...new Set(matches.map(normalizeTemplateVariableToken))].sort(
      (left, right) => Number(left.replace(/\D/g, "")) - Number(right.replace(/\D/g, ""))
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
      (mapping.componentType || "BODY") === descriptor.componentType && mapping.variable === descriptor.variable
  ) ||
  mappings.find(
    (mapping) =>
      !mapping.componentType && descriptor.componentType === "BODY" && mapping.variable === descriptor.variable
  );

const upsertVariableMapping = (mappings = [], descriptor = {}, updates = {}) => {
  const nextMappings = [...mappings];
  const index = nextMappings.findIndex(
    (mapping) =>
      ((mapping.componentType || "BODY") === descriptor.componentType && mapping.variable === descriptor.variable) ||
      (!mapping.componentType && descriptor.componentType === "BODY" && mapping.variable === descriptor.variable)
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

const getTemplatePreviewText = (template, mappings, fields) => {
  const bodyText =
    template?.components?.find((component) => component.type === "BODY")?.text ||
    "Choose a template to preview the WhatsApp message.";

  if (!template) return bodyText;

  let previewText = bodyText;
  mappings
    .filter((mapping) => (mapping.componentType || "BODY") === "BODY")
    .forEach((mapping) => {
    const field = fields.find((item) => item.fieldKey === mapping.value);
    const replacement =
      mapping.sourceType === "static"
        ? mapping.value || "value"
        : mapping.sourceType === "derived"
          ? mapping.value || "derived"
          : field?.label || "customer field";

    previewText = previewText.replaceAll(mapping.variable, `{{${replacement}}}`);
    });

  return previewText;
};

const formatPhone = (countryCode = "", mobileNumber = "") => {
  const phone = `${countryCode || ""}${mobileNumber || ""}`.trim();
  return phone ? (phone.startsWith("+") ? phone : `+${phone}`) : "No mobile";
};

const formatRuleGroupSummary = (ruleGroup = {}) => {
  const rules = Array.isArray(ruleGroup?.conditions) ? ruleGroup.conditions : [];
  if (!rules.length) return "All";
  return `${ruleGroup.logic || "AND"} • ${rules.length} rule${rules.length === 1 ? "" : "s"}`;
};

const formatExecutionSummary = (log) => {
  const triggerSnapshot = log?.triggerSnapshot || {};
  if (triggerSnapshot.customerCreatedAt) return "New customer";
  if (triggerSnapshot.keyword) return `Keyword: ${triggerSnapshot.keyword}`;
  if (triggerSnapshot.activityType) return `Activity: ${triggerSnapshot.activityType}`;

  const audienceSummary = formatRuleGroupSummary(log?.conditionSnapshot?.audienceRules);
  const conditionSummary = formatRuleGroupSummary(log?.conditionSnapshot?.conditionRules);
  return `Audience ${audienceSummary} | Conditions ${conditionSummary}`;
};

const normalizeAutomationForForm = (automation) => {
  if (!automation) return createEmptyAutomation();

  return {
    ...createEmptyAutomation(),
    ...automation,
    actionConfig: {
      ...createEmptyAutomation().actionConfig,
      ...(automation.actionConfig || {}),
      templateId: automation.actionConfig?.templateId?._id || automation.actionConfig?.templateId || "",
      variableMappings: automation.actionConfig?.variableMappings || [],
    },
    triggerConfig: {
      ...createEmptyAutomation().triggerConfig,
      ...(automation.triggerConfig || {}),
    },
    audienceRules: automation.audienceRules || { logic: "AND", conditions: [] },
    conditionRules: automation.conditionRules || { logic: "AND", conditions: [] },
    delay: automation.delay || { mode: "immediate", value: 0, unit: "minutes" },
    safetyFlags: automation.safetyFlags || { preventDuplicateWindowHours: 24, stopIfOptedOut: true },
  };
};

function AutomationDashboardView({
  automations,
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
    selectedView === "all" ? automations : automations.filter((automation) => automation.status === selectedView);

  const summary = {
    total: automations.length,
    active: automations.filter((automation) => automation.status === "active").length,
    paused: automations.filter((automation) => automation.status === "paused").length,
    draft: automations.filter((automation) => automation.status === "draft").length,
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
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Retention Rhythm</p>
              <h2 className="mt-1 text-2xl font-semibold">Automation dashboard</h2>
              <p className="mt-2 max-w-3xl text-sm text-white/75">
                Build reusable WhatsApp retention journeys using dynamic customer fields, typed conditions, and approved templates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["WhatsApp-first", "Dynamic fields", "Retention automation"].map((badge) => (
              <span key={badge} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                {badge}
              </span>
            ))}
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
                    backgroundColor: isSelected ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)",
                    borderColor: isSelected ? "rgba(255,255,255,0.22)" : "transparent",
                  }}
                >
                  <div className="text-white/70 text-sm">{stat.label}</div>
                  <div className={`mt-2 text-3xl font-semibold ${stat.tone}`}>{summary[stat.key]}</div>
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
            <h3 className="text-lg font-semibold text-[#313166]">Automations</h3>
            <p className="text-sm text-gray-500">These flows are now backed by the retention automation APIs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["all", "active", "paused", "draft"].map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => onSelectView(view)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: selectedView === view ? "#313166" : "#F4F5F9",
                  color: selectedView === view ? "white" : "#313166",
                }}
              >
                {view === "all" ? "All" : view.charAt(0).toUpperCase() + view.slice(1)}
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
              <h4 className="mt-4 text-lg font-semibold text-[#313166]">No automations found</h4>
              <p className="mt-2 text-sm text-gray-500">Create your first retention flow to start automating customer follow-ups.</p>
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
              const TriggerIcon = triggerIcons[automation.triggerType] || Activity;
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
                    <button type="button" onClick={() => onEdit(automation)} className="flex-1 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#31316610] text-[#313166]">
                          <TriggerIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-[#313166]">{automation.name}</h4>
                          <p className="mt-0.5 text-sm text-gray-500">{automation.triggerType.replaceAll("_", " ")}</p>
                        </div>
                      </div>
                    </button>

                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={statusTone}>
                      {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-[#F4F5F9] p-3">
                      <div className="text-xs uppercase text-gray-400">Audience</div>
                      <div className="mt-1 font-semibold text-[#313166]">{automation.audienceSize || 0}</div>
                    </div>
                    <div className="rounded-xl bg-[#F4F5F9] p-3">
                      <div className="text-xs uppercase text-gray-400">Delivered</div>
                      <div className="mt-1 font-semibold text-[#313166]">{automation.delivered || 0}</div>
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
                      {automation.status === "active" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
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

function RuleComposer({ label, fields, rules, draftRule, onDraftChange, onAddRule, onRemoveRule, logic, onLogicChange }) {
  const selectedField = fields.find((field) => field.fieldKey === draftRule.fieldKey);
  const operators = selectedField?.operators || [];

  const renderValueInput = () => {
    if (!selectedField) return null;
    if (["is_true", "is_false", "today", "is_empty", "is_not_empty"].includes(draftRule.operator)) return null;

    if (draftRule.operator === "between") {
      const inputType = selectedField.type === "number" ? "number" : "date";
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type={inputType}
            value={draftRule.value || ""}
            onChange={(event) => onDraftChange({ ...draftRule, value: event.target.value })}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="From"
          />
          <input
            type={inputType}
            value={draftRule.valueTo || ""}
            onChange={(event) => onDraftChange({ ...draftRule, valueTo: event.target.value })}
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
            onChange={(event) => onDraftChange({ ...draftRule, value: event.target.value })}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Number of days"
          />
        );
      }

      return (
        <input
          type="date"
          value={draftRule.value || ""}
          onChange={(event) => onDraftChange({ ...draftRule, value: event.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      );
    }

    if (selectedField.type === "options" && draftRule.operator === "equals") {
      return (
        <select
          value={draftRule.value || ""}
          onChange={(event) => onDraftChange({ ...draftRule, value: event.target.value })}
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
        onChange={(event) => onDraftChange({ ...draftRule, value: event.target.value })}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        placeholder={selectedField.type === "options" ? "Comma separated values" : "Value"}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#313166]">{label}</div>
          <div className="text-xs text-gray-500">Choose dynamic customer fields and typed operators.</div>
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
          onChange={(event) => onDraftChange({ fieldKey: event.target.value, operator: "", value: "", valueTo: "" })}
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
          onChange={(event) => onDraftChange({ ...draftRule, operator: event.target.value, value: "", valueTo: "" })}
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

        {renderValueInput() || <div className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-400">No extra value needed</div>}
      </div>

      <button
        type="button"
        onClick={onAddRule}
        className="rounded-xl bg-[#CB376D] px-4 py-2 text-sm font-medium text-white"
      >
        Add Rule
      </button>

      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule, index) => {
            const field = fields.find((item) => item.fieldKey === rule.fieldKey);
            return (
              <div key={`${rule.fieldKey}-${index}`} className="flex items-center justify-between rounded-xl bg-[#F4F5F9] px-4 py-3 text-sm text-[#313166]">
                <span>
                  <b>{field?.label || rule.fieldKey}</b> {operatorLabels[rule.operator] || rule.operator}{" "}
                  <b>{rule.valueTo ? `${rule.value} to ${rule.valueTo}` : rule.value || ""}</b>
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
  onBack,
  onSave,
  previewState,
  onPreview,
  saving,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => normalizeAutomationForForm(initialAutomation));
  const [audienceDraftRule, setAudienceDraftRule] = useState({ fieldKey: "", operator: "", value: "", valueTo: "" });
  const [conditionDraftRule, setConditionDraftRule] = useState({ fieldKey: "", operator: "", value: "", valueTo: "" });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    setForm(normalizeAutomationForForm(initialAutomation));
  }, [initialAutomation]);

  const selectedTriggerGroup =
    triggerGroups.find((group) => group.items.some((item) => item.id === form.triggerType)) || triggerGroups[0];
  const selectedTemplate = templates.find((template) => template._id === form.actionConfig.templateId);
  const dateFields = fields.filter((field) => field.type === "date");
  const templateVariables = extractTemplateVariables(selectedTemplate);
  const templateHeaderMediaType = getTemplateHeaderMediaType(selectedTemplate);
  const previewText = getTemplatePreviewText(selectedTemplate, form.actionConfig.variableMappings || [], fields);

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
        }
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
        mediaUrl: mediaType === form.actionConfig.mediaType ? form.actionConfig.mediaUrl : "",
      },
    });
  };

  const handleMediaUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = templateHeaderMediaType === "VIDEO" ? 64 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`File too large. Max ${maxSize / (1024 * 1024)}MB.`, "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingMedia(true);
      const response = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
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
      showToast("Failed to upload media", "error");
    } finally {
      setUploadingMedia(false);
      event.target.value = "";
    }
  };

  const addRule = (ruleType, draftRule) => {
    if (!draftRule.fieldKey || !draftRule.operator) {
      showToast("Choose a field and operator before adding a rule", "warning");
      return;
    }

    setForm({
      ...form,
      [ruleType]: {
        ...form[ruleType],
        conditions: [...form[ruleType].conditions, draftRule],
      },
    });

    if (ruleType === "audienceRules") {
      setAudienceDraftRule({ fieldKey: "", operator: "", value: "", valueTo: "" });
      return;
    }

    setConditionDraftRule({ fieldKey: "", operator: "", value: "", valueTo: "" });
  };

  const removeRule = (ruleType, index) => {
    setForm({
      ...form,
      [ruleType]: {
        ...form[ruleType],
        conditions: form[ruleType].conditions.filter((_, itemIndex) => itemIndex !== index),
      },
    });
  };

  const applyQuickSegment = (segment) => {
    setForm({
      ...form,
      audienceRules: segment.rules,
    });
  };

  const handleSave = () => {
    if (!form.actionConfig.templateId) {
      showToast("Choose a WhatsApp template before saving", "warning");
      return;
    }

    const missingMappings = templateVariables.filter((descriptor) => {
      const mapping = findVariableMapping(form.actionConfig.variableMappings, descriptor);
      return !mapping?.value?.trim();
    });

    if (missingMappings.length > 0) {
      showToast("Fill all template variables before saving", "warning");
      return;
    }

    if (templateHeaderMediaType && !form.actionConfig.mediaUrl?.trim()) {
      showToast(`Add a ${templateHeaderMediaType.toLowerCase()} header URL or upload media before saving`, "warning");
      return;
    }

    onSave(form);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-r from-[#313166] to-[#3d3b83] px-6 py-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Create automation</p>
              <h2 className="mt-1 text-2xl font-semibold">{form.name}</h2>
              <p className="mt-2 max-w-3xl text-sm text-white/75">
                This builder now uses the real retention APIs, dynamic field registry, and template catalog.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index + 1)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                style={{
                  backgroundColor: step === index + 1 ? "white" : "rgba(255,255,255,0.1)",
                  color: step === index + 1 ? "#313166" : "rgba(255,255,255,0.8)",
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

          <div className="text-xs uppercase tracking-[0.22em] text-white/55">Retention rhythm automation builder</div>
        </div>
      </div>

      <div className={`grid gap-6 ${step === 6 ? "xl:grid-cols-[1.25fr_0.95fr]" : "grid-cols-1"}`}>
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-gray-400">Step {step} of 6</div>
                <h3 className="mt-1 text-lg font-semibold text-[#313166]">{stepLabels[step - 1]}</h3>
                <p className="text-sm text-gray-500">Use dynamic fields, typed operators, and approved templates.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {stepLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(index + 1)}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: step === index + 1 ? "#313166" : "#F4F5F9",
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
                  <span className="mb-2 block text-sm font-medium text-[#313166]">Automation name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#313166]"
                    placeholder="Enter automation name"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-3">
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
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {triggerGroups.map((group) => (
                  <div key={group.name}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{group.name}</h4>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = form.triggerType === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setForm({ ...form, triggerType: item.id })}
                            className="rounded-2xl border p-4 text-left transition-all"
                            style={{
                              borderColor: active ? group.color : "#E5E7EB",
                              backgroundColor: active ? `${group.color}08` : "white",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${group.color}15` }}>
                                <Icon className="h-5 w-5" style={{ color: group.color }} />
                              </div>
                              <div>
                                <div className="font-semibold text-[#313166]">{item.name}</div>
                                <div className="text-sm text-gray-500">Trigger this flow</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {form.triggerType === "customer_field_date" && (
                  <select
                    value={form.triggerConfig.fieldKey}
                    onChange={(event) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, fieldKey: event.target.value } })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">Choose a date field</option>
                    {dateFields.map((field) => (
                      <option key={field.fieldKey} value={field.fieldKey}>
                        {field.label} ({field.sourceSection})
                      </option>
                    ))}
                  </select>
                )}

                {form.triggerType === "inactive_for_days" && (
                  <input
                    type="number"
                    value={form.triggerConfig.days || ""}
                    onChange={(event) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, days: Number(event.target.value) } })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Inactive for how many days?"
                  />
                )}

                {form.triggerType === "whatsapp_keyword" && (
                  <input
                    value={form.triggerConfig.keyword || ""}
                    onChange={(event) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, keyword: event.target.value } })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Enter keyword"
                  />
                )}

                {form.triggerType === "customer_activity_completed" && (
                  <select
                    value={form.triggerConfig.activityType || ""}
                    onChange={(event) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, activityType: event.target.value } })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">Choose activity</option>
                    <option value="spinwheel">Spin Wheel</option>
                    <option value="scratchcard">Scratch Card</option>
                    <option value="quiz">Quiz</option>
                  </select>
                )}

                {form.triggerType === "scheduled_recurring" && (
                  <select
                    value={form.triggerConfig.scheduleType || "daily"}
                    onChange={(event) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, scheduleType: event.target.value } })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {previewQuickSegments.map((segment) => (
                    <button
                      key={segment.key}
                      type="button"
                      onClick={() => applyQuickSegment(segment)}
                      className="rounded-2xl border px-4 py-3 text-left transition-all"
                      style={{
                        borderColor: form.audienceRules.conditions.length === segment.rules.conditions.length ? "#313166" : "#E5E7EB",
                        backgroundColor: "#fff",
                      }}
                    >
                      <div className="font-semibold text-[#313166]">{segment.label}</div>
                      <div className="text-xs text-gray-500">Audience preset</div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
                  <div className="mb-2 text-sm font-semibold text-[#313166]">Dynamic customer fields</div>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((field) => (
                      <span key={field.fieldKey} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#313166]">
                        {field.label}
                      </span>
                    ))}
                  </div>
                </div>

                <RuleComposer
                  label="Audience rules"
                  fields={fields}
                  rules={form.audienceRules.conditions}
                  draftRule={audienceDraftRule}
                  onDraftChange={setAudienceDraftRule}
                  onAddRule={() => addRule("audienceRules", audienceDraftRule)}
                  onRemoveRule={(index) => removeRule("audienceRules", index)}
                  logic={form.audienceRules.logic}
                  onLogicChange={(logic) => setForm({ ...form, audienceRules: { ...form.audienceRules, logic } })}
                />

                <button
                  type="button"
                  onClick={() => onPreview(form)}
                  className="rounded-xl border border-[#313166] px-4 py-2 text-sm font-medium text-[#313166]"
                >
                  Preview Audience
                </button>
              </div>
            )}

            {step === 4 && (
              <RuleComposer
                label="Condition rules"
                fields={fields}
                rules={form.conditionRules.conditions}
                draftRule={conditionDraftRule}
                onDraftChange={setConditionDraftRule}
                onAddRule={() => addRule("conditionRules", conditionDraftRule)}
                onRemoveRule={(index) => removeRule("conditionRules", index)}
                logic={form.conditionRules.logic}
                onLogicChange={(logic) => setForm({ ...form, conditionRules: { ...form.conditionRules, logic } })}
              />
            )}

            {step === 5 && (
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
                    <div className="text-sm font-semibold text-[#313166]">{templateHeaderMediaType} header media</div>
                    <p className="text-sm text-gray-500">
                      This template uses a media header. Add the file URL or upload the media that should be sent with the automation.
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
                        {uploadingMedia ? "Uploading..." : form.actionConfig.mediaUrl ? "Replace File" : "Upload File"}
                      </label>
                      {form.actionConfig.mediaUrl ? (
                        <span className="truncate text-xs text-gray-500">{form.actionConfig.mediaUrl}</span>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {delayOptions.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setForm({ ...form, delay: { mode: item.mode, value: item.value, unit: item.unit } })}
                      className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          form.delay.mode === item.mode && form.delay.value === item.value && form.delay.unit === item.unit ? "#313166" : "white",
                        color:
                          form.delay.mode === item.mode && form.delay.value === item.value && form.delay.unit === item.unit ? "white" : "#313166",
                        borderColor:
                          form.delay.mode === item.mode && form.delay.value === item.value && form.delay.unit === item.unit ? "#313166" : "#E5E7EB",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {templateVariables.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F4F5F9] p-4">
                    <div className="text-sm font-semibold text-[#313166]">Template variable mapping</div>
                    {templateVariables.map((descriptor) => {
                      const mapping = findVariableMapping(form.actionConfig.variableMappings, descriptor) || {
                        componentType: descriptor.componentType,
                        variable: descriptor.variable,
                        sourceType: "customer_field",
                        value: "firstname",
                      };
                      return (
                        <div key={descriptor.key} className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{descriptor.componentType}</div>
                            <input value={descriptor.variable} readOnly className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
                          </div>
                          <select
                            value={mapping.sourceType}
                            onChange={(event) => {
                              const nextMappings = upsertVariableMapping(form.actionConfig.variableMappings, descriptor, {
                                ...mapping,
                                sourceType: event.target.value,
                                value: "",
                              });
                              setForm({ ...form, actionConfig: { ...form.actionConfig, variableMappings: nextMappings } });
                            }}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          >
                            <option value="customer_field">Customer field</option>
                            <option value="static">Static value</option>
                            <option value="derived">Derived value</option>
                          </select>
                          {mapping.sourceType === "customer_field" ? (
                            <select
                              value={mapping.value}
                              onChange={(event) => {
                                const nextMappings = upsertVariableMapping(form.actionConfig.variableMappings, descriptor, {
                                  ...mapping,
                                  value: event.target.value,
                                });
                                setForm({ ...form, actionConfig: { ...form.actionConfig, variableMappings: nextMappings } });
                              }}
                              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                            >
                              <option value="">Choose field</option>
                              {fields.map((field) => (
                                <option key={field.fieldKey} value={field.fieldKey}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          ) : mapping.sourceType === "derived" ? (
                            <select
                              value={mapping.value}
                              onChange={(event) => {
                                const nextMappings = upsertVariableMapping(form.actionConfig.variableMappings, descriptor, {
                                  ...mapping,
                                  value: event.target.value,
                                });
                                setForm({ ...form, actionConfig: { ...form.actionConfig, variableMappings: nextMappings } });
                              }}
                              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                            >
                              <option value="">Choose derived value</option>
                              <option value="full_name">Full name</option>
                              <option value="first_name">First name</option>
                              <option value="last_name">Last name</option>
                              <option value="mobile_number">Mobile number</option>
                              <option value="loyalty_points">Loyalty points</option>
                              <option value="store_name">Store name</option>
                              <option value="current_date">Current date</option>
                            </select>
                          ) : (
                            <input
                              value={mapping.value}
                              onChange={(event) => {
                                const nextMappings = upsertVariableMapping(form.actionConfig.variableMappings, descriptor, {
                                  ...mapping,
                                  value: event.target.value,
                                });
                                setForm({ ...form, actionConfig: { ...form.actionConfig, variableMappings: nextMappings } });
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

            {step === 6 && (
              <div className="space-y-8 py-4">
                <div className="relative flex flex-col gap-8">
                  {/* Visual Flow Line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-gray-200 lg:left-1/2 lg:-ml-px lg:border-l-0 lg:border-t-2 lg:top-1/2 lg:w-full lg:h-0" />

                  <div className="relative flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-4">
                    {/* Trigger Node */}
                    <div className="z-10 flex flex-1 flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm outline outline-4 outline-white">
                        <Zap size={24} />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Trigger</div>
                        <div className="mt-1 text-sm font-bold text-[#313166]">{form.triggerType.replaceAll("_", " ")}</div>
                        <div className="mt-0.5 text-xs text-gray-500">Starts the journey</div>
                      </div>
                    </div>

                    {/* Conditions Node */}
                    <div className="z-10 flex flex-1 flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CB376D10] text-[#CB376D] shadow-sm outline outline-4 outline-white">
                        <Settings2 size={24} />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#CB376D]">Conditions</div>
                        <div className="mt-1 text-sm font-bold text-[#313166]">
                          {form.audienceRules.conditions.length + form.conditionRules.conditions.length} Rules
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">{form.audienceRules.logic} matching</div>
                      </div>
                    </div>

                    {/* Delay Node */}
                    <div className="z-10 flex flex-1 flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm outline outline-4 outline-white">
                        <Clock size={24} />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Delay</div>
                        <div className="mt-1 text-sm font-bold text-[#313166]">
                          {form.delay.mode === "immediate" ? "Immediate" : `${form.delay.value} ${form.delay.unit}`}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">Wait before action</div>
                      </div>
                    </div>

                    {/* Action Node */}
                    <div className="z-10 flex flex-1 flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#31316610] text-[#313166] shadow-sm outline outline-4 outline-white">
                        <MessageCircle size={24} />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#313166]">Action</div>
                        <div className="mt-1 text-sm font-bold text-[#313166]">{selectedTemplate?.name || "WhatsApp Message"}</div>
                        <div className="mt-0.5 text-xs text-gray-500">Send template</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#313166]">Audience Filtering</h4>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{form.audienceRules.logic}</span>
                    </div>
                    <div className="space-y-2">
                      {form.audienceRules.conditions.length > 0 ? (
                        form.audienceRules.conditions.map((rule, idx) => {
                          const field = fields.find(f => f.fieldKey === rule.fieldKey);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span><b>{field?.label || rule.fieldKey}</b> {operatorLabels[rule.operator] || rule.operator} <b>{rule.value || ""}</b></span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-gray-500 italic">No audience rules (targeting all)</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#F4F5F9] p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#313166]">Trigger Conditions</h4>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{form.conditionRules.logic}</span>
                    </div>
                    <div className="space-y-2">
                      {form.conditionRules.conditions.length > 0 ? (
                        form.conditionRules.conditions.map((rule, idx) => {
                          const field = fields.find(f => f.fieldKey === rule.fieldKey);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span><b>{field?.label || rule.fieldKey}</b> {operatorLabels[rule.operator] || rule.operator} <b>{rule.value || ""}</b></span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-gray-500 italic">No additional trigger conditions</div>
                      )}
                    </div>
                  </div>
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

              <div className="text-sm text-gray-500">Step {step} of 6</div>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.min(6, current + 1))}
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
                  {saving ? "Saving..." : "Save Automation"}
                </button>
              )}
            </div>
          </div>
        </div>

        {step === 6 && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#313166] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/60">Live Preview</div>
                  <h3 className="mt-2 text-lg font-semibold">WhatsApp Retention Flow</h3>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{selectedTriggerGroup.name}</div>
              </div>

              <div className="mt-5 rounded-[28px] bg-[#171717] p-3 shadow-2xl">
                <div className="overflow-hidden rounded-[22px] bg-[#0a0a0a]">
                  <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">V</div>
                    <div className="flex-1">
                      <div className="font-semibold">Vadik Business</div>
                      <div className="text-xs text-white/75">retention automation preview</div>
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
                      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#005c4b] p-3">
                        <div className="whitespace-pre-wrap text-sm text-white">{previewText}</div>
                        <div className="mt-1 text-right text-xs text-white/60">12:00 PM</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#1f2c33] px-3 py-2">
                    <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-sm text-[#8696a0]">Type a message</div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884]">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#313166]">Audience preview</h3>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>

              <div className="rounded-2xl bg-[#F4F5F9] p-4">
                <div className="text-3xl font-semibold text-[#313166]">{previewState.loading ? "..." : previewState.count}</div>
                <div className="text-sm text-gray-500">Customers currently matching this automation</div>
              </div>

              <div className="mt-4 space-y-2">
                {(previewState.customers || []).map((customer) => (
                  <div key={`${customer._id}`} className="rounded-xl border border-gray-100 px-4 py-3 text-sm">
                    <div className="font-medium text-[#313166]">{customer.firstname || "Customer"}</div>
                    <div className="text-gray-500">
                      {customer.countryCode ? `+${customer.countryCode}` : ""} {customer.mobileNumber}
                    </div>
                  </div>
                ))}

                {!previewState.loading && previewState.customers.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
                    Run audience preview after adding rules to see sample customers here.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AutomationLogsView({ automation, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/retention-automations/${automation._id}/executions`);
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
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Execution History</p>
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
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Customer</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Triggered Condition</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Triggered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm text-gray-500">Loading history...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm text-gray-500">No executions found for this automation.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const customer = log.customerId || {};
                  const messageLog = log.messageLogId || {};
                  const fullName = [customer.firstname, customer.lastname].filter(Boolean).join(" ") ||
                    [messageLog.firstname, messageLog.lastname].filter(Boolean).join(" ") ||
                    customer.firstname ||
                    messageLog.firstname ||
                    "Unknown Customer";
                  const mobileNumber = customer.mobileNumber || messageLog.mobileNumber || "";

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50">
                      <td className="py-4">
                        <div className="font-medium text-[#313166]">{fullName}</div>
                        <div className="text-xs text-gray-500">{formatPhone(customer.countryCode, mobileNumber)}</div>
                      </td>
                      <td className="py-4">
                        <div className="max-w-xs text-sm text-gray-600">{formatExecutionSummary(log)}</div>
                        {log.failureReason ? <div className="mt-1 text-xs text-red-500">{log.failureReason}</div> : null}
                      </td>
                      <td className="py-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          log.sendResult === "delivered" || log.sendResult === "read"
                            ? "bg-emerald-100 text-emerald-600"
                            : log.sendResult === "failed"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                        }`}>
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [previewState, setPreviewState] = useState({ loading: false, count: 0, customers: [] });

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

  useEffect(() => {
    fetchRetentionData();
  }, []);

  const handleCreateNew = () => {
    setEditingAutomation(null);
    setPreviewState({ loading: false, count: 0, customers: [] });
    setView("builder");
  };

  const handleEdit = (automation) => {
    setEditingAutomation(automation);
    setPreviewState({ loading: false, count: automation.audienceSize || 0, customers: [] });
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

  const handlePreview = async (form) => {
    try {
      setPreviewState((previous) => ({ ...previous, loading: true }));
      const response = await api.post("/api/retention-automations/preview-audience", {
        audienceRules: form.audienceRules,
        conditionRules: form.conditionRules,
        limit: 5,
      });

      setPreviewState({
        loading: false,
        count: response.data?.data?.count || 0,
        customers: response.data?.data?.customers || [],
      });
    } catch (error) {
      console.error("Error previewing audience:", error);
      setPreviewState({ loading: false, count: 0, customers: [] });
      showToast("Failed to preview audience", "error");
    }
  };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        analyticsSummary: {
          audienceSize: previewState.count || editingAutomation?.audienceSize || 0,
          sent: editingAutomation?.sent || 0,
          delivered: editingAutomation?.delivered || 0,
          read: editingAutomation?.read || 0,
          failed: editingAutomation?.failed || 0,
        },
      };

      if (editingAutomation?._id) {
        await api.put(`/api/retention-automations/${editingAutomation._id}`, payload);
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
      showToast(error.response?.data?.message || "Failed to save automation", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (automation) => {
    try {
      const nextStatus = automation.status === "active" ? "paused" : "active";
      await api.patch(`/api/retention-automations/${automation._id}/status`, { status: nextStatus });
      setAutomations((previous) =>
        previous.map((item) => (item._id === automation._id ? { ...item, status: nextStatus } : item))
      );
      showToast(`Automation ${nextStatus === "active" ? "activated" : "paused"}`, "success");
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
      copyPayload.analyticsSummary = { audienceSize: 0, sent: 0, delivered: 0, read: 0, failed: 0 };

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
      setAutomations((previous) => previous.filter((item) => item._id !== automation._id));
      showToast("Automation deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting automation:", error);
      showToast("Failed to delete automation", "error");
    }
  };

  return view === "dashboard" ? (
    <AutomationDashboardView
      automations={automations}
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
      onBack={handleBack}
      onSave={handleSave}
      previewState={previewState}
      onPreview={handlePreview}
      saving={saving}
    />
  ) : (
    <AutomationLogsView 
      automation={editingAutomation}
      onBack={handleBack}
    />
  );
}
