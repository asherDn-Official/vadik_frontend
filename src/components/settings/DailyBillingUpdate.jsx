import React, { useState } from "react";
import { Calendar, Upload, FileText } from "lucide-react";
import PurchasedCustomerList from "./PurchasedCustomerList";
import DailyOrderSheet from "./DailyOrderSheet";

const DailyBillingUpdate = () => {
  const [startDate, setStartDate] = useState("2025-05-02");
  const [endDate, setEndDate] = useState("2025-05-09");
  const [currentView, setCurrentView] = useState("billing");
  const [selectedBillingData, setSelectedBillingData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleViewDetails = (billingData) => {
    setSelectedBillingData(billingData);
    setCurrentView("customers");
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView("orderSheet");
  };

  const handleBack = () => {
    if (currentView === "orderSheet") {
      setCurrentView("customers");
      setSelectedCustomer(null);
    } else if (currentView === "customers") {
      setCurrentView("billing");
      setSelectedBillingData(null);
    }
  };

  const handleNewOrder = () => {
    setSelectedCustomer(null);
    setCurrentView("orderSheet");
  };

  // Mock context for the table with customer lists
  const billingData = [
    {
      id: 1,
      serial: "01",
      date: "02/05/2025",
      customers: 100,
      sale: "₹ 50,000",
      customersList: [
        {
          id: 1,
          name: "Karthik Raja",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "02/05/2025",
        },
        {
          id: 2,
          name: "Suresh Babu",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "02/05/2025",
        },
        {
          id: 3,
          name: "Chandra",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Female",
          totalValue: 50000,
          date: "02/05/2025",
        },
      ],
    },
    {
      id: 2,
      serial: "02",
      date: "03/05/2025",
      customers: 150,
      sale: "₹ 80,000",
      customersList: [
        {
          id: 4,
          name: "Sathish Kumar",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "03/05/2025",
        },
        {
          id: 5,
          name: "Praveen Anand",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "03/05/2025",
        },
        {
          id: 6,
          name: "Janani",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Female",
          totalValue: 50000,
          date: "03/05/2025",
        },
      ],
    },
    {
      id: 3,
      serial: "03",
      date: "05/05/2025",
      customers: 79,
      sale: "₹ 10,000",
      customersList: [
        {
          id: 7,
          name: "Kavitha",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Female",
          totalValue: 50000,
          date: "05/05/2025",
        },
        {
          id: 8,
          name: "Mohanraj Elango",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "05/05/2025",
        },
      ],
    },
    {
      id: 4,
      serial: "04",
      date: "06/05/2025",
      customers: 101,
      sale: "₹ 15,000",
      customersList: [
        {
          id: 9,
          name: "Dinesh Kannan",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "06/05/2025",
        },
        {
          id: 10,
          name: "Selvaraj",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "06/05/2025",
        },
      ],
    },
    {
      id: 5,
      serial: "05",
      date: "07/05/2025",
      customers: 56,
      sale: "₹ 40,000",
      customersList: [
        {
          id: 11,
          name: "Ramesh Kumar",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "07/05/2025",
        },
      ],
    },
    {
      id: 6,
      serial: "06",
      date: "08/05/2025",
      customers: 20,
      sale: "₹ 50,000",
      customersList: [
        {
          id: 12,
          name: "Priya Sharma",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Female",
          totalValue: 50000,
          date: "08/05/2025",
        },
      ],
    },
    {
      id: 7,
      serial: "07",
      date: "09/05/2025",
      customers: 200,
      sale: "₹ 10,000",
      customersList: [
        {
          id: 13,
          name: "Vikram Singh",
          mobile: "+91 95554 51518",
          orderId: "2025051401",
          gender: "Male",
          totalValue: 50000,
          date: "09/05/2025",
        },
      ],
    },
  ];

  if (currentView === "customers" && selectedBillingData) {
    return (
      <PurchasedCustomerList
        billingData={selectedBillingData}
        onBack={handleBack}
        onCustomerClick={handleCustomerClick}
      />
    );
  }

  if (currentView === "orderSheet") {
    return (
      <DailyOrderSheet
        customer={selectedCustomer}
        onBack={handleBack}
        onNewOrder={handleNewOrder}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Daily Billing Update
        </h2>

        <div className="flex space-x-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={handleNewOrder}
            className="flex items-center gap-2 px-4 py-2 border border-pink-600 text-pink-600 rounded-md hover:bg-pink-50 transition-colors"
          >
            <FileText size={16} />
            Create Order Sheet
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <Calendar
              className="absolute left-3 top-3 text-gray-400"
              size={16}
            />
          </div>

          <span className="text-gray-500">-</span>

          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <Calendar
              className="absolute left-3 top-3 text-gray-400"
              size={16}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  S. no
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  No. Of. Customers
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Total Sale
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {billingData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm">{item.serial}</td>
                  <td className="px-4 py-3 text-sm">{item.date}</td>
                  <td className="px-4 py-3 text-sm">{item.customers}</td>
                  <td className="px-4 py-3 text-sm font-medium">{item.sale}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyBillingUpdate;
