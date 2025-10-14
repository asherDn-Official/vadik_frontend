import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig";

const CustomerTable = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [singleDate, setSingleDate] = useState(null);
  const [dateMode, setDateMode] = useState("single"); // "single" or "range"

  // Format currency for Indian Rupees
  const formatRupee = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      
      if (dateMode === "single" && singleDate) {
        params.singleDate = singleDate.toISOString().split('T')[0];
      } else if (dateMode === "range" && startDate && endDate) {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }

      const response = await api.get("/api/performanceTracking/clvSummary", {
        params
      });
      
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or date selection changes
  useEffect(() => {
    fetchData();
  }, []);

  const handleSingleDateSelect = (date) => {
    setSingleDate(date);
    setStartDate(null);
    setEndDate(null);
  };

  const handleDateRangeSelect = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setSingleDate(null);
  };

  const handleSearch = () => {
    fetchData();
  };

  // Format table data from API response
  const tableData = data?.topCustomers?.map(customer => ({
    name: customer.name,
    currentValue: formatRupee(customer.currentValue),
    futureValue: formatRupee(customer.futureValue)
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Customer (CLV)
        </h3>
        
        {/* Date Selection Controls */}
        <div className="flex items-center flex-col space-y-3 space-x-4">
          {/* Date Mode Toggle */}
          <div className="flex space-x-2">
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md ${
                dateMode === "single" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setDateMode("single")}
            >
              Single Date
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md ${
                dateMode === "range" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setDateMode("range")}
            >
              Date Range
            </button>
          </div>

          {/* Date Pickers */}
          <div className="flex items-center space-x-2">
            {dateMode === "single" ? (
              <DatePicker
                selected={singleDate}
                onChange={handleSingleDateSelect}
                selectsSingle
                placeholderText="Select date"
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                dateFormat="yyyy-MM-dd"
              />
            ) : (
              <DatePicker
                selected={startDate}
                onChange={handleDateRangeSelect}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                placeholderText="Select date range"
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                dateFormat="yyyy-MM-dd"
              />
            )}
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {/* {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Current Year Value</h4>
            <p className="text-xl font-bold text-blue-900">{formatRupee(data.currentYearValue)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Future Business Value</h4>
            <p className="text-xl font-bold text-green-900">{formatRupee(data.futureBusinessValue)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Total Customers</h4>
            <p className="text-xl font-bold text-purple-900">{data.totalCustomers}</p>
          </div>
        </div>
      )} */}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Customer Table */}
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
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {customer.currentValue}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {customer.futureValue}
                  </td>
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

      {/* Campaign Summary (Optional) */}
      {/* {data?.campaignSummary && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Campaign Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.campaignSummary).map(([campaign, stats]) => (
              <div key={campaign} className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-800 capitalize mb-2">
                  {campaign.replace(/([A-Z])/g, ' $1')}
                </h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Sent: {stats.sent}</div>
                  <div>Opened: {stats.opened}</div>
                  <div>Completed: {stats.completed}</div>
                  <div>Coupon Issued: {stats.couponIssued}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default CustomerTable;