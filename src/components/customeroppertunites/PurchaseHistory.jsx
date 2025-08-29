import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import api from '../../api/apiconfig';

const PurchaseHistory = ({mobileNumber}) => {

  const [showPurchaseList, setShowPurchaseList] = useState(false);
  const [showAllPurchases, setShowAllPurchases] = useState(false);
  const [purchaseHistoryData ,SetPurchaseHistoryData]= useState([]);


  const getOrderHistrory = async() =>{
     try{
          const respose  =await api.get(`/api/orderHistory/getCustomerPurchaseData?mobileNumber=${mobileNumber}`);
          SetPurchaseHistoryData(respose.data);
     }catch(err){
         console.log("error",err)
     }
  }

  useEffect(()=>{
     getOrderHistrory()
  },[])

  // Prepare data for pie chart
  const pieChartData = purchaseHistoryData.map(item => ({
    name: item.month,
    value: item.totalAmount,
    orders: item.totalOrders
  }));

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm">{`Amount: $${payload[0].value}`}</p>
          <p className="text-sm">{`Orders: ${payload[0].payload.orders}`}</p>
        </div>
      );
    }
    return null;
  };

  // Colors for the pie chart segments
  const COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Purchase History</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowPurchaseList(!showPurchaseList)}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            {showPurchaseList ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {!showPurchaseList ? (
        <div className="mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-3">
          {purchaseHistoryData.slice(0, showAllPurchases ? undefined : 5).map((purchase, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{purchase.month} {purchase.year}</p>
                <p className="text-xs text-gray-500">{purchase.totalOrders} orders</p>
              </div>
              <p className="text-sm font-medium text-gray-900">${purchase.totalAmount}</p>
            </div>
          ))}
          {purchaseHistoryData.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllPurchases(!showAllPurchases)}
              className="text-pink-600 text-sm font-medium hover:text-pink-700"
            >
              {showAllPurchases ? "Show Less" : "See More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;