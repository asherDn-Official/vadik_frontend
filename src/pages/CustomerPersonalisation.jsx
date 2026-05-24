import React, { useEffect, useState, useRef } from "react";
import FilterPanel from "../../src/components/customerInsigth/FilterPanel";
import CustomerList from "../../src/components/customerInsigth/CustomerList";
import * as XLSX from "xlsx";
import api from "../api/apiconfig";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";

const CustomerPersonalisation = () => {
  const [filters, setFilters] = useState({});
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const dropdownRef = useRef(null);

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
      return Object.values(value).every(
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExport(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleExport = () => {
    // If customers are selected, export only those, otherwise export all filtered customers
    const dataToExport =
      selectedCustomers.length > 0
        ? filteredData.filter((customer) =>
            selectedCustomers.includes(customer._id),
          )
        : filteredData;

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "customers_export.xlsx");

    // Hide the export option after download
    setShowExport(false);
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
        <div className="app-panel grid grid-cols-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0 border-b border-gray-100 xl:border-b-0 xl:border-r">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              timeFilterMode="dateRange"
              appliedFiltersCount={appliedFiltersCount}
              clearAllFilters={clearAllFilters}
              onFilteredDataChange={setFilteredData}
            />
          </div>

          <div className="min-w-0 p-4 sm:p-5 lg:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h1 className="text-xl font-semibold text-[#313166]">
                Customer List ({pagination.total})
              </h1>

              <div className="relative flex flex-wrap items-center gap-3" ref={dropdownRef}>
                <VideoPopupWithShare
                  video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ"
                  buttonCss="flex items-center text-sm gap-2 px-4 py-2 text-gray-700 bg-white rounded hover:text-gray-500"
                />

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Per page:</label>
                  <select
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
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
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {showExport && (
                  <div className="absolute right-0 top-full z-40 mt-3 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                    <div
                      className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleExport}
                    >
                      {selectedCustomers.length > 0
                        ? "Export Selected"
                        : "Export All"}
                    </div>
                  </div>
                )}
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
