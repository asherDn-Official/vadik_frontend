import React, { useEffect, useState, useRef } from "react";
import { Upload } from "lucide-react";
import FilterPanel from "../customerInsigth/FilterPanel";
import CustomerList from "../customerInsigth/CustomerList";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import * as XLSX from "xlsx";

const PersonalizationCampaign = () => {
  // Campaign selection state
  const [selectedCampaignType, setSelectedCampaignType] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(""); //id

  // Activities data state
  const [quizActivities, setQuizActivities] = useState([]);
  const [spinWheelActivities, setSpinWheelActivities] = useState([]);
  const [scratchCardActivities, setScratchCardActivities] = useState([]);

  // Sending options
  const [sendByWhatsapp, setSendByWhatsapp] = useState(false);
  const [sendByEngageBird, setSendByEngageBird] = useState(false);

  // Filter and customer selection state
  const [filters, setFilters] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pageSize, setPageSize] = useState(15); // customers per page selector
  const [formErrors, setFormErrors] = useState({});

  // Pre-check modal state
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkResults, setCheckResults] = useState([]); // API response rows
  const [checkFilter, setCheckFilter] = useState("all"); // all | true | false
  const [checking, setChecking] = useState(false);

  // Excel import state
  const fileInputRef = useRef(null);
  const [importedRows, setImportedRows] = useState([]); // rows as read from Excel
  const [importedHeaders, setImportedHeaders] = useState([]); // column names from Excel
  const [selectedImported, setSelectedImported] = useState([]); // resolved _ids selected from import
  const [unresolvedImports, setUnresolvedImports] = useState([]); // rows we couldn't map to an existing customer
  const [resolvableImportedIds, setResolvableImportedIds] = useState([]); // unique list of resolvable IDs from import

  // Fetch activities data on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch quiz activities
        const quizResponse = await api.get("/api/quiz");
        setQuizActivities(quizResponse.data.docs);

        // Fetch spin wheel activities
        const spinWheelResponse = await api.get("/api/spinWheels/spinWheel/all");
        setSpinWheelActivities(spinWheelResponse.data.data);

        // Fetch scratch card activities
        const scratchCardResponse = await api.get("/api/scratchCards/scratchCard/all");
        setScratchCardActivities(scratchCardResponse.data.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);

  // Fetch customer data with filters and pagination
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Prepare filters array - exclude period-related filters
      const filtersArray = Object.entries(filters)
        .filter(([name, value]) => {
          // Exclude periodValue and any other period-related fields
          return (
            value !== "" &&
            value !== null &&
            value !== undefined &&
            name !== "periodValue"
          );
        })
        .map(([name, value]) => ({ name, value }));

      // Prepare the request payload
      const payload = {
        page: currentPage,
        limit: pageSize,
        filters: filtersArray.length > 0 ? filtersArray : undefined,
        ...(selectedPeriod === "Yearly" && filters.periodValue && {
          year: parseInt(filters.periodValue),
        }),
        ...(selectedPeriod === "Monthly" && filters.periodValue && {
          year: new Date().getFullYear(),
          month: parseInt(filters.periodValue),
        }),
        ...(selectedPeriod === "Quarterly" && filters.periodValue && {
          year: new Date().getFullYear(),
          quarter: filters.periodValue,
        }),
      };

      // Remove undefined parameters
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.post("/api/personilizationInsights", payload);
      setFilteredData(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, pageSize]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Calculate applied filters count
      const count = Object.values(newFilters).filter(
        (v) => v !== undefined && v !== ""
      ).length;
      setAppliedFiltersCount(count);
      return newFilters;
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({});
    setAppliedFiltersCount(0);
    setCurrentPage(1);
  };

  // Toggle customer selection
  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers((prevSelected) => {
      const next = prevSelected.includes(customerId)
        ? prevSelected.filter((id) => id !== customerId)
        : [...prevSelected, customerId];
      // Clear error if there is at least one selection across tables
      if ((next.length + selectedImported.length) > 0) {
        setFormErrors((prev) => ({ ...prev, selectedCustomers: undefined }));
      }
      return next;
    });
  };

  // Toggle all customers on current page (preserve selections across pages)
  const toggleAllCustomers = () => {
    const pageIds = filteredData.map((customer) => customer._id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedCustomers.includes(id));
    setSelectedCustomers((prev) => {
      let next;
      if (allOnPageSelected) {
        // Deselect only the current page IDs
        next = prev.filter((id) => !pageIds.includes(id));
      } else {
        // Select union of previous + current page IDs
        next = Array.from(new Set([...prev, ...pageIds]));
      }
      if ((next.length + selectedImported.length) > 0) {
        setFormErrors((prevErr) => ({ ...prevErr, selectedCustomers: undefined }));
      }
      return next;
    });
  };

  // Toggle imported selections
  const toggleImportedSelection = (resolvedId) => {
    setSelectedImported((prev) => {
      const next = prev.includes(resolvedId)
        ? prev.filter((id) => id !== resolvedId)
        : [...prev, resolvedId];
      // Clear error if there is at least one selection across tables
      if ((selectedCustomers.length + next.length) > 0) {
        setFormErrors((prev) => ({ ...prev, selectedCustomers: undefined }));
      }
      return next;
    });
  };

  const toggleAllImported = () => {
    const allUnique = resolvableImportedIds;
    const allSelected = selectedImported.length === allUnique.length &&
      allUnique.every((id) => selectedImported.includes(id));
    const next = allSelected ? [] : allUnique;
    setSelectedImported(next);
    if ((selectedCustomers.length + next.length) > 0) {
      setFormErrors((prev) => ({ ...prev, selectedCustomers: undefined }));
    }
  };

  const getCampaignOptions = () => {
    switch (selectedCampaignType) {
      case "quiz":
        return quizActivities?.map((campaign) => ({
          value: campaign._id,
          label: campaign.campaignName,
        }));
      case "spinwheel":
        return spinWheelActivities?.map((campaign) => ({
          value: campaign._id,
          label: campaign.name,
        }));
      case "scratchcard":
        return scratchCardActivities?.map((campaign) => ({
          value: campaign._id,
          label: campaign.name,
        }));
      default:
        return [];
    }
  };

  // ===== Import Customers from Excel =====
  const acceptedColumns = [
    "_id","firstname","lastname","mobileNumber","gender","source","customerId","firstVisit","loyaltyPoints","additionalData","advancedDetails","advancedPrivacyDetails","createdAt","updatedAt","__v"
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const parseExcel = async (file) => {
    try {
      const data = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!rows.length) {
        showToast("No rows found in uploaded file", "warning");
        return;
      }
      const headers = Object.keys(rows[0]);
      // Keep only known columns; ignore extra columns
      const normalizedRows = rows.map((r) => {
        const obj = {};
        headers.forEach((h) => {
          if (acceptedColumns.includes(h)) obj[h] = r[h];
        });
        // Normalize potential header variants for ID/Phone/CustomerId
        if (!obj._id && (r.id || r.ID)) obj._id = r.id || r.ID;
        if (!obj.mobileNumber && (r.phone || r.phoneNumber || r.mobile)) obj.mobileNumber = r.phone || r.phoneNumber || r.mobile;
        if (!obj.customerId && (r.customerID || r.CustomerId)) obj.customerId = r.customerID || r.CustomerId;
        return obj;
      });
      setImportedHeaders(headers.filter((h) => acceptedColumns.includes(h)));
      setImportedRows(normalizedRows);

      // Resolve which customers map to existing ones → Prefer _id, then customerId, then mobileNumber
      const resolvedIds = [];
      const unresolved = [];
      for (const row of normalizedRows) {
        // If row already has _id, keep it
        if (row._id) {
          resolvedIds.push(row._id);
          continue;
        }
        // Try quick search by mobileNumber if present
        if (row.mobileNumber) {
          try {
            const res = await api.get("/api/customerQuickSearch", { params: { search: String(row.mobileNumber).trim() } });
            const found = res.data?.data?.customer?._id;
            if (found) {
              resolvedIds.push(found);
              continue;
            }
          } catch (e) {
            // ignore; we’ll mark unresolved
          }
        }
        // Try by customerId if present (backend must support it in quick search)
        if (row.customerId) {
          try {
            const res = await api.get("/api/customerQuickSearch", { params: { search: String(row.customerId).trim() } });
            const found = res.data?.data?.customer?._id;
            if (found) {
              resolvedIds.push(found);
              continue;
            }
          } catch (e) {}
        }
        unresolved.push(row);
      }
      const uniqueResolved = [...new Set(resolvedIds)];
      setResolvableImportedIds(uniqueResolved);
      setSelectedImported(uniqueResolved);
      setUnresolvedImports(unresolved);
      if (unresolved.length) {
        showToast(`${unresolved.length} row(s) could not be matched to existing customers`, "warning");
      } else {
        showToast(`Imported ${resolvedIds.length} customers`, "success");
      }
    } catch (err) {
      console.error("Failed to parse Excel:", err);
      showToast("Failed to parse Excel file", "error");
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcel(file);
    e.target.value = ""; // reset input
  };

  // Build merged selected customer IDs from list and import
  const buildMergedSelectedIds = () => {
    return [...new Set([
      ...selectedCustomers,
      ...selectedImported,
    ].filter(Boolean))];
  };

  // Pre-check before sending: call /api/customerOpportunities/check and show modal
  const handlePreCheckAndOpenModal = async () => {
    const errs = {};
    if (!selectedCampaignType) errs.selectedCampaignType = "Please select Activities Type";
    if (!selectedCampaign) errs.selectedCampaign = "Please select an activity from 'Select Activities'";

    const merged = buildMergedSelectedIds();
    if (!merged || merged.length === 0) {
      errs.selectedCustomers = "Please select at least one customer (from list or import).";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    try {
      setChecking(true);
      setCheckFilter("all");
      // Build opportunities payload
      const opportunities = merged.map((id) => ({ customerId: id, campaignId: selectedCampaign }));
      const resp = await api.post("/api/customerOpportunities/check", { opportunities });
      const rows = resp?.data?.data || [];
      setCheckResults(rows);
      setShowCheckModal(true);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to check already shared status", "error");
    } finally {
      setChecking(false);
    }
  };

  const handleSendCampaign = async () => {
    // Frontend validations -> show inline errors
    const newErrors = {};
    if (!selectedCampaignType) newErrors.selectedCampaignType = "Please select Activities Type";
    if (!selectedCampaign) newErrors.selectedCampaign = "Please select an activity from 'Select Activities'";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});

    // Recipients: merge only explicitly selected checkboxes (no fallback)
    const merged = [...new Set([
      ...selectedCustomers,
      ...selectedImported
    ].filter(Boolean))];

    const customerIds = merged;

    // Guard: must select at least one checkbox
    if (!customerIds || customerIds.length === 0) {
      setFormErrors({ selectedCustomers: "Please select at least one customer (from list or import)." });
      return;
    }

    try {
      setLoading(true);

      if (selectedCampaignType === "quiz") {
        // POST /api/quiz/share
        await api.post("/api/quiz/share", {
          quizId: selectedCampaign,
          customerIds: customerIds,
          frontendUrl: "https://app.vadik.ai",
        });
      } else if (selectedCampaignType === "spinwheel") {
        // POST /api/spinWheels/share/spinWheel
        await api.post("/api/spinWheels/share/spinWheel", {
          spinWheelId: selectedCampaign,
          customersIds: customerIds,
        });
      } else if (selectedCampaignType === "scratchcard") {
        // POST /api/scratchCards/share/scratchCard
        await api.post("/api/scratchCards/share/scratchCard", {
          scratchCardId: selectedCampaign,
          customersIds: customerIds,
        });
      } else {
        alert("Unsupported Activities Type selected");
        return;
      }
      showToast('Activities sent successfully!', 'success');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to send', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Activities selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Activities Type */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Activities Type</h3>
          <p className="text-gray-600 mb-4">What Kind of Activities Would You Like to Run?</p>
          <select
            value={selectedCampaignType}
            onChange={(e) => {
              setSelectedCampaignType(e.target.value);
              setSelectedCampaign("");
              setFormErrors((prev) => ({ ...prev, selectedCampaignType: undefined }));
            }}
            className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${formErrors.selectedCampaignType ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Activities Type</option>
            <option value="quiz">Quiz</option>
            <option value="spinwheel">Spin Wheel</option>
            <option value="scratchcard">Scratch Card</option>
          </select>
          {formErrors.selectedCampaignType && (
            <p className="text-red-600 text-sm mt-1">{formErrors.selectedCampaignType}</p>
          )}
        </div>

        {/* Select Activities */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Select Activities</h3>
          <p className="text-gray-600 mb-4">Select a Activities You've Already Created</p>
          <select
            value={selectedCampaign}
            onChange={(e) => {
              setSelectedCampaign(e.target.value);
              setFormErrors((prev) => ({ ...prev, selectedCampaign: undefined }));
            }}
            className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${formErrors.selectedCampaign ? 'border-red-500' : 'border-gray-300'}`}
            disabled={!selectedCampaignType}
          >
            <option value="">Select the campaign you created</option>
            {getCampaignOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.selectedCampaign && (
            <p className="text-red-600 text-sm mt-1">{formErrors.selectedCampaign}</p>
          )}
          {formErrors.selectedCustomers && (
            <p className="text-red-600 text-sm mt-1">{formErrors.selectedCustomers}</p>
          )}
        </div>
      </div>

      {/* Customer filter + list (FilterPanel in a popup) */}
      <div className="grid grid-cols-12 rounded-[20px] w-full">
        {/* Filters trigger + List Section */}
        <div className="col-span-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilterModal(true)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Select Customer
              </button>
               <button  className="px-4 py-2 border  text-blue-950 rounded-sm border-blue-950 flex items-center gap-2" onClick={handleImportClick}>
                  <Upload size={16} /> Import Customers
               </button>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept=".xlsx,.xls"
                 onChange={onFileChange}
                 className="hidden"
               />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Customers per page:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setCurrentPage(1); // reset to page 1 when page size changes
                }}
                className="px-2 py-1 border rounded-md text-sm"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                {pagination.total > 0 && (
                  <option value={pagination.total}>{pagination.total}</option>
                )}
              </select>
              <h1 className="text-xl font-semibold">Customer List ({pagination.total})</h1>
            </div>
          </div>

          {/* Imported customers preview table */}
          {importedRows.length > 0 && (
            <div className="mb-6 border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                <div className="text-sm text-gray-700 flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={toggleAllImported}
                      checked={resolvableImportedIds.length > 0 && selectedImported.length === resolvableImportedIds.length}
                    />
                    <span>Toggle All</span>
                  </label>
                  <span>
                    Matched: {selectedImported.length} / {resolvableImportedIds.length} (imported rows: {importedRows.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setImportedRows([]); setSelectedImported([]); setUnresolvedImports([]); setResolvableImportedIds([]); }} className="text-xs px-3 py-1 border rounded text-red-700">
                    Clear Import
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Select</th>
                      {importedHeaders.slice(0, 6).map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs uppercase text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {importedRows.slice(0, 50).map((row, idx) => {
                      const resolvedId = row._id; // after parse we keep _id if present
                      const isSelected = resolvedId && selectedImported.includes(resolvedId);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              disabled={!resolvedId}
                              checked={!!resolvedId && isSelected}
                              onChange={() => resolvedId && toggleImportedSelection(resolvedId)}
                            />
                          </td>
                          {importedHeaders.slice(0, 6).map((h) => (
                            <td key={`${idx}-${h}`} className="px-3 py-2 text-sm">{String(row[h] ?? "")}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {unresolvedImports.length > 0 && (
                <div className="px-4 py-2 text-sm text-amber-700 bg-amber-50 border-t">
                  {unresolvedImports.length} row(s) could not be resolved to existing customers. We can only send to existing customer IDs.
                </div>
              )}
            </div>
          )}

          <CustomerList
            customers={filteredData}
            loading={loading}
            selectedCustomers={selectedCustomers}
            toggleCustomerSelection={toggleCustomerSelection}
            toggleAllCustomers={toggleAllCustomers}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Popup for FilterPanel */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 min-h-[400px] max-h-[85vh] overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">Filter Customers</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            <div className="col-span-12 md:col-span-5 border-r min-h-[300px] pr-2">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                appliedFiltersCount={appliedFiltersCount}
                clearAllFilters={clearAllFilters}
                onFilteredDataChange={setFilteredData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pre-check Modal */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-slate-800">Already Shared Check</h3>
              <button
                onClick={() => setShowCheckModal(false)}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-gray-600">Filter:</label>
                <select
                  value={checkFilter}
                  onChange={(e) => setCheckFilter(e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm"
                >
                  <option value="all">All</option>
                  <option value="true">Already Shared: true</option>
                  <option value="false">Already Shared: false</option>
                </select>
                <span className="text-sm text-gray-600">Total: {checkResults.length}</span>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs uppercase text-gray-600">Customer ID</th>
                      <th className="px-3 py-2 text-left text-xs uppercase text-gray-600">Campaign ID</th>
                      <th className="px-3 py-2 text-left text-xs uppercase text-gray-600">Already Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {checkResults
                      .filter((r) => checkFilter === 'all' ? true : r.alreadyShared === (checkFilter === 'true'))
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs font-mono break-all">{row.customerId}</td>
                          <td className="px-3 py-2 text-xs font-mono break-all">{row.campaignId}</td>
                          <td className="px-3 py-2">{String(row.alreadyShared)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCheckModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  disabled={loading}
                  onClick={handleSendCampaign}
                  className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="flex justify-start">
        <button
          onClick={handlePreCheckAndOpenModal}
          className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-60"
          disabled={checking}
        >
          {checking ? 'Checking...' : 'Check & Send'}
        </button>
      </div>
    </div>
  );
};

export default PersonalizationCampaign;