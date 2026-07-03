import { useEffect, useState } from "react";
import api from "../../api/apiconfig";

function OptInOptOut() {
  const [loyaltyScore, setLoyaltyScore] = useState(60);
  const [riskScore, setRiskScore] = useState(40);
  const [loyalCustomerPeriodDays, setLoyalCustomerPeriodDays] = useState(120);
  const [loyalCustomers, setLoyalCustomers] = useState(0);
  const [nonLoyalCustomers, setNonLoyalCustomers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchLoyalty = async () => {
        try {
          const res = await api.get("api/dashboard/customerLoyaltyScore");
          setLoyalCustomerPeriodDays(
            Number.isFinite(Number(res.data.loyalCustomerPeriodDays))
              ? Number(res.data.loyalCustomerPeriodDays)
              : 120,
          );
          setLoyalCustomers(
            Number.isFinite(Number(res.data.loyalCustomers))
              ? Number(res.data.loyalCustomers)
              : 0,
          );
          setNonLoyalCustomers(
            Number.isFinite(Number(res.data.nonLoyalCustomers))
              ? Number(res.data.nonLoyalCustomers)
              : 0,
          );
          setLoyaltyScore(
            Number.isFinite(Number(res.data.loyaltyScore))
              ? Number(res.data.loyaltyScore)
              : 0,
          );
          setRiskScore(
            Number.isFinite(Number(res.data.riskScore))
              ? Number(res.data.riskScore)
              : 0,
          );
          setTotalCustomers(
            Number.isFinite(Number(res.data.totalCustomers))
              ? Number(res.data.totalCustomers)
              : 0,
          );
        } catch (error) {
          console.error("Error fetching loyalty data:", error);
          setLoyaltyScore(0);
          setRiskScore(0);
          setLoyalCustomers(0);
          setNonLoyalCustomers(0);
          setTotalCustomers(0);
        } finally {
          setLoading(false);
        }
      };

      fetchLoyalty();
    }, 1000); // Delay for 1 second

    return () => clearTimeout(timer); // Cleanup if component unmounts
  }, []);

  const safeLoyalCustomers = Number.isFinite(loyalCustomers)
    ? Math.max(loyalCustomers, 0)
    : 0;
  const safeNonLoyalCustomers = Number.isFinite(nonLoyalCustomers)
    ? Math.max(nonLoyalCustomers, 0)
    : 0;
  const safeLoyaltyScore = Number.isFinite(loyaltyScore)
    ? Math.min(Math.max(loyaltyScore, 0), 100)
    : 0;
  const safeRiskScore = Number.isFinite(riskScore)
    ? Math.min(Math.max(riskScore, 0), 100)
    : 0;

  return (
    <div className="dashboard-card flex h-full min-h-[260px] flex-col sm:min-h-[280px] xl:min-h-[300px]">
      {/* Header */}
      <div>
        <h2 className="dashboard-card-title">
          Customer Loyalty
        </h2>
        <p className="mt-1 text-xs font-medium text-[#7E85A8]">
          Customers created within {loyalCustomerPeriodDays} days are counted as loyal
        </p>
      </div>

      {/* Loyal Customers */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#1F1C5C]" />

            <span className="pr-3 text-sm font-medium text-[#1F1C5C]">
              Loyal Customers
            </span>
          </div>

          <span className="ml-3 text-2xl font-bold leading-none text-[#1F1C5C] sm:text-[28px]">
            {loading ? "--" : `${safeLoyaltyScore.toFixed(0)}%`}
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-[#EEF1FF] sm:h-5">
          <div
            className="
            absolute left-0 top-0 h-full rounded-full
            bg-gradient-to-r
            from-[#1F1C5C]
            via-[#1C1E8B]
            to-[#00007A]
            shadow-[0_0_20px_rgba(28,30,139,0.35)]
            transition-all duration-700 ease-out
          "
            style={{ width: `${safeLoyaltyScore}%` }}
          />

          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Non Loyal Customers */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#E43274]" />

            <span className="pr-3 text-sm font-medium text-[#E43274]">
              Non Loyal Customers
            </span>
          </div>

          <span className="ml-3 text-2xl font-bold leading-none text-[#E43274] sm:text-[28px]">
            {loading ? "--" : `${safeRiskScore.toFixed(0)}%`}
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-[#FFF1F6] sm:h-5">
          <div
            className="
            absolute left-0 top-0 h-full rounded-full
            bg-gradient-to-r
            from-[#FF8DB6]
            via-[#E43274]
            to-[#C81E63]
            shadow-[0_0_20px_rgba(228,50,116,0.35)]
            transition-all duration-700 ease-out
          "
            style={{ width: `${safeRiskScore}%` }}
          />

          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Footer Analytics */}
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6 sm:gap-4">
        {/* Loyal Box */}
        <div className="dashboard-stat-panel">
          <div className="text-xs font-medium uppercase tracking-wide text-[#8B90B2]">
            Loyalty Score
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : safeLoyaltyScore.toFixed(0)}
          </div>
          <div className="text-[11px] text-[#8B90B2]">
            {loading ? "--" : `${safeLoyalCustomers} of ${totalCustomers} customers`}
          </div>
        </div>

        {/* Risk Box */}
        <div className="dashboard-stat-panel bg-[#FFF5F8]">
          <div className="text-xs font-medium uppercase tracking-wide text-[#D85B8B]">
            Risk Score
          </div>

          <div className="mt-2 text-2xl font-bold leading-none text-[#E43274] sm:text-[28px]">
            {loading ? "--" : safeRiskScore.toFixed(0)}
          </div>
          <div className="text-[11px] text-[#D85B8B]">
            {loading ? "--" : `${safeNonLoyalCustomers} of ${totalCustomers} customers`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptInOptOut;
