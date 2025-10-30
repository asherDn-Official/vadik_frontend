import React, { useCallback, useEffect, useState } from "react";
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
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [noOfCustomer, setNoOfCustomer] = useState(0);
  const [lastMonthTurnOver, setLastMonthTurnOver] = useState(0);
  const [avgTurnoverPerDay, setAvgTurnoverPerDay] = useState(0);
  const [avgTurnoverPerCustomer, setAvgTurnoverPerCustomer] = useState(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateRangeChange = (update) => {
    const [newStart, newEnd] = update;
    const validStart = newStart && newStart > today ? today : newStart;
    let validEnd = newEnd && newEnd > today ? today : newEnd;
    if (validStart && validEnd && validEnd < validStart) {
      validEnd = validStart;
    }
    setDateRange([validStart || null, validEnd || null]);
  };

  // Format date to yyyy-mm-dd
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchCartData = useCallback(async (params = {}) => {
    try {
      const response = await api.get("api/performanceTracking/cartStatistics", {
        params
      });
      
      setNoOfCustomer(response.data.customersCreated);
      setAvgTurnoverPerCustomer(response.data.avgTurnoverPerCustomer);
      setAvgTurnoverPerDay(response.data.avgTurnoverPerDay);
      setLastMonthTurnOver(response.data.turnover);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  }, []);

  // Handle date range change with clear detection
  const handleDateRangeChangeWithClear = (update) => {
    const [newStart, newEnd] = update;
    
    // If both dates are cleared, fetch initial data immediately
    if (!newStart && !newEnd) {
      setDateRange([null, null]);
      // Fetch data without any date filters
      fetchCartData();
      return;
    }
    
    handleDateRangeChange(update);
  };

  const handleApplyFilters = () => {
    const params = {};

    if (startDate && endDate) {
      params.startDate = formatDate(startDate);
      params.endDate = formatDate(endDate);
    } else if (startDate) {
      params.singleDate = formatDate(startDate);
    }

    if (Object.keys(params).length > 0) {
      fetchCartData(params);
    }
  };

  const handleClearFilters = () => {
    setDateRange([null, null]);
    fetchCartData();
  };

  const isFilterActive = Boolean(startDate || endDate);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCartData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchCartData]);

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
      label: " Turn Over",
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChangeWithClear}
              isClearable={true}
              maxDate={today}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full sm:w-64"
              placeholderText="Select date range"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          {isFilterActive && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex items-center justify-center rounded-md bg-pink-600 px-4 py-1.5 text-white font-semibold hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Apply Filter
              </button>
              {/* <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-1.5 text-gray-700 font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear
              </button> */}
            </div>
          )}
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