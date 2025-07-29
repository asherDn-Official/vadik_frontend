import React, { useEffect, useState } from "react";
import api from "../../api/apiconfig";
import { set } from "react-hook-form";

const campaignData = [
  {
    name: "Spin the Wheel",
    customers: 100,
    openRate: 74,
    clickRate: 62,
    responded: 30,
  },
  { name: "Quiz", customers: 120, openRate: 82, clickRate: 68, responded: 24 },
  {
    name: "Scratch Card",
    customers: 50,
    openRate: 38,
    clickRate: 24,
    responded: 12,
  },
];

const CampaignTable = () => {
  const [quize,setQuize]=useState(0)
    const [spinWheel,setSpinWheel]=useState(0)
    const [scratchCard,setScratchCard]=useState(0)
    useEffect(()=>{
      const fetchData=async()=>{
        try{
          const response=await api.get("api/performanceTracking/campaingAnalytics");
          setQuize(response.data.analytics.quiz)
          setScratchCard(response.data.analytics.spinWheel)
          setSpinWheel(response.data.analytics.scratchCard)
        }catch(error){
          console.error('Error fetching data:',error);
        }
      }
      fetchData();
    },[])
    console.log("getched data of quiz"+quize,spinWheel,scratchCard)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3> */}
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
         
              <tr  className="border-b border-gray-100">
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
    <tr  className="border-b border-gray-100">
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
                <tr  className="border-b border-gray-100">
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
