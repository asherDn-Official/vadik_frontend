import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/apiconfig";
import { FiArrowLeft } from "react-icons/fi";

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q");

  const fromPage = location.state?.from || "/dashboard";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) fetchData(query);
  }, [query]);

  const fetchData = async (q) => {
    setLoading(true);
    try {
      const res = await api.get("/api/customerQuickSearch/search", {
        params: { search: q },
      });
      setCustomers(res?.data?.data || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customer) => {
    navigate(`/customer/${customer.customerId}`, {
      state: { customer, from: location.pathname + location.search },
    });
  };

  return (
    <div className="bg-[#F3F4F8] min-h-screen px-4 md:px-6 xl:px-8 py-5">
      <div className="w-full space-y-6">
        {/* 🔙 Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigate(fromPage)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <FiArrowLeft />
            Back
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#313166]">
              Results for "{query}"
            </h1>
            {!loading && (
              <p className="text-xs text-gray-400">
                {customers.length} result{customers.length !== 1 && "s"} found
              </p>
            )}
          </div>
        </div>

        {/* ⏳ Loading */}
        {loading && <SkeletonList />}

        {/* ❌ Empty */}
        {!loading && customers.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow">
            <p className="text-lg font-semibold text-gray-700">
              No customers found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try searching with a different keyword
            </p>
          </div>
        )}

        {/* ✅ Results */}
        {!loading && customers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.customerId}
                  customer={customer}
                  onClick={() => handleCustomerClick(customer)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <p>
            Showing {customers.length} result{customers.length !== 1 && "s"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;

/* ============================= */
/* 🔥 CUSTOMER CARD */
/* ============================= */

const CustomerCard = ({ customer, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-[#FAFAFC] border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-[#EC396F] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#313166] text-white flex items-center justify-center font-semibold">
          {customer.firstname?.[0] || "C"}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-semibold text-[#313166] group-hover:text-[#EC396F]">
            {customer.firstname} {customer.lastname}
          </p>

          <p className="text-xs text-gray-500">
            +{customer.countryCode} {customer.mobileNumber}
          </p>
        </div>

        {/* Status */}
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            customer.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {customer.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>ID: {customer.customerId}</span>

        <span className="text-[#EC396F] font-semibold">
          {customer.loyaltyPoints || 0} pts
        </span>
      </div>
    </div>
  );
};

/* ============================= */
/* 🔥 SKELETON */
/* ============================= */

const SkeletonList = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow animate-pulse space-y-3"
          >
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
