import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";

const DailyBillingUpdate = () => {
  const [startDate, setStartDate] = useState(new Date("2025-05-02"));
  const [endDate, setEndDate] = useState(new Date("2025-05-09"));

  // Mock data for the table
  const billingData = [
    {
      id: 1,
      serial: "01",
      date: "02/05/2025",
      customers: 100,
      sale: "₹ 50,000",
    },
    {
      id: 2,
      serial: "02",
      date: "03/05/2025",
      customers: 150,
      sale: "₹ 80,000",
    },
    {
      id: 3,
      serial: "03",
      date: "05/05/2025",
      customers: 79,
      sale: "₹ 10,000",
    },
    {
      id: 4,
      serial: "03",
      date: "05/05/2025",
      customers: 79,
      sale: "₹ 10,000",
    },
    {
      id: 5,
      serial: "04",
      date: "06/05/2025",
      customers: 101,
      sale: "₹ 15,000",
    },
    {
      id: 6,
      serial: "05",
      date: "07/05/2025",
      customers: 56,
      sale: "₹ 40,000",
    },
    {
      id: 7,
      serial: "06",
      date: "08/05/2025",
      customers: 20,
      sale: "₹ 50,000",
    },
    {
      id: 8,
      serial: "07",
      date: "09/05/2025",
      customers: 200,
      sale: "₹ 10,000",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Daily Billing Update</h2>

        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-pink-700 transition">
            Import
          </button>
          <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-pink-50 transition">
            Create Order Sheet
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              dateFormat="dd/MM/yyyy"
            />
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
          </div>

          <span className="text-gray-500">-</span>

          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              dateFormat="dd/MM/yyyy"
            />
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">S. no</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">No. Of. Customers</th>
                <th className="px-4 py-3 text-left">Total Sale</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {billingData.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">{item.serial}</td>
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">{item.customers}</td>
                  <td className="px-4 py-3">{item.sale}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-500 hover:text-blue-700">
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
