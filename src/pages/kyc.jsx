import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiFilter, FiX } from "react-icons/fi";
import api from "../api/apiconfig";
import showToast from "../utils/ToastNotification";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { Search, SearchX } from "lucide-react";


const KYCPage = () => {
  const [searchType, setSearchType] = useState("phone");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    productName: ""
  });

  const searchOptions = [
    { key: "phone", label: "Phone" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "customerId", label: "Vadik Id" }
  ];

  const { register, handleSubmit, formState: { errors }, reset, setValue, clearErrors } = useForm({ mode: "onChange" });

  const getValidationRules = () => {
    switch (searchType) {
      case "phone":
        return {
          required: "Phone is required",
          pattern: { value: /^[0-9]+$/, message: "Only numbers allowed" },
        };
      case "name":
        return {
          required: "Name is required",
          pattern: { value: /^[A-Za-z ]+$/, message: "Only letters and spaces" },
          maxLength: { value: 15, message: "Max length 15" },
        };
      case "email":
        return {
          required: "Email is required",
          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
        };
      case "customerId":
        return {
          required: "Customer ID is required",
          pattern: { value: /^VID-[A-Z0-9]{8}$/, message: "Format VID-XXXXXXXX with uppercase letters and digits" },
          maxLength: { value: 12, message: "Max length 12" }
        };
      default:
        return {};
    }
  };

  const onSubmit = (data) => {
    setSearchQuery(data.query);
    setHasSearched(true);
    handleSearch(data.query, searchType);
  };

  // Debounced auto-search on change
  useEffect(() => {
    const q = searchQuery?.trim();
    if (!q) return; // only when there is something
    const id = setTimeout(() => {
      setHasSearched(true);
      handleSearch(q, searchType);
    }, 500);
    return () => clearTimeout(id);
  }, [searchQuery, searchType]);

  const handleSearch = async (query, type) => {
    if (!query.trim()) {
      showToast("Please enter a search query", "warning");
      return;
    }

    setSearchType(type);
    setSearchQuery(query);
    setCurrentPage(1);
    fetchCustomerData(query);
  };

  const fetchCustomerData = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/customerQuickSearch", {
        params: {
          search: query,
          page: currentPage,
          limit: itemsPerPage,
        }
      });

      const { customer, statistics, orderHistory } = response.data.data || {};
      if (!customer) {
        setCustomerData(null);
        setStatistics(null);
        setOrderHistory([]);
        setTotalPages(1);
        setError("Customer not found for this retailer");
        return;
      }
      setError(null);
      setCustomerData(customer);
      setStatistics(statistics);
      setOrderHistory(orderHistory.orders);
      setTotalPages(orderHistory.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setCustomerData(null);
      setStatistics(null);
      setOrderHistory([]);
      setTotalPages(1);
      setError("Customer not found for this retailer");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchCustomerData(searchQuery);
  };

  const clearFilters = () => {
    setFilters({
      minAmount: "",
      maxAmount: "",
      dateFrom: "",
      dateTo: "",
      productName: ""
    });
    fetchCustomerData(searchQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  function formatPhone(raw) {
    if (!raw && raw !== "") return "";

    // remove non-digits
    const digits = String(raw).replace(/\D+/g, "");

    // if digits empty
    if (!digits) return "";

    // decide country code length:
    // If total length > 10, assume country code exists. Use upto 3 digits for CC.
    let country = "";
    let national = digits;

    if (digits.length > 10) {
      // pick country code as digits.length - 10 (so last 10 digits become national)
      // but clamp to 1..3
      const ccLen = Math.min(3, Math.max(1, digits.length - 10));
      country = digits.slice(0, ccLen);
      national = digits.slice(ccLen);
    }

    // split national into two groups for display
    let left, right;
    if (national.length >= 10) {
      // prefer 5 + rest (like the example)
      left = national.slice(0, 5);
      right = national.slice(5);
    } else if (national.length > 1) {
      const mid = Math.ceil(national.length / 2);
      left = national.slice(0, mid);
      right = national.slice(mid);
    } else {
      left = national;
      right = "";
    }

    const countryPart = country ? `${country}+ ` : "";
    const rightPart = right ? ` ${right}` : "";

    // Normalize spaces (if you want the double space in your example, change below)
    return `${countryPart}${left}${rightPart}`.replace(/\s+/g, " ");
  }

  useEffect(() => {
    if (searchQuery) {
      fetchCustomerData(searchQuery);
    }
  }, [currentPage, itemsPerPage]);

  const filteredOrders = orderHistory.filter(order => {
    // Apply filters
    if (filters.minAmount && order.orderSummary.grandTotal < parseFloat(filters.minAmount)) {
      return false;
    }
    if (filters.maxAmount && order.orderSummary.grandTotal > parseFloat(filters.maxAmount)) {
      return false;
    }
    if (filters.dateFrom && new Date(order.createdAt) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(order.createdAt) > new Date(filters.dateTo)) {
      return false;
    }
    if (filters.productName &&
      !order.products.some(p =>
        p.productName.toLowerCase().includes(filters.productName.toLowerCase())
      )) {
      return false;
    }
    return true;
  });

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="p-8">
      <h1 className="text-[#313166] font-bold text-xl mb-6">Quick Search</h1>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {searchOptions.map(option => (
            <button
              key={option.key}
              onClick={() => {
                setSearchType(option.key);
                reset({ query: "" });
                clearErrors("query");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-full capitalize ${searchType === option.key
                ? "bg-[#313166] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form className="flex gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex-1">
            <input
              type={searchType === "email" ? "email" : "text"}
              inputMode={searchType === "phone" ? "numeric" : undefined}
              maxLength={searchType === "name" ? 15 : searchType === "customerId" ? 12 : undefined}
              placeholder={`Search by ${searchType}...`}
              {...register("query", getValidationRules())}
              onChange={(e) => {
                let value = e.target.value;
                if (searchType === "phone") {
                  value = value.replace(/\D/g, "");
                }
                if (searchType === "customerId") {
                  value = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                }
                setValue("query", value, { shouldValidate: true });
                setSearchQuery(value);
              }}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.query ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.query && (
              <p className="text-red-600 text-sm mt-1">{errors.query.message}</p>
            )}
          </div>
          {/* <button
            type="submit"
            className="px-6 py-3 bg-[#313166] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button> */}
        </form>
      </div>

      {loading && <SkeletonLoader />}

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <SearchX className="w-5 h-5 text-red-700" />
          <div className="text-red-700">Customer not found for this retailer</div>
        </div>
      )}

      {!hasSearched && !loading && !customerData && (
        <div className="bg-white rounded-lg shadow-sm p-10 mb-6 text-center text-gray-500">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p>Start by searching a customer using phone, name, or email.</p>
        </div>
      )}

      {customerData && !loading && (
        <>
          {/* Customer Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-r border-gray-200 pr-6">
                <h2 className="text-lg font-semibold text-[#313166] mb-4">Customer Details</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{customerData.firstname} {customerData.lastname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{formatPhone(customerData.mobileNumber)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer ID</p>
                    <p className="font-medium">{customerData.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">First Visit</p>
                    <p className="font-medium">
                      {formatDate(customerData.firstVisit)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-r border-gray-200 pr-6">
                <h2 className="text-lg font-semibold text-[#313166] mb-4">Shopping Statistics</h2>
                {statistics ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Visits</p>
                      <p className="font-medium">{statistics.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Spend</p>
                      <p className="font-medium">₹{statistics.totalSpend.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg. Purchase</p>
                      <p className="font-medium">₹{statistics.averagePurchase.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Highest Purchase</p>
                      <p className="font-medium">₹{statistics.highestPurchase.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <p>No statistics available</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#313166] mb-4">Favorites</h2>
                {statistics?.mostPurchasedProduct ? (
                  <div>
                    <p className="text-sm text-gray-500">Most Purchased Product</p>
                    <p className="font-medium">
                      {statistics.mostPurchasedProduct.name}
                      (x{statistics.mostPurchasedProduct.quantity})
                    </p>
                  </div>
                ) : (
                  <p>No favorite products</p>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <FiFilter className="mr-2" />
                Filters
                {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    name="minAmount"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    placeholder="₹0"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="₹10000"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <DatePicker
                    selected={
                      filters.dateFrom ? new Date(filters.dateFrom) : null
                    }
                    onChange={(date) => {
                      const formatted = date
                        ? new Intl.DateTimeFormat("en-GB").format(date) // dd/MM/yyyy
                        : "";
                      setFilters((prev) => ({ ...prev, dateFrom: formatted }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    maxDate={new Date()}
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <DatePicker
                    selected={
                      filters.dateTo ? new Date(filters.dateTo) : null
                    }
                    onChange={(date) => {
                      const formatted = date
                        ? new Intl.DateTimeFormat("en-GB").format(date) // dd/MM/yyyy
                        : "";
                      setFilters((prev) => ({ ...prev, dateTo: formatted }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    maxDate={new Date()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    value={filters.productName}
                    onChange={handleFilterChange}
                    placeholder="Search products..."
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-[#313166] text-white rounded-lg hover:bg-gray-800"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order History Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[#313166] mb-4">Order History</h2>

              {filteredOrders.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderId}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex flex-wrap gap-1">
                                {order.products.map((product, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                  >
                                    {product.productName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.products.reduce((sum, product) => sum + product.quantity, 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{order.orderSummary.grandTotal.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${order.orderSummary.paymentStatus === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {order.orderSummary.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPage === pageNum
                              ? "bg-[#313166] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {totalPages > 5 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiX className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-4">
                    This customer doesn't have any orders matching your filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 bg-[#313166] text-white rounded-lg hover:bg-[#252451] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(3)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-gray-200 rounded-full"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
);


export default KYCPage;
