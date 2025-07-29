import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../../api/apiconfig";

ChartJS.register(ArcElement, Tooltip);

function CustomerRetentionRate() {
  const chartRef = useRef(null);
  const [retention, setRetention] = useState(null);
  const [gradient, setGradient] = useState(null);

  // Fetch retention data
  useEffect(() => {
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
  }, []);

  // Create gradient after data is loaded
  useLayoutEffect(() => {
    if (chartRef.current?.canvas) {
      const ctx = chartRef.current.canvas.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 160, 160);
      grad.addColorStop(0, "#db2777");
      grad.addColorStop(1, "#1e1b4b");
      setGradient(grad);
    }
  }, [retention]);

  const data = {
    labels: ["Retention", "Churn"],
    datasets: [
      {
        data: [retention ?? 0, 100 - (retention ?? 0)],
        backgroundColor: gradient
          ? [gradient, "#f1f5f9"]
          : ["#db2777", "#f1f5f9"],
        borderWidth: 0,
        borderRadius: 30,
        cutout: "80%",
        circumference: 360,
        rotation: -90,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md  h-[100%] flex flex-col justify-between">
      {/* h-[287px] */}
      <h2 className="text-center text-lg font-semibold text-[#1e1b4b]">
        Customer Retention Rate
      </h2>

      <div className="relative w-[160px] h-[160px] mx-auto mt-2 mb-2">
        {retention !== null ? (
          <>
            <Doughnut ref={chartRef} data={data} options={options} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-[#1e1b4b]">
                {retention}%
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
