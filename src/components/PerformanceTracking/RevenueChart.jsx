import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RevenueChart = ({
  data,
  totalRevenue,
  yesterdayChange,
  monthChange,
  yearChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Growth
          </h3>
          <div className="flex items-center space-x-4 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {totalRevenue}
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  yesterdayChange >= 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {yesterdayChange >= 0 ? "↑" : "↓"} {Math.abs(yesterdayChange)}%
                Yesterday
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  monthChange >= 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {monthChange >= 0 ? "↑" : "↓"} {Math.abs(monthChange)}% last
                Month
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  yearChange >= 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {yearChange >= 0 ? "↑" : "↓"} {Math.abs(yearChange)}% last year
              </span>
            </div>
          </div>
        </div>
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

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#EC4899"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
