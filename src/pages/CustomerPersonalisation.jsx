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
    const allCurrentPageCustomerIds = filteredData.map(
      (customer) => customer._id,
    );
    if (
      selectedCustomers.length === filteredData.length &&
      selectedCustomers.every((id) => allCurrentPageCustomerIds.includes(id))
    ) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(allCurrentPageCustomerIds);
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
                <p className="mt-1 text-sm text-[#7E85A8]">
                  {pagination.total} profiles match the current personalisation filters.
                </p>
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
                    {[10, 20, 30, pagination.total].map((size) => (
                      <option key={size} value={size}>
                        {size === pagination.total ? "All" : size}
                      </option>
                    ))}
                  </select>
                </div>

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
      </div>
    </div>
  );
};

export default CustomerPersonalisation;
