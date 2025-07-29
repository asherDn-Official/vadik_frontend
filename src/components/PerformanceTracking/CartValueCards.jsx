import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig";

const CartValueCards = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
 const [noOfCustomer,setNoOfCustomer]=useState(0)
  const [lastMonthTurnOver,setLastMonthTurnOver]=useState(0)
  const [avgTurnoverPerDay,setAvgTurnoverPerDay]=useState(0)
  const [avgTurnoverPerCustomer,setAvgTurnoverPerCustomer]=useState(0)
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const response=await api.get("api/performanceTracking/cartStatistics");
        setNoOfCustomer(response.data.customersCreated)
        setAvgTurnoverPerCustomer(response.data.avgTurnoverPerCustomer)
        setAvgTurnoverPerDay(response.data.avgTurnoverPerDay)
        setLastMonthTurnOver(response.data.lastMonthTurnover)
      }catch(error){
        console.error('Error fetching data:',error);
      }
    }
    fetchData();
  },[])
  const cardData = [
    {
      icon: Users,
      value: noOfCustomer,
      label: "No. of Customer",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      icon: DollarSign,
      value: lastMonthTurnOver,
      label: "Last Month Turn Over",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: ShoppingCart,
      value: avgTurnoverPerDay,
      label: "Avg Turnover per Day",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: TrendingUp,
      value: avgTurnoverPerCustomer,
      label: "Avg Turnover / Customer",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Cart Value</h3>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-500" />
          {/* <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            selectsStart
            startDate={selectedDate}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full sm:w-40"
            placeholderText="Select date"
          /> */}
          <div className="text-sm text-gray-600">Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartValueCards;
