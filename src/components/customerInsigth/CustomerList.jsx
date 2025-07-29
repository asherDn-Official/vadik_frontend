// import React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// const CustomerList = ({
//   customers,
//   selectedCustomers,
//   toggleCustomerSelection,
//   toggleAllCustomers,
//   totalCustomers,
//   customersPerPage,
//   currentPage,
//   paginate,
// }) => {
//   const allSelected =
//     customers.length > 0 && selectedCustomers.length === customers.length;
//   const pageCount = Math.ceil(totalCustomers / customersPerPage);

//   const renderPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;

//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(
//         <button
//           key={i}
//           onClick={() => paginate(i)}
//           className={`px-3 py-1 mx-1 rounded ${
//             currentPage === i
//               ? "bg-[#7E57C2] text-white"
//               : "bg-white text-gray-600 hover:bg-gray-100"
//           }`}
//         >
//           {i}
//         </button>
//       );
//     }

//     return pages;
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm">
//       <div className="overflow-x-auto">
//         <div className=" overflow-y-auto">
//           <table className="w-full">
//             <thead className="bg-[#ECEDF3] sticky top-0 z-10">
//               <tr>
//                 <th className="px-4 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={allSelected}
//                     onChange={toggleAllCustomers}
//                     className="rounded border-gray-300 text-[#7E57C2] focus:ring-[#7E57C2]"
//                   />
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   ID.No
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Name
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Mobile Number
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Gender
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Source
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Profession
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Location
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Income
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Favorite Product
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Favorite Colour
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Favorite Brand
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Life Style
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Customer Label
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Special Days
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                   Interest
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {customers.map((customer) => (
//                 <tr
//                   key={customer.id}
//                   className="hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="px-4 py-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedCustomers.includes(customer.id)}
//                       onChange={() => toggleCustomerSelection(customer.id)}
//                       className="rounded border-gray-300 text-[#7E57C2] focus:ring-[#7E57C2]"
//                     />
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
//                     {customer.id}
//                   </td>
//                   <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
//                     {customer.name}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.mobileNumber}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.gender}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.source}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.profession}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.location}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.income}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.favoriteProduct}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.favoriteColour}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.favoriteBrand}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.lifeStyle}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.customerLabel}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.specialDays}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
//                     {customer.interest}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {pageCount > 1 && (
//         <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
//           <div className="text-sm text-gray-700">
//             Showing {(currentPage - 1) * customersPerPage + 1} to{" "}
//             {Math.min(currentPage * customersPerPage, totalCustomers)} of{" "}
//             {totalCustomers} customers
//           </div>
//           <div className="flex items-center">
//             <button
//               onClick={() => currentPage > 1 && paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//               className={`p-1 rounded ${
//                 currentPage === 1
//                   ? "text-gray-400 cursor-not-allowed"
//                   : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               <ChevronLeft size={18} />
//             </button>

//             {renderPageNumbers()}

//             <button
//               onClick={() =>
//                 currentPage < pageCount && paginate(currentPage + 1)
//               }
//               disabled={currentPage === pageCount}
//               className={`p-1 rounded ${
//                 currentPage === pageCount
//                   ? "text-gray-400 cursor-not-allowed"
//                   : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               <ChevronRight size={18} />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerList;

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CustomerList = () => {
  const { retailerId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    profession: "",
    value: "",
    search: "",
    month: "",
    year: "",
    quarter: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: customersPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "") {
          delete params[key];
        }
      });

      const response = await axios.get(`/api/personilizationInsights`, {
        params,
      });

      setCustomers(response.data.data);
      setTotalCustomers(response.data.pagination.total);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((customer) => customer._id));
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const allSelected =
    customers?.length > 0 && selectedCustomers?.length === customers?.length;
  const pageCount = Math.ceil(totalCustomers / customersPerPage);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
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

  // Function to get nested values safely
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((o, p) => (o || {})[p], obj) || "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filter Controls */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={filters.profession}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by profession"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="General search"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Months</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <>
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
                      Mobile Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Gender
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
                      Favorite Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Favorite Colour
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Favorite Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Life Style
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Customer Label
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Special Days
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Interest
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers?.map((customer) => (
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
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "additionalData.gender.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {customer.source}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "additionalData.profession.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "additionalData.location.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "additionalData.income.value"
                        ) ||
                          getNestedValue(
                            customer,
                            "advancedDetails.income.value"
                          )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "advancedDetails.favoriteProduct.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "advancedDetails.favoriteColour.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "advancedDetails.favoriteBrand.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "advancedDetails.lifeStyle.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "advancedDetails.customerLabel.value"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "additionalData.anniversary.value"
                        ) ||
                          getNestedValue(
                            customer,
                            "advancedDetails.anniversary.value"
                          )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {getNestedValue(
                          customer,
                          "advancedDetails.interest.value"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * customersPerPage + 1} to{" "}
                {Math.min(currentPage * customersPerPage, totalCustomers)} of{" "}
                {totalCustomers} customers
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
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
                    currentPage < pageCount && paginate(currentPage + 1)
                  }
                  disabled={currentPage === pageCount}
                  className={`p-1 rounded ${
                    currentPage === pageCount
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerList;
