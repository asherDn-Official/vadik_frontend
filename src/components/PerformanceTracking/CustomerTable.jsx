import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig";

const CustomerTable = () => {
  const [currentYearValue, setCurrentYearValue] = useState(0);
  const [futureYearValue, setFutureYearValue] = useState(0);
  const [clvList, setClvList] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [singleDate, setSingleDate] = useState(new Date());
  const [dateMode, setDateMode] = useState("single"); // "single" or "range"
  const [loading, setLoading] = useState(false);

  // Format currency to Indian Rupees
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date to YYYY-MM-DD for API
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch CLV data
  const fetchCLVData = async () => {
    setLoading(true);
    try {
      const params = {
        singleDate: formatDate(singleDate),
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      };

      const response = await api.get("api/performanceTracking/clvSummary", { 
        params: dateMode === "single" ? 
          { singleDate: params.singleDate } : 
          { startDate: params.startDate, endDate: params.endDate }
      });
      
      setCurrentYearValue(response.data.currentYearValue || 0);
      setFutureYearValue(response.data.futureBusinessValue || 0);
      setClvList(response.data.topCustomers || []);
    } catch (error) {
      console.error('Error fetching CLV data:', error);
      // Fallback to default data or empty state
      setClvList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCLVData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [startDate, endDate, singleDate, dateMode]);

  const handleDateModeChange = (mode) => {
    setDateMode(mode);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Header with Date Pickers */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Customer (CLV)
        </h3>
        
        {/* Date Mode Toggle */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => handleDateModeChange("single")}
            className={`px-3 py-1 text-sm rounded-md ${
              dateMode === "single"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Single Date
          </button>
          <button
            onClick={() => handleDateModeChange("range")}
            className={`px-3 py-1 text-sm rounded-md ${
              dateMode === "range"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Date Range
          </button>
        </div>

        {/* Date Pickers */}
        <div className="flex flex-col sm:flex-row gap-4">
          {dateMode === "single" ? (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <DatePicker
                selected={singleDate}
                onChange={(date) => setSingleDate(date)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  dateFormat="yyyy-MM-dd"
                  minDate={startDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Current Year Value</h4>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(currentYearValue)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <h4 className="text-sm font-medium text-green-800 mb-1">Future Business Value</h4>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(futureYearValue)}
          </p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : clvList.length > 0 ? (
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Customer Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Mobile
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
              {clvList.map((customer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    {customer.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {customer.mobile}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {formatCurrency(customer.currentValue)}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {formatCurrency(customer.futureValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No customer data available
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTable;