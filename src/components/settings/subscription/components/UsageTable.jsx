export default function UsageTable({ data, isUsingOwnWhatsapp }) {
  // Safe defaults if data is loading or missing
  const safeData = data || {
    customers: { allowed: 0, used: 0, remaining: 0 },
    activities: { allowed: 0, used: 0, remaining: 0 },
    whatsapp: { allowed: 0, used: 0, remaining: 0 }
  };

  const isDataLoading = !data;

  // Helper to round values to nearest integer
  const formatVal = (val) => {
    if (isDataLoading) return '-';
    const num = parseFloat(val) || 0;
    return Math.round(num);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 w-full">
      <div className="app-table-scroll">
      <table className="app-table w-full">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-900 to-indigo-800">
            <th className="text-left py-3 px-4 text-white font-medium whitespace-nowrap">Features</th>
            <th className="text-center py-3 px-4 text-white font-medium whitespace-nowrap">Given</th>
            <th className="text-center py-3 px-4 text-white font-medium whitespace-nowrap">Used</th>
            <th className="text-center py-3 px-4 text-white font-medium whitespace-nowrap">Balance</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          <tr className="border-t border-gray-200">
            <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
              Customers Profile
            </td>
            <td className="py-3 px-4 text-center text-gray-700 whitespace-nowrap">
              {formatVal(safeData.customers.allowed)}
            </td>
            <td className="py-3 px-4 text-center text-gray-700 whitespace-nowrap">
              {formatVal(safeData.customers.used)}
            </td>
            <td className="py-3 px-4 text-center font-medium text-gray-700 whitespace-nowrap">
              {formatVal(safeData.customers.remaining)}
            </td>
          </tr>
          <tr className="border-t border-gray-200">
            <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
              Customer Activities 
            </td>
            <td className="py-3 px-4 text-center text-gray-700 whitespace-nowrap">
              {formatVal(safeData.activities.allowed)}
            </td>
            <td className="py-3 px-4 text-center text-gray-700 whitespace-nowrap">
              {formatVal(safeData.activities.used)}
            </td>
            <td className="py-3 px-4 text-center font-medium text-gray-700 whitespace-nowrap">
              {formatVal(safeData.activities.remaining)}
            </td>
          </tr>
          
          {!isUsingOwnWhatsapp && (
            <tr className="border-t border-gray-200">
              <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                WhatsApp Credits
              </td>
              <td className="py-3 px-4 text-center text-gray-700 whitespace-nowrap">
                ₹ {formatVal(safeData.whatsapp?.allowed)}
              </td>
              <td className="py-3 px-4 text-center text-gray-700 whitespace-nowrap">
                ₹ {formatVal(safeData.whatsapp?.used)}
              </td>
              <td className="py-3 px-4 text-center font-medium text-gray-700 whitespace-nowrap">
                ₹ {formatVal(safeData.whatsapp?.remaining)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
