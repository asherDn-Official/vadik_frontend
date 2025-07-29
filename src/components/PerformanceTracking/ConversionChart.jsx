import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";
import api from "../../api/apiconfig";

const COLORS = ["#E91E63", "#F3F4F6"];

const ConversionChart = () => {
  const [conversionRate, setConversionRate] = useState(0);

  const data = [
    { name: "Converted", value: conversionRate },
    { name: "Not Converted", value: 100 - conversionRate },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("api/dashboard/customerRetensionRate");
        const percentage = parseFloat(response.data.retentionPercentage);
        setConversionRate(percentage);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
        <Info className="w-4 h-4 text-gray-400" />
      </div>
      <div className="relative h-48">
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
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {conversionRate.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionChart;
