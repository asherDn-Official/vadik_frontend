import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

function CustomerProfileOverview() {
  const active = 394;
  const inactive = 156;
  const total = active + inactive;

  const data = {
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ['#db2777', '#313166'], // pink & dark blue
        borderColor: '#fff',
        borderWidth: 6,
        cutout: '75%',
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
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md  h-[287px] flex flex-col justify-between">
      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-[#313166]">
        Customer Profile Overview
      </h2>

      {/* Chart container */}
      <div className="relative w-[160px] h-[160px] mx-auto">
        <Doughnut data={data} options={options} />

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-[#313166]">{total}</span>
          <span className="text-xs font-medium text-[#313166]">Total Customers</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-around items-end mt-2">
        {/* Active */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-[#313166]">{active}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#db2777]"></span>
            <span className="text-xs text-[#313166]">Active Customers</span>
          </div>
        </div>

        {/* Inactive */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-[#313166]">{inactive}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#313166]"></span>
            <span className="text-xs text-[#313166]">Inactive Customers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileOverview;
