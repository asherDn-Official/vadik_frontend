import React, { useEffect, useState, useRef } from "react";
import FilterPanel from "../../src/components/customerInsigth/FilterPanel";
import CustomerList from "../../src/components/customerInsigth/CustomerList";
import * as XLSX from "xlsx";
import api from "../api/apiconfig";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";

const CustomerPersonalisation = () => {
  const [filters, setFilters] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const dropdownRef = useRef(null);
  const [soon, setSoon] = useState()


   useEffect(() => {
        fetch("/assets/Comingsoon.json")
            .then((res) => res.json())
            .then(setSoon)
            .catch(console.error)

    }, []);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

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
        .map(([name, value]) => ({
          name,
          value: typeof value === "string" ? value.trim() : value,
        }));

      // Prepare the request payload
      const payload = {
        page: currentPage,
        limit: pagination.limit,
        filters: filtersArray.length > 0 ? filtersArray : undefined,
        // Period filters (handled separately)
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
      // Calculate applied filters count (exclude periodValue)
      const count = Object.entries(newFilters).filter(
        ([k, v]) => k !== "periodValue" && v !== undefined && v !== ""
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
            selectedCustomers.includes(customer._id)
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
        : [...prevSelected, customerId]
    );
  };

  // Toggle all customers on current page
  const toggleAllCustomers = () => {
    const allCurrentPageCustomerIds = filteredData.map(
      (customer) => customer._id
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
    <div className="p-2">
      <div className="grid grid-cols-12 bg-white rounded-[20px]">
        {/* Filters Section */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
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

        {/* Customer List Section */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                Customer List ({pagination.total})
              </h1>
            </div>
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <VideoPopupWithShare
                  // video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ?si=JGtmQtyRIt_K6Dt5"
                  animationData={soon}
                  buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
                />

              {/* Per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Per page:</label>
                <select
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
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
{/* 
              <button
                className="px-4 bg-[#3131661A] py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setShowExport(!showExport)}
              >
                Action
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button> */}

              {showExport && (
                <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-lg  z-40 border border-gray-200">
                  <div
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
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
  );
};

export default CustomerPersonalisation;
