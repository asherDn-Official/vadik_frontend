import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PurchasedCustomerList from "./PurchasedCustomerList";
import DailyOrderSheet from "./DailyOrderSheet";
import { format, parseISO } from "date-fns";
import api from "../../api/apiconfig";

const DailyBillingUpdate = () => {
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "6856350030bcee9b82be4c13";
  });

  // Set default dates to current date
  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentView, setCurrentView] = useState("billing");
  const [selectedBillingData, setSelectedBillingData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
  });

  // Fetch billing data with date range
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare params object
      const params = {
        retailerId: "6856350030bcee9b82be4c13",
        page: pagination.page,
        limit: pagination.limit,
        ...(startDate && { startDate: startDate }),
        ...(startDate && { endDate: endDate }),
      };

      const response = await api.get(
        `https://app.vadik.ai/api/orderHistory/gross-total-by-date-range`,
        {
          params,
        }
      );

      console.log("Billing data response:", response.data);

      const formattedData = response.data.map((item, index) => ({
        id: index + 1,
        serial: String(
          index + 1 + (pagination.page - 1) * pagination.limit
        ).padStart(2, "0"),
        date: item.date,
        customers: item.noOfCustomers,
        sale: `₹ ${new Intl.NumberFormat("en-IN").format(item.totalSale)}`,
        dateForApi: item.date
          ? format(
              new Date(item.date.split("/").reverse().join("-")),
              "yyyy-MM-dd"
            )
          : format(new Date(), "yyyy-MM-dd"), // Fallback to current date or another default
      }));

      setBillingData(formattedData);

      // Calculate total pages based on data length and limit
      // Note: The API doesn't return pagination info, so we'll estimate
      // If you can modify the backend to return total count, that would be better
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(response.data.length / prev.limit),
        totalDocs: response.data.length,
      }));
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer details for a specific date
  const fetchCustomerDetails = async (date, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`https://app.vadik.ai/api/orderHistory`, {
        params: {
          retailerId: "6856350030bcee9b82be4c13",
          page,
          limit: 10,
          singleDate: date,
        },
      });

      console.log("Customer details response:", response.data.docs);

      const formattedCustomers = response?.data?.docs.map((doc) => ({
        id: doc._id,
        name: doc.customerName,
        mobile: doc.mobileNumber,
        orderId: doc.orderId,
        totalValue: doc?.orderSummary?.grandTotal,
        date: format(parseISO(doc.createdAt), "dd/MM/yyyy"),
        rawData: doc, // Store the full data for order sheet
      }));

      // Update the selected billing data with customers
      setSelectedBillingData((prev) => ({
        ...prev,
        customersList: formattedCustomers,
        pagination: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          hasNextPage: response.data.hasNextPage,
          hasPrevPage: response.data.hasPrevPage,
        },
      }));
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError("Failed to fetch customer details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === "billing") {
      fetchBillingData();
    }
  }, [startDate, endDate, pagination.page, currentView]);

  const handleViewDetails = async (billingData) => {
    setSelectedBillingData(billingData);
    setCurrentView("customers");
    await fetchCustomerDetails(billingData.dateForApi);
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView("orderSheet");
  };

  const handleBack = () => {
    if (currentView === "orderSheet") {
      setCurrentView("customers");
      setSelectedCustomer(null);
    } else if (currentView === "customers") {
      setCurrentView("billing");
      setSelectedBillingData(null);
    }
  };

  const handleNewOrder = () => {
    setSelectedCustomer(null);
    setCurrentView("orderSheet");
  };

  const handleReset = () => {

    console.log("Resetting filters...");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
      // If end date is before new start date, update end date to match
      if (value > endDate) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
      // If start date is after new end date, update start date to match
      if (value < startDate) {
        setStartDate(value);
      }
    }
    // Reset to first page when dates change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleCustomerPageChange = async (newPage) => {
    if (selectedBillingData) {
      await fetchCustomerDetails(selectedBillingData.dateForApi, newPage);
    }
  };

  if (currentView === "customers" && selectedBillingData) {
    return (
      <PurchasedCustomerList
        billingData={selectedBillingData}
        onBack={handleBack}
        onCustomerClick={handleCustomerClick}
        onPageChange={handleCustomerPageChange}
        loading={loading}
        error={error}
      />
    );
  }

  if (currentView === "orderSheet") {
    return (
      <DailyOrderSheet
        customer={selectedCustomer}
        onBack={handleBack}
        onNewOrder={handleNewOrder}
        retailerId={retailerId}
      />
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Daily Billing Update
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                max={endDate}
                className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <Calendar
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
            <span className="text-gray-500 mx-1">to</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                min={startDate}
                className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <Calendar
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors whitespace-nowrap">
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={handleNewOrder}
              className="flex items-center gap-2 px-4 py-2 border border-pink-600 text-pink-600 rounded-md hover:bg-pink-50 transition-colors whitespace-nowrap"
            >
              <FileText size={16} />
              Create Order
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      S. no
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      No. Of Customers
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      Total Sale
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billingData.length > 0 ? (
                    billingData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {item.serial}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {item.customers}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                          {item.sale}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No billing data found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {billingData.length > 0 && (
              <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-md ${
                      pagination.page === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-md ${
                      pagination.page === pagination.totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailyBillingUpdate;
