import React, { useRef, useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

function CustomerRetentionRate() {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current && chartRef.current.canvas) {
      const ctx = chartRef.current.canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, chartRef.current.canvas.width, chartRef.current.canvas.height);
      grad.addColorStop(0, '#db2777');
      grad.addColorStop(1, '#1e1b4b');
      setGradient(grad);
    }
  }, []);

  const data = {
    datasets: [
      {
        data: [40, 60],
        backgroundColor: gradient ? [gradient, '#f1f5f9'] : ['#db2777', '#f1f5f9'],
        borderWidth: 0,
        borderRadius: 30,
        cutout: '80%',
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
    <div className="bg-white p-4 rounded-xl shadow-md  h-[287px] flex flex-col justify-between">
      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-[#1e1b4b]">
        Customer Retention Rate
      </h2>

      {/* Chart */}
      <div className="relative w-[160px] h-[160px] mx-auto mt-2 mb-2">
        <Doughnut ref={chartRef} data={data} options={options} />

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-extrabold text-[#1e1b4b]">40%</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerRetentionRate;
