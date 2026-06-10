import React, { useEffect, useState } from "react";
import FilterPanel from "../components/customerInsigth/FilterPanel";
import CustomerList from "../components/customerInsigth/CustomerList";
import api from "../api/apiconfig";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";

const CustomerPersonalisation = () => {
  const [filters, setFilters] = useState({});
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const hasFilterValue = (value) => {
    if (value === "" || value === null || value === undefined) {
      return false;
    }

    if (typeof value === "object") {
      return Object.values(value).some(
        (nestedValue) =>
          nestedValue !== "" &&
          nestedValue !== null &&
          nestedValue !== undefined,
      );
    }

    return true;
  };

  // Fetch customer data with filters and pagination
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Prepare filters array - exclude period-related filters
      const filtersArray = Object.entries(filters)

        .filter(([name, value]) => {
          // Exclude date range fields because they are sent as top-level payload values
          return (
            hasFilterValue(value) &&
            name !== "periodValue" &&
            name !== "fromDate" &&
            name !== "toDate"
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

      // Prepare the request payload
      const payload = {
        page: currentPage,
        limit: pagination.limit,
        filters: filtersArray.length > 0 ? filtersArray : undefined,
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
      };

      // Remove undefined parameters
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      // console.log('API Payload:', payload);

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
  }, [currentPage, filters, pagination.limit]);

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  const selectAllMatching = async () => {
    try {
      setLoading(true);
      const filtersArray = Object.entries(filters)
        .filter(([name, value]) => {
          return (
            hasFilterValue(value) &&
            name !== "periodValue" &&
            name !== "fromDate" &&
            name !== "toDate"
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
        page: 1,
        limit: 10000,
        filters: filtersArray.length > 0 ? filtersArray : undefined,
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
      };

      const response = await api.post("/api/personilizationInsights", payload);
      const allMatchingIds = response.data.data
        .filter(c => c.isOptedIn === true)
        .map(c => c._id);
      
      setSelectedCustomers(allMatchingIds);
      // alert(`Selected all ${allMatchingIds.length} matching customers`);
    } catch (error) {
      console.error("Error selecting all matching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Calculate applied filters count (exclude legacy periodValue only)
      const count = Object.entries(newFilters).filter(
        ([k, v]) => k !== "periodValue" && hasFilterValue(v),
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
        : [...prevSelected, customerId],
    );
  };

  // Toggle all customers on current page
  const toggleAllCustomers = () => {
    const enabledCustomers = filteredData.filter(c => c.isOptedIn === true);
    const enabledIds = enabledCustomers.map(c => c._id);
    
    const allEnabledOnPageSelected = enabledIds.length > 0 && enabledIds.every(id => selectedCustomers.includes(id));

    if (allEnabledOnPageSelected) {
      setSelectedCustomers(prev => prev.filter(id => !enabledIds.includes(id)));
    } else {
      setSelectedCustomers(prev => {
        const newSelected = [...prev];
        enabledIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  return (
    <div className="app-page">
      <div className="app-page-shell">
        <div className="app-panel grid grid-cols-1 overflow-visible p-0 xl:h-[calc(100dvh-132px)] xl:grid-cols-[320px_minmax(0,1fr)] xl:overflow-hidden 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="min-w-0 border-b border-gray-100 bg-white xl:min-h-0 xl:border-b-0 xl:border-r xl:overflow-hidden">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              timeFilterMode="dateRange"
              appliedFiltersCount={appliedFiltersCount}
              clearAllFilters={clearAllFilters}
              onFilteredDataChange={setFilteredData}
            />
          </div>

          <div className="min-w-0 bg-[#FCFCFF] p-4 sm:p-5 lg:p-6 xl:min-h-0 xl:overflow-y-auto">
            <div className="mb-5 flex flex-col gap-4 xl:mb-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#313166]">
                  Customer List
                </h2>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-sm text-[#7E85A8]">
                    {pagination.total} profiles match the current personalisation filters.
                  </p>
                  {selectedCustomers.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-[1px] bg-gray-200"></span>
                      <span className="text-sm font-semibold text-[#313166]">
                        {selectedCustomers.length} Selected
                      </span>
                      {pagination.total > 0 && selectedCustomers.length < pagination.total && (
                        <button 
                          onClick={selectAllMatching}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
                        >
                          Select All Matching ({pagination.total})
                        </button>
                      )}
                      <button 
                        onClick={clearSelection}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-wrap items-center gap-3">
                <VideoPopupWithShare
                  video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ"
                  buttonCss="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E4E8F6] bg-white px-4 text-sm font-medium text-[#313166] shadow-sm transition hover:bg-[#F8F9FF]"
                />

                <div className="flex h-11 items-center gap-2 rounded-xl border border-[#E4E8F6] bg-white px-3 shadow-sm">
                  <label className="text-sm font-medium text-[#5C628B]">Per page</label>
                  <select
                    className="rounded-lg border border-[#E4E8F6] bg-[#F8F9FF] px-3 py-2 text-sm font-medium text-[#313166] outline-none transition focus:border-[#313166]/20"
                    value={pagination.limit}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value, 10);
                      setPagination((prev) => ({
                        ...prev,
                        limit: newLimit,
                        page: 1,
                      }));
                      setCurrentPage(1);
                    }}
                  >
                    {[10, 20, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            <div className="mb-4">
              {(() => {
                const enabledOnPage = filteredData.filter(c => c.isOptedIn === true);
                const enabledIdsOnPage = enabledOnPage.map(c => c._id);
                const allOnPageSelected = enabledIdsOnPage.length > 0 && enabledIdsOnPage.every(id => selectedCustomers.includes(id));
                const hasMoreToSelect = pagination.total > enabledOnPage.length && selectedCustomers.length < pagination.total;

                if (allOnPageSelected && hasMoreToSelect) {
                  return (
                    <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-center animate-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-indigo-700 font-medium">
                        All {enabledOnPage.length} customers on this page are selected. 
                        <button 
                          onClick={selectAllMatching}
                          className="ml-2 font-bold underline hover:text-indigo-900"
                        >
                          Select all {pagination.total} matching customers
                        </button>
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
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
      </div>
    </div>
  );
};

export default CustomerPersonalisation;
