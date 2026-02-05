import React, { useState, useEffect } from "react";
import { Info, History, CreditCard, ArrowUpCircle, RefreshCw, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import api from "../../../../api/apiconfig";
import showToast from "../../../../utils/ToastNotification";
import { useAuth } from "../../../../context/AuthContext";
import { calculateTotalWithGST } from "../../../../utils/billingUtils";
import TopupConfirmationModal from "./TopupConfirmationModal";

const TEMPLATE_PRICING = {
  quiz_link_message: 0.78,
  scratch_card_offer: 0.79,
  spinwheel_offer: 0.79,
  optin_optout: 0.12,
  custom_event_greeting: 0.78,
  customer_appreciation: 0.78,
  birthday_greeting: 0.82,
  customer_otp: 0.15,
  sale_reminder: 0.78,
  opt_in_success_1: 0.78,
  opt_in_confirmation_2: 0.79,
  anniversary_greeting: 0.79,
  opt_out_acknowledged: 0
};

export default function WhatsAppCredits() {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState(100);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const { auth } = useAuth();

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/whatsapp-credits/balance");
      if (response.data.status) {
        setBalance(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const response = await api.get(`/api/whatsapp-credits/history/usage?page=${page}&limit=10`);
      if (response.data.status) {
        setHistory(response.data.data);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

  const handleTopup = async () => {
    if (topupAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setIsTopupLoading(true);
    try {
      const response = await api.post("/api/whatsapp-credits/topup/initiate", {
        creditsAmount: topupAmount,
        pricePerCredit: 1.00
      });

      if (response.data.status) {
        const orderData = response.data.data;
        setPendingOrderData(orderData);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error("Top-up initiation error:", error);
      showToast(error.response?.data?.message || "Failed to initiate top-up", "error");
    } finally {
      setIsTopupLoading(false);
    }
  };
const handleConfirmTopup = async () => {
  if (!pendingOrderData) return;

  setIsTopupLoading(true);

  try {
    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
      showToast("Razorpay SDK failed to load", "error");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: pendingOrderData.amount,
      currency: pendingOrderData.currency,
      name: "Vadik AI WhatsApp Credits",
      description: `Top-up ${pendingOrderData.creditsAmount} WhatsApp credits`,
      order_id: pendingOrderData.orderId,

      handler: async (razorpayResponse) => {
        try {
          const verifyResponse = await api.post(
            "/api/whatsapp-credits/topup/verify",
            {
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
              creditsAmount: pendingOrderData.creditsAmount,
              pricePerCredit: pendingOrderData.pricePerCredit,
            }
          );

          if (verifyResponse.data.status) {
            showToast("✅ Top-up successful", "success");
            fetchBalance();
            fetchHistory();
          } else {
            showToast("Payment verification failed", "error");
          }
        } catch (err) {
          console.error("Verification error:", err);
          showToast("Error verifying payment", "error");
        } finally {
          setIsTopupLoading(false);
          setShowConfirmation(false);
          setPendingOrderData(null);
        }
      },

      prefill: {
        name: auth?.user?.fullName,
        email: auth?.user?.email,
        contact: auth?.user?.phone,
      },

      theme: {
        color: "#D3285B",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Payment processing error:", error);
    showToast("Error processing payment", "error");
  } finally {
    setIsTopupLoading(false);
  }
};

  // const handleConfirmTopup = async () => {
  //   if (!pendingOrderData) return;

  //   setIsTopupLoading(true);
  //   try {
  //     const options = {
  //       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //       amount: pendingOrderData.amount,
  //       currency: pendingOrderData.currency,
  //       name: "Vadik AI WhatsApp Credits",
  //       description: `Top-up ${pendingOrderData.creditsAmount} WhatsApp credits`,
  //       order_id: pendingOrderData.orderId,
  //       handler: async function (razorpayResponse) {
  //         try {
  //           const verifyResponse = await api.post("/api/whatsapp-credits/topup/verify", {
  //             razorpayOrderId: razorpayResponse.razorpay_order_id,
  //             razorpayPaymentId: razorpayResponse.razorpay_payment_id,
  //             razorpaySignature: razorpayResponse.razorpay_signature,
  //             creditsAmount: pendingOrderData.creditsAmount,
  //             pricePerCredit: pendingOrderData.pricePerCredit
  //           });

  //           if (verifyResponse.data.status) {
  //             const billingInfo = verifyResponse.data?.billing;
  //             showToast(`✅ Top-up successful! Invoice #${billingInfo?.billNumber}`, "success");
  //             fetchBalance();
  //             fetchHistory();
  //           } else {
  //             showToast(verifyResponse.data.message || "Verification failed", "error");
  //           }
  //         } catch (error) {
  //           console.error("Verification error:", error);
  //           showToast("Error verifying payment", "error");
  //         } finally {
  //           setIsTopupLoading(false);
  //           setShowConfirmation(false);
  //           setPendingOrderData(null);
  //         }
  //       },
  //       prefill: {
  //         name: auth?.user?.fullName,
  //         email: auth?.user?.email,
  //         contact: auth?.user?.phone,
  //       },
  //       theme: {
  //         color: "#D3285B",
  //       },
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   } catch (error) {
  //     console.error("Payment processing error:", error);
  //     showToast("Error processing payment", "error");
  //     setIsTopupLoading(false);
  //     setShowConfirmation(false);
  //     setPendingOrderData(null);
  //   }
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <TopupConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingOrderData(null);
        }}
        amount={topupAmount}
        onConfirm={handleConfirmTopup}
        loading={isTopupLoading}
      />

      {/* Credits Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Available Credits</span>
            <div className="p-2 bg-green-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800">
              ₹ {balance?.availableCredits?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-400 mt-1">Total: ₹ {balance?.totalCredits?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Used Credits</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800">
              ₹ {balance?.usedCredits?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-400 mt-1">Last Usage: {balance?.lastUsageDate ? formatDate(balance.lastUsageDate) : "N/A"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Quick Top-up</span>
            <div className="p-2 bg-pink-50 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="Amount"
            />
            <button
              onClick={handleTopup}
              disabled={isTopupLoading}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isTopupLoading ? "..." : "Top-up"}
            </button>
          </div>
          {/* <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3 cursor-help" data-tooltip-id="pricing-tooltip" />
            Pricing per template message varies
          </p> */}
        </div>
      </div>

      <Tooltip id="pricing-tooltip" className="z-50 !bg-white !text-gray-800 !shadow-xl !border !border-gray-100 !rounded-xl !opacity-100 !p-4">
        <div className="w-64">
          <h4 className="font-bold text-sm mb-3 border-b pb-2">WhatsApp Template Pricing</h4>
          <div className="space-y-2">
            {Object.entries(TEMPLATE_PRICING).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-mono font-semibold">₹ {value.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-gray-400 italic">* Prices are per successful message delivery</p>
        </div>
      </Tooltip>

      {/* Usage History Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-800">Usage History</h3>
          </div>
          <button 
            onClick={fetchHistory}
            className="text-pink-600 text-sm font-medium hover:text-pink-700"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Credits Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-400">Loading history...</td>
                </tr>
              ) : history.length > 0 ? (
                history.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(item.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">
                      - ₹ {item.creditsUsed.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-400">No usage history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-800">{(currentPage - 1) * 10 + 1}</span> to <span className="font-semibold text-gray-800">{Math.min(currentPage * 10, totalRecords)}</span> of <span className="font-semibold text-gray-800">{totalRecords}</span> records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchHistory(currentPage - 1)}
                disabled={currentPage === 1 || historyLoading}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current, first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchHistory(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-pink-600 text-white"
                            : "hover:bg-white border border-transparent hover:border-gray-200 text-gray-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-gray-400 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => fetchHistory(currentPage + 1)}
                disabled={currentPage === totalPages || historyLoading}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
