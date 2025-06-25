import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://13.60.19.134:5000/api/customers?retailerId=6856350030bcee9b82be4c17&page=${currentPage}&limit=${itemsPerPage}`
        );
        const data = await response.json();
        setCustomers(data.data);
        setTotalItems(data.pagination.totalItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobileNumber.includes(searchTerm) ||
      customer.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleCustomerClick = (customerId) => {
    navigate(`/customer-profile/${customerId}`);
  };

  const handleEditClick = (e, customerId) => {
    e.stopPropagation();
    navigate(`/customers/edit/${customerId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F4F5F9] items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4F5F9]">
      <div className="flex-1 flex flex-col overflow-hidden m-2 rounded-[20px]">
        <div className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Customer List{" "}
              <span className="text-gray-500 font-normal">
                ({totalItems})
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
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCustomerClick(customer._id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.firstname}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.lastname}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.mobileNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      {customer.source}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#313166]">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => handleEditClick(e, customer._id)}
                      >
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
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
              {totalItems} results
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