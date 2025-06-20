import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

const data = [
  { name: "Jan", value: 10 },
  { name: "Feb", value: 15 },
  { name: "Mar", value: 30 },
  { name: "Apr", value: 45 },
  { name: "May", value: 50 },
  { name: "Jun", value: 35 },
  { name: "Jul", value: 25 },
  { name: "Aug", value: 40 },
  { name: "Sep", value: 55 },
  { name: "Oct", value: 65 },
  { name: "Nov", value: 75 },
  { name: "Dec", value: 90 },
];

const RevenueChart = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Today</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">$ 58,000.00</div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>20% Yesterday</span>
          </div>
          <div className="flex items-center space-x-1 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span>20% last Month</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>20% last year</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(value) => `${value}k`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#E91E63"
              strokeWidth={3}
              dot={false}
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E91E63" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#E91E63" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
