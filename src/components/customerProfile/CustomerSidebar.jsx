import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/apiconfig";

const CustomerSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const navigate = useNavigate();
  const { customerId } = useParams();

  // Fetch customers data
  const fetchCustomers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/customers`,
        {
          params: {
            retailerId,
            search,
            // page,
          },
        }
      );

      const { data, pagination } = response.data;

      setCustomers(data);
      setPagination(pagination);

      // Auto-select current customer from URL if it exists in the list
      if (customerId && data.length > 0) {
        const currentCustomer = data.find(customer => customer._id === customerId);
        if (currentCustomer) {
          setSelectedCustomer(currentCustomer);
        }
      }
      // Only auto-select first customer if no customer is currently selected and no customerId in URL
      else if (data.length > 0 && !selectedCustomer && !customerId) {
        setSelectedCustomer(data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customers");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and on search term change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCustomers(1, searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, retailerId, customerId]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    navigate(`/customer-profile/${customer._id}`);
  };

  // Format customer name
  const formatName = (customer) => {
    return `${customer.firstname} ${customer.lastname}`.trim();
  };

  return (
    <div className="w-80 bg-white flex flex-col m-2 rounded-[10px]">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer List ({pagination?.totalItems})
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No customers found
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer._id}
              onClick={() => handleCustomerSelect(customer)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                selectedCustomer?._id === customer._id
                  ? "bg-purple-50 border-l-4 border-purple-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center mr-3">
                  <img
                    src="../assets/user-in-cp.png"
                    alt={formatName(customer)}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-[400] text-[18px] text-[#313166]">
                    {formatName(customer)}
                  </h3>
                  <p className="font-[400] text-[15px] text-[#31316680]">
                    {customer?.mobileNumber}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <button
            onClick={() =>
              fetchCustomers(pagination?.currentPage - 1, searchTerm)
            }
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 rounded-md border disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              fetchCustomers(pagination.currentPage + 1, searchTerm)
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1 rounded-md border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerSidebar;
