import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from '../common/DatePicker';

function CustomerProfileCollection() {
  const days = [11, 12, 13, 14, 15, 16, 17];
  const values = [65, 80, 60, 70, 85, 45, 35];
  
  return (
    <div className="dashboard-card h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Customer Profile Collection</h2>
        <div className="flex items-center gap-2">
          <DatePicker />
        </div>
      </div>
      
      <div className="text-6xl font-bold text-indigo-900 mb-6">120</div>
      
      <div className="flex items-end gap-2 mb-4 justify-between">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full rounded-full ${index < 5 ? 'bg-accent-600' : 'bg-gray-300'}`} 
              style={{ height: `${values[index]}px` }}
            ></div>
            <span className="text-xs mt-2 text-gray-600">{day}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-around mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent-400"></span>
          <span className="text-sm text-gray-600">Retention Customer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent-600"></span>
          <span className="text-sm text-gray-600">New Customers</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileCollection;