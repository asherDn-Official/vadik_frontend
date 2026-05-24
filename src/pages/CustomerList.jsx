import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash.debounce";
import Select from "react-select";
import api from "../api/apiconfig";
import { FiUsers } from "react-icons/fi";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";
import BulkImportModal from "../components/customerProfile/BulkImportModal";
import { formatIndianMobile } from "../components/customerProfile/formatIndianMobile";

import Loader from "../utils/Loader";

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
  const totalSize = 10;
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
      setError("Failed to fetch customers");
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

  let startPage = Math.max(
    1,
    pagination.currentPage - Math.floor(totalSize / 2),
  );

  let endPage = startPage + totalSize - 1;

  if (endPage > pagination.totalPages) {
    endPage = pagination.totalPages;
    startPage = Math.max(1, endPage - totalSize + 1);
  }

  const paginationPages = useMemo(() => {
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  }, [startPage, endPage]);

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

  const sourceOptions = [
    { value: "", label: "All Sources" },
    { value: "walk-in", label: "Walk In" },
    { value: "website", label: "Website" },
    { value: "social-media", label: "Social Media" },
    { value: "others", label: "Others" },
  ];

  return (
    <div className="app-page">
      <div className="app-page-shell">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="space-y-4">
          {/* Top Header */}
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#1F1C5C]">
                Customer Directory
              </h1>

              <p className="mt-2 text-sm text-[#8B90B2]">
                Manage customer profiles, engagement records and customer
                insights
              </p>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleAddNewCustomer}
              className="
                h-12 rounded-2xl
                bg-[#313166]
                px-5
                text-sm font-medium text-white
                transition-all duration-200
                hover:scale-[1.02]
                hover:bg-[#272757]
                shadow-[0_8px_24px_rgba(49,49,102,0.18)]
              "
            >
              Add New Customer
            </button>
          </div>

          {/* Filters Row */}
          <div
            className="
              mt-6
              rounded-2xl
              border border-[#EEF1FF]
              bg-white/95
              p-3
              shadow-[0_4px_20px_rgba(49,49,102,0.06)]
              backdrop-blur-sm
            "
          >
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
              {/* Left Side */}
              <div className="flex flex-1 flex-col gap-3 xl:flex-row">
                {/* Search */}
                <div
                  className="
                    group

                    flex h-12 flex-1 items-center

                    rounded-2xl

                    border border-[#E7EBFA]

                    bg-[#F8F9FF]

                    px-4

                    transition-all duration-200

                    focus-within:border-[#313166]/15
                    focus-within:bg-white

                    focus-within:shadow-[0_0_0_4px_rgba(49,49,102,0.05)]

                    hover:border-[#DCE2F5]
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      flex items-center justify-center

                      text-[#9AA3C7]

                      transition-colors duration-200

                      group-focus-within:text-[#313166]
                    "
                  >
                    <svg
                      className="h-[18px] w-[18px]"
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

                  {/* Input */}
                  <input
                    type="text"
                    placeholder="Search customers..."
                    defaultValue={searchTerm}
                    onChange={handleSearchChange}
                    className="
                      ml-3

                      h-full
                      w-full

                      bg-transparent

                      text-sm font-medium
                      text-[#1F1C5C]

                      outline-none

                      placeholder:font-normal
                      placeholder:text-[#9AA3C7]
                    "
                  />
                </div>

                {/* Source Filter */}
                <div className="w-full min-w-0 xl:w-[240px]">
                  <Select
                    options={sourceOptions}
                    defaultValue={sourceOptions[0]}
                    onChange={(selected) => setSource(selected?.value || "")}
                    isSearchable={false}
                    className="text-sm"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: "48px",
                        borderRadius: "16px",
                        borderColor: state.isFocused ? "#31316620" : "#EEF1FF",
                        backgroundColor: "#F8F9FF",
                        boxShadow: state.isFocused
                          ? "0 0 0 4px rgba(49,49,102,0.06)"
                          : "none",
                        cursor: "pointer",
                        paddingLeft: "4px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#D8DDF8",
                          backgroundColor: "#FFFFFF",
                        },
                      }),

                      menu: (base) => ({
                        ...base,
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid #EEF1FF",
                        boxShadow: "0 12px 32px rgba(49,49,102,0.12)",
                        zIndex: 9999,
                      }),

                      menuList: (base) => ({
                        ...base,
                        padding: "8px",
                      }),

                      option: (base, state) => ({
                        ...base,
                        borderRadius: "12px",
                        padding: "12px 14px",
                        fontSize: "14px",
                        backgroundColor: state.isSelected
                          ? "#313166"
                          : state.isFocused
                            ? "#F4F6FF"
                            : "#FFFFFF",
                        color: state.isSelected ? "#FFFFFF" : "#1F1C5C",
                        cursor: "pointer",
                      }),

                      indicatorSeparator: () => ({
                        display: "none",
                      }),

                      dropdownIndicator: (base) => ({
                        ...base,
                        color: "#8B90B2",
                      }),
                    }}
                  />
                </div>
              </div>

              {/* Right Side */}
              <div className="flex flex-wrap items-center gap-3">
                <VideoPopupWithShare
                  video_url="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  animationData={soon}
                  buttonCss="
                    flex h-12 items-center gap-2
                    rounded-2xl
                    border border-[#EEF1FF]
                    bg-white px-4
                    text-sm font-medium text-[#1F1C5C]
                    transition-all duration-200
                    hover:bg-[#F8F9FF]
                  "
                />

                <button
                  onClick={() => navigate("/customer-preferences")}
                  className="
                    flex h-12 items-center gap-2
                    rounded-2xl
                    border border-[#EEF1FF]
                    bg-white px-4
                    text-sm font-medium text-[#1F1C5C]
                    transition-all duration-200
                    hover:bg-[#F8F9FF]
                  "
                >
                  <FiUsers className="text-lg" />
                  Preferences
                </button>

                <button
                  onClick={() => setShowBulkImport(true)}
                  className="
                    h-12 rounded-2xl
                    border border-[#313166]
                    px-4
                    text-sm font-medium text-[#313166]
                    transition-all duration-200
                    hover:bg-[#313166]
                    hover:text-white
                  "
                >
                  Bulk Import
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0">
          <div
            className="
              flex flex-1 flex-col
              overflow-hidden
              rounded-2xl
              border border-[#EEF1FF]
              bg-white/95
              shadow-[0_4px_20px_rgba(49,49,102,0.06)]
              backdrop-blur-sm
            "
          >
            {loading ? (
              <Loader text="Fetching customers..." fullHeight={false} />
            ) : (
              <>
                {customers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No customers found
                  </div>
                ) : (
                  <div
                    className="
                      flex-1
                      overflow-auto
                      scrollbar-thin
                      scrollbar-thumb-[#D7DBF5]
                      scrollbar-track-transparent
                    "
                  >
                    <table className="min-w-full">
                      <thead className="border-b border-[#EEF1FF] bg-[#F8F9FF]">
                        <tr className="">
                          <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                            First Name
                          </th>
                          <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                            Last Name
                          </th>
                          <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                            Mobile Number
                          </th>
                          <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {customers.map((customer) => (
                          <tr
                            key={customer._id}
                            className="
                              cursor-pointer
                              border-b border-[#F4F6FB]
                              transition-all duration-200
                              hover:bg-[#F8F9FF]
                            "
                            onClick={() => handleCustomerClick(customer._id)}
                          >
                            <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-[#1F1C5C] text-center">
                              {customer.firstname}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-[#1F1C5C] text-center">
                              {customer.lastname || "-"}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-[#1F1C5C] text-center">
                              {`${formatIndianMobile(customer.countryCode + " " + customer.mobileNumber)}`}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-[#1F1C5C] text-center">
                              {customer.source}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-[#1F1C5C] text-center">
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
          <div className="mt-2 rounded-2xl border border-[#EEF1FF] bg-white/95 px-4 py-2.5 shadow-[0_4px_20px_rgba(49,49,102,0.06)]">
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
                {/* Previous */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`
                    h-9 rounded-xl px-4
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      pagination.currentPage === 1
                        ? "cursor-not-allowed bg-[#F4F5FA] text-[#A0A6C1]"
                        : "bg-[#F8F9FF] text-[#313166] hover:bg-[#EEF1FF]"
                    }
                  `}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 rounded-2xl bg-[#F8F9FF] p-1">
                  {paginationPages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`
                        h-9 min-w-[36px]
                        rounded-xl px-3
                        text-sm font-medium
                        transition-all duration-200
                        ${
                          pagination.currentPage === page
                            ? "bg-[#313166] text-white shadow-md"
                            : "text-[#313166] hover:bg-white"
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`
                    h-9 rounded-xl px-4
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      pagination.currentPage === pagination.totalPages
                        ? "cursor-not-allowed bg-[#F4F5FA] text-[#A0A6C1]"
                        : "bg-[#F8F9FF] text-[#313166] hover:bg-[#EEF1FF]"
                    }
                  `}
                >
                  Next
                </button>

                {/* Page Select */}
                <div className="relative">
                  <select
                    value={pagination.currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="
                      h-9 appearance-none
                      rounded-xl
                      border border-[#EEF1FF]
                      bg-[#F8F9FF]
                      px-3 pr-9
                      text-sm font-medium text-[#313166]
                      outline-none
                      transition-all duration-200

                      hover:bg-white
                      focus:border-[#313166]/20
                    "
                  >
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <option key={page} value={page}>
                        Page {page}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B90B2]">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
