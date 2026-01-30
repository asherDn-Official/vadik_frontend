import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/apiconfig";

import { formatIndianMobile } from "../customerProfile/formatIndianMobile";

const CustomerList = ({
  customers,
  loading,
  selectedCustomers,
  toggleCustomerSelection,
  toggleAllCustomers,
  pagination,
  currentPage,
  onPageChange,
}) => {
  const [tableHeaders, setTableHeaders] = useState([
    "name",
    "mobileNumber",
    "gender",
    "firstVisit",
    "source",
    "isActive",
  ]);
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  console.log(customers.isOptedIn,); // null  //false

  // Function to safely get nested values from customer object
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((o, p) => (o || {})[p], obj);
  };

  const enabledCustomers = customers.filter((c) => c.isOptedIn === true);
  const allSelected =
    enabledCustomers.length > 0 &&
    enabledCustomers.every((c) => selectedCustomers.includes(c._id));

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all enabled customers
      enabledCustomers.forEach((customer) => {
        if (selectedCustomers.includes(customer._id)) {
          toggleCustomerSelection(customer._id);
        }
      });
    } else {
      // Select all enabled customers
      enabledCustomers.forEach((customer) => {
        if (!selectedCustomers.includes(customer._id)) {
          toggleCustomerSelection(customer._id);
        }
      });
    }
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get(
          `/api/customer-preferences/${retailerId}`
        );
        const apiData = response.data;
        const mergedData = {
          allData: [
            ...apiData?.additionalData,
            ...apiData?.advancedDetails,
            ...apiData?.advancedPrivacyDetails,
          ],
        };

        // Extract all unique keys from the API data
        const keysArray = mergedData.allData.map((item) => item.key);

        // Combine with default headers and remove duplicates
        const allHeaders = [
          ...new Set([
            "name",
            "mobileNumber",
            "gender",
            "firstVisit",
            "source",
            "isActive",
            ...keysArray,
          ]),
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
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/(^|\s)\S/g, (l) => l.toUpperCase()) // Capitalize first letters
      .trim();
  };

  // Render cell content based on header
  const renderCellContent = (customer, header) => {
    switch (header) {
      case "name":
        return `${customer.firstname || ""} ${customer.lastname || ""}`.trim();
      case "mobileNumber":
        return  `${formatIndianMobile(customer.countryCode + " " + customer.mobileNumber)}`
      case "gender":
        return customer.gender || "";
      case "firstVisit":
         return formatUTCDate(customer.firstVisit);
      case "source":
        return customer.source
          ? customer.source.charAt(0).toUpperCase() + customer.source.slice(1)
          : "";
      case "isActive":
        return customer.isActive ? "Active" : "InActive";
      default:
        // Check nested properties
        // Check nested properties (returns empty string if value is "")
        const nestedValue =
          getNestedValue(customer, `additionalData.${header}.value`) ??
          getNestedValue(customer, `advancedDetails.${header}.value`) ??
          getNestedValue(customer, `advancedPrivacyDetails.${header}.value`);

        // Handle null/undefined values
        if (
          nestedValue === null ||
          nestedValue === undefined ||
          nestedValue === ""
        ) {
          return "-";
        }

        // Check if the value is a date string in ISO format
        if (
          typeof nestedValue === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(nestedValue)
        ) {
          try {
            const date = new Date(nestedValue);
            // Format as dd/mm/yyyy
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          } catch (error) {
            // If date parsing fails, return original value
            return nestedValue;
          }
        }

        // Return the original value for non-date strings/values
        return nestedValue;
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
                    onChange={handleToggleAll}
                    className="rounded border-gray-300 text-[#7E57C2] focus:ring-[#7E57C2]"
                  />
                </th>
                {tableHeaders.map((header) => (
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
                    className={`hover:bg-gray-50 transition-colors ${
                      customer.isOptedIn !== true ? "opacity-50" : ""
                    }`}
                    title={
                      customer.isOptedIn !== true
                        ? "Customer not allowed the campaign"
                        : ""
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={() => toggleCustomerSelection(customer._id)}
                        disabled={customer.isOptedIn !== true}
                        className="rounded border-gray-300 text-[#7E57C2] focus:ring-[#7E57C2]"
                      />
                    </td>

                    {tableHeaders.map((header) => (
                      <td
                        key={`${customer._id}-${header}`}
                        className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                      >
                        {renderCellContent(customer, header)}
                      </td>
                    ))}
                  </tr>
                );
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
                currentPage < pagination.totalPages &&
                onPageChange(currentPage + 1)
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
export const formatUTCDate = (isoDate) => {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${
    String(d.getUTCMonth() + 1).padStart(2, "0")
  }/${d.getUTCFullYear()}`;
};
