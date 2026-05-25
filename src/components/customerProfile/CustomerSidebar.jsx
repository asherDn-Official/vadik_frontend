import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/apiconfig";
import profileIcon from "/assets/user-in-cp.png";
import { formatIndianMobile } from "./formatIndianMobile";

const INITIAL_RENDER_COUNT = 10;
const RENDER_STEP = 8;

const CustomerSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [renderedCount, setRenderedCount] = useState(INITIAL_RENDER_COUNT);
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
  const loadMoreRef = useRef(null);
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
        append ? [...prevCustomers, ...data] : data,
      );
      setRenderedCount((prevCount) =>
        append
          ? prevCount
          : Math.min(data.length, INITIAL_RENDER_COUNT),
      );
      setPagination(paginationData);

      if (!append) {
        if (customerId && data.length > 0) {
          const currentCustomer = data.find(
            (customer) => customer._id === customerId,
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

  useEffect(() => {
    if (!customerId) return;

    const currentCustomer = customers.find((customer) => customer._id === customerId);
    if (currentCustomer) {
      setSelectedCustomer(currentCustomer);
      const selectedIndex = customers.findIndex(
        (customer) => customer._id === customerId,
      );
      if (selectedIndex >= 0) {
        setRenderedCount((prevCount) =>
          Math.max(
            prevCount,
            Math.min(customers.length, selectedIndex + 1 + RENDER_STEP),
          ),
        );
      }
    }
  }, [customerId, customers]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    navigate(`/customers/customer-profile/${customer._id}`);
  };

  const loadMoreCustomers = useCallback(() => {
    if (
      pagination.currentPage < pagination.totalPages &&
      !loading &&
      !isLoadingMore
    ) {
      fetchCustomers(pagination.currentPage + 1, searchTerm, true);
    }
  }, [
    pagination.currentPage,
    pagination.totalPages,
    loading,
    isLoadingMore,
    searchTerm,
  ]);

  useEffect(() => {
    const root = listRef.current;
    const target = loadMoreRef.current;

    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRenderedCount((prevCount) => {
            if (prevCount < customers.length) {
              return Math.min(customers.length, prevCount + RENDER_STEP);
            }

            return prevCount;
          });

          if (renderedCount >= customers.length) {
            loadMoreCustomers();
          }
        }
      },
      {
        root,
        rootMargin: "0px 0px 180px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [customers.length, loadMoreCustomers, renderedCount]);

  // Format customer name
  const formatName = (customer) => {
    return `${customer.firstname} ${customer.lastname}`.trim();
  };

  const visibleCustomers = customers.slice(0, renderedCount);

  return (
    <div
      className="
      flex min-h-0 flex-col bg-transparent
      max-h-[min(34rem,52vh)]
      lg:max-h-[min(38rem,58vh)]
      xl:h-full xl:min-h-0 xl:max-h-full xl:overflow-hidden
    "
    >
      {/* Header */}
      <div
        className="
        shrink-0 border-b border-[#EEF1FF]
        bg-white
        px-4 sm:px-5
        py-4
        xl:sticky xl:top-0 xl:z-10
      "
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold text-[#1F1C5C]">
              Customers
            </h2>

            <p className="mt-1 text-sm text-[#8B90B2]">
              {pagination?.totalItems || 0} profiles available
            </p>
          </div>

          <div
            className="
            flex h-10 min-w-[40px]
            items-center justify-center

            rounded-xl

            bg-[#F8F9FF]

            text-sm font-semibold
            text-[#313166]
          "
          >
            {pagination?.totalItems || 0}
          </div>
        </div>

        {/* Search */}
        <div
          className="
          mt-4

          flex h-11 items-center

          rounded-xl
          border border-[#EEF1FF]

          bg-[#F8F9FF]

          px-4

          transition-all

          focus-within:border-[#313166]/20
          focus-within:bg-white
          focus-within:shadow-sm
        "
        >
          <svg
            className="h-5 w-5 shrink-0 text-[#8B90B2]"
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

          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
            ml-3
            h-full
            w-full

            bg-transparent

            text-sm text-[#1F1C5C]

            outline-none

            placeholder:text-[#8B90B2]
          "
          />
        </div>
      </div>

      {/* Customer List */}
      <div
        ref={listRef}
        className="
        customer-sidebar-scroll
        h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain xl:[scrollbar-gutter:stable]
        px-3 py-3
        sm:px-4
        xl:px-3 xl:pb-4
      "
      >
        {loading ? (
          <div className="space-y-3">
            {skeletonItems.map((_, index) => (
              <div
                key={index}
                className="
                animate-pulse

                rounded-xl

                border border-[#EEF1FF]

                bg-[#F8F9FF]

                p-3
              "
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gray-200" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="
            rounded-xl
            border border-red-100
            bg-red-50

            p-5

            text-center text-sm text-red-500
          "
          >
            {error}
          </div>
        ) : customers.length === 0 ? (
          <div
            className="
            rounded-xl
            border border-[#EEF1FF]
            bg-[#F8F9FF]

            p-6

            text-center text-sm text-[#8B90B2]
          "
          >
            No customers found
          </div>
        ) : (
          <>
            <div className="space-y-1.5 xl:space-y-2">
              {visibleCustomers.map((customer) => {
                const isActive = selectedCustomer?._id === customer._id;

                return (
                  <div
                    key={customer._id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`
                    group
                    relative

                    cursor-pointer

                    overflow-hidden

                    rounded-xl

                    border

                    transition-all duration-200

                    ${
                      isActive
                        ? "border-[#313166]/10 bg-[#3131660A] shadow-sm"
                        : "border-transparent hover:border-[#EEF1FF] hover:bg-[#F8F9FF]"
                    }
                  `}
                  >
                    {/* Active Glow */}
                    {isActive && (
                      <div className="absolute inset-y-3 left-0 w-1 rounded-full bg-[#313166]" />
                    )}

                    <div className="flex items-center gap-3 p-3">
                      {/* Avatar */}
                      <div
                        className="
                        relative

                        flex h-11 w-11 shrink-0
                        items-center justify-center

                        rounded-xl

                        bg-[#F8F9FF]
                      "
                      >
                        <img
                          src={profileIcon}
                          alt={formatName(customer)}
                          className="
                          h-9 w-9 rounded-lg object-cover
                        "
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className="
                          truncate

                          text-[14px]
                          font-semibold

                          text-[#1F1C5C]
                        "
                        >
                          {formatName(customer)}
                        </h3>

                        <p
                          className="
                          mt-1

                          truncate

                          text-sm
                          text-[#8B90B2]
                        "
                        >
                          {formatIndianMobile(
                            customer.countryCode + " " + customer.mobileNumber,
                          )}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div
                        className={`
                        text-sm transition-all duration-200

                        ${
                          isActive
                            ? "translate-x-0 opacity-100 text-[#313166]"
                            : "translate-x-1 opacity-0 text-[#8B90B2] group-hover:translate-x-0 group-hover:opacity-100"
                        }
                      `}
                      >
                        →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Skeleton */}
            {isLoadingMore && (
              <div className="mt-3 space-y-3">
                {skeletonItems.slice(0, 2).map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="
                    animate-pulse

                    rounded-xl

                    border border-[#EEF1FF]

                    bg-[#F8F9FF]

                    p-3
                  "
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gray-200" />

                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              ref={loadMoreRef}
              className="flex h-8 w-full items-center justify-center"
              aria-hidden="true"
            >
              {(renderedCount < customers.length || isLoadingMore) && (
                <div className="h-1.5 w-16 rounded-full bg-[#E7EBF5]" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerSidebar;
