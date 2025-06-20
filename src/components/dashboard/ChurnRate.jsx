import React, { useRef, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

function ChurnRate({ value = 55 }) {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.ctx;
      const grad = ctx.createLinearGradient(0, 0, chartRef.current.width, 0);
      grad.addColorStop(0, "#db2777"); // pink start
      grad.addColorStop(1, "#1e1b4b"); // purple end
      setGradient(grad);
    }
  }, []);

  const data = {
    datasets: [
      {
        data: [value, 100 - value],
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
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  // Helper: compute arrow rotation based on value
  const calcArrowRotation = (percent) => {
    return (percent / 100) * 180;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full mx-auto">
      <h2 className="text-lg font-semibold text-[#1e1b4b] mb-4">Churn Rate</h2>

      <div className="relative w-full h-48">
        <Doughnut ref={chartRef} data={data} options={options} />

        {/* Triangle indicator */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom pointer-events-none"
          style={{
            transform: `rotate(${calcArrowRotation(
              value
            )}deg) translateY(-80%)`,
          }}
        ></div>

        {/* Center % */}
        <div className="absolute inset-0 flex items-center justify-center mt-8 pointer-events-none">
          <span className="text-4xl font-extrabold text-[#1e1b4b]">
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChurnRate;
