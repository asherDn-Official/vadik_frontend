import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CustomerList = ({
  customers,
  loading,
  selectedCustomers,
  toggleCustomerSelection,
  toggleAllCustomers,
  pagination,
  currentPage,
  onPageChange
}) => {
  // Function to safely get nested values from customer object
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => (o || {})[p], obj) || '';
  };

  const allSelected = customers.length > 0 && 
                      selectedCustomers.length === customers.length;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const { totalPages } = pagination;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-[#7E57C2] text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7E57C2]"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No customers found matching your criteria
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <div className="overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#ECEDF3] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllCustomers}
                    className="rounded border-gray-300 text-[#7E57C2] focus:ring-[#7E57C2]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  ID.No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Profession
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Income
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  First Visit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer._id)}
                      onChange={() => toggleCustomerSelection(customer._id)}
                      className="rounded border-gray-300 text-[#7E57C2] focus:ring-[#7E57C2]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {customer.customerId}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {customer.firstname} {customer.lastname}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {customer.mobileNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap capitalize">
                    {customer.source}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {getNestedValue(customer, 'additionalData.profession.value')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {getNestedValue(customer, 'additionalData.location.value')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {getNestedValue(customer, 'additionalData.income.value') || 
                     getNestedValue(customer, 'advancedDetails.income.value')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {customer.firstVisit ? 
                      new Date(customer.firstVisit).toLocaleDateString() : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
            {pagination.total} customers
          </div>
          <div className="flex items-center">
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {renderPageNumbers()}

            <button
              onClick={() => 
                currentPage < pagination.totalPages && onPageChange(currentPage + 1)
              }
              disabled={currentPage === pagination.totalPages}
              className={`p-1 rounded ${
                currentPage === pagination.totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;