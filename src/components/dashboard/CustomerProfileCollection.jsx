import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig"; // Adjust path as needed
import { format } from "date-fns";

function CustomerProfileCollection() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const formattedStart = format(startDate, "yyyy-MM-dd");
      const formattedEnd = format(endDate, "yyyy-MM-dd");

      const res = await api.get(
        `api/dashboard/customerProfileCollection?startDate=${formattedStart}&endDate=${formattedEnd}`
      );

      setData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customer profile data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [startDate, endDate]);

  const total = data.reduce(
    (sum, d) => sum + d.newCustomers + d.retentionCustomers,
    0
  );

  return (
    <div className="dashboard-card bg-white rounded-xl p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#313166]">
          Customer Profile Collection
        </h2>

        {/* Date Picker */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 text-[#313166] font-medium text-sm">
          <FaCalendarAlt />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="MMM dd, yyyy"
            className="bg-transparent focus:outline-none w-[110px]"
          />
          <span>-</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="MMM dd, yyyy"
            className="bg-transparent focus:outline-none w-[110px]"
          />
        </div>
      </div>

      {/* Total */}
      <div className="text-6xl font-bold text-[#313166] mb-6">{total}</div>

      {/* Bar Graph */}
      <div className="flex items-end gap-3 mb-4 justify-between h-40 relative">
        {loading ? (
          <div className="text-center w-full text-gray-400">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center w-full text-gray-400">No data</div>
        ) : (
          data.map(({ date, newCustomers, retentionCustomers }, index) => {
            const totalHeight = newCustomers + retentionCustomers;
            const day = new Date(date).getDate();

            return (
              <div
                key={date}
                className="flex flex-col items-center flex-1 relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {hoveredIndex === index && totalHeight > 0 && (
                  <div className="absolute -top-14 z-10 bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg">
                    <div>New: {newCustomers}</div>
                    <div>Retention: {retentionCustomers}</div>
                  </div>
                )}

                {totalHeight === 0 ? (
                  <div className="w-6 rounded-full bg-gray-300 h-2 mt-auto mb-1"></div>
                ) : (
                  <div className="flex flex-col justify-end w-6 relative">
                    <div
                      className="bg-pink-300 rounded-t-md"
                      style={{ height: `${retentionCustomers}px` }}
                    />
                    <div
                      className="bg-rose-500 rounded-t-md"
                      style={{
                        height: `${newCustomers}px`,
                        marginTop: "-4px",
                      }}
                    />
                  </div>
                )}

                <span className="text-xs text-[#313166] opacity-60 mt-2">
                  {day}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-around mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-300"></span>
          <span className="text-sm text-[#313166] opacity-80">
            Retention Customer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500"></span>
          <span className="text-sm text-[#313166] opacity-80">
            New Customers
          </span>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileCollection;
