import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig";

const CampaignTable = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  const [quize, setQuize] = useState({
    totalSent: 120,
    openRate: 82,
    clickRate: 68,
    responded: 24,
  });
  const [spinWheel, setSpinWheel] = useState({
    totalSent: 100,
    openRate: 74,
    clickRate: 62,
    responded: 30,
  });
  const [scratchCard, setScratchCard] = useState({
    totalSent: 50,
    openRate: 38,
    clickRate: 24,
    responded: 12,
  });

  // Format date to yyyy-mm-dd
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const params = {};
          
          // Add date parameters based on selection
          if (startDate && endDate) {
            // If both dates selected, send as date range
            params.startDate = formatDate(startDate);
            params.endDate = formatDate(endDate);
          } else if (startDate) {
            // If only one date selected, send as singleDate
            params.singleDate = formatDate(startDate);
          }
          // If no dates selected, no date parameters will be sent

          const response = await api.get("api/performanceTracking/campaingAnalytics", {
            params: params
          });
          
          setQuize(response.data.analytics.quiz);
          setScratchCard(response.data.analytics.scratchCard);
          setSpinWheel(response.data.analytics.spinWheel);
        } catch (error) {
          console.error("Error fetching campaign data:", error);
        }
      };
      fetchData();
    }, 1000); // 1-second delay

    return () => clearTimeout(timer);
  }, [startDate, endDate]); // Re-fetch when dates change

  console.log("fetched data of quiz", quize, spinWheel, scratchCard);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-500" />
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={true}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full sm:w-64"
            placeholderText="Select date range"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Activities
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                No. of Customers
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Open Rate
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Click Rate
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Responded
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-gray-900">{"Spin the Wheel"}</td>
              <td className="py-4 px-4 text-gray-700">
                {spinWheel.totalSent}
              </td>
              <td className="py-4 px-4 text-gray-700">{spinWheel.openRate}</td>
              <td className="py-4 px-4 text-gray-700">
                {spinWheel.clickRate}
              </td>
              <td className="py-4 px-4 text-gray-700">
                {spinWheel.responded}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-gray-900">{"Quiz"}</td>
              <td className="py-4 px-4 text-gray-700">
                {quize.totalSent}
              </td>
              <td className="py-4 px-4 text-gray-700">{quize.openRate}</td>
              <td className="py-4 px-4 text-gray-700">
                {quize.clickRate}
              </td>
              <td className="py-4 px-4 text-gray-700">
                {quize.responded}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-gray-900">{"Scratch Card"}</td>
              <td className="py-4 px-4 text-gray-700">
                {scratchCard.totalSent}
              </td>
              <td className="py-4 px-4 text-gray-700">{scratchCard.openRate}</td>
              <td className="py-4 px-4 text-gray-700">
                {scratchCard.clickRate}
              </td>
              <td className="py-4 px-4 text-gray-700">
                {scratchCard.responded}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;