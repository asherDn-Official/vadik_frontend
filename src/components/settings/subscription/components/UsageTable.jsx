export default function UsageTable({ data }) {
  // Safe defaults if data is loading or missing
  const safeData = data || {
    customers: { allowed: 0, used: 0, remaining: 0 },
    activities: { allowed: 0, used: 0, remaining: 0 },
    whatsappActivities: { allowed: 0, used: 0, remaining: 0 },
    mediaStorage: { allowed: 0, used: 0 }
  };

  const isDataLoading = !data;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-900 to-indigo-800">
            <th className="text-left py-3 px-4 text-white font-medium">Features</th>
            <th className="text-center py-3 px-4 text-white font-medium">Given</th>
            <th className="text-center py-3 px-4 text-white font-medium">Used</th>
            <th className="text-center py-3 px-4 text-white font-medium">Balance</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          <tr className="border-t border-gray-200">
            <td className="py-3 px-4 text-gray-700">
              Customers Profile
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : safeData.customers.allowed}
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : safeData.customers.used}
            </td>
            <td className="py-3 px-4 text-center font-medium text-gray-700">
              {isDataLoading ? '-' : safeData.customers.remaining}
            </td>
          </tr>
          {/* Repeat for other rows */}
          <tr className="border-t border-gray-200">
            <td className="py-3 px-4 text-gray-700">
              Customer Activities 
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : safeData.activities.allowed}
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : safeData.activities.used}
            </td>
            <td className="py-3 px-4 text-center font-medium text-gray-700">
              {isDataLoading ? '-' : safeData.activities.remaining}
            </td>
          </tr>
          <tr className="border-t border-gray-200">
            <td className="py-3 px-4 text-gray-700">
              WhatsApp Credits 
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' :  `₹${safeData.whatsappActivities.allowed}`}
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : `₹${safeData.whatsappActivities.used}`}
            </td>
            <td className="py-3 px-4 text-center font-medium text-gray-700">
{isDataLoading ? '-' : `₹${safeData.whatsappActivities.remaining}`}
            </td>
          </tr>
          {/* <tr className="border-t border-gray-200">
            <td className="py-3 px-4 text-gray-700">
              Media Storage (MB) {isDataLoading && <span className="text-xs text-gray-400">(Loading...)</span>}
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : safeData.mediaStorage.allowed}
            </td>
            <td className="py-3 px-4 text-center text-gray-700">
              {isDataLoading ? '-' : safeData.mediaStorage.used}
            </td>
            <td className="py-3 px-4 text-center font-medium text-gray-700">
              {isDataLoading ? '-' : (safeData.mediaStorage.allowed - safeData.mediaStorage.used)}
            </td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
}