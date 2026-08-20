import { useState, useEffect, useRef, useMemo } from "react";
import * as xlsx from "xlsx";
import { 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Settings2, 
  HelpCircle,
  X,
  FileText
} from "lucide-react";
import api from "../../api/apiconfig";
import Loader from "../../utils/Loader";
import { useCustomerImport } from "../../context/CustomerImportContext";
import showToast from "../../utils/ToastNotification";

const CORE_FIELDS = [
  { id: "firstname", label: "First Name", required: true, desc: "Customer first name (Required)" },
  { id: "lastname", label: "Last Name", required: false, desc: "Customer surname/last name" },
  { id: "mobileNumber", label: "Mobile Number", required: true, desc: "Phone number 4-14 digits (Required)" },
  { id: "countryCode", label: "Country Code", required: false, desc: "Dial code without '+' (e.g. 91)" },
  { id: "source", label: "Source", required: false, desc: "Lead/acquisition channel" },
  { id: "gender", label: "Gender", required: false, desc: "male, female, or others" },
  { id: "firstVisit", label: "First Visit Date", required: false, desc: "DD-MM-YYYY or YYYY-MM-DD" },
  { id: "labels", label: "Labels / Tags", required: false, desc: "Comma-separated tags" },
];

const AUTO_MAP_RULES = [
  { field: "firstname", matches: ["first name", "firstname", "first_name", "fname", "name", "customer name", "client name", "customer_name", "full name", "fullname"] },
  { field: "lastname", matches: ["last name", "lastname", "last_name", "lname", "surname", "family name"] },
  { field: "mobileNumber", matches: ["mobile", "phone", "contact", "mobile number", "phone number", "cell", "cell phone", "whatsapp", "mobile_number", "phone_number", "mob", "contact number", "contact_number", "telephone", "tel"] },
  { field: "countryCode", matches: ["country code", "country_code", "country", "isd", "dial code", "dial_code", "c_code"] },
  { field: "source", matches: ["source", "lead source", "lead_source", "channel", "origin", "medium", "campaign source"] },
  { field: "gender", matches: ["gender", "sex"] },
  { field: "firstVisit", matches: ["first visit", "first_visit", "visit date", "visit", "date", "joining date", "reg date", "registration date", "created at", "created_at"] },
  { field: "labels", matches: ["labels", "label", "tags", "tag", "groups", "group", "category", "categories", "segment", "segments"] },
];

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { refreshJobs } = useCustomerImport();
  const retailerId = localStorage.getItem("retailerId");

  // Step state: 1 = Upload, 2 = Mapping, 3 = Progress/Result
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parsed File Details
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [totalRowsCount, setTotalRowsCount] = useState(0);

  // Customer Preferences & Retailer Data
  const [preferences, setPreferences] = useState({
    additionalData: [],
    advancedDetails: [],
    advancedPrivacyDetails: [],
  });
  const [sources, setSources] = useState([]);

  // Column Mapping: { [excelHeader]: { type: 'core'|'preference', field?: string, section?: string, key?: string } | 'SKIP' }
  const [columnMapping, setColumnMapping] = useState({});

  // Default values
  const [defaultCountryCode, setDefaultCountryCode] = useState("91");
  const [defaultSource, setDefaultSource] = useState("bulk-import");
  const [defaultFirstVisit, setDefaultFirstVisit] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Import Job & Progress
  const [importJobId, setImportJobId] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const pollIntervalRef = useRef(null);

  // Reset when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFile(null);
      setSheetHeaders([]);
      setSampleRows([]);
      setTotalRowsCount(0);
      setColumnMapping({});
      setImportJobId(null);
      setJobDetails(null);
      setSuccessMessage("");
      setLoading(false);
      setIsParsing(false);
      stopPolling();
    } else {
      fetchPreferencesAndSources();
    }
  }, [isOpen]);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchPreferencesAndSources = async () => {
    if (!retailerId) return;
    try {
      const [prefRes, srcRes] = await Promise.allSettled([
        api.get(`/api/customer-preferences/${retailerId}`),
        api.get("/api/retailer/getSource"),
      ]);

      if (prefRes.status === "fulfilled" && prefRes.value.data) {
        setPreferences({
          additionalData: prefRes.value.data.additionalData || [],
          advancedDetails: prefRes.value.data.advancedDetails || [],
          advancedPrivacyDetails: prefRes.value.data.advancedPrivacyDetails || [],
        });
      }

      if (srcRes.status === "fulfilled" && srcRes.value.data?.data) {
        const fetchedSources = Array.isArray(srcRes.value.data.data)
          ? srcRes.value.data.data
          : [];
        setSources(fetchedSources);
        if (fetchedSources.length > 0) {
          setDefaultSource(fetchedSources[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching preferences/sources:", err);
    }
  };

  // Smart Auto-Mapping
  const autoMapColumns = (headers, prefData) => {
    const mapping = {};
    const usedTargets = new Set();

    headers.forEach((header) => {
      const cleanHeader = String(header || "").trim().toLowerCase();
      if (!cleanHeader) return;

      // 1. Try matching core fields
      let matchedCore = null;
      for (const rule of AUTO_MAP_RULES) {
        if (!usedTargets.has(`core:${rule.field}`)) {
          if (rule.matches.includes(cleanHeader) || rule.matches.some(m => cleanHeader.includes(m))) {
            matchedCore = rule.field;
            break;
          }
        }
      }

      if (matchedCore) {
        mapping[header] = { type: "core", field: matchedCore };
        usedTargets.add(`core:${matchedCore}`);
        return;
      }

      // 2. Try matching preference fields
      const checkPrefList = (list, section, prefix) => {
        if (!list || !list.length) return null;
        for (const item of list) {
          const itemKey = item.key.toLowerCase();
          const targetKey = `pref:${section}:${item.key}`;
          if (usedTargets.has(targetKey)) continue;

          if (
            cleanHeader === itemKey ||
            cleanHeader === `${prefix}: ${itemKey}` ||
            cleanHeader === `${prefix}:${itemKey}` ||
            (cleanHeader.startsWith(`${prefix}:`) && cleanHeader.includes(itemKey))
          ) {
            return item.key;
          }
        }
        return null;
      };

      const addKey = checkPrefList(prefData.additionalData, "additionalData", "additional");
      if (addKey) {
        mapping[header] = { type: "preference", section: "additionalData", key: addKey };
        usedTargets.add(`pref:additionalData:${addKey}`);
        return;
      }

      const advKey = checkPrefList(prefData.advancedDetails, "advancedDetails", "advanced");
      if (advKey) {
        mapping[header] = { type: "preference", section: "advancedDetails", key: advKey };
        usedTargets.add(`pref:advancedDetails:${advKey}`);
        return;
      }

      const privKey = checkPrefList(prefData.advancedPrivacyDetails, "advancedPrivacyDetails", "privacy");
      if (privKey) {
        mapping[header] = { type: "preference", section: "advancedPrivacyDetails", key: privKey };
        usedTargets.add(`pref:advancedPrivacyDetails:${privKey}`);
        return;
      }

      // Default: Skip
      mapping[header] = "SKIP";
    });

    return mapping;
  };

  // Parse Excel file on upload
  const handleFileSelection = async (selectedFile) => {
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileExt)) {
      showToast("Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.", "error");
      return;
    }

    setIsParsing(true);
    setFile(selectedFile);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = xlsx.read(data, { type: "array" });

      // Find first non-instruction sheet
      let sheetName = workbook.SheetNames[0];
      for (const name of workbook.SheetNames) {
        if (!name.toLowerCase().includes("instruction")) {
          sheetName = name;
          break;
        }
      }

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error("Could not find a valid sheet in workbook");
      }

      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (jsonData.length === 0) {
        throw new Error("The uploaded file is empty.");
      }

      // First row contains headers
      const rawHeaderRow = (jsonData[0] || []).map((h) => String(h || "").trim());
      const rawHeaders = rawHeaderRow.filter((h) => h !== "");

      if (rawHeaders.length === 0) {
        throw new Error("No column headers found in first row.");
      }

      // Extract sample data rows (filter out empty rows)
      const dataRows = jsonData.slice(1).filter((row) =>
        row.some((cell) => cell !== "" && cell !== null && String(cell).trim() !== "")
      );
      const samples = dataRows.slice(0, 3).map((row) => {
        const rowObj = {};
        rawHeaderRow.forEach((h, idx) => {
          if (h) {
            rowObj[h] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : "";
          }
        });
        return rowObj;
      });

      setSheetHeaders(rawHeaders);
      setSampleRows(samples);
      setTotalRowsCount(dataRows.length);

      // Perform Smart Auto-Mapping
      const initialMapping = autoMapColumns(rawHeaders, preferences);
      setColumnMapping(initialMapping);

      // Move to Step 2: Mapping
      setStep(2);
    } catch (err) {
      console.error("Error reading file:", err);
      showToast(err.message || "Failed to read Excel file", "error");
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleMappingChange = (header, value) => {
    setColumnMapping((prev) => {
      const next = { ...prev };
      if (!value || value === "SKIP") {
        next[header] = "SKIP";
      } else if (value.startsWith("core:")) {
        const field = value.replace("core:", "");
        next[header] = { type: "core", field };
      } else if (value.startsWith("pref:")) {
        const [, section, key] = value.split(":");
        next[header] = { type: "preference", section, key };
      }
      return next;
    });
  };

  // Check validation status of required fields
  const mappingValidation = useMemo(() => {
    const mappedValues = Object.values(columnMapping);
    const hasFirstName = mappedValues.some(
      (m) => m && typeof m === "object" && m.type === "core" && m.field === "firstname"
    );
    const hasMobile = mappedValues.some(
      (m) => m && typeof m === "object" && m.type === "core" && m.field === "mobileNumber"
    );
    const hasCountryCode = mappedValues.some(
      (m) => m && typeof m === "object" && m.type === "core" && m.field === "countryCode"
    );
    const hasSource = mappedValues.some(
      (m) => m && typeof m === "object" && m.type === "core" && m.field === "source"
    );

    return {
      hasFirstName,
      hasMobile,
      hasCountryCode,
      hasSource,
      isValid: hasFirstName && hasMobile,
    };
  }, [columnMapping]);

  // Start polling job status
  const startPolling = (jobId) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/api/customers/import-status/${jobId}`);
        const data = response.data;
        setJobDetails(data);

        if (data.status === "completed" || data.status === "failed") {
          stopPolling();
          if (data.status === "completed") {
            setSuccessMessage(`Import completed! ${data.successCount} customers added.`);
            setTimeout(() => {
              if (onSuccess) onSuccess(`Import completed! ${data.successCount} customers added.`);
              onClose();
            }, 3000);
          } else {
            showToast(`Import failed: ${data.importErrors?.[0]?.message || 'Unknown error'}`, "error");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
      }
    }, 2000);
  };

  const handleStartImport = async () => {
    if (!mappingValidation.hasMobile) {
      showToast("Please map a column to 'Mobile Number' (Required).", "error");
      return;
    }
    if (!mappingValidation.hasFirstName) {
      showToast("Please map a column to 'First Name' (Required).", "error");
      return;
    }

    try {
      setLoading(true);
      setStep(3);
      setJobDetails(null);

      // Clean up mapping payload (strip SKIP entries)
      const cleanMapping = {};
      Object.entries(columnMapping).forEach(([header, val]) => {
        if (val && val !== "SKIP") {
          cleanMapping[header] = val;
        }
      });

      const defaultsPayload = {
        countryCode: defaultCountryCode,
        source: defaultSource,
        firstVisit: defaultFirstVisit,
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("columnMapping", JSON.stringify(cleanMapping));
      formData.append("defaults", JSON.stringify(defaultsPayload));

      const response = await api.post(`/api/customers/bulk-upload/${retailerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      if (data.jobId) {
        setImportJobId(data.jobId);
        startPolling(data.jobId);
        refreshJobs();
      } else {
        showToast("Failed to start import job.", "error");
        setStep(2);
        setLoading(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err?.response?.data?.error || "Import failed to initialize.", "error");
      setStep(2);
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(`/api/customers/bulk-upload/template/${retailerId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customer_bulk_upload_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download template error:", err);
      showToast("Failed to download template.", "error");
    }
  };

  const calculateProgress = () => {
    if (!jobDetails) return 0;
    if (jobDetails.percentage !== undefined) return jobDetails.percentage;
    if (!jobDetails.totalRows) return 0;
    const p = Math.round((jobDetails.processedRows / jobDetails.totalRows) * 100);
    return Math.min(100, p);
  };

  const getMappingValueString = (mappingObj) => {
    if (!mappingObj || mappingObj === "SKIP") return "SKIP";
    if (mappingObj.type === "core") return `core:${mappingObj.field}`;
    if (mappingObj.type === "preference") return `pref:${mappingObj.section}:${mappingObj.key}`;
    return "SKIP";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_.2s_ease]">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-[28px] border border-[#EEF1FF] bg-white shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1FF] px-6 py-4 bg-[#FAFBFD]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#313166]/10 text-[#313166]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#1F1C5C]">
                Bulk Import Customers
              </h2>
              <p className="text-xs text-[#8B90B2]">
                Upload any Excel/CSV spreadsheet and map its columns to customer attributes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {step === 1 && (
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-xs font-semibold text-[#313166] hover:underline flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5" />
                Download Sample Template
              </button>
            )}

            <button
              onClick={onClose}
              disabled={loading && jobDetails?.status === "processing"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EEF1FF] bg-white text-[#8B90B2] transition-all hover:bg-[#F8F9FF] hover:text-[#313166] disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#F8F9FF] border-b border-[#EEF1FF] text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${step >= 1 ? 'bg-[#313166] text-white' : 'bg-[#E5E9FF] text-[#8B90B2]'}`}>1</span>
            <span className={step === 1 ? 'text-[#1F1C5C] font-bold' : 'text-[#8B90B2]'}>Upload File</span>
          </div>
          <div className="h-[1px] w-12 bg-[#DDE2F5]" />
          <div className="flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${step >= 2 ? 'bg-[#313166] text-white' : 'bg-[#E5E9FF] text-[#8B90B2]'}`}>2</span>
            <span className={step === 2 ? 'text-[#1F1C5C] font-bold' : 'text-[#8B90B2]'}>Map Columns</span>
          </div>
          <div className="h-[1px] w-12 bg-[#DDE2F5]" />
          <div className="flex items-center gap-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${step >= 3 ? 'bg-[#313166] text-white' : 'bg-[#E5E9FF] text-[#8B90B2]'}`}>3</span>
            <span className={step === 3 ? 'text-[#1F1C5C] font-bold' : 'text-[#8B90B2]'}>Import Status</span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#D7DBF5]">
          
          {/* STEP 1: UPLOAD COMPONENT */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]);
                }}
                className="group relative flex flex-col items-center justify-center w-full max-w-xl p-8 rounded-[24px] border-2 border-dashed border-[#D2D8F2] bg-[#FAFBFD] hover:bg-[#F4F6FF] hover:border-[#313166] cursor-pointer transition-all duration-200"
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
                  }}
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(49,49,102,0.08)] group-hover:scale-105 transition-transform">
                  <Upload className="h-8 w-8 text-[#313166]" />
                </div>

                <h3 className="mt-4 text-base font-bold text-[#1F1C5C]">
                  {isParsing ? "Reading spreadsheet..." : "Click or drag & drop Excel / CSV here"}
                </h3>
                <p className="mt-1 text-xs text-[#8B90B2] text-center max-w-sm">
                  Supports .xlsx, .xls, and .csv files. Any column names are accepted — you will map them in the next step.
                </p>

                {isParsing && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#313166]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#313166] border-t-transparent" />
                    Parsing sheet headers & sample rows...
                  </div>
                )}
              </label>

              <div className="w-full max-w-xl bg-[#F8F9FF] p-4 rounded-2xl border border-[#EEF1FF] text-xs text-[#313166] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#1F1C5C]">
                  <HelpCircle className="h-4 w-4 text-[#313166]" />
                  <span>How it works:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#666B8E] ml-1">
                  <li>Upload any spreadsheet from your existing CRM, POS, or Google Sheets.</li>
                  <li>Our smart auto-mapping tool will detect headers like First Name, Phone, Tags, etc.</li>
                  <li>You can map any column to custom preference data (e.g. Birthday, Anniversary).</li>
                  <li>100,000+ records are processed reliably in background queue.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F9FF] border border-[#EEF1FF]">
                <div>
                  <p className="text-sm font-bold text-[#1F1C5C] flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-[#313166]" />
                    {file?.name}
                  </p>
                  <p className="text-xs text-[#8B90B2] mt-0.5">
                    {sheetHeaders.length} columns detected • ~{totalRowsCount} rows to import
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${mappingValidation.hasFirstName ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mappingValidation.hasFirstName ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    First Name
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${mappingValidation.hasMobile ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mappingValidation.hasMobile ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    Mobile Number
                  </span>
                </div>
              </div>

              {/* Column Mapping Table */}
              <div className="rounded-2xl border border-[#EEF1FF] overflow-hidden bg-white shadow-sm">
                <div className="grid grid-cols-12 bg-[#FAFBFD] px-4 py-3 border-b border-[#EEF1FF] text-xs font-bold text-[#313166] uppercase tracking-wider">
                  <div className="col-span-6 sm:col-span-5">Excel Column & Preview</div>
                  <div className="col-span-6 sm:col-span-7">Map to Vadik Field</div>
                </div>

                <div className="divide-y divide-[#F4F6FB] max-h-[380px] overflow-y-auto">
                  {sheetHeaders.map((header, idx) => {
                    const currentMapping = columnMapping[header] || "SKIP";
                    const isSkipped = currentMapping === "SKIP";
                    const sampleVals = sampleRows.map((r) => r[header]).filter(Boolean).slice(0, 2);

                    return (
                      <div key={idx} className={`grid grid-cols-12 items-center px-4 py-3 transition-colors ${isSkipped ? 'bg-gray-50/50' : 'bg-white hover:bg-[#F8F9FF]'}`}>
                        
                        {/* Left: Excel Header & Sample Values */}
                        <div className="col-span-6 sm:col-span-5 pr-3">
                          <p className="text-sm font-bold text-[#1F1C5C] truncate">{header}</p>
                          <p className="text-[11px] text-[#8B90B2] truncate mt-0.5">
                            {sampleVals.length > 0 ? (
                              <span>e.g. <span className="text-[#313166] font-medium">{sampleVals.join(", ")}</span></span>
                            ) : (
                              <span className="italic text-gray-400">Empty sample</span>
                            )}
                          </p>
                        </div>

                        {/* Right: Vadik Field Dropdown */}
                        <div className="col-span-6 sm:col-span-7">
                          <select
                            value={getMappingValueString(currentMapping)}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            className={`w-full h-10 px-3 text-xs font-medium rounded-xl border outline-none transition-all ${
                              isSkipped 
                                ? 'border-[#E5E9FF] bg-[#F8F9FF] text-[#8B90B2]' 
                                : 'border-[#313166]/30 bg-white text-[#1F1C5C] font-semibold shadow-sm focus:ring-2 focus:ring-[#313166]/10'
                            }`}
                          >
                            <option value="SKIP">-- Do Not Import (Skip Column) --</option>

                            <optgroup label="Standard Customer Fields">
                              {CORE_FIELDS.map((f) => (
                                <option key={f.id} value={`core:${f.id}`}>
                                  {f.label} {f.required ? "(Required)" : ""}
                                </option>
                              ))}
                            </optgroup>

                            {preferences.additionalData?.length > 0 && (
                              <optgroup label="Additional Data (Preferences)">
                                {preferences.additionalData.map((pref) => (
                                  <option key={pref.key} value={`pref:additionalData:${pref.key}`}>
                                    Additional: {pref.key} ({pref.type})
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {preferences.advancedDetails?.length > 0 && (
                              <optgroup label="Advanced Details (Preferences)">
                                {preferences.advancedDetails.map((pref) => (
                                  <option key={pref.key} value={`pref:advancedDetails:${pref.key}`}>
                                    Advanced: {pref.key} ({pref.type})
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {preferences.advancedPrivacyDetails?.length > 0 && (
                              <optgroup label="Privacy Details (Preferences)">
                                {preferences.advancedPrivacyDetails.map((pref) => (
                                  <option key={pref.key} value={`pref:advancedPrivacyDetails:${pref.key}`}>
                                    Privacy: {pref.key} ({pref.type})
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Default Values Fallback Section */}
              <div className="p-4 rounded-2xl border border-[#EEF1FF] bg-[#FAFBFD] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F1C5C]">
                  <Settings2 className="h-4 w-4 text-[#313166]" />
                  <span>Default Values (Used if columns are not mapped or cells are empty in Excel):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8B90B2] mb-1">
                      Default Country Code
                    </label>
                    <input
                      type="text"
                      value={defaultCountryCode}
                      onChange={(e) => setDefaultCountryCode(e.target.value.replace(/\+/g, ''))}
                      placeholder="e.g. 91"
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#E5E9FF] bg-white text-[#1F1C5C] outline-none focus:border-[#313166]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8B90B2] mb-1">
                      Default Source
                    </label>
                    {sources.length > 0 ? (
                      <select
                        value={defaultSource}
                        onChange={(e) => setDefaultSource(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-xl border border-[#E5E9FF] bg-white text-[#1F1C5C] outline-none focus:border-[#313166]"
                      >
                        <option value="bulk-import">Bulk Import</option>
                        {sources.map((s, idx) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={defaultSource}
                        onChange={(e) => setDefaultSource(e.target.value)}
                        placeholder="e.g. bulk-import"
                        className="w-full h-9 px-3 text-xs rounded-xl border border-[#E5E9FF] bg-white text-[#1F1C5C] outline-none focus:border-[#313166]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8B90B2] mb-1">
                      Default First Visit Date
                    </label>
                    <input
                      type="date"
                      value={defaultFirstVisit}
                      onChange={(e) => setDefaultFirstVisit(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#E5E9FF] bg-white text-[#1F1C5C] outline-none focus:border-[#313166]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IMPORT PROGRESS & LOG */}
          {step === 3 && (
            <div className="space-y-6 py-2">
              {successMessage && (
                <div className="p-4 rounded-2xl border border-green-200 bg-green-50 text-sm font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {successMessage}
                </div>
              )}

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-semibold text-[#8B90B2] uppercase tracking-wider">Status</p>
                  <p className={`text-lg font-bold capitalize ${
                    jobDetails?.status === 'completed' ? 'text-green-600' :
                    jobDetails?.status === 'failed' ? 'text-red-600' : 'text-[#313166]'
                  }`}>
                    {jobDetails?.status || 'Starting background processing...'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#8B90B2]">Progress</p>
                  <p className="text-lg font-bold text-[#1F1C5C]">{calculateProgress()}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-[#EEF1FF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#313166] transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#F8F9FF] p-4 rounded-2xl border border-[#EEF1FF] text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Records</p>
                  <p className="text-xl font-bold text-[#1F1C5C]">{jobDetails?.totalRows ?? totalRowsCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                  <p className="text-xs text-green-600 mb-1">Successfully Imported</p>
                  <p className="text-xl font-bold text-green-700">{jobDetails?.successCount || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                  <p className="text-xs text-red-600 mb-1">Errors / Skipped</p>
                  <p className="text-xl font-bold text-red-700">{jobDetails?.errorCount || 0}</p>
                </div>
              </div>

              {/* Issue Details Log */}
              {jobDetails?.importErrors?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1F1C5C] mb-2">
                    Issues & Warnings Log (First 100)
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#EEF1FF] bg-[#FCFCFF]">
                    <table className="min-w-full text-xs">
                      <thead className="bg-[#F4F6FF] sticky top-0 border-b border-[#EEF1FF]">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold text-[#313166]">Row</th>
                          <th className="px-3 py-2 text-left font-bold text-[#313166]">Type</th>
                          <th className="px-3 py-2 text-left font-bold text-[#313166]">Contact</th>
                          <th className="px-3 py-2 text-left font-bold text-[#313166]">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobDetails.importErrors.map((err, idx) => (
                          <tr key={idx} className={`border-t ${err.isWarning ? 'border-amber-50 bg-amber-50/30' : 'border-gray-100'}`}>
                            <td className="px-3 py-2 font-semibold text-[#1F1C5C]">{err.row || '-'}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                err.isWarning ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {err.isWarning ? 'Warning' : 'Error'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {err.data?.countryCode ? `+${err.data.countryCode} ${err.data.mobileNumber}` : '-'}
                            </td>
                            <td className={`px-3 py-2 ${err.isWarning ? 'text-amber-700' : 'text-red-600 font-medium'}`}>
                              {err.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-[#EEF1FF] bg-[#FAFBFD] px-6 py-4">
          {step === 1 && (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-[#EEF1FF] bg-white px-5 text-xs font-semibold text-[#313166] hover:bg-[#F8F9FF] transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 h-11 rounded-xl border border-[#EEF1FF] bg-white px-4 text-xs font-semibold text-[#313166] hover:bg-[#F8F9FF] transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Upload
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-xl border border-[#EEF1FF] bg-white px-5 text-xs font-semibold text-[#313166] hover:bg-[#F8F9FF] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartImport}
                  disabled={!mappingValidation.isValid || loading}
                  className={`flex items-center gap-2 h-11 rounded-xl px-6 text-xs font-semibold text-white shadow-md transition-all ${
                    !mappingValidation.isValid || loading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-[#313166] hover:bg-[#272757]'
                  }`}
                >
                  Proceed to Import
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                disabled={jobDetails?.status === "processing"}
                className="h-11 rounded-xl bg-[#313166] px-6 text-xs font-semibold text-white hover:bg-[#272757] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {jobDetails?.status === "processing" ? "Importing in Background..." : "Done & Close"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BulkImportModal;
