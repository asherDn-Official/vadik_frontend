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
  Upload,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  LayoutTemplate,
  Info,
  ExternalLink,
  Phone,
  Layers,
} from "lucide-react";
import { renderWhatsAppFormattedText } from "../utils/whatsappTextFormatter";

const getTemplateButtons = (template) => {
  if (!template?.components) return [];
  const buttonsComp = template.components.find((c) => c.type === "BUTTONS");
  if (buttonsComp && Array.isArray(buttonsComp.buttons)) {
    return buttonsComp.buttons;
  }
  const directButtons = template.components.filter((c) =>
    ["QUICK_REPLY", "URL", "PHONE_NUMBER", "FLOW", "CATALOG", "OTP", "COPY_CODE"].includes(c.type)
  );
  return directButtons;
};
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

  // Retry mode controls whether we reuse the original message setup or swap in a new template/flow.
  const [retryVariant, setRetryVariant] = useState("same"); // "same", "template", or "flow"
  const [templates, setTemplates] = useState([]);
  const [flows, setFlows] = useState([]);
  const [fetchingConfigData, setFetchingConfigData] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [variables, setVariables] = useState({});
  const [media, setMedia] = useState({ url: "", type: "" });
  const [uploadingMedia, setUploadingMedia] = useState(false);

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

  const handleOpenRetryModal = async () => {
    setRetryStatus("failed");
    setRetryReason("");
    setRetryVariant("same");
    setSelectedTemplate(null);
    setSelectedFlow(null);
    setVariables({});
    setMedia({ url: "", type: "" });
    setError("");
    setIsRetryModalOpen(true);

    if (templates.length === 0 && flows.length === 0) {
      try {
        setFetchingConfigData(true);
        const [tempRes, flowRes] = await Promise.all([
          api.get("/api/integrationManagement/whatsapp/custom-templates"),
          api.get("/api/whatsappFlow")
        ]);
        if (tempRes.data?.status) {
          setTemplates(tempRes.data.data.filter(t => t.status === "APPROVED"));
        }
        if (flowRes.data) {
          setFlows(flowRes.data.filter(f => f.status === "PUBLISHED"));
        }
      } catch (err) {
        console.error("Failed to load templates or flows", err);
      } finally {
        setFetchingConfigData(false);
      }
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSelectedFlow(null);
    setError("");
    
    // Extract variables
    const allText = template.components?.map(c => c.text || "").join(" ") || "";
    const vars = allText.match(/\{\{(\d+)\}\}/g) || [];
    const uniqueVars = [...new Set(vars)];
    
    const initialVariables = {};
    uniqueVars.forEach(v => initialVariables[v] = "");

    const header = template.components?.find(c => c.type === "HEADER");
    const mediaType = header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) ? header.format : "";

    setVariables(initialVariables);
    setMedia({ url: "", type: mediaType });
  };

  const handleFlowSelect = (flow) => {
    setSelectedFlow(flow);
    setSelectedTemplate(null);
    setError("");
    setVariables({ body: "Please fill this form" });
    setMedia({ url: "", type: "" });
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (media.type === "IMAGE" && !file.type.startsWith("image/")) {
      alert("Please upload an image file");
      e.target.value = "";
      return;
    }
    if (media.type === "VIDEO" && !file.type.startsWith("video/")) {
      alert("Please upload a video file");
      e.target.value = "";
      return;
    }
    if (media.type === "DOCUMENT" && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      alert("Please upload a document file");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadingMedia(true);
      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
      if (res.data.status) {
        setMedia(prev => ({ ...prev, url: res.data.url }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Media upload failed. Please try again.");
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleRetryCampaign = async () => {
    try {
      setRetrying(true);
      setError("");
      
      const payload = {
        status: retryStatus,
        retryMode: retryVariant,
      };
      if (retryStatus === "failed" && retryReason) {
        payload.failureReason = retryReason;
      }

      if (retryVariant === "template") {
        if (!selectedTemplate) {
          setError("Please select a template");
          setRetrying(false);
          return;
        }

        const missingVars = Object.entries(variables).filter(([, val]) => !val.trim());
        if (missingVars.length > 0) {
          setError("Please fill all template variables");
          setRetrying(false);
          return;
        }

        if (media.type && !media.url) {
          setError("Please upload the required media file");
          setRetrying(false);
          return;
        }

        payload.templateId = selectedTemplate._id;
        payload.variables = variables;
        if (media.url) {
          payload.mediaUrl = media.url;
          payload.mediaType = media.type;
        }
      } else if (retryVariant === "flow") {
        if (!selectedFlow) {
          setError("Please select a flow");
          setRetrying(false);
          return;
        }

        if (!variables.body?.trim()) {
          setError("Please fill the body text for the flow");
          setRetrying(false);
          return;
        }

        payload.flowId = selectedFlow._id;
        payload.variables = variables;
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
              onClick={handleOpenRetryModal}
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
          <div className={`w-full overflow-hidden rounded-[28px] border border-[#E8EBFF] bg-gradient-to-br from-white to-[#F9FAFF] shadow-[0_24px_70px_rgba(49,49,102,0.15)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${retryVariant === "same" ? "max-w-lg" : "max-w-4xl"}`}>
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

            <div className={`p-6 space-y-5 overflow-y-auto flex-1 ${retryVariant === "same" ? "" : "grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 space-y-0"}`}>
              {/* Left Form Panel */}
              <div className="space-y-5">
                {/* 1. Target Audience status Selection */}
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

                {/* 2. Strategy Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                    Retry Strategy
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setRetryVariant("same");
                        setSelectedTemplate(null);
                        setSelectedFlow(null);
                        setVariables({});
                        setMedia({ url: "", type: "" });
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${retryVariant === "same" ? "bg-[#313166] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                    >
                      Same Setup
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRetryVariant("template");
                        setSelectedFlow(null);
                        setVariables({});
                        setMedia({ url: "", type: "" });
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${retryVariant === "template" ? "bg-[#313166] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                    >
                      Different Template
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRetryVariant("flow");
                        setSelectedTemplate(null);
                        setVariables({ body: "Please fill this form" });
                        setMedia({ url: "", type: "" });
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${retryVariant === "flow" ? "bg-[#313166] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                    >
                      Different Flow
                    </button>
                  </div>
                </div>

                {/* 3. Different Template/Flow Configuration Form */}
                {retryVariant !== "same" && (
                  <div className="space-y-5 border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                    {fetchingConfigData ? (
                      <div className="text-xs text-gray-500 italic animate-pulse">Loading available options...</div>
                    ) : retryVariant === "template" ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="newTemplateSelect" className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                            Select Meta Template
                          </label>
                          <select
                            id="newTemplateSelect"
                            value={selectedTemplate?._id || ""}
                            onChange={(e) => {
                              const selected = templates.find(t => t._id === e.target.value);
                              if (selected) handleTemplateSelect(selected);
                            }}
                            className="w-full rounded-xl border border-[#E8EBFF] bg-white p-3 text-sm font-semibold text-[#1F1C5C] shadow-sm focus:border-[#313166] focus:outline-none"
                          >
                              <option value="">-- Choose Template --</option>
                              {templates.map(t => (
                                <option key={t._id} value={t._id}>{t.name} ({t.language})</option>
                              ))}
                            </select>
                          </div>

                        {selectedTemplate && (
                          <>
                            {/* Variable Configuration */}
                            {Object.keys(variables).length > 0 && (
                              <div className="space-y-3 bg-[#FCFCFF] p-4 rounded-2xl border border-[#EEF1FF]">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                                    Variables Configuration
                                  </label>
                                  <span className="text-[10px] text-gray-400">Use &#123;&#123;customer_name&#125;&#125; for dynamic names</span>
                                </div>
                                <div className="space-y-3">
                                  {Object.keys(variables).map(v => (
                                    <div key={v} className="bg-white p-3 rounded-xl border border-gray-100 space-y-2 shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#313166] bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{v}</span>
                                        <button 
                                          type="button"
                                          onClick={() => setVariables(prev => ({
                                            ...prev,
                                            [v]: (prev[v] || "") + "{{customer_name}}"
                                          }))}
                                          className="text-[9px] text-[#313166] hover:bg-[#313166]/10 px-1.5 py-0.5 rounded transition-all font-bold flex items-center gap-0.5"
                                        >
                                          <Plus size={8} /> Add Name
                                        </button>
                                      </div>
                                      <input 
                                        type="text"
                                        placeholder={`Enter value for ${v}...`}
                                        className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-[#313166]/20 font-medium focus:outline-none"
                                        value={variables[v] || ""}
                                        onChange={(e) => setVariables(prev => ({ ...prev, [v]: e.target.value }))}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Media Header configuration */}
                            {media.type && (
                              <div className="space-y-3 bg-[#FCFCFF] p-4 rounded-2xl border border-[#EEF1FF]">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#8B90B2] block">
                                  Header {media.type} Upload
                                </label>
                                <div className="flex flex-col gap-3">
                                  <input 
                                    type="text"
                                    placeholder={`Enter ${media.type.toLowerCase()} URL...`}
                                    className="w-full px-3 py-2 bg-white border border-[#E8EBFF] rounded-xl text-xs focus:outline-none focus:border-[#313166]"
                                    value={media.url || ""}
                                    onChange={(e) => setMedia(prev => ({ ...prev, url: e.target.value }))}
                                  />
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8EBFF] rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer shadow-sm transition">
                                      <Upload size={14} />
                                      <span>Upload File</span>
                                      <input 
                                        type="file"
                                        className="hidden"
                                        accept={media.type === "IMAGE" ? "image/*" : media.type === "VIDEO" ? "video/*" : "*"}
                                        onChange={handleMediaUpload}
                                        disabled={uploadingMedia}
                                      />
                                    </label>
                                    {uploadingMedia && <span className="text-[10px] text-gray-500 italic animate-pulse">Uploading file...</span>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="newFlowSelect" className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                            Select Meta Flow
                          </label>
                          <select
                            id="newFlowSelect"
                            value={selectedFlow?._id || ""}
                            onChange={(e) => {
                              const selected = flows.find(f => f._id === e.target.value);
                              if (selected) handleFlowSelect(selected);
                            }}
                            className="w-full rounded-xl border border-[#E8EBFF] bg-white p-3 text-sm font-semibold text-[#1F1C5C] shadow-sm focus:border-[#313166] focus:outline-none"
                          >
                            <option value="">-- Choose Flow --</option>
                            {flows.map(f => (
                              <option key={f._id} value={f._id}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        {selectedFlow && (
                          <div className="space-y-2">
                            <label htmlFor="flowBody" className="text-xs font-bold uppercase tracking-wider text-[#8B90B2]">
                              Flow Message Body
                            </label>
                            <textarea
                              id="flowBody"
                              placeholder="Enter message body text..."
                              className="w-full rounded-xl border border-[#E8EBFF] bg-white p-3 text-sm font-semibold text-[#1F1C5C] shadow-sm focus:border-[#313166] focus:outline-none"
                              rows={3}
                              value={variables.body || ""}
                              onChange={(e) => setVariables({ body: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. What will happen explanation */}
                <div className="rounded-2xl border border-[#E8EBFF] bg-indigo-50/50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">What will happen?</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#5A6084]">
                    {retryVariant === "same" ? (
                      <>This will create a new campaign named <strong className="text-[#1F1C5C]">{campaignDetails?.name || campaign?.sourceName} (Retry...)</strong> targeting the customers matching your selection. It will run with the exact same template or flow and variables configured in the original campaign.</>
                    ) : (
                      <>This will create a new campaign targeting the selected customers. It will run using the newly selected <strong className="text-[#1F1C5C]">{retryVariant === "template" ? (selectedTemplate?.name || "template") : (selectedFlow?.name || "flow")}</strong> and new variables configuration.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Preview Panel (only for Different Template/Flow) */}
              {retryVariant !== "same" && (
                <div className="hidden lg:block lg:sticky lg:top-0 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</h4>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    </div>
                  </div>

                  <div className="w-full aspect-[9/16] max-h-[380px] bg-gray-100 rounded-[2.5rem] p-2 border-[4px] border-gray-900 shadow-md relative overflow-hidden flex flex-col">
                    {/* Phone Header */}
                    <div className="bg-white/85 backdrop-blur-sm p-2 border-b border-gray-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <Users size={12} />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-900 leading-tight">Your Business</p>
                        <p className="text-[6px] text-green-500 font-medium leading-tight">Online</p>
                      </div>
                    </div>

                    {/* Message Area */}
                    <div className="flex-1 p-2 bg-[#e5ddd5] space-y-1.5 overflow-y-auto custom-scrollbar" style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: '100px' }}>
                      {retryVariant === "flow" && selectedFlow ? (
                        <div className="max-w-[85%] bg-white rounded-xl p-2 shadow-sm border border-emerald-100">
                          <div className="flex items-center gap-1 mb-1 pb-1 border-b border-gray-100 text-[#313166] font-bold text-[8px]">
                            <Layers size={10} className="text-[#313166]" />
                            <span>Meta WhatsApp Flow</span>
                          </div>
                          <div className="text-[8px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {variables.body || selectedFlow.name || "Interactive Meta WhatsApp Flow"}
                          </div>
                          <div className="mt-2 border-t border-gray-100 pt-1">
                            <div className="py-1 px-2 text-center text-[#00a884] font-bold text-[9px] flex items-center justify-center gap-1 bg-emerald-50/60 rounded-lg border border-emerald-100">
                              <Layers size={10} />
                              <span>{selectedFlow.name || "Open Flow"}</span>
                            </div>
                          </div>
                          <div className="flex justify-end mt-0.5">
                            <span className="text-[6px] text-gray-300 font-medium">12:00 PM</span>
                          </div>
                        </div>
                      ) : selectedTemplate ? (
                        <div className="max-w-[85%] bg-white rounded-xl p-2 shadow-sm">
                          {/* Header Preview */}
                          {(() => {
                            const header = selectedTemplate.components?.find(c => c.type === "HEADER");
                            if (!header) return null;
                            if (header.format === "TEXT") {
                              return (
                                <div
                                  className="mb-1 font-bold text-[8px] text-gray-900"
                                  dangerouslySetInnerHTML={{
                                    __html: renderWhatsAppFormattedText(header.text),
                                  }}
                                />
                              );
                            }
                            const previewUrl = media.url || header.mediaUrl;
                            return (
                              <div className="bg-gray-100 min-h-[60px] rounded-lg flex flex-col items-center justify-center text-gray-400 overflow-hidden mb-1.5 border border-gray-50">
                                {previewUrl ? (
                                  header.format === "IMAGE" ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-0.5 p-2">
                                      {header.format === "VIDEO" ? <Video size={14} /> : <FileText size={14} />}
                                      <span className="text-[5px] text-center break-all text-gray-500">{previewUrl}</span>
                                    </div>
                                  )
                                ) : (
                                  <>
                                    {header.format === "IMAGE" && <ImageIcon size={16} />}
                                    {header.format === "VIDEO" && <Video size={16} />}
                                    {header.format === "DOCUMENT" && <FileText size={16} />}
                                    <span className="text-[6px] mt-1 font-bold uppercase tracking-wider">{header.format} Header</span>
                                  </>
                                )}
                              </div>
                            );
                          })()}

                          {/* Body Preview */}
                          <div
                            className="text-[8px] text-gray-800 whitespace-pre-wrap leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: (() => {
                                let text = selectedTemplate.components?.find(c => c.type === "BODY")?.text || "";
                                if (variables) {
                                  Object.entries(variables).forEach(([key, val]) => {
                                    const numMatch = key.match(/\d+/);
                                    if (numMatch) {
                                      const placeholder = `{{${numMatch[0]}}}`;
                                      text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val || `<${key}>`);
                                    }
                                  });
                                }
                                text = text.replace(/\{\{customer_name\}\}/g, "John Doe");
                                return renderWhatsAppFormattedText(text);
                              })(),
                            }}
                          />
                          
                          {/* Footer Preview */}
                          {selectedTemplate.components?.find(c => c.type === "FOOTER") && (
                            <div
                              className="mt-0.5 text-[6px] text-gray-400"
                              dangerouslySetInnerHTML={{
                                __html: renderWhatsAppFormattedText(
                                  selectedTemplate.components.find(c => c.type === "FOOTER").text,
                                ),
                              }}
                            />
                          )}

                          {/* Buttons Preview */}
                          {(() => {
                            const templateButtons = getTemplateButtons(selectedTemplate);
                            if (!templateButtons || templateButtons.length === 0) return null;
                            return (
                              <div className="border-t border-gray-100 mt-1">
                                {templateButtons.map((btn, i) => (
                                  <div
                                    key={i}
                                    className="py-1 px-2 text-center border-b border-gray-50 last:border-0 text-[#00a884] font-semibold text-[9px] flex items-center justify-center gap-1"
                                  >
                                    {btn.type === "URL" && <ExternalLink size={8} />}
                                    {btn.type === "PHONE_NUMBER" && <Phone size={8} />}
                                    {btn.type === "FLOW" && <Layers size={8} />}
                                    <span>{btn.text || btn.url || btn.phone_number || "Button"}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          <div className="flex justify-end mt-0.5">
                            <span className="text-[6px] text-gray-300 font-medium">12:00 PM</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400/50 space-y-2 text-center p-4">
                          <LayoutTemplate size={20} className="opacity-20" />
                          <p className="text-[7px] font-bold uppercase tracking-widest leading-relaxed">Select template/flow<br/>to see preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Info size={14} className="text-blue-500" />
                    <p className="text-[9px] text-gray-500 leading-normal">
                      Shows how message will appear on customer devices.
                    </p>
                  </div>
                </div>
              )}
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
                disabled={retrying || uploadingMedia}
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
