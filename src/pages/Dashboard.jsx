import { useState } from "react";
import DatePicker from "../components/common/DatePicker";
import CustomerProfileCollection from "../components/dashboard/CustomerProfileCollection";
import CustomerProfileOverview from "../components/dashboard/CustomerProfileOverview";
import CustomerRetentionRate from "../components/dashboard/CustomerRetentionRate";
import ChurnRate from "../components/dashboard/ChurnRate";
import CustomerEngagementScore from "../components/dashboard/CustomerEngagementScore";
import OptInOptOut from "../components/dashboard/OptInOptOut";
import CustomerSatisfactionScore from "../components/dashboard/CustomerSatisfactionScore";

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" max-w-[1600px] mx-auto">
        <div className="bg-white p-4">
          <header className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome, Admin
            </h1>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                S
              </div>
            </div>
          </header>
        </div>

        {/* <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <CustomerProfileCollection />
          </div>

          <div className="col-span-12 md:col-span-4">
            <CustomerProfileOverview />
          </div>

          <div className="col-span-12 md:col-span-4">
            <CustomerRetentionRate />
          </div>

          <div className="col-span-12 md:col-span-4">
            <ChurnRate />
          </div>

          <div className="col-span-1 md:col-span-8">
            <CustomerEngagementScore />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="h-full">
                <OptInOptOut />
              </div>
              <div className="h-full">
                <CustomerSatisfactionScore />
              </div>
            </div>
          </div>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* First Column */}
          <div className="space-y-6">
            <CustomerProfileCollection />
            <ChurnRate />
          </div>

          {/* Second Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomerProfileOverview />
              <CustomerRetentionRate />
            </div>

            <CustomerEngagementScore />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OptInOptOut />
              <CustomerSatisfactionScore />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
