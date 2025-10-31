import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/apiconfig";
import profileIcon from "../../../public/assets/user-in-cp.png";
import { formatIndianMobile } from "./formatIndianMobile";

const CustomerSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  const listRef = useRef(null);
  const skeletonItems = Array.from({ length: 6 });

  // Fetch customers data
  const fetchCustomers = async (page = 1, search = "", append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get(`/api/customers`, {
        params: {
          retailerId,
          search,
          page,
        },
      });

      const { data, pagination: paginationData } = response.data;

      setCustomers((prevCustomers) =>
        append ? [...prevCustomers, ...data] : data
      );
      setPagination(paginationData);

      if (!append) {
        if (customerId && data.length > 0) {
          const currentCustomer = data.find(
            (customer) => customer._id === customerId
          );
          if (currentCustomer) {
            setSelectedCustomer(currentCustomer);
          }
        } else if (data.length > 0 && !selectedCustomer && !customerId) {
          setSelectedCustomer(data[0]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customers");
      console.error("Error fetching customers:", err);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Initial fetch and on search term change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCustomers(1, searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, retailerId]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    navigate(`/customers/customer-profile/${customer._id}`);
  };

  const loadMoreCustomers = () => {
    if (
      pagination.currentPage < pagination.totalPages &&
      !loading &&
      !isLoadingMore
    ) {
      fetchCustomers(pagination.currentPage + 1, searchTerm, true);
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreCustomers();
    }
  };

  // Format customer name
  const formatName = (customer) => {
    return `${customer.firstname} ${customer.lastname}`.trim();
  };

  return (
    <div className="w-80 bg-white flex flex-col  rounded-[10px]">
      <div className=" border-b p-4 border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer List <span className=" text-[#31316699] ">({pagination?.totalItems})</span>
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

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto customer-sidebar-scroll"
      >
        {loading ? (
          <div className="p-4 space-y-4">
            {skeletonItems.map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-100 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No customers found
          </div>
        ) : (
          <>
            {customers.map((customer) => (
              <div
                key={customer._id}
                onClick={() => handleCustomerSelect(customer)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                  selectedCustomer?._id === customer._id
                    ? "bg-[#3131660F] border-l-4  rounded-sm"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <img
                        src={profileIcon}
                        alt={formatName(customer)}
                        className="rounded-full w-6 h-6 object-cover"
                      />
                    </div>

                    <h3 className="font-[400] text-[18px] text-[#313166]">
                      {formatName(customer)}
                    </h3>
                  </div>
                  <p className="  font-[400] pl-8 text-[15px] text-[#31316680]">
                    {formatIndianMobile(customer.mobileNumber)}
                  </p>
                </div>
              </div>
            ))}
            {isLoadingMore && (
              <div className="p-4 space-y-4">
                {skeletonItems.slice(0, 2).map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-100 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default CustomerSidebar;
