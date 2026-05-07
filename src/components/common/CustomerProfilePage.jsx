// src/components/common/CustomerProfilePage.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import api from "../../api/apiconfig";
import { FiArrowLeft, FiFilter } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CustomerProfilePage() {
  //   const { id } = useParams();
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fromPage = location.state?.from || "/search";

  const [customerData, setCustomerData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [claimedCoupons, setClaimedCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(true);
  // Filters
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    productName: "",
    limit: 5,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/customerQuickSearch/${customerId}`);

      const { customer, statistics, orderHistory, claimedCoupons } =
        res.data.data || {};

      setCustomerData(customer);
      setStatistics(statistics);
      setOrderHistory(orderHistory?.orders || []);
      setClaimedCoupons(claimedCoupons?.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      if (
        appliedFilters.minAmount &&
        order.orderSummary.grandTotal < parseFloat(appliedFilters.minAmount)
      )
        return false;

      if (
        appliedFilters.maxAmount &&
        order.orderSummary.grandTotal > parseFloat(appliedFilters.maxAmount)
      )
        return false;

      if (
        appliedFilters.productName &&
        !order.products.some((p) =>
          p.productName
            .toLowerCase()
            .includes(appliedFilters.productName.toLowerCase()),
        )
      )
        return false;

      if (
        appliedFilters.dateFrom &&
        new Date(order.createdAt) < new Date(appliedFilters.dateFrom)
      )
        return false;

      if (
        appliedFilters.dateTo &&
        new Date(order.createdAt) > new Date(appliedFilters.dateTo)
      )
        return false;

      return true;
    });
  }, [orderHistory, appliedFilters]);

  const customerScore = Math.min(
    Math.round(
      (statistics?.totalVisits || 0) * 5 + (statistics?.totalSpend || 0) / 1000,
    ),
    100,
  );

  return (
    <div className="bg-[#F3F4F8] min-h-screen px-4 md:px-6 xl:px-8 py-5">
      <div className="w-full space-y-5">
        {/* 🔙 Back */}
        <button
          onClick={() => navigate(fromPage)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4"
        >
          <FiArrowLeft />
          Back to results
        </button>

        {/* ⏳ Loading */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-60 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
        ) : (
          <>
            {/* ✅ Content */}
            <div className="flex gap-4 mb-6 border-b overflow-x-auto whitespace-nowrap">
              {[
                { name: "overview" },
                { name: "orders", count: orderHistory.length },
                { name: "coupons", count: claimedCoupons.length },
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-all duration-300 ${
                    activeTab === tab.name
                      ? "border-[#EC396F] text-[#EC396F]"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`}
                >
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {!loading && customerData && (
              <>
                {activeTab === "overview" && (
                  <>
                    <div className="space-y-5 animate-fadeIn">
                      {/* 🔥 PROFILE HEADER */}
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between flex-wrap gap-4 sm:p-5">
                        <div className="w-12 h-12 rounded-full bg-[#313166] text-white flex items-center justify-center font-semibold text-lg">
                          {customerData.firstname?.[0]}
                        </div>

                        <div className="flex-1">
                          <p className="text-2xl font-bold text-[#313166] mt-1">
                            {customerData.firstname} {customerData.lastname}
                          </p>
                          <p className="text-sm text-gray-500">
                            +{customerData.countryCode}{" "}
                            {customerData.mobileNumber}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Customer ID: {customerData.customerId}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            customerData.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {customerData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* 🔥 KPI CARDS */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                          label="Total Spend"
                          value={`₹${statistics?.totalSpend || 0}`}
                        />
                        <StatCard
                          label="Visits"
                          value={statistics?.totalVisits || 0}
                        />
                        <StatCard
                          label="Avg Purchase"
                          value={`₹${statistics?.averagePurchase || 0}`}
                        />
                        <StatCard
                          label="Loyalty"
                          value={customerData?.loyaltyPoints || 0}
                        />
                      </div>

                      {/* 🔥 MAIN GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT → DETAILS */}
                        <div className="bg-white rounded-xl shadow p-4 sm:p-5 space-y-3">
                          <h2 className="font-semibold text-[#313166]">
                            Customer Details
                          </h2>

                          <DetailItem
                            label="Customer ID"
                            value={customerData.customerId}
                          />
                          <DetailItem
                            label="Last Active"
                            value={new Date(
                              customerData.lastInboundMessageAt ||
                                customerData.createdAt,
                            ).toLocaleString()}
                          />
                          <DetailItem
                            label="Source"
                            value={customerData.source || "Unknown"}
                          />
                          <DetailItem
                            label="Opt-In"
                            value={customerData.isOptedIn ? "Yes" : "No"}
                          />
                          <DetailItem
                            label="Chat Status"
                            value={customerData.chatStatus || "none"}
                          />
                        </div>

                        {/* RIGHT → BEHAVIOR */}
                        <div className="bg-white rounded-xl shadow p-4 sm:p-5 space-y-3">
                          <h2 className="font-semibold text-[#313166]">
                            Customer Behavior
                          </h2>

                          <DetailItem
                            label="Most Purchased"
                            value={
                              statistics?.mostPurchasedProduct?.name ||
                              "No data"
                            }
                          />
                          <DetailItem
                            label="Purchase Count"
                            value={`${statistics?.mostPurchasedProduct?.count || 0} times`}
                          />
                          <DetailItem
                            label="Last Purchased"
                            value={
                              statistics?.lastPurchasedProduct?.name ||
                              "No data"
                            }
                          />

                          {/* Health bar */}
                          <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                Engagement Score
                              </p>

                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  customerScore >= 75
                                    ? "bg-green-100 text-green-700"
                                    : customerScore >= 40
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-600"
                                }`}
                              >
                                {customerScore >= 75
                                  ? "High"
                                  : customerScore >= 40
                                    ? "Moderate"
                                    : "Low"}
                              </span>
                            </div>

                            {/* Progress */}
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  customerScore >= 75
                                    ? "bg-green-500"
                                    : customerScore >= 40
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${customerScore}%`,
                                }}
                              />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between text-[11px] text-gray-400">
                              <span>Based on visits & purchases</span>

                              <span>{customerScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 🔥 INSIGHTS */}
                      <div className="bg-white rounded-xl shadow p-4 sm:p-5">
                        <h2 className="font-semibold text-[#313166] mb-3">
                          Insights
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {statistics?.totalSpend > 10000 && (
                            <div className="bg-[#F8F8FC] border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                              💰 High value customer (₹{statistics.totalSpend})
                            </div>
                          )}
                          {statistics?.totalVisits > 10 && (
                            <div className="bg-[#F8F8FC] border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                              🔁 Frequent visitor ({statistics.totalVisits}{" "}
                              visits)
                            </div>
                          )}
                          {statistics?.averagePurchase > 2000 && (
                            <div className="bg-[#F8F8FC] border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                              🛒 High average purchase (₹
                              {statistics.averagePurchase})
                            </div>
                          )}
                          {customerData?.loyaltyPoints > 500 && (
                            <div className="bg-[#F8F8FC] border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                              🎯 Strong loyalty engagement (
                              {customerData.loyaltyPoints} pts)
                            </div>
                          )}

                          {!statistics && (
                            <div className="bg-[#F8F8FC] border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600">
                              No insights available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "coupons" && (
                  <>
                    <div className="bg-white rounded-xl shadow p-6 mb-6 animate-fadeIn">
                      <h2 className="flex items-center gap-2 font-semibold text-[#313166] mb-4">
                        Coupons
                      </h2>

                      {claimedCoupons.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {claimedCoupons.map((c) => (
                            <div
                              key={c.claimId}
                              className="group border rounded-xl p-4 bg-white hover:shadow-md hover:border-[#EC396F] transition-all cursor-pointer"
                            >
                              {/* Top Row */}
                              <div className="flex justify-between items-start mb-3">
                                {/* Discount Highlight */}
                                <div className="bg-[#FEE2E2] text-[#EC396F] text-xs font-semibold px-2 py-1 rounded">
                                  {c.coupon.discount
                                    ? `${c.coupon.discount}${
                                        c.coupon.couponType === "percentage"
                                          ? "%"
                                          : "₹"
                                      } OFF`
                                    : "No Offer"}
                                </div>

                                {/* Status */}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    c.status === "used"
                                      ? "bg-green-100 text-green-700"
                                      : c.status === "expired"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>

                              {/* Name */}
                              <p className="font-semibold text-[#313166] text-sm mb-1">
                                {c.coupon.name}
                              </p>

                              {/* Code */}
                              <p className="text-xs text-gray-500 mb-2">
                                Code:{" "}
                                <span className="font-medium">
                                  {c.coupon.code}
                                </span>
                              </p>

                              {/* Expiry */}
                              {c.coupon.expiryDate && (
                                <p className="text-xs text-gray-400 mb-3">
                                  Expires on{" "}
                                  {new Date(
                                    c.coupon.expiryDate,
                                  ).toLocaleDateString()}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex justify-between items-center pt-2 border-t">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      c.coupon.code,
                                    );
                                    setCopiedId(c.claimId);

                                    setTimeout(() => setCopiedId(null), 1500);
                                  }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {copiedId === c.claimId ? "Copied!" : "Copy"}
                                </button>

                                {c.status === "claimed" && (
                                  <span className="text-xs text-gray-400">
                                    Not used
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <p className="text-lg font-medium">No Coupons Used</p>
                          <p className="text-sm">
                            No coupon activity available
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "orders" && (
                  <>
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow p-6 mb-6 animate-fadeIn">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                          <h2 className="flex items-center gap-2 font-semibold text-[#313166]">
                            <FiFilter /> Filters
                          </h2>
                          <p className="text-xs text-gray-400">
                            Refine customer order history
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Show</span>
                          <select
                            className="border rounded px-2 py-1"
                            value={filters.limit || 5}
                            onChange={(e) =>
                              setFilters((p) => ({
                                ...p,
                                limit: e.target.value,
                              }))
                            }
                          >
                            {[5, 10, 20, 50].map((n) => (
                              <option key={n}>{n}</option>
                            ))}
                          </select>
                          <span className="text-gray-500">entries</span>
                        </div>
                      </div>

                      {/* Inputs */}
                      {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Min */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Min Amount
                            </label>
                            <input
                              type="number"
                              placeholder="₹10"
                              className="w-full p-2 border rounded focus:ring-1 focus:ring-[#EC396F]"
                              value={filters.minAmount}
                              onChange={(e) =>
                                setFilters((p) => ({
                                  ...p,
                                  minAmount: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* Max */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Max Amount
                            </label>
                            <input
                              type="number"
                              placeholder="₹10000"
                              className="w-full p-2 border rounded focus:ring-1 focus:ring-[#EC396F]"
                              value={filters.maxAmount}
                              onChange={(e) =>
                                setFilters((p) => ({
                                  ...p,
                                  maxAmount: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* Product */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Product Name
                            </label>
                            <input
                              type="text"
                              placeholder="Search products..."
                              className="w-full p-2 border rounded focus:ring-1 focus:ring-[#EC396F]"
                              value={filters.productName}
                              onChange={(e) =>
                                setFilters((p) => ({
                                  ...p,
                                  productName: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* From Date */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              From Date
                            </label>
                            <DatePicker
                              selected={filters.dateFrom || null}
                              onChange={(date) =>
                                setFilters((p) => ({ ...p, dateFrom: date }))
                              }
                              className="w-full p-2 border rounded"
                              placeholderText="Select date"
                              maxDate={new Date()}
                            />
                          </div>

                          {/* To Date */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              To Date
                            </label>
                            <DatePicker
                              selected={filters.dateTo || null}
                              onChange={(date) =>
                                setFilters((p) => ({ ...p, dateTo: date }))
                              }
                              className="w-full p-2 border rounded"
                              placeholderText="Select date"
                              maxDate={new Date()}
                            />
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setAppliedFilters({ ...filters });
                            }}
                            disabled={
                              JSON.stringify(filters) ===
                              JSON.stringify(appliedFilters)
                            }
                            className="bg-[#313166] text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-[#252451]"
                          >
                            Apply Filters
                          </button>

                          <button
                            onClick={() => {
                              const reset = {
                                minAmount: "",
                                maxAmount: "",
                                dateFrom: "",
                                dateTo: "",
                                productName: "",
                                limit: 5,
                              };
                              setFilters(reset);
                              setAppliedFilters(reset);
                            }}
                            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-sm text-gray-500"
                          >
                            {showFilters ? "Hide Filters" : "Show Filters"}
                          </button>
                        </div>

                        {/* Active Filters */}
                        <div className="flex flex-wrap gap-2 text-xs max-w-full">
                          {appliedFilters.minAmount && (
                            <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              Min ₹{appliedFilters.minAmount}
                            </span>
                          )}

                          {appliedFilters.maxAmount && (
                            <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              Max ₹{appliedFilters.maxAmount}
                            </span>
                          )}

                          {appliedFilters.productName && (
                            <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              Name : {appliedFilters.productName}
                            </span>
                          )}

                          {appliedFilters.dateFrom && (
                            <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              From{" "}
                              {appliedFilters.dateFrom.toLocaleDateString()}
                            </span>
                          )}

                          {appliedFilters.dateTo && (
                            <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              To {appliedFilters.dateTo.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="bg-white rounded-xl shadow p-6">
                      <h2 className="font-semibold text-[#313166] mb-4">
                        Order History
                      </h2>

                      {filteredOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border-separate border-spacing-y-2">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                  Date
                                </th>
                                <th className="px-4 py-2 text-gray-500 font-medium">
                                  Order ID
                                </th>
                                <th className="px-4 py-2 text-gray-500 font-medium">
                                  Products
                                </th>
                                <th className="px-4 py-2 text-gray-500 font-medium">
                                  Amount
                                </th>
                                <th className="px-4 py-2 text-gray-500 font-medium">
                                  Status
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {filteredOrders
                                .slice(0, appliedFilters.limit || 5)
                                .map((order) => (
                                  <tr
                                    key={order._id}
                                    className="bg-white hover:bg-gray-50 shadow-sm rounded-lg cursor-pointer"
                                    onClick={() => console.log(order)}
                                  >
                                    <td className="px-4 py-2">
                                      {new Date(
                                        order.createdAt,
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2">
                                      {order.orderId}
                                    </td>
                                    <td className="px-4 py-2">
                                      {order.products
                                        .map((p) => p.productName)
                                        .join(", ")}
                                    </td>
                                    <td className="px-4 py-2 font-semibold text-[#313166]">
                                      ₹{order.orderSummary.grandTotal}
                                    </td>
                                    <td className="px-4 py-2">
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          order.orderSummary.paymentStatus ===
                                          "Paid"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                      >
                                        {order.orderSummary.paymentStatus}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                            <p>
                              Showing{" "}
                              {Math.min(
                                appliedFilters.limit || 5,
                                filteredOrders.length,
                              )}{" "}
                              of {filteredOrders.length} orders
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p className="text-lg font-semibold">
                            No Orders Found
                          </p>
                          <p className="text-sm">
                            Try adjusting filters or this customer has no orders
                            yet
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ label, value }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-[#313166] mt-1">{value}</p>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-[#313166]">{value}</p>
  </div>
);

export default CustomerProfilePage;
