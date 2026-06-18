import React, { useState, useEffect, useMemo } from "react";
import { 
  Send, 
  Filter,
  Users, 
  LayoutTemplate, 
  Megaphone,
  Search,
  ChevronRight,
  ChevronLeft,
  Info,
  Type,
  X,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Image as ImageIcon,
  Upload,
  Plus,
  ArrowRight,
  Clock,
  Trash2,
  Calendar,
  Layers
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";
import FilterPanel from "../customerInsigth/FilterPanel";
import CustomerList from "../customerInsigth/CustomerList";
import * as XLSX from "xlsx";

import Loader from "../../utils/Loader";

const hasMeaningfulFilterValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).some(([nestedKey, nestedValue]) =>
      nestedKey !== "operator" && hasMeaningfulFilterValue(nestedValue)
    );
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulFilterValue(item));
  }

  return true;
};

const countAppliedFilters = (activeFilters) =>
  Object.values(activeFilters).filter((filterValue) =>
    hasMeaningfulFilterValue(filterValue)
  ).length;

const SendCampaign = () => {
  // Main View State
  const [view, setView] = useState("dashboard"); // "dashboard" or "wizard"
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: "",
    type: "broadcast", // "broadcast", "template", or "flow"
    template: null,
    flow: null,
    audience: [],
    variables: {},
    media: { url: "", type: "" },
    scheduledAt: null
  });
  
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Data State
  const [templates, setTemplates] = useState([]);
  const [flows, setFlows] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectionProgress, setSelectionProgress] = useState({ current: 0, total: 0, isSelecting: false });
  const [selectAllMatchingMode, setSelectAllMatchingMode] = useState(false);
  
  const selectedCustomerIds = useMemo(() => 
    new Set(campaignData.audience.map(c => c._id)), 
    [campaignData.audience]
  );

  // Pagination & Filter
  const [filters, setFilters] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  
  // Backwards compatibility for wizard steps
  const customerSearch = filters.mobileNumber || filters.firstname || ""; 
  const setCustomerSearch = (val) => setFilters(prev => ({ ...prev, firstname: val }));

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (view === "wizard" && currentStep === 3) {
      fetchCustomers();
    }
  }, [currentPage, filters, pageSize, currentStep, view]);

  useEffect(() => {
    setAppliedFiltersCount(countAppliedFilters(filters));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const toggleCustomerSelection = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      toggleCustomer(customer);
    }
  };

  const fetchInitialData = async () => {
    try {
      setFetchingData(true);
      const [tempRes, campRes, flowRes] = await Promise.all([
        api.get("/api/integrationManagement/whatsapp/custom-templates"),
        api.get("/api/integrationManagement/whatsapp/campaigns"),
        api.get("/api/whatsappFlow")
      ]);
      
      if (tempRes.data.status) {
        setTemplates(tempRes.data.data.filter(t => t.status === "APPROVED"));
      }
      if (campRes.data.status) {
        setCampaigns(campRes.data.data);
      }
      if (flowRes.data) {
        setFlows(flowRes.data.filter(f => f.status === "PUBLISHED"));
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setFetchingCustomers(true);
      const filtersArray = Object.entries(filters)
        .filter(([name, value]) => {
          return (
            hasMeaningfulFilterValue(value) &&
            name !== "periodValue"
          );
        })
        .map(([name, value]) => ({
          name,
          value:
            typeof value === "string"
              ? value.trim()
              : typeof value === "object" && value !== null
              ? {
                  ...value,
                  value:
                    typeof value.value === "string"
                      ? value.value.trim()
                      : value.value,
                  valueTo:
                    typeof value.valueTo === "string"
                      ? value.valueTo.trim()
                      : value.valueTo,
                }
              : value,
        }));

      const payload = {
        page: currentPage,
        limit: pageSize,
        dateRangeFieldKey: "firstVisit",
        projection: true, // Frontend optimization: skip heavy fields
        filters: filtersArray.length > 0 ? filtersArray : undefined,
        ...(selectedPeriod === "Yearly" &&
          filters.periodValue && {
            year: parseInt(filters.periodValue),
          }),
        ...(selectedPeriod === "Monthly" &&
          filters.periodValue && {
            year: new Date().getFullYear(),
            month: parseInt(filters.periodValue),
          }),
        ...(selectedPeriod === "Quarterly" &&
          filters.periodValue && {
            year: new Date().getFullYear(),
            quarter: filters.periodValue,
          }),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.post("/api/personilizationInsights", payload);
      setCustomers(response.data.data);
      setPagination(response.data.pagination);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalCustomers(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setPagination({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 1,
      });
      setTotalPages(1);
      setTotalCustomers(0);
      toast.error("Unable to apply the selected filters");
    } finally {
      setFetchingCustomers(false);
    }
  };

  const handleStartNewCampaign = () => {
    setCampaignData({
      name: "",
      type: "flow", // Default to flow since user asked for it prominently
      template: null,
      flow: null,
      audience: [],
      variables: {},
      media: { url: "", type: "" },
      scheduledAt: null
    });
    setIsScheduling(false);
    setScheduleDate("");
    setScheduleTime("");
    setCurrentStep(1);
    setView("wizard");
  };

  const handleFlowSelect = (flow) => {
    setCampaignData({
      ...campaignData,
      flow,
      template: null,
      type: "flow",
      variables: { body: "Please fill this form" }, // Default body for flow message
      media: { url: "", type: "" }
    });
    setCurrentStep(3);
  };

  const handleTemplateSelect = (template) => {
    // Extract variables
    const allText = template.components.map(c => c.text || "").join(" ");
    const vars = allText.match(/\{\{(\d+)\}\}/g) || [];
    const uniqueVars = [...new Set(vars)];
    
    const initialVariables = {};
    uniqueVars.forEach(v => initialVariables[v] = "");

    const header = template.components.find(c => c.type === "HEADER");
    const mediaType = header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) ? header.format : "";

    setCampaignData({
      ...campaignData,
      template,
      variables: initialVariables,
      media: { url: "", type: mediaType }
    });
    setCurrentStep(3); // Auto-advance to audience after template selection
  };

  const toggleCustomer = (customer) => {
    setSelectAllMatchingMode(false);
    if (selectedCustomerIds.has(customer._id)) {
      setCampaignData((prev) => ({
        ...prev,
        audience: prev.audience.filter((c) => c._id !== customer._id),
      }));
    } else {
      setCampaignData((prev) => ({
        ...prev,
        audience: [...prev.audience, customer],
      }));
    }
  };

  const selectAllLoaded = () => {
    setSelectAllMatchingMode(false);
    const enabledCustomers = customers.filter(c => c.isOptedIn === true);
    const enabledIds = enabledCustomers.map(c => c._id);
    const allLoadedSelected = enabledIds.length > 0 && enabledIds.every(id => selectedCustomerIds.has(id));

    if (allLoadedSelected) {
      setCampaignData((prev) => ({
        ...prev,
        audience: prev.audience.filter(c => !enabledIds.includes(c._id))
      }));
    } else {
      const newToSelect = enabledCustomers.filter(c => !selectedCustomerIds.has(c._id));
      setCampaignData((prev) => ({
        ...prev,
        audience: [...prev.audience, ...newToSelect]
      }));
    }
  };

  const clearSelection = () => {
    setSelectAllMatchingMode(false);
    setCampaignData({
      ...campaignData,
      audience: []
    });
  };

  const selectAllMatching = async () => {
    try {
      setLoading(true);
      setSelectionProgress({ current: 0, total: totalCustomers, isSelecting: true });
      setSelectAllMatchingMode(true);
      
      const filtersArray = Object.entries(filters)
        .filter(([name, value]) => {
          const hasValue = (val) => {
            if (val === "" || val === null || val === undefined) return false;
            if (typeof val === "object") {
              return Object.values(val).some(
                (nested) => nested !== "" && nested !== null && nested !== undefined
              );
            }
            return true;
          };

          return (
            hasValue(value) &&
            name !== "periodValue"
          );
        })
        .map(([name, value]) => ({
          name,
          value:
            typeof value === "string"
              ? value.trim()
              : typeof value === "object" && value !== null
              ? {
                  ...value,
                  value:
                    typeof value.value === "string"
                      ? value.value.trim()
                      : value.value,
                  valueTo:
                    typeof value.valueTo === "string"
                      ? value.valueTo.trim()
                      : value.valueTo,
                }
              : value,
        }));

      const BATCH_SIZE = 10000; // Larger batches for IDs only
      let allMatchingIds = new Set(campaignData.audience.map(c => c._id));
      let currentAudience = [...campaignData.audience];
      
      const totalToFetch = totalCustomers;
      const totalPagesToFetch = Math.ceil(totalToFetch / BATCH_SIZE);

      for (let i = 1; i <= totalPagesToFetch; i++) {
        const payload = {
          page: i,
          limit: BATCH_SIZE,
          onlyIds: true, // Optimizes backend significantly
          filters: filtersArray.length > 0 ? filtersArray : undefined,
          ...(selectedPeriod === "Yearly" &&
            filters.periodValue && {
              year: parseInt(filters.periodValue),
            }),
          ...(selectedPeriod === "Monthly" &&
            filters.periodValue && {
              year: new Date().getFullYear(),
              month: parseInt(filters.periodValue),
            }),
          ...(selectedPeriod === "Quarterly" &&
            filters.periodValue && {
              year: new Date().getFullYear(),
              quarter: filters.periodValue,
            }),
        };

        const response = await api.post("/api/personilizationInsights", payload);
        const batch = response.data.data.filter(c => c.isOptedIn !== false); // Handle cases where isOptedIn might be undefined (default true)
        
        // Add only new ones
        const newCustomers = batch.filter(c => !allMatchingIds.has(c._id));
        newCustomers.forEach(c => allMatchingIds.add(c._id));
        
        currentAudience = [...currentAudience, ...newCustomers];
        
        setCampaignData(prev => ({
          ...prev,
          audience: currentAudience
        }));

        setSelectionProgress(prev => ({
          ...prev,
          current: Math.min(prev.current + batch.length, totalToFetch)
        }));
      }

      toast.success(`Selected all matching customers`);
    } catch (error) {
      console.error("Error selecting all matching customers:", error);
      toast.error("Failed to select all customers");
      setSelectAllMatchingMode(false);
    } finally {
      setLoading(false);
      setSelectionProgress(prev => ({ ...prev, isSelecting: false }));
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation for images
    if (campaignData.media.type === "IMAGE") {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported image format. Please upload a JPG, JPEG, PNG, or WebP file.");
        e.target.value = "";
        return;
      }
      const maxImgSize = 1 * 1024 * 1024; // 1MB for consistency
      if (file.size > maxImgSize) {
        toast.error("Image size exceeds the maximum allowed limit. Please upload an image within the permitted size.");
        e.target.value = "";
        return;
      }
    } else {
      // Validation for other media
      const maxSize = campaignData.media.type === "VIDEO" ? 64 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File too large. Max ${maxSize / (1024 * 1024)}MB.`);
        e.target.value = "";
        return;
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadingMedia(true);
      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
      if (res.data.status) {
        setCampaignData({
          ...campaignData,
          media: { ...campaignData.media, url: res.data.url }
        });
        toast.success("Media uploaded successfully");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Image upload failed. Please verify the file and try again.";
      toast.error(errorMsg);
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleScheduleCampaign = async () => {
    if (campaignData.audience.length === 0) return toast.error("Select at least one customer");
    if (campaignData.type === "flow" && !campaignData.flow) return toast.error("Please select a flow");
    if (campaignData.type !== "flow" && !campaignData.template) return toast.error("Please select a template");
    if (!scheduleDate || !scheduleTime) return toast.error("Please select date and time for scheduling");

    const scheduledDate = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledDate <= new Date()) return toast.error("Schedule time must be in the future");

    setLoading(true);
    try {
      const payload = {
        name: campaignData.name,
        templateId: campaignData.template?._id,
        flowId: campaignData.flow?._id,
        variables: campaignData.variables,
        mediaUrl: campaignData.media.url,
        mediaType: campaignData.media.type,
        audience: campaignData.audience.map(c => c._id),
        audienceSize: campaignData.audience.length,
        scheduledAt: scheduledDate,
        status: "SCHEDULED"
      };

      const res = await api.post("/api/integrationManagement/whatsapp/campaigns", payload);
      if (res.data.status) {
        toast.success(`Campaign scheduled for ${scheduledDate.toLocaleString()}`);
        setView("dashboard");
        fetchInitialData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (campaignData.audience.length === 0) return toast.error("Select at least one customer");
    if (campaignData.type === "flow" && !campaignData.flow) return toast.error("Please select a flow");
    if (campaignData.type !== "flow" && !campaignData.template) return toast.error("Please select a template");
    
    // Validate variables
    const missingVars = Object.entries(campaignData.variables).filter(([_, val]) => !val.trim());
    if (missingVars.length > 0) return toast.error("Please fill all variables");

    if (campaignData.media.type && !campaignData.media.url) {
      return toast.error(`Please provide ${campaignData.media.type.toLowerCase()} URL or upload media`);
    }

    setLoading(true);
    try {
      // 1. Save Campaign record first
      const savePayload = {
        name: campaignData.name,
        templateId: campaignData.template?._id,
        flowId: campaignData.flow?._id,
        variables: campaignData.variables,
        mediaUrl: campaignData.media.url,
        mediaType: campaignData.media.type,
        audience: selectAllMatchingMode ? [] : campaignData.audience.map(c => c._id),
        audienceSize: campaignData.audience.length,
        status: "COMPLETED"
      };
      
      const campaignSaveRes = await api.post("/api/integrationManagement/whatsapp/campaigns", savePayload);
      const savedCampaign = campaignSaveRes.data?.data;

      // 2. Prepare payload for sending
      let payload = {
        campaignId: savedCampaign?._id,
        campaignName: campaignData.name,
        templateId: campaignData.template?._id,
        templateName: campaignData.template?.name,
        languageCode: campaignData.template?.language,
        flowId: campaignData.flow?.remoteFlowId,
        media: campaignData.media.url ? { url: campaignData.media.url, type: campaignData.media.type } : null,
        variables: campaignData.variables // Pass variables for server-side name replacement
      };

      if (selectAllMatchingMode) {
        // Optimized: Send filters and flag instead of 100k IDs
        const filtersArray = Object.entries(filters)
          .filter(([name, value]) => hasMeaningfulFilterValue(value) && name !== "periodValue")
          .map(([name, value]) => ({ name, value }));

        payload.selectionType = "ALL";
        payload.filters = filtersArray;
        payload.search = filters.firstname || filters.mobileNumber;
        payload.dateRangeFieldKey = "firstVisit";
        if (selectedPeriod === "Yearly" && filters.periodValue) payload.year = parseInt(filters.periodValue);
        // Add other period filters as needed
      } else {
        // Standard: Send individual recipients
        payload.recipients = campaignData.audience.map(customer => {
          const replaceDynamic = (val) => {
            return (val || "").replace(/\{\{customer_name\}\}/g, customer.firstname || "Customer");
          };

          const orderedVars = campaignData.variables ? Object.keys(campaignData.variables)
            .sort((a, b) => {
              const numA = parseInt(a.match(/\d+/)?.[0] || 0);
              const numB = parseInt(b.match(/\d+/)?.[0] || 0);
              return numA - numB;
            })
            .map(key => replaceDynamic(campaignData.variables[key])) : [];

          return {
            phone: customer.mobileNumber ? `${customer.countryCode || "91"}${customer.mobileNumber}` : null,
            variables: orderedVars,
            firstname: customer.firstname,
            lastname: customer.lastname,
            customerId: customer._id
          };
        });
      }

      const res = await api.post("/api/integrationManagement/whatsapp/campaign/send", payload);
      if (res.data.status) {
        toast.success(`Message execution started for ${res.data.processedCount || campaignData.audience.length} customers!`);
        setView("dashboard");
        fetchInitialData();
      }
    } catch (error) {
      console.error("Campaign Send Error:", error);
      toast.error(error.response?.data?.message || "Failed to send messages");
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-sm text-gray-500">Manage and track your message broadcasts</p>
        </div>
        <button 
          onClick={handleStartNewCampaign}
          className="px-6 py-2.5 bg-[#313166] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#3d3b83] transition-all shadow-lg shadow-[#313166]/20"
        >
          <Plus size={18} />
          Launch Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Broadcasts", value: campaigns.length, icon: Megaphone, color: "bg-blue-50 text-blue-600" },
          { label: "Active Audiences", value: totalCustomers, icon: Users, color: "bg-purple-50 text-purple-600" },
          { label: "Templates", value: templates.length, icon: LayoutTemplate, color: "bg-green-50 text-green-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Campaigns</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text"
                placeholder="Search campaigns..."
                className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-[#313166]/20 w-48"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Campaign Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Template / Flow</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sent Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Audience</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Delivered</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Replied</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.length > 0 ? campaigns.map((camp) => (
                <tr key={camp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#313166]/5 flex items-center justify-center text-[#313166]">
                        <Megaphone size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{camp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">{camp.templateId?.name || camp.flowId?.name || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} />
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-gray-700">{camp.audienceSize || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-emerald-600">{camp.delivered || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-purple-600">{camp.replied || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      camp.status === "COMPLETED" ? "bg-green-50 text-green-600" :
                      camp.status === "SCHEDULED" ? "bg-blue-50 text-blue-600" :
                      camp.status === "FAILED" ? "bg-red-50 text-red-600" :
                      "bg-yellow-50 text-yellow-600"
                    }`}>
                      {camp.status || "Completed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    No campaigns found. Launch your first campaign!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWizard = () => {
    const isStep4Needed = !!campaignData.media?.type || (campaignData.variables && Object.keys(campaignData.variables).length > 0);
    
    const allSteps = [
      { id: 1, name: "Campaign Details", icon: Type },
      { id: 2, name: "Select Template", icon: LayoutTemplate },
      { id: 3, name: "Add Audience", icon: Users },
      { id: 4, name: "Map Variables", icon: Layers },
      { id: 5, name: "Review & Send", icon: Send }
    ];

    const steps = allSteps.filter(s => s.id !== 4 || isStep4Needed);

    const handleNext = () => {
      const currentIndex = steps.findIndex(s => s.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
      }
    };

    const handleBack = () => {
      const currentIndex = steps.findIndex(s => s.id === currentStep);
      if (currentIndex > 0) {
        setCurrentStep(steps[currentIndex - 1].id);
      }
    };

    return (
      <div className="max-w-6xl mx-auto h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Stepper Header */}
        <div className="bg-white px-8 py-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  currentStep === step.id 
                    ? "bg-[#313166] text-white shadow-lg shadow-[#313166]/20" 
                    : currentStep > step.id 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-100 text-gray-400"
                }`}>
                  {currentStep > step.id ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                </div>
                <span className={`text-xs font-bold transition-colors ${
                  currentStep === step.id ? "text-gray-900" : "text-gray-400"
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && <ChevronRight size={14} className="text-gray-200 ml-2" />}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setView("dashboard")}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {currentStep === 1 && (
                <div className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Let&apos;s name your campaign</h3>
                    <p className="text-sm text-gray-500">This is for your internal reference to track performance.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign Name</label>
                    <input 
                      type="text"
                      placeholder="e.g., Seasonal Promotion - March 2024"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#313166]/10 transition-all font-medium"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    />
                  </div>
                  <div className="pt-4 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <button 
                        className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${campaignData.type === "broadcast" ? "border-[#313166] bg-[#313166]/5" : "border-gray-100 hover:border-gray-200"}`}
                        onClick={() => {
                          setCampaignData({ ...campaignData, type: "broadcast" });
                          setIsScheduling(false);
                        }}
                      >
                        <Megaphone className={campaignData.type === "broadcast" ? "text-[#313166]" : "text-gray-400"} />
                        <h4 className="font-bold text-sm mt-3">Broadcast</h4>
                        <p className="text-[10px] text-gray-500 mt-1">Send a message to multiple customers at once.</p>
                      </button>
                      <button 
                        className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${campaignData.type === "template" ? "border-[#313166] bg-[#313166]/5" : "border-gray-100 hover:border-gray-200"}`}
                        onClick={() => {
                          setCampaignData({ ...campaignData, type: "template" });
                          setIsScheduling(true);
                        }}
                      >
                        <Clock className={campaignData.type === "template" ? "text-[#313166]" : "text-gray-400"} />
                        <h4 className="font-bold text-sm mt-3">Scheduled</h4>
                        <p className="text-[10px] text-gray-500 mt-1">Plan your message for a future date and time.</p>
                      </button>
                      <button 
                        className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${campaignData.type === "flow" ? "border-[#313166] bg-[#313166]/5" : "border-gray-100 hover:border-gray-200"}`}
                        onClick={() => {
                          setCampaignData({ ...campaignData, type: "flow" });
                          setIsScheduling(false);
                        }}
                      >
                        <Layers className={campaignData.type === "flow" ? "text-[#313166]" : "text-gray-400"} />
                        <h4 className="font-bold text-sm mt-3">Flow</h4>
                        <p className="text-[10px] text-gray-500 mt-1">Send an interactive flow to your customers.</p>
                      </button>
                    </div>

                    {isScheduling && (
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 text-[#313166] mb-4">
                           <Calendar size={18} />
                           <h4 className="font-bold text-sm">Select Schedule Time</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                            <input 
                              type="date"
                              className="w-full px-4 py-2 bg-white border-none rounded-xl text-sm focus:ring-1 focus:ring-[#313166]/20 font-medium"
                              value={scheduleDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setScheduleDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                            <input 
                              type="time"
                              className="w-full px-4 py-2 bg-white border-none rounded-xl text-sm focus:ring-1 focus:ring-[#313166]/20 font-medium"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {campaignData.type === "flow" ? "Choose a WhatsApp Flow" : "Choose a Message Template"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {campaignData.type === "flow" 
                          ? "Select a published flow to send to your audience." 
                          : "Only approved templates can be used for campaigns."}
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text"
                        placeholder={campaignData.type === "flow" ? "Filter flows..." : "Filter templates..."}
                        className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-[#313166]/20 w-48"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaignData.type === "flow" ? (
                      flows.map(f => (
                        <div 
                          key={f._id}
                          onClick={() => handleFlowSelect(f)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer group ${campaignData.flow?._id === f._id ? "border-[#313166] bg-[#313166]/5 shadow-sm" : "border-gray-100 hover:border-gray-300"}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${campaignData.flow?._id === f._id ? "bg-[#313166] text-white" : "bg-gray-100 text-gray-400"}`}>
                              <Layers size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FLOW</span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 mb-1">{f.name}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-2">
                            ID: {f.remoteFlowId}
                          </p>
                          <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all text-[#313166] text-[10px] font-bold">
                            Select Flow <ArrowRight size={12} />
                          </div>
                        </div>
                      ))
                    ) : (
                      templates.map(t => (
                        <div 
                          key={t._id}
                          onClick={() => handleTemplateSelect(t)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer group ${campaignData.template?._id === t._id ? "border-[#313166] bg-[#313166]/5 shadow-sm" : "border-gray-100 hover:border-gray-300"}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${campaignData.template?._id === t._id ? "bg-[#313166] text-white" : "bg-gray-100 text-gray-400"}`}>
                              <LayoutTemplate size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category}</span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 mb-1">{t.name}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-2">
                            {t.components.find(c => c.type === "BODY")?.text || "No preview available"}
                          </p>
                          <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all text-[#313166] text-[10px] font-bold">
                            Select Template <ArrowRight size={12} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900">Select Audience</h3>
                      <p className="text-sm text-gray-500">Choose who should receive this campaign.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 mr-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Size:</label>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(parseInt(e.target.value, 10));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 bg-gray-50 border-none rounded-lg text-xs font-bold text-[#313166] focus:ring-1 focus:ring-[#313166]/20"
                        >
                          <option value={15}>15</option>
                          <option value={20}>20</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => setShowFilterModal(true)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${appliedFiltersCount > 0 ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                      >
                        <Filter size={18} />
                        Advanced Filters
                        {appliedFiltersCount > 0 && <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center animate-in zoom-in">{appliedFiltersCount}</span>}
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#313166] bg-[#313166]/5 px-3 py-1.5 rounded-full">
                           {campaignData.audience.length} Selected
                        </span>
                        {pagination.total > 0 && campaignData.audience.length < pagination.total && (
                          <button 
                            onClick={selectAllMatching}
                            type="button"
                            className="px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm uppercase tracking-wider"
                          >
                            Select All Matching ({pagination.total})
                          </button>
                        )}
                        {campaignData.audience.length > 0 && (
                          <button 
                            onClick={clearSelection}
                            type="button"
                            className="px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-[10px] font-bold text-red-600 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm uppercase tracking-wider"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {(() => {
                      const enabledOnPage = customers.filter(c => c.isOptedIn === true);
                      const selectedOnPage = enabledOnPage.filter(c => campaignData.audience.find(sc => sc._id === c._id));
                      const allOnPageSelected = enabledOnPage.length > 0 && enabledOnPage.length === selectedOnPage.length;
                      const hasMoreToSelect = pagination.total > enabledOnPage.length && campaignData.audience.length < pagination.total;

                      if (allOnPageSelected && hasMoreToSelect) {
                        return (
                          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-center animate-in slide-in-from-top-2 duration-300">
                            <p className="text-xs text-indigo-700 font-medium flex flex-wrap items-center justify-center gap-2">
                              All {enabledOnPage.length} customers on this page are selected. 
                              <button 
                                onClick={selectAllMatching}
                                type="button"
                                className="px-3 py-1 rounded-full border border-indigo-300 bg-white text-[10px] font-bold text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
                              >
                                Select all {pagination.total} matching customers
                              </button>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <CustomerList
                      customers={customers}
                      loading={fetchingCustomers}
                      selectedCustomers={selectedCustomerIds}
                      toggleCustomerSelection={toggleCustomerSelection}
                      toggleAllCustomers={selectAllLoaded}
                      pagination={pagination}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 max-w-2xl">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">Customize Content</h3>
                    <p className="text-sm text-gray-500">Map your template variables to customer data or static values.</p>
                  </div>

                  {campaignData.media.type && (
                    <div className="p-6 bg-[#313166]/5 rounded-2xl border border-[#313166]/10 space-y-4">
                      <div className="flex items-center gap-2 text-[#313166]">
                         <Upload size={18} />
                         <h4 className="font-bold text-sm">Upload {campaignData.media.type} Header</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input 
                            type="text"
                            placeholder={`Paste ${campaignData.media.type.toLowerCase()} URL here...`}
                            className="w-full px-4 py-3 bg-white border-none rounded-xl text-sm focus:ring-1 focus:ring-[#313166]/20 font-medium"
                            value={campaignData.media.url}
                            onChange={(e) => setCampaignData({
                              ...campaignData,
                              media: { ...campaignData.media, url: e.target.value }
                            })}
                          />
                        </div>
                        <div className="relative">
                          <input 
                            type="file"
                            id="media-upload-wizard"
                            className="hidden"
                            accept={campaignData.media.type === "IMAGE" ? "image/*" : campaignData.media.type === "VIDEO" ? "video/*" : ".pdf"}
                            onChange={handleMediaUpload}
                          />
                          <label 
                            htmlFor="media-upload-wizard"
                            className="px-6 py-3 bg-[#313166] text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-[#3d3b83] transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                            {uploadingMedia ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Plus size={16} />}
                            {campaignData.media.url ? "Replace File" : "Upload File"}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Variables</label>
                       <div className="flex items-center gap-1.5 text-[10px] text-[#313166] bg-[#313166]/5 px-2 py-1 rounded-full font-bold">
                         <Info size={12} />
                         Use &#123;&#123;customer_name&#125;&#125; for dynamic names
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.keys(campaignData.variables).map(v => (
                        <div key={v} className="bg-gray-50 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#313166] bg-white px-2 py-1 rounded border border-gray-100">{v}</span>
                            <button 
                              onClick={() => setCampaignData({
                                ...campaignData,
                                variables: { ...campaignData.variables, [v]: (campaignData.variables[v] || "") + "{{customer_name}}" }
                              })}
                              className="text-[10px] text-[#313166] hover:bg-[#313166]/10 px-2 py-1 rounded transition-all font-bold flex items-center gap-1"
                            >
                              <Plus size={10} /> Add Customer Name
                            </button>
                          </div>
                          <input 
                            type="text"
                            placeholder={`Enter value for ${v}...`}
                            className="w-full px-4 py-2 bg-white border-none rounded-xl text-sm focus:ring-1 focus:ring-[#313166]/20 font-medium"
                            value={campaignData.variables[v]}
                            onChange={(e) => setCampaignData({
                              ...campaignData,
                              variables: { ...campaignData.variables, [v]: e.target.value }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8 max-w-xl">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Final Review</h3>
                    <p className="text-sm text-gray-500">Please confirm your campaign details before launching.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-6 rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Target Audience</p>
                        <p className="text-xl font-black text-[#313166]">{campaignData.audience.length} Customers</p>
                     </div>
                     <div className="bg-gray-50 p-6 rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {campaignData.type === "flow" ? "WhatsApp Flow" : "Message Template"}
                        </p>
                        <p className="text-sm font-bold text-gray-700 truncate">
                          {campaignData.type === "flow" ? campaignData.flow?.name : campaignData.template?.name}
                        </p>
                     </div>
                  </div>

                  <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl text-yellow-700 h-fit">
                       <AlertCircle size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-yellow-800">Before you send...</h4>
                       <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                         Sending messages via WhatsApp Business API may incur costs. Ensure your template variables are correctly mapped to avoid confusing your customers.
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    {isScheduling ? (
                      <button 
                        onClick={handleScheduleCampaign}
                        disabled={loading || !scheduleDate || !scheduleTime}
                        className="flex-1 py-4 bg-[#313166] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d3b83] transition-all shadow-xl shadow-[#313166]/30 disabled:opacity-50"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><Clock size={18} /> Schedule Campaign</>}
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={handleSendMessage}
                          disabled={loading}
                          className="flex-1 py-4 bg-[#313166] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d3b83] transition-all shadow-xl shadow-[#313166]/30 disabled:opacity-50"
                        >
                          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><Send size={18} /> Launch Campaign Now</>}
                        </button>
                        <button 
                          onClick={() => setIsScheduling(true)}
                          className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <Clock size={18} />
                          Schedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer Navigation */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={handleBack}
                disabled={currentStep === steps[0]?.id}
                className="px-6 py-2.5 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-white hover:border-gray-300 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <div className="flex items-center gap-2">
                {steps.map(s => (
                  <div key={s.id} className={`w-1.5 h-1.5 rounded-full transition-all ${currentStep === s.id ? "w-6 bg-[#313166]" : "bg-gray-200"}`}></div>
                ))}
              </div>

              {steps.findIndex(s => s.id === currentStep) < steps.length - 1 ? (
                <button 
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !campaignData.name) ||
                    (currentStep === 2 && !campaignData.template) ||
                    (currentStep === 3 && campaignData.audience.length === 0)
                  }
                  className="px-8 py-2.5 bg-[#313166] text-white rounded-xl text-sm font-bold hover:bg-[#3d3b83] transition-all flex items-center gap-2 disabled:opacity-30 shadow-lg shadow-[#313166]/10"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <div className="w-[110px]"></div>
              )}
            </div>
          </div>

          {/* Right Side: Preview (Sticky) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</h3>
                 <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-red-400"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                   <div className="w-2 h-2 rounded-full bg-green-400"></div>
                 </div>
               </div>

               <div className="w-full aspect-[9/16] max-h-[500px] bg-gray-100 rounded-[2.5rem] p-3 border-[6px] border-gray-900 shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Phone Header */}
                  <div className="bg-white/80 backdrop-blur-sm p-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-900 leading-tight">Your Business</p>
                      <p className="text-[8px] text-green-500 font-medium leading-tight">Online</p>
                    </div>
                  </div>

                  {/* Message Area */}
                  <div className="flex-1 p-3 bg-[#e5ddd5] space-y-2 overflow-y-auto custom-scrollbar" style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: '150px' }}>
                     {campaignData.template ? (
                       <div className="max-w-[85%] bg-white rounded-xl p-2 shadow-sm animate-in zoom-in-95 duration-300 origin-top-left">
                          {/* Header Preview */}
                          {(() => {
                            const header = campaignData.template.components.find(c => c.type === "HEADER");
                            if (!header) return null;
                            if (header.format === "TEXT") return <div className="mb-1 font-bold text-[10px] text-gray-900">{header.text}</div>;
                            
                            const previewUrl = campaignData.media.url || header.mediaUrl;
                            return (
                              <div className="bg-gray-100 min-h-[80px] rounded-lg flex flex-col items-center justify-center text-gray-400 overflow-hidden mb-2 border border-gray-50">
                                 {previewUrl ? (
                                    header.format === "IMAGE" ? (
                                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="flex flex-col items-center gap-1 p-4">
                                         {header.format === "VIDEO" ? <Video size={20} /> : <FileText size={20} />}
                                         <span className="text-[6px] text-center break-all text-gray-500">{previewUrl}</span>
                                      </div>
                                    )
                                 ) : (
                                   <>
                                     {header.format === "IMAGE" && <ImageIcon size={24} />}
                                     {header.format === "VIDEO" && <Video size={24} />}
                                     {header.format === "DOCUMENT" && <FileText size={24} />}
                                     <span className="text-[8px] mt-2 font-bold uppercase tracking-wider">{header.format} Header</span>
                                   </>
                                 )}
                              </div>
                            );
                          })()}

                          {/* Body Preview */}
                          <div className="text-[10px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {(() => {
                              let text = campaignData.template.components.find(c => c.type === "BODY")?.text || "";
                              Object.entries(campaignData.variables).forEach(([key, val]) => {
                                const placeholder = `{{${key.match(/\d+/)[0]}}}`;
                                text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val || `<${key}>`);
                              });
                              // Also replace {{customer_name}} if it was added as a string
                              text = text.replace(/\{\{customer_name\}\}/g, "John Doe");
                              return text;
                            })()}
                          </div>
                          
                          {/* Footer Preview */}
                          {campaignData.template.components.find(c => c.type === "FOOTER") && (
                            <div className="mt-1 text-[8px] text-gray-400">
                              {campaignData.template.components.find(c => c.type === "FOOTER").text}
                            </div>
                          )}

                          <div className="flex justify-end mt-1">
                            <span className="text-[7px] text-gray-300 font-medium">12:00 PM</span>
                          </div>
                       </div>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400/50 space-y-4 text-center p-8">
                         <div className="w-16 h-16 rounded-3xl bg-white/50 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <LayoutTemplate size={32} className="opacity-20" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Select a template to<br/>see live preview</p>
                       </div>
                     )}
                  </div>
               </div>

               <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Info size={16} />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    This preview shows how your message will appear on your customers&apos; devices.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <Filter className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                  appliedFiltersCount={appliedFiltersCount}
                  clearAllFilters={clearAllFilters}
                />
              </div>
              
              <div className="p-6 border-t bg-gray-50 flex items-center justify-between gap-4">
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-8 py-2.5 bg-[#313166] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#313166]/20 hover:bg-[#3d3b83] transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (fetchingData) {
    return <Loader text="Initializing Campaign Manager..." />;
  }

  return (
    <div className="h-full">
      {view === "dashboard" ? renderDashboard() : renderWizard()}
      
      {/* Selection Progress Overlay */}
      {selectionProgress.isSelecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-sm w-full space-y-4 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Selecting Customers</h3>
              <span className="text-xs font-black text-[#313166] bg-[#313166]/5 px-2 py-1 rounded-lg">
                {Math.round((selectionProgress.current / selectionProgress.total) * 100) || 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#313166] transition-all duration-500 ease-out"
                style={{ width: `${(selectionProgress.current / selectionProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 font-medium">
              {selectionProgress.current.toLocaleString()} of {selectionProgress.total.toLocaleString()} customers selected...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendCampaign;
