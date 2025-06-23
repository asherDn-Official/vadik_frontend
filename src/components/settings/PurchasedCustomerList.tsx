import React, { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const PurchasedCustomerList = ({ billingData, onBack, onCustomerClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extend the customers list to show more entries for demo
  const extendedCustomers = [
    ...billingData.customersList,
    ...billingData.customersList.map((customer, index) => ({
      ...customer,
      id: customer.id + 100 + index,
      name: `${customer.name} ${index + 2}`,
    })),
  ].slice(0, 100); // Limit to 100 for demo

  const totalPages = Math.ceil(extendedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = extendedCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-4 p-6 border-b">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Purchased Customer List
        </h2>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  S. no
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Mobile Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onCustomerClick(customer)}
                >
                  <td className="px-4 py-3 text-sm">
                    {String(startIndex + index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.mobile}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.orderId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.gender}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₹ {customer.totalValue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, extendedCustomers.length)} of{" "}
            {extendedCustomers.length} results
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 rounded text-sm ${
                    currentPage === pageNumber
                      ? "bg-slate-800 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-3 py-2 rounded text-sm ${
                    currentPage === totalPages
                      ? "bg-slate-800 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedCustomerList;
