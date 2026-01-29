import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash.debounce";
import api from "../api/apiconfig";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";
import BulkImportModal from "../components/customerProfile/BulkImportModal";
import { formatIndianMobile } from "../components/customerProfile/formatIndianMobile";

const CustomerList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soon, setSoon] = useState();
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  const itemsPerPage = 10;
  const navigate = useNavigate();
  const searchTerm = searchParams.get("search") || "";
  const [source, setSource] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        retailerId: retailerId,
        page: pagination.currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(source && { source: source }),
      });

      const response = await api.get(`/api/customers?${queryParams}`);

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
  }, [pagination.currentPage, searchTerm, source]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetch("/assets/Comingsoon.json")
      .then((res) => res.json())
      .then(setSoon)
      .catch(console.error);
  }, []);

  // Debounced search to avoid too many API calls while typing
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchParams(term ? { search: term } : {});
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 500),
    [],
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
  };

  if (error) {
    return (
      <div className="flex h-screen bg-[#F4F5F9] items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const handleBulkSuccess = (message) => {
    setSuccessMessage(message);
    fetchCustomers();
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F9]">
      <div className="flex-1 flex flex-col overflow-hidden m-2 rounded-[20px]">
        <div className="bg-white shadow-sm p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Customer List{" "}
              <span className="text-gray-500 font-normal">
                ({pagination.totalItems})
              </span>
            </h1>
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <VideoPopupWithShare
                // video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ?si=JGtmQtyRIt_K6Dt5"
                animationData={soon}
                buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
              />
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by name, mobile or source"
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
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
              <div>
                <select
                  name=""
                  id=""
                  className="py-2 border px-5 border-gray-300 rounded-lg outline-none w-full sm:w-auto"
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="">select source</option>
                  <option value="walk-in">walkin</option>
                  <option value="website">website</option>
                  <option value="social-media">social-media</option>
                  <option value="others">others</option>
                </select>
              </div>
              <button
                onClick={() => setShowBulkImport(true)}
                className="w-full sm:w-auto bg-white border border-[#313166] text-[#313166] px-4 py-2 rounded-md"
              >
                Bulk Import
              </button>

              <button
                onClick={handleAddNewCustomer}
                className="w-full sm:w-auto sm:ml-2 bg-[#313166] text-white px-4 py-2 rounded-md"
              >
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr className="">
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
                            className="hover:bg-gray-50 cursor-pointer  divide-gray-200"
                            onClick={() => handleCustomerClick(customer._id)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                              {customer.firstname}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                              {customer.lastname || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                              {(customer.countryCode + " ").concat(
                                customer.mobileNumber,
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                              {customer.source}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166] text-center">
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={(e) =>
                                  handleEditClick(e, customer._id)
                                }
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {!loading && customers.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[#313166]">
                Showing{" "}
                {Math.min(
                  (pagination.currentPage - 1) * itemsPerPage + 1,
                  pagination.totalItems,
                )}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * itemsPerPage,
                  pagination.totalItems,
                )}{" "}
                of {pagination.totalItems} results
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    pagination.currentPage === 1
                      ? "bg-[#3131661A] cursor-not-allowed opacity-50"
                      : "bg-[#3131661A] hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      pagination.currentPage === page
                        ? "bg-[#313166] text-white border-[#313166]"
                        : "bg-[#3131661A] text-[#313166] hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    pagination.currentPage === pagination.totalPages
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
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
};

export default CustomerList;
