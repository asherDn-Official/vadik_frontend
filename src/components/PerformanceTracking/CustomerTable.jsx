import React, { useCallback, useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig";

const CustomerTable = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateRangeChange = (update) => {
    const [newStart, newEnd] = update;
    const validStart = newStart && newStart > today ? today : newStart;
    let validEnd = newEnd && newEnd > today ? today : newEnd;
    if (validStart && validEnd && validEnd < validStart) {
      validEnd = validStart;
    }
    setDateRange([validStart || null, validEnd || null]);
  };

  const formatRupee = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchCustomerData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/performanceTracking/clvSummary", {
        params,
      });

      setData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle date range change with clear detection
  const handleDateRangeChangeWithClear = (update) => {
    const [newStart, newEnd] = update;
    
    // If both dates are cleared, fetch initial data immediately
    if (!newStart && !newEnd) {
      setDateRange([null, null]);
      // Fetch data without any date filters
      fetchCustomerData();
      return;
    }
    
    handleDateRangeChange(update);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerData();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchCustomerData]);

  const handleApplyFilters = () => {
    const params = {};

    if (startDate && endDate) {
      params.startDate = formatDate(startDate);
      params.endDate = formatDate(endDate);
    } else if (startDate) {
      params.singleDate = formatDate(startDate);
    }

    fetchCustomerData(params);
  };

  const handleClearFilters = () => {
    setDateRange([null, null]);
    fetchCustomerData();
  };

  const isFilterActive = Boolean(startDate || endDate);

  const tableData =
    data?.topCustomers?.map((customer) => ({
      name: customer.name,
      currentValue: formatRupee(customer.currentValue),
      futureValue: formatRupee(customer.futureValue),
    })) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Customer (CLV)</h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChangeWithClear}
              isClearable
              maxDate={today}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full sm:w-64"
              placeholderText="Select date range"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          {isFilterActive && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex items-center justify-center rounded-md bg-pink-600 px-4 py-1.5 text-white font-semibold hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Apply Filter
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-1.5 text-gray-700 font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto max-h-120 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Customer Name
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Current Value
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Future Value (CLV)
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : tableData.length > 0 ? (
              tableData.map((customer, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-700">{customer.currentValue}</td>
                  <td className="py-3 px-4 text-gray-700">{customer.futureValue}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  No customer data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;