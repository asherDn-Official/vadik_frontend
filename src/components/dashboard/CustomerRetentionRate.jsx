import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

function CustomerRetentionRate() {
  const data = {
    datasets: [
      {
        data: [40, 60],
        backgroundColor: ['#db2777', '#f1f5f9'],
        borderWidth: 0,
        circumference: 270,
        rotation: 135,
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
    <div className="dashboard-card h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Retention Rate</h2>
      
      <div className="relative h-52 flex-1 flex items-center justify-center">
        <Doughnut data={data} options={options} />
        
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-900">40 %</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerRetentionRate;