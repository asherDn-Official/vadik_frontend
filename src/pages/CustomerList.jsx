import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash.debounce";
import api from "../api/apiconfig";

const CustomerList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  const itemsPerPage = 6;
  const navigate = useNavigate();
  const searchTerm = searchParams.get("search") || "";

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        retailerId: retailerId,
        page: pagination.currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await api.get(
        `/api/customers?${queryParams}`
      );

      const data = await response.data;

      setCustomers(data.data);
      setPagination({
        totalItems: data.pagination.totalItems,
        totalPages: Math.ceil(data.pagination.totalItems / itemsPerPage),
        currentPage: data.pagination.currentPage,
      });
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search to avoid too many API calls while typing
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchParams(term ? { search: term } : {});
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    debouncedSearch(term);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleCustomerClick = (customerId) => {
    navigate(`customer-profile/${customerId}`);
  };

  const handleEditClick = (e, customerId) => {
    e.stopPropagation();
    navigate(`customer-profile/${customerId}`);
  };

  const handleAddNewCustomer = () => {
    navigate("/customers/add");
  }

  // Format Indian mobile numbers like "+91 98876 54323"
  const formatIndianMobile = (value) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, "");
    let country = "91";
    let local = "";
    if (digits.length >= 12 && digits.startsWith("91")) {
      country = "91";
      local = digits.slice(-10);
    } else if (digits.length === 10) {
      local = digits;
    } else if (digits.startsWith("0") && digits.length === 11) {
      local = digits.slice(1);
    } else if (digits.startsWith("91") && digits.length === 11) {
      local = digits.slice(-10);
    } else {
      local = digits.slice(-10) || digits;
    }
    const part1 = local.slice(0, 5);
    const part2 = local.slice(5, 10);
    return `+${country} ${part1}${part2 ? " " + part2 : ""}`;
  };

  if (error) {
    return (
      <div className="flex h-screen bg-[#F4F5F9] items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4F5F9]">
      <div className="flex-1 flex flex-col overflow-hidden m-2 rounded-[20px]">
        <div className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Customer List{" "}
              <span className="text-gray-500 font-normal">
                ({pagination.totalItems})
              </span>
            </h1>
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, mobile or source"
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                  className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button onClick={handleAddNewCustomer} className="ml-4 bg-[#313166] text-white px-4 py-2 rounded-md">
                Add New Customer
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="bg-white shadow-sm p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                {customers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No customers found
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr className="divide-x divide-gray-200">
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                          First Name
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Last Name
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Mobile Number
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr
                          key={customer._id}
                          className="hover:bg-gray-50 cursor-pointer divide-x divide-gray-200"
                          onClick={() => handleCustomerClick(customer._id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                            {customer.firstname}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                            {customer.lastname}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                            {formatIndianMobile(customer.mobileNumber)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                            {customer.source}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={(e) => handleEditClick(e, customer._id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>

        {!loading && customers.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#313166]">
                Showing{" "}
                {Math.min(
                  (pagination.currentPage - 1) * itemsPerPage + 1,
                  pagination.totalItems
                )}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} results
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 text-sm border rounded-md ${pagination.currentPage === 1
                    ? "bg-[#3131661A] cursor-not-allowed opacity-50"
                    : "bg-[#3131661A] hover:bg-gray-100"
                    }`}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md mx-1 ${pagination.currentPage === page
                        ? "bg-[#313166] text-white border-[#313166]"
                        : "bg-[#3131661A] text-[#313166] hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 text-sm border rounded-md ${pagination.currentPage === pagination.totalPages
                    ? "bg-[#3131661A] cursor-not-allowed opacity-50"
                    : "bg-[#3131661A] hover:bg-gray-100"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;