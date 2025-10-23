import React, { useRef, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../../api/apiconfig";

ChartJS.register(ArcElement, Tooltip);

function ChurnRate() {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);
  const [churn, setChurn] = useState(88);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchChurn = async () => {
    try {
      const res = await api.get("api/dashboard/churnRate");
      const churnValue = parseFloat(res.data.churnRate.replace("%", ""));
      setChurn(churnValue);
    } catch (err) {
      console.error("Error fetching churn rate:", err);
      setChurn(0);
    } finally {
      setLoading(false);
    }
  };

  const timer = setTimeout(() => {
    fetchChurn();
  }, 1000); // Delay API call by 3 seconds

  return () => clearTimeout(timer); // cleanup if component unmounts
}, []);


  useEffect(() => {
    if (chartRef.current && chartRef.current.canvas) {
      const ctx = chartRef.current.canvas.getContext("2d");
      const grad = ctx.createLinearGradient(
        0,
        0,
        chartRef.current.canvas.width,
        0
      );
      grad.addColorStop(0, "#db2777");
      grad.addColorStop(1, "#1e1b4b");
      setGradient(grad);
    }
  }, []);

  const data = {
    labels: ["Churn", "Remaining"],
    datasets: [
      {
        data: [churn, 100 - churn],
        backgroundColor: gradient
          ? [gradient, "#f1f5f9"]
          : ["#db2777", "#f1f5f9"],
        borderWidth: 0,
        borderRadius: 30,
        cutout: "85%",
        circumference: 180,
        rotation: 270,
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
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  const calcArrowRotation = (percent) => {
    return (percent / 100) * 180;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full mx-auto h-[244px]">
      <h2 className="text-lg font-semibold text-[#1e1b4b] mb-4">Churn Rate</h2>

      <div className="relative w-full h-40">
        { (
          <>
            <Doughnut ref={chartRef} data={data} options={options} />

            {/* Triangle indicator */}
            <div
              className="absolute top-1/2 left-1/2 origin-bottom pointer-events-none"
              style={{
                transform: `rotate(${calcArrowRotation(
                  churn
                )}deg) translateY(-80%)`,
              }}
            >
              {/* You can add a triangle/arrow SVG or shape here if needed */}
            </div>

            {/* Center Percentage */}
            <div className="absolute inset-0 flex items-center justify-center mt-8 pointer-events-none">
              <span className="text-4xl font-extrabold text-[#1e1b4b]">
                {churn.toFixed(2)}%
              </span>
            </div>
          </>
        )}


      </div>
    </div>
  );
}

export default ChurnRate;
