import React from "react";

const PhoneSearchResults = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No purchase history found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-[#313166] font-[500] text-[18px] mb-4">
          Purchase History
        </h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.product}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-[#313166] font-[500]">
          Showing {history.length} of 24 orders
        </p>
        <div className="flex gap-[2px]">
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#3131661A] border border-gray-300">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#313166] text-white">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#3131661A] border border-gray-300">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#3131661A] border border-gray-300">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#3131661A] border border-gray-300">
            ...
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#3131661A] border border-gray-300">
            8
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#3131661A] border border-gray-300">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneSearchResults;
