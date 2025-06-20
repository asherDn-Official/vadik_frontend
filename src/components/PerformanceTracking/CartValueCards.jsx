import React from "react";
import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Calendar } from "lucide-react";

const CartValueCards = () => {
  const cardData = [
    {
      icon: Users,
      value: "53%",
      label: "No. of Customer",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      icon: DollarSign,
      value: "537",
      label: "Last Month Turn Over",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: ShoppingCart,
      value: "220",
      label: "Avg Turnover per Day",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: TrendingUp,
      value: "124",
      label: "Avg Turnover / Customer",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Cart Value</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Today</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
