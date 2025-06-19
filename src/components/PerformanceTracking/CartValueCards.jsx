import React, { useState } from "react";
import { User, IndianRupee, TrendingUp, Users, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CartValueCards = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const cards = [
    {
      icon: User,
      value: `${data.customerPercentage}%`,
      subtitle: "No. of Customer",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      icon: IndianRupee,
      value: data.revenue,
      subtitle: "Last Month Turn Over",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: TrendingUp,
      value: data.avgTurnover,
      subtitle: "Avg Turnover per Day",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      icon: Users,
      value: data.avgTurnoverPerCustomer,
      subtitle: "Avg Turnover / Customer",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cart Value</h3>
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <span>Today</span>
            <Calendar size={14} />
          </button>
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 z-10">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date || new Date());
                  setShowDatePicker(false);
                }}
                inline
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-4 hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white bg-opacity-50 rounded-lg">
                  <Icon size={18} className={card.iconColor} />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {card.value}
                </span>
              </div>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartValueCards;
