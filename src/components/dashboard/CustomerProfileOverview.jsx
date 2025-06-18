import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function CustomerProfileOverview() {
  const data = {
    datasets: [
      {
        data: [720, 156],
        backgroundColor: ['#312e81', '#db2777'],
        borderWidth: 0,
      },
    ],
  };
  
  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };
  
  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Customer Profile Overview</h2>
      
      <div className="relative h-52">
        <Doughnut data={data} options={options} />
        
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">156</span>
                <span className="text-xl">→</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center mt-16 ml-16">
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">720</span>
                <span className="text-xl">←</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-around mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-navbg"></span>
          <span className="text-sm text-gray-600">Total Customers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent-600"></span>
          <span className="text-sm text-gray-600">Active Customers</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileOverview;