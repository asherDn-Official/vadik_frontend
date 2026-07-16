import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  MessageSquare,
  Send,
  ShieldAlert,
  Users,
  Activity,
  RefreshCw,
  RotateCcw,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import moment from "moment";
import api from "../api/apiconfig";
import Loader from "../utils/Loader";

const statCard =
  "rounded-2xl border border-[#EEF1FF] bg-white p-5 shadow-[0_10px_30px_rgba(49,49,102,0.04)]";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return moment(date).format("MMM DD, YYYY hh:mm A");
};

const CampaignAnalytics = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [retryStatus, setRetryStatus] = useState("failed");
  const [retryReason, setRetryReason] = useState("");
  const [retrying, setRetrying] = useState(false);

  const loadCampaignAnalytics = async ({ silent = false } = {}) => {
    if (!campaignId) return;

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const [analyticsRes, logsRes, campaignsRes] = await Promise.all([
        api.get(
          `/api/whatsappMessage/analytics/individual?sourceType=campaign&sourceId=${campaignId}`
        ),
        api.get(
          `/api/whatsappMessage/logs?page=${page}&limit=8&sourceType=campaign&sourceId=${campaignId}${
            statusFilter ? `&status=${statusFilter}` : ""
          }`
        ),
        api.get("/api/integrationManagement/whatsapp/campaigns"),
      ]);

      const items = analyticsRes.data?.data?.items || [];
      const matched = items.find((item) => String(item.sourceId) === String(campaignId));
      const campaigns = campaignsRes.data?.data || [];

      setCampaign(matched || null);
      setCampaignDetails(campaigns.find((item) => String(item._id) === String(campaignId)) || null);
      setLogs(logsRes.data?.data || []);
      setPages(logsRes.data?.pagination?.pages || 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load campaign analytics");
      setCampaign(null);
      setLogs([]);
      setPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetryCampaign = async () => {
    try {
      setRetrying(true);
      setError("");
      
      const payload = {
        status: retryStatus,
      };
      if (retryStatus === "failed" && retryReason) {
        payload.failureReason = retryReason;
      }

      const res = await api.post(
        `/api/integrationManagement/whatsapp/campaigns/${campaignId}/retry`,
        payload
      );

      setIsRetryModalOpen(false);
      
      if (res.data?.data?.campaignId) {
        navigate(`/customerrhythm/campaign/${res.data.data.campaignId}`);
      } else {
        loadCampaignAnalytics();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to retry campaign");
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    loadCampaignAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, page, statusFilter]);

  const timelineData = useMemo(() => {
    if (!campaign?.timeline) return [];
    return Object.entries(campaign.timeline)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((left, right) => new Date(left.date) - new Date(right.date));
  }, [campaign]);

  const replyRows = useMemo(() => {
    if (campaign?.replyMessages?.length) return campaign.replyMessages;

    return logs
      .filter((log) => log.status === "replied")
      .map((log) => ({
        customerName:
          log.firstname || log.lastname
            ? `${log.firstname || ""} ${log.lastname || ""}`.trim()
            : "Unknown Customer",
        mobileNumber: log.mobileNumber || "",
        replyMessage: log.replyMessageContent || "",
        replyDateTime: log.replyTimestamp || log.timestamp,
        replyMessageType: log.replyMessageType || log.messageType || "",
      }));
  }, [campaign, logs]);

  const campaignTypeDisplay = useMemo(() => {
    if (campaignDetails?.flowId) return "FLOW";
    if (campaignDetails?.templateId) return "TEMPLATE";
    return "BROADCAST";
  }, [campaignDetails]);

  const failureReasons = useMemo(() => {
    const reasons = campaign?.failureReasons || {};
    return Object.entries(reasons)
      .filter(([, count]) => Number(count) > 0)
      .sort((left, right) => Number(right[1]) - Number(left[1]));
  }, [campaign]);

  const metrics = [
    { label: "Audience", value: campaignDetails?.audienceSize ?? campaign?.meta?.audienceSize ?? 0, icon: Users, tone: "text-[#313166]" },
    { label: "Sent", value: campaign?.sent ?? 0, icon: Send, tone: "text-blue-600" },
    { label: "Delivered", value: campaign?.delivered ?? 0, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Read", value: campaign?.read ?? 0, icon: Eye, tone: "text-cyan-600" },
    { label: "Replied", value: campaign?.replied ?? 0, icon: MessageSquare, tone: "text-purple-600" },
    { label: "Failed", value: campaign?.failed ?? 0, icon: ShieldAlert, tone: "text-red-600" },
  ];

  if (loading) {
    return <Loader text="Loading campaign analytics..." fullHeight={false} />;
  }

  return (
    <div className="space-y-6 p-2">
      <div className="rounded-[28px] border border-[#E8EBFF] bg-gradient-to-br from-white via-[#FCFCFF] to-[#F5F7FF] p-6 shadow-[0_24px_70px_rgba(49,49,102,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/customerrhythm?section=send_campaign")}
              className="inline-flex items-center gap-2 rounded-full border border-[#313166]/10 bg-white px-4 py-2 text-sm font-semibold text-[#313166] shadow-sm transition hover:bg-[#313166]/5"
            >
              <ArrowLeft size={16} />
              Back to campaigns
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B90B2]">
                Campaign Analytics
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#1F1C5C]">
                {campaignDetails?.name || campaign?.sourceName || "Campaign"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[#5A6084]">
                A dedicated view for this campaign's delivery, read, and reply performance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => loadCampaignAnalytics({ silent: true })}
              className="inline-flex items-center gap-2 rounded-full border border-[#313166]/10 bg-[#313166] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(49,49,102,0.18)] transition hover:bg-[#262650]"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setRetryStatus("failed");
                setRetryReason("");
                setIsRetryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#EEF1FF] bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(99,102,241,0.2)] transition hover:from-indigo-700 hover:to-purple-700"
            >
              <RotateCcw size={16} />
              Retry Campaign
            </button>
          </div>
        </div>

        {campaign ? (
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className={statCard}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                Campaign Type
              </p>
              <p className="mt-2 text-lg font-bold text-[#1F1C5C]">
                {campaignTypeDisplay}
              </p>
              <p className="mt-1 text-xs text-[#8B90B2]">
                {campaignDetails?.status || campaign.meta?.status || "-"}
              </p>
            </div>
            <div className={statCard}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                Template
              </p>
              <p className="mt-2 text-lg font-bold text-[#1F1C5C]">
                {campaignDetails?.templateId?.name || campaign.templateName || "-"}
              </p>
              <p className="mt-1 text-xs text-[#8B90B2]">
                {campaignDetails?.templateId?._id || campaign.templateId || "-"}
              </p>
            </div>
            <div className={statCard}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                Created At
              </p>
              <p className="mt-2 text-lg font-bold text-[#1F1C5C]">
                {formatDateTime(campaignDetails?.createdAt)}
              </p>
            </div>
            <div className={statCard}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                Last Activity
              </p>
              <p className="mt-2 text-lg font-bold text-[#1F1C5C]">
                {formatDateTime(campaign.lastSentAt)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {campaign ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className={statCard}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                      {metric.label}
                    </p>
                    <Icon className={metric.tone} size={18} />
                  </div>
                  <p className="mt-3 text-3xl font-black text-[#1F1C5C]">{metric.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-[#EEF1FF] bg-white p-5 shadow-[0_12px_40px_rgba(49,49,102,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1F1C5C]">Performance Timeline</h3>
                  <p className="mt-1 text-sm text-[#8B90B2]">
                    Sent, delivered, and failed progression for this campaign.
                  </p>
                </div>
                <CalendarDays className="text-[#313166]" />
              </div>

              <div className="mt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(val) => moment(val).format("MMM DD")} />
                    <YAxis />
                    <Tooltip labelFormatter={(val) => moment(val).format("MMM DD, YYYY")} />
                    <Legend />
                    <Area type="monotone" dataKey="sent" name="Sent" stroke="#313166" fill="#313166" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="failed" name="Failed" stroke="#F44336" fill="#F44336" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEF1FF] bg-white p-5 shadow-[0_12px_40px_rgba(49,49,102,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1F1C5C]">Quick Summary</h3>
                  <p className="mt-1 text-sm text-[#8B90B2]">
                    Short answer on how the campaign performed.
                  </p>
                </div>
                <Activity className="text-[#313166]" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-[#F8F9FF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                    Reply rate
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#1F1C5C]">
                    {campaign?.total ? `${Math.round((campaign.replied / campaign.total) * 100)}%` : "0%"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8F9FF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                    Delivered rate
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#1F1C5C]">
                    {campaign?.total ? `${campaign.deliveredRate || 0}%` : "0%"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8F9FF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                    Read rate
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#1F1C5C]">
                    {campaign?.total ? `${campaign.readRate || 0}%` : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-[#EEF1FF] bg-white p-5 shadow-[0_12px_40px_rgba(49,49,102,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1F1C5C]">Reply Details</h3>
                  <p className="mt-1 text-sm text-[#8B90B2]">
                    Replies from contacts that responded to this campaign.
                  </p>
                </div>
                <span className="rounded-full bg-[#313166]/5 px-3 py-1 text-xs font-bold text-[#313166]">
                  {replyRows.length} replies
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEF1FF]">
                <div className="max-h-[520px] overflow-y-auto">
                  {replyRows.length ? (
                    <table className="w-full text-left">
                      <thead className="bg-[#FAFBFF] text-[11px] uppercase tracking-[0.08em] text-[#8B90B2]">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Mobile</th>
                          <th className="px-4 py-3">Reply</th>
                          <th className="px-4 py-3">Reply At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF1FF] bg-white">
                        {replyRows.map((reply, index) => (
                          <tr key={`${reply.mobileNumber || "reply"}-${index}`}>
                            <td className="px-4 py-3 text-sm font-semibold text-[#1F1C5C]">
                              {reply.customerName || "Unknown Customer"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#5A6084]">
                              {reply.mobileNumber || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#5A6084]">
                              {reply.replyMessage || "Reply details unavailable"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#5A6084] whitespace-nowrap">
                              {formatDateTime(reply.replyDateTime)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-10 text-center text-sm text-[#8B90B2]">
                      No replies recorded for this campaign yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEF1FF] bg-white p-5 shadow-[0_12px_40px_rgba(49,49,102,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1F1C5C]">Recent Logs</h3>
                  <p className="mt-1 text-sm text-[#8B90B2]">
                    Latest delivery records for the selected campaign.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["", "sent", "delivered", "read", "replied", "failed"].map((status) => (
                  <button
                    key={status || "all"}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setStatusFilter(status);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      statusFilter === status
                        ? "bg-[#313166] text-white"
                        : "bg-[#F4F5FB] text-[#5A6084] hover:bg-[#EDEFFC]"
                    }`}
                  >
                    {status ? status : "All"}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {logs.length ? (
                  logs.map((log) => (
                    <div key={log._id} className="rounded-2xl border border-[#EEF1FF] bg-[#FCFCFF] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#1F1C5C]">
                            {log.firstname || log.lastname
                              ? `${log.firstname || ""} ${log.lastname || ""}`.trim()
                              : "Unknown Customer"}
                          </p>
                          <p className="mt-1 text-xs text-[#8B90B2]">{log.mobileNumber || "-"}</p>
                        </div>
                        <span className="rounded-full bg-[#313166]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#313166]">
                          {log.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[#5A6084]">{log.messageContent || "-"}</p>
                      {log.status === "replied" && log.replyMessageContent ? (
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                            Customer Reply
                          </span>
                          {log.replyMessageContent}
                        </div>
                      ) : null}
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                        {formatDateTime(log.timestamp)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DCE2FF] bg-[#FAFBFF] p-8 text-center text-sm text-[#8B90B2]">
                    No logs found for this campaign.
                  </div>
                )}
              </div>

              {statusFilter === "failed" && failureReasons.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-red-900">
                        Failure Reasons Breakdown
                      </h4>
                      <p className="mt-1 text-sm text-red-700">
                        Why these campaign messages failed to deliver.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700">
                      {campaign?.failed || 0} failed
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {failureReasons.map(([reason, count]) => (
                      <div
                        key={reason}
                        className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-red-900">
                          {reason}
                        </p>
                        <p className="mt-2 text-2xl font-black text-red-600">
                          {count}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {pages > 1 ? (
                <div className="mt-4 flex items-center justify-between border-t border-[#EEF1FF] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                    Page {page} of {pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-lg border border-[#EEF1FF] bg-white px-3 py-2 text-xs font-semibold text-[#5A6084] transition hover:bg-[#F8F9FF] disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page === pages}
                      onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
                      className="rounded-lg border border-[#EEF1FF] bg-white px-3 py-2 text-xs font-semibold text-[#5A6084] transition hover:bg-[#F8F9FF] disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {/* Retry Modal */}
      {isRetryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[#E8EBFF] bg-gradient-to-br from-white to-[#F9FAFF] shadow-[0_24px_70px_rgba(49,49,102,0.15)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EEF1FF] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F1C5C]">Retry Campaign</h3>
                  <p className="text-xs text-[#8B90B2]">Rerun campaign for subset of contacts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRetryModalOpen(false)}
                className="rounded-full p-1.5 text-[#8B90B2] transition hover:bg-[#313166]/5 hover:text-[#1F1C5C]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="retryStatus" className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                  Select Message Status to Target
                </label>
                <select
                  id="retryStatus"
                  value={retryStatus}
                  onChange={(e) => {
                    setRetryStatus(e.target.value);
                    setRetryReason(""); // Reset reason filter
                  }}
                  className="w-full rounded-xl border border-[#E8EBFF] bg-white p-3 text-sm font-semibold text-[#1F1C5C] shadow-sm focus:border-[#313166] focus:outline-none"
                >
                  <option value="failed">Failed ({campaign?.failed || 0})</option>
                  <option value="sent">Sent ({campaign?.sent || 0})</option>
                  <option value="delivered">Delivered ({campaign?.delivered || 0})</option>
                  <option value="read">Read ({campaign?.read || 0})</option>
                  <option value="replied">Replied ({campaign?.replied || 0})</option>
                </select>
              </div>

              {retryStatus === "failed" && failureReasons.length > 0 && (
                <div className="space-y-2 animate-in slide-in-from-top-3 duration-200">
                  <label htmlFor="retryReason" className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                    Filter by Failure Reason
                  </label>
                  <select
                    id="retryReason"
                    value={retryReason}
                    onChange={(e) => setRetryReason(e.target.value)}
                    className="w-full rounded-xl border border-[#E8EBFF] bg-white p-3 text-sm font-semibold text-[#1F1C5C] shadow-sm focus:border-[#313166] focus:outline-none"
                  >
                    <option value="">All Failed Messages ({campaign?.failed || 0})</option>
                    {failureReasons.map(([reason, count]) => (
                      <option key={reason} value={reason}>
                        {reason} ({count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-2xl border border-[#E8EBFF] bg-indigo-50/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">What will happen?</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#5A6084]">
                  This will create a new campaign named <strong className="text-[#1F1C5C]">{campaignDetails?.name || campaign?.sourceName} (Retry...)</strong> targeting the customers matching your selection. It will run with the exact same template/flow and variables configured in the original campaign.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#EEF1FF] px-6 py-4 bg-[#FCFCFF]">
              <button
                type="button"
                onClick={() => setIsRetryModalOpen(false)}
                className="rounded-full border border-[#313166]/10 bg-white px-5 py-2 text-sm font-semibold text-[#313166] shadow-sm transition hover:bg-[#313166]/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={retrying}
                onClick={handleRetryCampaign}
                className="inline-flex items-center gap-2 rounded-full bg-[#313166] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(49,49,102,0.18)] transition hover:bg-[#262650] disabled:opacity-50"
              >
                {retrying ? "Triggering..." : "Rerun Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignAnalytics;
