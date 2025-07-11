import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const PurchasedCustomerList = ({ billingData, onBack, onCustomerClick, onPageChange, loading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Safely get customers list or default to empty array
  const customersList = billingData?.customersList || [];
  const totalPages = billingData?.pagination?.totalPages || 1;
  const hasNextPage = billingData?.pagination?.hasNextPage || false;
  const hasPrevPage = billingData?.pagination?.hasPrevPage || false;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, customersList.length);

  useEffect(() => {
    // Reset to page 1 when billing data changes
    setCurrentPage(1);
  }, [billingData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
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
        <div className="text-red-500 p-4 bg-red-50 rounded-md">
          Error: {error.message || "Failed to load customer data"}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
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
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  S. no
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  Mobile Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody>
              {customersList.length > 0 ? (
                customersList.map((customer, index) => (
                  <tr
                    key={customer.id || index}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onCustomerClick(customer)}
                  >
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {String(startIndex + index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {customer.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer.mobile || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer.orderId || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹ {customer.totalValue?.toLocaleString() || "0"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No customers found for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {customersList.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {endIndex} of {customersList.length} results
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded text-sm ${
                      currentPage === pageNum
                        ? "bg-slate-800 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedCustomerList;