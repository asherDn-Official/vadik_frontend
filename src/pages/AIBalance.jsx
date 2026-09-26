import { useEffect, useState } from "react";
import {
  Wallet,
  RefreshCw,
  Plus,
  X,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bot,
  Coins,
  Activity,
} from "lucide-react";
import api from "../api/apiconfig";
import { loadRazorpayCheckout } from "../utils/razorpayCheckout";

const formatPaise = (paise = 0) =>
  `₹${(Number(paise) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTransactionLabel = (type) => {
  switch (type) {
    case "RECHARGE":
      return "AI Balance Recharge";

    case "USAGE_DEBIT":
      return "AI Usage";

    case "PROMOTIONAL_CREDIT":
      return "Promotional Credit";

    case "RESERVATION":
      return "Balance Reserved";

    case "RESERVATION_RELEASE":
      return "Reservation Released";

    case "REFUND":
      return "Refund";

    case "REVERSAL":
      return "Reversal";

    case "ADMIN_ADJUSTMENT":
      return "Admin Adjustment";

    default:
      return type || "Transaction";
  }
};

const getTransactionIcon = (type) => {
  switch (type) {
    case "RECHARGE":
      return <ArrowDownLeft className="h-4 w-4" />;

    case "PROMOTIONAL_CREDIT":
      return <Gift className="h-4 w-4" />;

    case "USAGE_DEBIT":
      return <ArrowUpRight className="h-4 w-4" />;

    case "REFUND":
    case "REVERSAL":
    case "RESERVATION_RELEASE":
      return <RotateCcw className="h-4 w-4" />;

    default:
      return <Wallet className="h-4 w-4" />;
  }
};

const isCreditTransaction = (type) => {
  return [
    "RECHARGE",
    "PROMOTIONAL_CREDIT",
    "REFUND",
    "RESERVATION_RELEASE",
  ].includes(type);
};

const getUsageStatusClass = (status) => {
  switch (status) {
    case "SETTLED":
      return "bg-green-50 text-green-700";

    case "PROVIDER_SUCCESS":
      return "bg-blue-50 text-blue-700";

    case "PENDING":
    case "SETTLEMENT_PENDING":
      return "bg-yellow-50 text-yellow-700";

    case "PROVIDER_FAILED":
      return "bg-red-50 text-red-700";

    case "RECONCILIATION_REQUIRED":
      return "bg-orange-50 text-orange-700";

    case "RELEASED":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatUsageStatus = (status) => {
  if (!status) return "-";

  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
};

const emptyUsageSummary = {
  totalRequests: 0,
  settledRequests: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0,
  totalChargedPaise: 0,
};

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

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] =
    useState(true);

  const [transactionPage, setTransactionPage] = useState(1);

  const [transactionPagination, setTransactionPagination] =
    useState(null);

  const [transactionType, setTransactionType] = useState("");


  const [usageRecords, setUsageRecords] = useState([]);
  const [usageLoading, setUsageLoading] = useState(true);

  const [usagePage, setUsagePage] = useState(1);
  const [usagePagination, setUsagePagination] =
    useState(null);

  const [usageSummary, setUsageSummary] =
    useState(emptyUsageSummary);

  const [usageSummaryLoading, setUsageSummaryLoading] =
    useState(true);


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
          response.data?.message ||
            "Unable to fetch AI balance",
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


  const fetchTransactions = async (
    page = 1,
    type = "",
  ) => {
    try {
      setTransactionsLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (type) {
        params.set("transactionType", type);
      }

      const response = await api.get(
        `/api/ai-balance/transactions?${params.toString()}`,
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to fetch AI balance transactions",
        );
      }

      setTransactions(
        response.data.data?.entries || [],
      );

      setTransactionPagination(
        response.data.data?.pagination || null,
      );

      setTransactionPage(page);
    } catch (error) {
      console.error(
        "AI wallet transactions fetch failed:",
        error,
      );

      setTransactions([]);
      setTransactionPagination(null);
    } finally {
      setTransactionsLoading(false);
    }
  };


  const fetchUsageHistory = async (page = 1) => {
    try {
      setUsageLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      const response = await api.get(
        `/api/ai-balance/usage?${params.toString()}`,
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to fetch AI usage history",
        );
      }

      setUsageRecords(response.data.data || []);

      setUsagePagination(
        response.data.pagination || null,
      );

      setUsagePage(page);
    } catch (error) {
      console.error(
        "AI usage history fetch failed:",
        error,
      );

      setUsageRecords([]);
      setUsagePagination(null);
    } finally {
      setUsageLoading(false);
    }
  };


  const fetchUsageSummary = async () => {
    try {
      setUsageSummaryLoading(true);

      const response = await api.get(
        "/api/ai-balance/usage/summary",
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to fetch AI usage summary",
        );
      }

      setUsageSummary(
        response.data.data || emptyUsageSummary,
      );
    } catch (error) {
      console.error(
        "AI usage summary fetch failed:",
        error,
      );

      setUsageSummary(emptyUsageSummary);
    } finally {
      setUsageSummaryLoading(false);
    }
  };


  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchUsageHistory();
    fetchUsageSummary();
  }, []);


  const handleRefresh = async () => {
    await Promise.all([
      fetchWallet(true),
      fetchTransactions(
        transactionPage,
        transactionType,
      ),
      fetchUsageHistory(usagePage),
      fetchUsageSummary(),
    ]);
  };

  const getRechargeAmount = () => {
    if (selectedAmount === "custom") {
      const amount = Number(customAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(
          "Please enter a valid recharge amount",
        );
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

      if (
        !response.data?.success ||
        !response.data?.data
      ) {
        throw new Error(
          response.data?.message ||
            "Unable to create recharge order",
        );
      }

      setRechargeOrder(response.data.data);
    } catch (error) {
      console.error(
        "AI recharge order creation failed:",
        error,
      );

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

      const razorpayReady =
        await loadRazorpayCheckout();

      if (!razorpayReady || !window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load",
        );
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: rechargeOrder.grossAmountPaise,

        currency:
          rechargeOrder.currency || "INR",

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
                rechargeId:
                  rechargeOrder.rechargeId,

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

            await fetchTransactions(
              1,
              transactionType,
            );

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

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "AI recharge payment failed:",
            response.error,
          );

          setRechargeError(
            response.error?.description ||
              "Payment failed. Please try again.",
          );

          setPaymentLoading(false);
        },
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "AI recharge checkout failed:",
        error,
      );

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

const handleTransactionFilter = async (
    event,
  ) => {
    const type = event.target.value;

    setTransactionType(type);

    await fetchTransactions(1, type);
  };


  const handlePreviousPage = async () => {
    if (
      !transactionPagination ||
      transactionPage <= 1
    ) {
      return;
    }

    await fetchTransactions(
      transactionPage - 1,
      transactionType,
    );
  };

  const handleNextPage = async () => {
    if (
      !transactionPagination?.hasNextPage
    ) {
      return;
    }

    await fetchTransactions(
      transactionPage + 1,
      transactionType,
    );
  };


  const handlePreviousUsagePage = async () => {
    if (
      !usagePagination ||
      usagePage <= 1
    ) {
      return;
    }

    await fetchUsageHistory(
      usagePage - 1,
    );
  };

  const handleNextUsagePage = async () => {
    if (
      !usagePagination?.hasNextPage
    ) {
      return;
    }

    await fetchUsageHistory(
      usagePage + 1,
    );
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
 

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            AI Balance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your AI service balance and usage
            credits.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            refreshing ||
            transactionsLoading ||
            usageLoading ||
            usageSummaryLoading
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            className={
              refreshing ||
              transactionsLoading ||
              usageLoading ||
              usageSummaryLoading
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
                  (wallet.reservedPurchasedPaise ||
                    0) +
                    (wallet.reservedPromotionalPaise ||
                      0),
                )}
              </p>
            </div>
          </div>

  
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Transaction History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View your AI balance transactions.
                </p>
              </div>

              <select
                value={transactionType}
                onChange={
                  handleTransactionFilter
                }
                disabled={transactionsLoading}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#313166]"
              >
                <option value="">
                  All Transactions
                </option>

                <option value="RECHARGE">
                  Recharge
                </option>

                <option value="USAGE_DEBIT">
                  AI Usage
                </option>

                <option value="PROMOTIONAL_CREDIT">
                  Promotional Credit
                </option>

                <option value="RESERVATION">
                  Reservation
                </option>

                <option value="RESERVATION_RELEASE">
                  Reservation Release
                </option>

                <option value="REFUND">
                  Refund
                </option>

                <option value="REVERSAL">
                  Reversal
                </option>

                <option value="ADMIN_ADJUSTMENT">
                  Admin Adjustment
                </option>
              </select>
            </div>

            {transactionsLoading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading transactions...
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-5 text-center">
                <div>
                  <Wallet className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    No transactions found
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Your AI balance transactions will
                    appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {transactions.map(
                    (transaction) => {
                      const isCredit =
                        isCreditTransaction(
                          transaction.transactionType,
                        );

                      return (
                        <div
                          key={
                            transaction._id ||
                            transaction.operationId
                          }
                          className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isCredit
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {getTransactionIcon(
                              transaction.transactionType,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {getTransactionLabel(
                                transaction.transactionType,
                              )}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400">
                              <span>
                                {formatDate(
                                  transaction.createdAt,
                                )}
                              </span>

                              <span>•</span>

                              <span>
                                {
                                  transaction.balanceBucket
                                }
                              </span>
                            </div>

                            {transaction.reason && (
                              <p className="mt-1 truncate text-xs text-gray-400">
                                {transaction.reason}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className={`text-sm font-semibold ${
                                isCredit
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {isCredit ? "+" : "-"}
                              {formatPaise(
                                transaction.amountPaise,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {transactionPagination && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                    <p className="text-xs text-gray-500">
                      Page{" "}
                      <span className="font-medium text-gray-700">
                        {transactionPagination.page}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-700">
                        {
                          transactionPagination.totalPages
                        }
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={
                          handlePreviousPage
                        }
                        disabled={
                          transactionPage <= 1 ||
                          transactionsLoading
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleNextPage
                        }
                        disabled={
                          !transactionPagination.hasNextPage ||
                          transactionsLoading
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

   
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                AI Usage
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track your AI requests, token usage and
                balance consumption.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
           

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Requests
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-800">
                      {usageSummaryLoading ? (
                        <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-100" />
                      ) : (
                        Number(
                          usageSummary.totalRequests ||
                            0,
                        ).toLocaleString("en-IN")
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
              </div>


              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Tokens
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-800">
                      {usageSummaryLoading ? (
                        <span className="inline-block h-7 w-20 animate-pulse rounded bg-gray-100" />
                      ) : (
                        Number(
                          usageSummary.totalTokens ||
                            0,
                        ).toLocaleString("en-IN")
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                    <Bot className="h-5 w-5" />
                  </div>
                </div>
              </div>



              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total AI Spend
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-800">
                      {usageSummaryLoading ? (
                        <span className="inline-block h-7 w-20 animate-pulse rounded bg-gray-100" />
                      ) : (
                        formatPaise(
                          usageSummary.totalChargedPaise,
                        )
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-3 text-green-600">
                    <Coins className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {!usageSummaryLoading && (
              <p className="mt-3 text-xs text-gray-400">
                {Number(
                  usageSummary.settledRequests || 0,
                ).toLocaleString("en-IN")}{" "}
                settled requests included in total AI
                spend.
              </p>
            )}
          </div>


          <div className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Usage History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Detailed history of your AI requests.
              </p>
            </div>

            {usageLoading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading usage history...
                </div>
              </div>
            ) : usageRecords.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-5 text-center">
                <div>
                  <Bot className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    No AI usage found
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Your AI usage will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {usageRecords.map((record) => (
                    <div
                      key={
                        record._id ||
                        record.aiRequestId
                      }
                      className="px-5 py-5 transition hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        {/* ICON */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#313166]/10 text-[#313166]">
                          <Bot className="h-5 w-5" />
                        </div>

                        {/* MAIN DETAILS */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800">
                              {record.feature ||
                                "AI Request"}
                            </p>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getUsageStatusClass(
                                record.status,
                              )}`}
                            >
                              {formatUsageStatus(
                                record.status,
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span>
                              Provider:{" "}
                              <span className="font-medium text-gray-700">
                                {record.provider ||
                                  "-"}
                              </span>
                            </span>

                            <span>•</span>

                            <span>
                              Model:{" "}
                              <span className="font-medium text-gray-700">
                                {record.model ||
                                  "-"}
                              </span>
                            </span>

                            <span>•</span>

                            <span>
                              {formatDate(
                                record.createdAt,
                              )}
                            </span>
                          </div>

                          <div className="mt-2 text-xs text-gray-400">
                            Request ID:{" "}
                            <span className="font-mono">
                              {record.aiRequestId}
                            </span>
                          </div>
                        </div>

                        {/* TOKENS */}

                        <div className="grid grid-cols-2 gap-4 text-right sm:grid-cols-3 lg:min-w-[300px]">
                          <div>
                            <p className="text-[11px] text-gray-400">
                              Input
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-700">
                              {Number(
                                record.inputTokens ||
                                  0,
                              ).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] text-gray-400">
                              Output
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-700">
                              {Number(
                                record.outputTokens ||
                                  0,
                              ).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] text-gray-400">
                              Total Tokens
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-700">
                              {Number(
                                record.totalTokens ||
                                  0,
                              ).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>

                   

                        <div className="shrink-0 text-left lg:min-w-[100px] lg:text-right">
                          <p className="text-[11px] text-gray-400">
                            Charged
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#313166]">
                            {formatPaise(
                              record.customerChargePaise ||
                                0,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

          

                {usagePagination && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                    <p className="text-xs text-gray-500">
                      Page{" "}
                      <span className="font-medium text-gray-700">
                        {usagePagination.page}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-700">
                        {
                          usagePagination.totalPages
                        }
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={
                          handlePreviousUsagePage
                        }
                        disabled={
                          usagePage <= 1 ||
                          usageLoading
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleNextUsagePage
                        }
                        disabled={
                          !usagePagination.hasNextPage ||
                          usageLoading
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}



      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            

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
                  creatingOrder ||
                  paymentLoading
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
           

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
                        setSelectedAmount(
                          amount,
                        );
                        setRechargeOrder(null);
                        setRechargeError("");
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        selectedAmount ===
                        amount
                          ? "border-[#313166] bg-[#313166] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#313166]"
                      }`}
                    >
                      ₹
                      {amount.toLocaleString(
                        "en-IN",
                      )}
                    </button>
                  ),
                )}
              </div>


              <button
                type="button"
                onClick={() => {
                  setSelectedAmount(
                    "custom",
                  );
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

              {selectedAmount ===
                "custom" && (
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
                      setCustomAmount(
                        e.target.value,
                      );
                      setRechargeOrder(null);
                      setRechargeError("");
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#313166]"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Minimum ₹100 and maximum
                    ₹10,000.
                  </p>
                </div>
              )}

              

              {!rechargeOrder && (
                <button
                  type="button"
                  onClick={
                    createRechargeOrder
                  }
                  disabled={
                    creatingOrder
                  }
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
                      GST (
                      {rechargeOrder.taxRate}
                      %)
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