import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/apiconfig";
import { format } from "date-fns";

function CustomerProfileCollection() {
  const [data, setData] = useState([
    {
      date: new Date().toISOString(),
      newCustomers: 52,
      retentionCustomers: 58,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 1)
      ).toISOString(),
      newCustomers: 10,
      retentionCustomers: 44,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 2)
      ).toISOString(),
      newCustomers: 19,
      retentionCustomers: 84,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 3)
      ).toISOString(), // changed
      newCustomers: 50,
      retentionCustomers: 45,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 4)
      ).toISOString(), // changed
      newCustomers: 70,
      retentionCustomers: 89,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 5)
      ).toISOString(), // changed
      newCustomers: 70,
      retentionCustomers: 89,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 6)
      ).toISOString(), // changed
      newCustomers: 20,
      retentionCustomers: 29,
    }
    
  ]);

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerData();
    }, 3000); // Delay actual data load by 3 sec

    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  const fetchCustomerData = async () => {
    try {
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

  const total = data.reduce(
    (sum, d) => sum + d.newCustomers + d.retentionCustomers,
    0
  );

  return (
    <div className="dashboard-card bg-white rounded-xl p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[20px] font-medium leading-[114%] tracking-normal text-[#313166] ">
          Customer Profile Collection
        </h2>

        {/* 
        Date Picker
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
        </div> */}
      </div>

      {/* Total */}
      <div className="text-[72px] font-medium leading-[114%] tracking-normal text-[#313166] font-[Poppins] ">
        {total}
      </div>
      {/* Bar Graph */}
      <div className="flex items-end gap-14 mb-4 h-40 relative">
        {data.map(({ date, newCustomers, retentionCustomers }, index) => {
          const totalHeight = newCustomers + retentionCustomers;
          const day = new Date(date).getDate();

          return (
            <div
              key={date}
              className="flex flex-col items-center w-[25px] relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && totalHeight > 0 && (
                <div className="absolute -top-14 z-10 bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg">
                  <div>New: {newCustomers}</div>
                  <div>Retention: {retentionCustomers}</div>
                </div>
              )}

              {totalHeight === 0 ? (
                <div className="w-full rounded-full bg-gray-300 h-2 mt-auto mb-1"></div>
              ) : (
                <div className="flex flex-col justify-end w-full ">
                  <div
                    className="bg-[#EC396F80] rounded-t-2xl"
                    style={{ height: `${retentionCustomers}px` }}
                  />
                  <div
                    className=" bg-[#EC396F] rounded-b-2xl"
                    style={{ height: `${newCustomers}px` }}
                  />
                </div>
              )}

              <span className="text-xs text-[#313166] opacity-60 mt-2">
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-around mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-300"></span>
          <span className="text-[10px] font-medium leading-[100%] tracking-normal text-[#313166] opacity-80 font-[Poppins]">
            Retention Customer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500"></span>
          <span className="text-[10px] font-medium leading-[100%] tracking-normal text-[#313166] opacity-80 font-[Poppins]">
            New Customers
          </span>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileCollection;
