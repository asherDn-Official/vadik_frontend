import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/apiconfig";

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
  const [tableHeaders, setTableHeaders] = useState([
    "name",
    "mobileNumber",
    "gender",
    "firstVisit",
    "source"
  ]);
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  // Function to safely get nested values from customer object
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => (o || {})[p], obj) ;
  };

  const allSelected = customers.length > 0 &&
    selectedCustomers.length === customers.length;

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get(`/api/customer-preferences/${retailerId}`);
        const apiData = response.data;
        const mergedData = {
          allData: [...apiData?.additionalData, ...apiData?.advancedDetails, ...apiData?.advancedPrivacyDetails]
        };

        // Extract all unique keys from the API data
        const keysArray = mergedData.allData.map(item => item.key);

        // Combine with default headers and remove duplicates
        const allHeaders = [
          ...new Set([
            "name",
            "mobileNumber",
            "gender",
            "firstVisit",
            "source",
            ...keysArray
          ])
        ];

        setTableHeaders(allHeaders);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Format header names for display
  const formatHeaderName = (header) => {
    return header
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/(^|\s)\S/g, l => l.toUpperCase()) // Capitalize first letters
      .trim();
  };

  // Render cell content based on header
  const renderCellContent = (customer, header) => {
    switch (header) {
      case 'name':
        return `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
      case 'mobileNumber':
        return customer.mobileNumber || '';
      case 'gender':
        return customer.gender || '';
      case 'firstVisit':
        return customer.firstVisit ?
          new Date(customer.firstVisit).toLocaleDateString() : '';
      case 'source':
        return customer.source ? customer.source.charAt(0).toUpperCase() + customer.source.slice(1) : '';
      default:
        // Check nested properties
        // Check nested properties (returns empty string if value is "")
        const nestedValue =
          getNestedValue(customer, `additionalData.${header}.value`) ??
          getNestedValue(customer, `advancedDetails.${header}.value`) ??
          getNestedValue(customer, `advancedPrivacyDetails.${header}.value`);
        return nestedValue ?? 'dsfsdf';
    }
  };

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
          className={`px-3 py-1 mx-1 rounded ${currentPage === i
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
                {tableHeaders.map(header => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                  >
                    {formatHeaderName(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => {

                return (
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

                    {tableHeaders.map(header => (
                      <td
                        key={`${customer._id}-${header}`}
                        className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                      >
                        {renderCellContent(customer, header)}
                      </td>
                    ))}
                  </tr>
                )
              })}
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
              className={`p-1 rounded ${currentPage === 1
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
              className={`p-1 rounded ${currentPage === pagination.totalPages
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