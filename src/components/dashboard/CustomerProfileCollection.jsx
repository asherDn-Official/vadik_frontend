import { FaCalendarAlt } from 'react-icons/fa';

// Sample customer data
const customerData = [
  { day: 19, new: 10, retention: 50 },
  { day: 12, new: 60, retention: 30 },
  { day: 13, new: 50, retention: 10 },
  { day: 14, new: 60, retention: 10 },
  { day: 15, new: 70, retention: 15 },
  { day: 16, new: 0, retention: 0 },
  { day: 17, new: 0, retention: 0 },
];

function CustomerProfileCollection() {
  const total = customerData.reduce((sum, d) => sum + d.new + d.retention, 0);
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="dashboard-card h-50 bg-white rounded-xl p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#313166]">Customer Profile Collection</h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 text-[#313166] font-medium text-sm">
          <FaCalendarAlt />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Total */}
      <div className="text-6xl font-bold text-[#313166] mb-6">{total}</div>

      {/* Bar Graph */}
      <div className="flex items-end gap-3 mb-4 justify-between h-40">
        {customerData.map(({ day, new: newCustomers, retention }) => {
          const totalHeight = newCustomers + retention;

          if (totalHeight === 0) {
            return (
              <div key={day} className="flex flex-col items-center flex-1">
                <div className="w-3 rounded-full bg-gray-300 h-2 mt-auto mb-1"></div>
                <span className="text-xs text-[#313166] opacity-60">{day}</span>
              </div>
            );
          }

          return (
            <div key={day} className="flex flex-col items-center flex-1">
              <div className="flex flex-col justify-end w-3 relative">
                {/* Retention Customers */}
                <div
                  className="bg-pink-300 rounded-t-md"
                  style={{ height: `${retention}px` }}
                />
                {/* New Customers */}
                <div
                  className="bg-rose-500 rounded-t-md"
                  style={{
                    height: `${newCustomers}px`,
                    marginTop: '-4px',
                  }}
                />
              </div>
              <span className="text-xs text-[#313166] opacity-60 mt-2">{day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-around mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-300"></span>
          <span className="text-sm text-[#313166] opacity-80">Retention Customer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500"></span>
          <span className="text-sm text-[#313166] opacity-80">New Customers</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileCollection;