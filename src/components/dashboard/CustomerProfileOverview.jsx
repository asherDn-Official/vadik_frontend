import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../../api/apiconfig"; // adjust this path as needed

ChartJS.register(ArcElement, Tooltip);

function CustomerProfileOverview() {
  const [active, setActive] = useState(250);
  const [inactive, setInactive] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchCustomerData = async () => {
        try {
          const res = await api.get(
            "api/dashboard/activeInactiveCustomerCount",
          );
          setActive(res.data.active || 0);
          setInactive(res.data.inactive || 0);
        } catch (err) {
          console.error("Error fetching customer profile data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCustomerData();
    }, 1000); // Delay by 1 second

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const total = active + inactive;

  const data = {
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ["#db2777", "#313166"], // pink & dark blue
        borderWidth: 0,
        spacing: 4,
        hoverOffset: 2,
        cutout: "82%",
        borderRadius: 30,
        circumference: 360,
        rotation: -90,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div className="dashboard-card flex min-h-[300px] flex-col justify-between">
      {/* Title */}
      <div>
        <h2 className="dashboard-card-title text-center">
          Customer Profile Overview
        </h2>

        <p className="dashboard-card-description text-center">
          Active vs inactive customer analytics
        </p>
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center py-4">
        <div className="relative h-[170px] w-[170px] sm:h-[200px] sm:w-[200px]">
          <Doughnut data={data} options={options} />

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold leading-none text-[#1F1C5C] sm:text-[40px]">
              {loading ? "..." : total}
            </span>

            <span className="mt-1 text-center text-xs font-medium text-[#7E85A8] sm:text-sm">
              Total Customers
            </span>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-2 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Active */}
        <div className="dashboard-stat-panel">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#db2777]" />

            <span className="dashboard-stat-label">
              Active Customers
            </span>
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : active}
          </div>
        </div>

        {/* Inactive */}
        <div className="dashboard-stat-panel">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#313166]" />

            <span className="dashboard-stat-label">
              Inactive Customers
            </span>
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : inactive}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileOverview;
