import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { customers } from "../data/mockData";
import Sidebar from "../components/common/Sidebar";

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobileNumber.includes(searchTerm) ||
      customer.profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleCustomerClick = (customerId) => {
    navigate(`/customer-profile/${customerId}`);
  };

  const handleEditClick = (e, customerId) => {
    e.stopPropagation();
    navigate(`/customers/edit/${customerId}`);
  };

  return (
    <div className="flex h-screen bg-[#F4F5F9]">
      <div className="flex-1 flex flex-col overflow-hidden m-2 rounded-[20px]">
        <div className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Customer List{" "}
              <span className="text-gray-500 font-normal">
                ({filteredCustomers.length})
              </span>
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="bg-white shadow-sm p-4">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    ID.No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Profession
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.mobileNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.gender}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.source}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.profession}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.income}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      <button className="text-gray-500 hover:text-gray-700">
                        <img
                          src="../assets/pen-edit-icon.png"
                          alt="Edit"
                          className="h-4 w-4"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#313166]">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of{" "}
              {filteredCustomers.length} results
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === 1
                    ? "bg-[#3131661A] cursor-not-allowed opacity-50"
                    : "bg-[#3131661A] hover:bg-gray-100"
                }`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border rounded-md mx-1 ${
                    currentPage === i + 1
                      ? "bg-[#313166] text-white border-[#313166]"
                      : "bg-[#3131661A] text-[#313166] hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === totalPages
                    ? "bg-[#3131661A] cursor-not-allowed opacity-50"
                    : "bg-[#3131661A] hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
