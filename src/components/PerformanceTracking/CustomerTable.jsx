import React from "react";

const CustomerTable = ({ customers }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Customer (CLV)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Customer Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Current Value
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Future Value (CLV)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.currentValue}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.futureValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
