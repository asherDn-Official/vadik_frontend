import { useState } from "react";

const CustomerSidebar = ({ customers, selectedCustomer, onCustomerSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white  flex flex-col m-2 rounded-[10px]">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer List (527)
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => onCustomerSelect(customer)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
              selectedCustomer.id === customer.id
                ? "bg-purple-50 border-l-4"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10  flex items-center justify-center mr-3">
                <img src="../assets/user-in-cp.png" alt="" />
              </div>
              <div className="flex-1">
                <h3 className="font-[400] text-[18px] text-[#313166]">
                  {customer.name}
                </h3>
                <p className="font-[400] text-[15px] text-[#31316680]">
                  {customer.mobileNumber}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSidebar;
