import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
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

  // Chart Data
  const data = {
    labels: ["Retention", "Churn"],
    datasets: [
      {
        data: [retention, 100 - retention],
        backgroundColor: gradient
          ? [gradient, "#D9D9D942"] // soft white-grey ring
          : ["#db2777", "#D9D9D942"],
        borderWidth: 0,
        borderRadius: 50, // round ends
        circumference: 360,
        rotation: -90,
      },
    ],
  };

  // Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%", // thick donut ring like reference UI
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
    <div className="bg-white p-4 rounded-xl shadow-md h-[100%] flex flex-col justify-between">
      <h2 className="text-center py-2 font-poppins font-medium text-[20px] leading-[114%] text-[#1e1b4b]">
        Customer Retention Rate
      </h2>

      {/* Chart container */}
      <div className="relative w-[180px] h-[180px] mx-auto mb-2 drop-shadow-lg">
        {retention !== null ? (
          <>
            <Doughnut ref={chartRef} data={data} options={options} />

            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-[#1e1b4b]">
                {retention} %
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-[#1e1b4b] font-medium">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerRetentionRate;
