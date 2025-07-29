import React from "react";

const customerData = [
  { name: "Srinivasan", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
  { name: "Chandru", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
  { name: "Srinivasan", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
  { name: "Chandru", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
  { name: "Srinivasan", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
  { name: "Chandru", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
  { name: "Srinivasan", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
];

const CustomerTable = ({value}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Customer (CLV)
      </h3>
      <div className="overflow-x-auto max-h-120 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Customer Name
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Current Value
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Future Value (CLV)
              </th>
            </tr>
          </thead>
          <tbody>
            {value.map((customer, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                <td className="py-3 px-4 text-gray-700">
                  {customer.currentValue}
                </td>
                <td className="py-3 px-4 text-gray-700">
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
