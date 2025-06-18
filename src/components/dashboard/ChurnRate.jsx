import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaArrowUp } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip);

function ChurnRate() {
  const data = {
    datasets: [
      {
        data: [55, 45],
        backgroundColor: ['#db2777', '#f1f5f9'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };
  
  const options = {
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
  };
  
  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Churn Rate</h2>
      
      <div className="relative h-52">
        <Doughnut data={data} options={options} />
        
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="mt-8 text-center">
            <div className="text-4xl font-bold text-indigo-900">55%</div>
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2">
          <div className="bg-indigo-900 text-white p-1 rounded-sm">
            <FaArrowUp />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChurnRate;