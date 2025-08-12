import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import FilterPanel from "../customerInsigth/FilterPanel";
import CustomerList from "../customerInsigth/CustomerList";
import api from "../../api/apiconfig";

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


  

  // Fetch activities data on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch quiz activities
        const quizResponse = await api.get("/api/quiz");
        setQuizActivities(quizResponse.data);
        
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
    setSelectedCustomers((prevSelected) =>
      prevSelected.includes(customerId)
        ? prevSelected.filter((id) => id !== customerId)
        : [...prevSelected, customerId]
    );
  };

  // Toggle all customers on current page
  const toggleAllCustomers = () => {
    const allCurrentPageCustomerIds = filteredData.map((customer) => customer._id);
    if (
      selectedCustomers.length === filteredData.length &&
      selectedCustomers.every((id) => allCurrentPageCustomerIds.includes(id))
    ) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(allCurrentPageCustomerIds);
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

  const handleSendCampaign = async () => {
    // Validations
    if (!selectedCampaignType) {
      alert("Please select Activities Type");
      return;
    }

    if (!selectedCampaign) {
      alert("Please select an activity from 'Select Activities'");
      return;
    }

    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    // Optional: keep send method validation if required
    // if (!sendByWhatsapp && !sendByEngageBird) {
    //   alert("Please select at least one sending method");
    //   return;
    // }

    const customerIds = selectedCustomers; // array of _id from /api/personilizationInsights

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

      alert("Activities sent successfully!");
    } catch (error) {
      console.error("Error sending activities:", error);
      alert(
        error?.response?.data?.message || "Failed to send activities. Please try again."
      );
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
            }}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          >
            <option value="">Select Activities Type</option>
            <option value="quiz">Quiz</option>
            <option value="spinwheel">Spin Wheel</option>
            <option value="scratchcard">Scratch Card</option>
          </select>
        </div>

        {/* Select Activities */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Select Activities</h3>
          <p className="text-gray-600 mb-4">Select a Activities You've Already Created</p>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            disabled={!selectedCampaignType}
          >
            <option value="">Select the campaign you created</option>
            {getCampaignOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

      {/* Send Button */}
      <div className="flex justify-start">
        <button
          onClick={handleSendCampaign}
          className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Send Activities
        </button>
      </div>
    </div>
  );
};

export default PersonalizationCampaign;