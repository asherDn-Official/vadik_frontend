import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../../api/apiconfig";

ChartJS.register(ArcElement, Tooltip);

function CustomerRetentionRate() {
  const chartRef = useRef(null);
  const [retention, setRetention] = useState(75);
  const [gradient, setGradient] = useState(null);

  // Fetch retention data
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchRetention = async () => {
        try {
          const res = await api.get("api/dashboard/customerRetensionRate");
          const percentage = res.data.retentionPercentage;
          setRetention(percentage ?? 0);
        } catch (error) {
          console.error("Error fetching retention data:", error);
          setRetention(0);
        }
      };

      fetchRetention();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Create gradient after data available
  useLayoutEffect(() => {
    if (chartRef.current?.canvas) {
      const ctx = chartRef.current.canvas.getContext("2d");

      // Radial gradient to match your UI
      const grad = ctx.createRadialGradient(80, 80, 20, 80, 80, 120);
      grad.addColorStop(0, "#ff4ba3");
      grad.addColorStop(1, "#1e1b4b");

      setGradient(grad);
    }
  }, [retention]);

  const safeRetention = Number.isFinite(retention)
    ? Math.min(Math.max(retention, 0), 100)
    : 0;

  // Chart Data
  const data = {
    labels: ["Retention", "Churn"],
    datasets: [
      {
        data: [safeRetention, 100 - safeRetention],
        backgroundColor: gradient
          ? [gradient, "#D9D9D942"] // soft white-grey ring
          : ["#db2777", "#D9D9D942"],
        borderWidth: 0,
        borderRadius: 100,
        spacing: 4,
        hoverOffset: 2,
        circumference: 360,
        rotation: -90,
      },
    ],
  };

  // Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "82%",
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "#1e1b4b",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed ?? 0;
            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
      legend: { display: false },
    },
  };

  return (
    <div className="dashboard-card flex h-full min-h-[260px] flex-col justify-between sm:min-h-[280px] xl:min-h-[300px]">
      {/* Header */}
      <div>
        <h2 className="dashboard-card-title text-center">
          Customer Retention Rate
        </h2>
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center py-4">
        <div className="relative h-[148px] w-[148px] sm:h-[180px] sm:w-[180px] xl:h-[168px] xl:w-[168px]">
          {retention !== null ? (
            <>
              <Doughnut ref={chartRef} data={data} options={options} />

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[2.3rem] font-bold leading-none tracking-[-0.04em] text-[#1F1C5C] sm:text-[2.5rem] xl:text-[2.7rem]">
                  {safeRetention}%
                </span>

                <span className="mt-1 text-center text-xs font-medium text-[#7E85A8] sm:text-sm">
                  Retention Score
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm font-medium text-[#7E85A8]">
                Loading...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-3">
        {/* Retained */}
        <div className="dashboard-stat-panel">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#db2777]" />

            <span className="dashboard-stat-label">Retained</span>
          </div>

          <div className="dashboard-stat-value">
            {safeRetention}%
          </div>
        </div>

        {/* Churn */}
        <div className="dashboard-stat-panel">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#313166]" />

            <span className="dashboard-stat-label">Churned</span>
          </div>

          <div className="dashboard-stat-value">
            {(100 - safeRetention).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerRetentionRate;
