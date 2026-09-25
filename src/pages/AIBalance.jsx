import { useEffect, useState } from "react";
import { Wallet, RefreshCw, Plus, X, Loader2 } from "lucide-react";
import api from "../api/apiconfig";
import { loadRazorpayCheckout } from "../utils/razorpayCheckout";

const formatPaise = (paise = 0) =>
  `₹${(Number(paise) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AIBalance() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showRecharge, setShowRecharge] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");

  const [rechargeOrder, setRechargeOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [rechargeMessage, setRechargeMessage] = useState("");
  const [rechargeError, setRechargeError] = useState("");

  const fetchWallet = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/ai-wallet");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to fetch AI balance",
        );
      }

      setWallet(response.data.data);
    } catch (error) {
      console.error("AI wallet fetch failed:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch AI balance",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const getRechargeAmount = () => {
    if (selectedAmount === "custom") {
      const amount = Number(customAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Please enter a valid recharge amount");
      }

      return Math.round(amount * 100);
    }

    return selectedAmount * 100;
  };

  const createRechargeOrder = async () => {
    try {
      setCreatingOrder(true);
      setRechargeError("");
      setRechargeMessage("");
      setRechargeOrder(null);

      const amountPaise = getRechargeAmount();

      const response = await api.post(
        "/api/ai-balance/recharge/order",
        {
          amountPaise,
        },
      );

      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message ||
            "Unable to create recharge order",
        );
      }

      setRechargeOrder(response.data.data);
    } catch (error) {
      console.error("AI recharge order creation failed:", error);

      setRechargeError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create recharge order",
      );
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePayment = async () => {
    if (!rechargeOrder) return;

    try {
      setPaymentLoading(true);
      setRechargeError("");
      setRechargeMessage("");

      const razorpayReady = await loadRazorpayCheckout();

      if (!razorpayReady || !window.Razorpay) {
        throw new Error("Razorpay Checkout failed to load");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: rechargeOrder.grossAmountPaise,

        currency: rechargeOrder.currency || "INR",

        name: "Vadik AI",

        description: "AI Balance Recharge",

        order_id: rechargeOrder.orderId,

        handler: async (paymentResponse) => {
          try {
            setRechargeMessage(
              "Payment successful. Verifying payment...",
            );

            const verifyResponse = await api.post(
              "/api/ai-balance/recharge/verify",
              {
                rechargeId: rechargeOrder.rechargeId,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              },
            );

            if (!verifyResponse.data?.success) {
              throw new Error(
                verifyResponse.data?.message ||
                  "Payment verification failed",
              );
            }

            setRechargeMessage(
              "Payment verified successfully. Your AI Balance has been credited.",
            );

            await fetchWallet(true);

            setTimeout(() => {
              setShowRecharge(false);
              setRechargeOrder(null);
              setRechargeMessage("");
              setCustomAmount("");
              setSelectedAmount(100);
            }, 1500);
          } catch (error) {
            console.error(
              "AI recharge payment verification failed:",
              error,
            );

            setRechargeError(
              error.response?.data?.message ||
                error.message ||
                "Payment verification failed",
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setRechargeMessage("");
          },
        },

        theme: {
          color: "#313166",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error(
          "AI recharge payment failed:",
          response.error,
        );

        setRechargeError(
          response.error?.description ||
            "Payment failed. Please try again.",
        );

        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("AI recharge checkout failed:", error);

      setRechargeError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment",
      );

      setPaymentLoading(false);
    }
  };

  const closeRechargeModal = () => {
    if (creatingOrder || paymentLoading) return;

    setShowRecharge(false);
    setRechargeOrder(null);
    setRechargeError("");
    setRechargeMessage("");
    setCustomAmount("");
    setSelectedAmount(100);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading AI Balance...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            AI Balance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your AI service balance and usage credits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchWallet(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            className={
              refreshing
                ? "h-4 w-4 animate-spin"
                : "h-4 w-4"
            }
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {wallet && (
        <>
          {/* Main Balance */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-2xl bg-[#313166] p-6 text-white shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/70">
                    Available AI Balance
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold">
                    {formatPaise(
                      wallet.availableBalancePaise,
                    )}
                  </h2>
                </div>

                <div className="rounded-xl bg-white/10 p-3">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecharge(true);
                    setRechargeError("");
                    setRechargeMessage("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#313166] transition hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                  Recharge
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Wallet Status
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    wallet.status === "ACTIVE"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="font-medium text-gray-800">
                  {wallet.status}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Purchased Balance
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {formatPaise(
                  wallet.purchasedBalancePaise,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Promotional Balance
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {formatPaise(
                  wallet.promotionalBalancePaise,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Reserved Balance
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {formatPaise(
                  (wallet.reservedPurchasedPaise || 0) +
                    (wallet.reservedPromotionalPaise || 0),
                )}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Recharge Modal */}
      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Recharge AI Balance
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Choose the amount you want to add.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRechargeModal}
                disabled={
                  creatingOrder || paymentLoading
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Amount Options */}
              <p className="mb-3 text-sm font-medium text-gray-700">
                Select recharge amount
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[100, 500, 1000, 5000].map(
                  (amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amount);
                        setRechargeOrder(null);
                        setRechargeError("");
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        selectedAmount === amount
                          ? "border-[#313166] bg-[#313166] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#313166]"
                      }`}
                    >
                      ₹{amount.toLocaleString("en-IN")}
                    </button>
                  ),
                )}
              </div>

              {/* Custom */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAmount("custom");
                  setRechargeOrder(null);
                  setRechargeError("");
                }}
                className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  selectedAmount === "custom"
                    ? "border-[#313166] bg-[#313166] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#313166]"
                }`}
              >
                Custom Amount
              </button>

              {selectedAmount === "custom" && (
                <div className="mt-3">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Amount in INR
                  </label>

                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setRechargeOrder(null);
                      setRechargeError("");
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#313166]"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Minimum ₹100 and maximum ₹10,000.
                  </p>
                </div>
              )}

              {/* Create Order */}
              {!rechargeOrder && (
                <button
                  type="button"
                  onClick={createRechargeOrder}
                  disabled={creatingOrder}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#313166] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#272752] disabled:opacity-60"
                >
                  {creatingOrder && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {creatingOrder
                    ? "Calculating..."
                    : "Continue"}
                </button>
              )}

              {/* Backend Billing Summary */}
              {rechargeOrder && (
                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      AI Balance
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatPaise(
                        rechargeOrder.walletCreditPaise,
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-500">
                      GST ({rechargeOrder.taxRate}%)
                    </span>

                    <span className="font-medium text-gray-800">
                      {formatPaise(
                        rechargeOrder.totalTaxPaise,
                      )}
                    </span>
                  </div>

                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">
                        Total Payable
                      </span>

                      <span className="text-lg font-bold text-[#313166]">
                        {formatPaise(
                          rechargeOrder.grossAmountPaise,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {rechargeError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {rechargeError}
                </div>
              )}

              {rechargeMessage && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {rechargeMessage}
                </div>
              )}

              {/* Pay */}
              {rechargeOrder && (
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#313166] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#272752] disabled:opacity-60"
                >
                  {paymentLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {paymentLoading
                    ? "Processing..."
                    : `Pay ${formatPaise(
                        rechargeOrder.grossAmountPaise,
                      )}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}