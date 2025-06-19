import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HelpCircle } from "lucide-react";

const ConversionChart = ({ percentage }) => {
  const data = [
    { name: "Converted", value: percentage },
    { name: "Not Converted", value: 100 - percentage },
  ];

  const COLORS = ["#EC4899", "#E5E7EB"];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
        <HelpCircle size={16} className="text-gray-400" />
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionChart;
