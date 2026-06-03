/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Gift,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  UserPlus,
} from "lucide-react";
import api from "../../api/apiconfig";

const summaryCardStyles =
  "rounded-2xl border border-[#EEF1FF] bg-[#FCFCFF] p-4 shadow-[0_4px_20px_rgba(49,49,102,0.04)]";

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimelineIcon = (type) => {
  switch (type) {
    case "customer_created":
    case "first_visit":
      return UserPlus;
    case "order":
      return ShoppingBag;
    case "outbound_message":
      return Send;
    case "inbound_message":
      return MessageCircle;
    case "automation_execution":
      return Sparkles;
    case "coupon_activity":
      return Gift;
    case "customer_event":
      return CalendarDays;
    default:
      return Activity;
  }
};

const renderDetailLines = (item) => {
  const details = item?.details || {};

  switch (item.type) {
    case "order":
      return [
        `Order ID: ${details.orderId || "-"}`,
        `Amount: Rs ${details.totalAmount || 0}`,
        `Status: ${details.paymentStatus || "-"}`,
        details.products?.length
          ? `Products: ${details.products.map((product) => product.name).join(", ")}`
          : "",
      ].filter(Boolean);
    case "outbound_message":
    case "inbound_message":
      return [
        details.templateName ? `Template: ${details.templateName}` : "",
        details.sourceName ? `Source: ${details.sourceName}` : "",
        details.content ? `Message: ${details.content}` : "",
        item.status ? `Status: ${item.status}` : "",
        details.failureReason ? `Failure: ${details.failureReason}` : "",
      ].filter(Boolean);
    case "automation_execution":
      return [
        details.automationName ? `Automation: ${details.automationName}` : "",
        details.triggerType ? `Trigger: ${details.triggerType}` : "",
        details.templateName ? `Template: ${details.templateName}` : "",
        item.status ? `Result: ${item.status}` : "",
        details.failureReason ? `Failure: ${details.failureReason}` : "",
      ].filter(Boolean);
    case "coupon_activity":
      return [
        details.couponName ? `Coupon: ${details.couponName}` : "",
        details.couponCode ? `Code: ${details.couponCode}` : "",
        details.orderId ? `Order: ${details.orderId}` : "",
        item.status ? `Status: ${item.status}` : "",
      ].filter(Boolean);
    case "engagement_activity":
      return [
        details.campaignType ? `Campaign: ${details.campaignType}` : "",
        details.activity ? `Activity: ${details.activity}` : "",
        item.channel ? `Channel: ${item.channel}` : "",
      ].filter(Boolean);
    case "customer_event":
      return [
        details.eventType ? `Event: ${details.eventType}` : "",
        details.eventName ? `Name: ${details.eventName}` : "",
        details.notes ? `Notes: ${details.notes}` : "",
      ].filter(Boolean);
    default:
      return [
        details.source ? `Source: ${details.source}` : "",
        details.lastMessageContent ? `Last message: ${details.lastMessageContent}` : "",
      ].filter(Boolean);
  }
};

const MetadataGroup = ({ title, data }) => {
  const entries = Object.entries(data || {}).filter(([, value]) => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "object" && "value" in value) {
      return value.value !== null && value.value !== undefined && value.value !== "";
    }
    return true;
  });

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DCE2FF] bg-[#FAFBFF] p-4 text-sm text-[#8B90B2]">
        No {title.toLowerCase()} available
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#EEF1FF] bg-white p-4">
      <h4 className="text-sm font-semibold text-[#1F1C5C]">{title}</h4>
      <div className="mt-3 space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-xl bg-[#F8F9FF] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
              {key}
            </p>
            <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
              {typeof value === "object" && value !== null && "value" in value
                ? String(value.value)
                : String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomerJourneyPanel = ({ customerId, isActive }) => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId || !isActive) return;

    const fetchJourney = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/api/customers/${customerId}/journey`);
        setJourney(response.data?.data || null);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load customer journey");
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [customerId, isActive]);

  const summary = journey?.summary || {};
  const metadata = journey?.metadata || {};
  const automations = journey?.automations || [];
  const timeline = useMemo(() => journey?.timeline || [], [journey]);

  if (!isActive) return null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`${summaryCardStyles} h-[104px] animate-pulse`}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-[420px] animate-pulse rounded-2xl border border-[#EEF1FF] bg-white" />
          <div className="h-[420px] animate-pulse rounded-2xl border border-[#EEF1FF] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* <div className={summaryCardStyles}>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
            Total Spend
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1F1C5C]">
            Rs {summary.totalSpend || 0}
          </p>
        </div>
        <div className={summaryCardStyles}>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
            Orders
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1F1C5C]">
            {summary.totalOrders || 0}
          </p>
        </div> */}
        <div className={summaryCardStyles}>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
            WhatsApp Messages
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1F1C5C]">
            {summary.totalMessages || 0}
          </p>
          <p className="mt-1 text-xs text-[#8B90B2]">
            Inbound {summary.totalInboundMessages || 0} | Outbound{" "}
            {summary.totalOutboundMessages || 0}
          </p>
        </div>
        <div className={summaryCardStyles}>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
            Automation Runs
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1F1C5C]">
            {summary.totalAutomationRuns || 0}
          </p>
          <p className="mt-1 text-xs text-[#8B90B2]">
            Timeline events {summary.totalTimelineEvents || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-[#EEF1FF] bg-white p-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF1FF] pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#1F1C5C]">
                Customer Journey Timeline
              </h3>
              <p className="mt-1 text-sm text-[#8B90B2]">
                Messages, orders, coupon actions, automations and engagement in one stream
              </p>
            </div>
          </div>

          <div className="relative mt-8 space-y-8 px-1">
            {/* Timeline Vertical Line */}
            {timeline.length > 1 && (
              <div
                className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#313166]/30 via-[#313166]/10 to-transparent"
                aria-hidden="true"
              />
            )}

            {timeline.length ? (
              timeline.map((item) => {
                const Icon = getTimelineIcon(item.type);
                const detailLines = renderDetailLines(item);

                return (
                  <div key={item.id} className="relative flex items-start gap-6">
                    {/* Timeline Node (Icon) */}
                    <div className="relative z-10 shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#313166] text-white shadow-[0_8px_16px_rgba(49,49,102,0.2)] ring-4 ring-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="flex-1 rounded-2xl border border-[#EEF1FF] bg-[#FCFCFF] p-5 shadow-[0_2px_12px_rgba(49,49,102,0.03)] transition-all duration-200 hover:border-[#DCE2FF] hover:bg-white hover:shadow-[0_8_24px_rgba(49,49,102,0.06)]">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF1FF]/50 pb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[15px] font-bold text-[#1F1C5C]">
                            {item.title}
                          </h4>
                          {item.status && (
                            <span className="rounded-full bg-[#313166]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#313166]">
                              {item.status}
                            </span>
                          )}
                          {item.channel && (
                            <span className="rounded-full bg-[#B42361]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B42361]">
                              {item.channel}
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B90B2]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDateTime(item.occurredAt)}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        {detailLines.length ? (
                          detailLines.map((line, idx) => (
                            <p key={idx} className="text-sm font-medium text-[#4A4F74]">
                              {line}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm italic text-[#8B90B2]">
                            No extra details captured for this event.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[#DCE2FF] bg-[#FAFBFF] p-8 text-center text-sm font-medium text-[#8B90B2]">
                No journey activity found for this customer yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#EEF1FF] bg-white p-4">
            <h3 className="text-lg font-semibold text-[#1F1C5C]">
              Customer Metadata
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="rounded-xl bg-[#F8F9FF] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
                  {metadata.name || "-"}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F9FF] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
                  {metadata.countryCode ? `+${metadata.countryCode} ` : ""}
                  {metadata.mobileNumber || "-"}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F9FF] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  Source
                </p>
                <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
                  {metadata.source || "-"}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F9FF] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  Last Inbound
                </p>
                <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
                  {formatDateTime(metadata.lastInboundMessageAt)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F9FF] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  Last Outbound
                </p>
                <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
                  {formatDateTime(metadata.lastOutboundMessageAt)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F9FF] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  Opt In Status
                </p>
                <p className="mt-1 text-sm font-medium text-[#1F1C5C]">
                  {metadata.isOptedIn ? "Opted In" : "Opted Out"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EEF1FF] bg-white p-4">
            <h3 className="text-lg font-semibold text-[#1F1C5C]">
              Automation Tracking
            </h3>
            <div className="mt-4 space-y-3">
              {automations.length ? (
                automations.map((automation) => (
                  <div
                    key={automation.id}
                    className="rounded-xl border border-[#EEF1FF] bg-[#FCFCFF] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1F1C5C]">
                          {automation.name}
                        </p>
                        <p className="mt-1 text-xs text-[#8B90B2]">
                          Trigger {automation.triggerType || "-"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#313166]">
                        {automation.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#4A4F74]">
                      <p>Sent: {automation.sent || 0}</p>
                      <p>Read: {automation.read || 0}</p>
                      <p>Replied: {automation.replied || 0}</p>
                      <p>Failed: {automation.failed || 0}</p>
                    </div>
                    <p className="mt-3 text-xs text-[#8B90B2]">
                      Last run {formatDateTime(automation.lastRunAt)}
                    </p>
                    {automation.nextRunAt ? (
                      <p className="mt-1 text-xs text-[#8B90B2]">
                        Next run {formatDateTime(automation.nextRunAt)}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#DCE2FF] bg-[#FAFBFF] p-4 text-sm text-[#8B90B2]">
                  No automation executions found for this customer yet.
                </div>
              )}
            </div>
          </div>

          <MetadataGroup title="Advanced Details" data={metadata.advancedDetails} />
          <MetadataGroup
            title="Additional Details"
            data={metadata.additionalData}
          />
          <MetadataGroup
            title="Advanced Privacy"
            data={metadata.advancedPrivacyDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyPanel;
