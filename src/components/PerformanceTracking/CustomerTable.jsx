import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};

        if (startDate && endDate) {
          params.startDate = formatDate(startDate);
          params.endDate = formatDate(endDate);
        } else if (startDate) {
          params.singleDate = formatDate(startDate);
        }

        const response = await api.get("/api/performanceTracking/clvSummary", {
          params,
        });

        if (!isCancelled) {
          setData(response.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Failed to fetch data. Please try again.");
          console.error("API Error:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 1000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDateRange([null, null]);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

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

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-500" />
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full sm:w-64"
            placeholderText="Select date range"
            dateFormat="dd/MM/yyyy"
          />
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