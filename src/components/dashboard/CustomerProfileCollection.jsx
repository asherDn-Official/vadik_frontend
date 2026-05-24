import { useEffect, useState } from "react";
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
        new Date().setDate(new Date().getDate() - 1),
      ).toISOString(),
      newCustomers: 10,
      retentionCustomers: 44,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 2),
      ).toISOString(),
      newCustomers: 19,
      retentionCustomers: 84,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 3),
      ).toISOString(), // changed
      newCustomers: 50,
      retentionCustomers: 45,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 4),
      ).toISOString(), // changed
      newCustomers: 70,
      retentionCustomers: 89,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 5),
      ).toISOString(), // changed
      newCustomers: 70,
      retentionCustomers: 89,
    },
    {
      date: new Date(
        new Date().setDate(new Date().getDate() - 6),
      ).toISOString(), // changed
      newCustomers: 20,
      retentionCustomers: 29,
    },
  ]);

  const [startDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6)),
  );
  const [endDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const formattedStart = format(startDate, "yyyy-MM-dd");
        const formattedEnd = format(endDate, "yyyy-MM-dd");

        const res = await api.get(
          `api/dashboard/customerProfileCollection?startDate=${formattedStart}&endDate=${formattedEnd}`,
        );

        setData(res.data || []);
      } catch (err) {
        console.error("Failed to fetch customer profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [startDate, endDate]);

  const total = data.reduce(
    (sum, d) => sum + d.newCustomers + d.retentionCustomers,
    0,
  );
  const maxDailyTotal = Math.max(
    ...data.map((d) => d.newCustomers + d.retentionCustomers),
    1,
  );

  return (
    <div className="dashboard-card flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dashboard-card-title">
            Customer Profile Collection
          </h2>
          <p className="dashboard-card-description">
            New and returning customer profiles by day
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="text-5xl font-bold leading-none text-[#1F1C5C] sm:text-[56px]">
          {loading ? "--" : total}
        </span>

        <span className="mb-2 text-sm font-medium text-[#7E85A8]">
          Total Profiles
        </span>
      </div>
      {/* Bar Graph */}
      <div className="mt-6 flex h-36 items-end justify-between gap-2 sm:h-44 sm:gap-3 lg:h-48">
        {data.map(({ date, newCustomers, retentionCustomers }, index) => {
          const totalHeight = newCustomers + retentionCustomers;
          const retentionHeight =
            totalHeight > 0
              ? Math.max((retentionCustomers / maxDailyTotal) * 100, 8)
              : 0;
          const newHeight =
            totalHeight > 0
              ? Math.max((newCustomers / maxDailyTotal) * 100, 8)
              : 0;
          const day = new Date(date).getDate();

          return (
            <div
              key={date}
              className="
                flex flex-1 flex-col items-center
                relative group min-w-[28px]
                transition-all duration-300
                hover:-translate-y-1
                "
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && totalHeight > 0 && (
                <div
                  className="
                    absolute -top-16 z-20
                    rounded-2xl
                    border border-white/20
                    bg-[#1F1C5C]/95
                    px-4 py-2
                    text-xs text-white
                    shadow-2xl
                    backdrop-blur-xl
                    whitespace-nowrap
                  "
                >
                  <div>New: {newCustomers}</div>
                  <div>Retention: {retentionCustomers}</div>
                </div>
              )}

              {totalHeight === 0 ? (
                <div className="w-full rounded-full bg-gray-300 h-2 mt-auto mb-1"></div>
              ) : (
                <div className="flex h-full w-full max-w-[46px] flex-col justify-end overflow-hidden rounded-full">
                  <div
                    className="
                      bg-gradient-to-t
                      from-[#F9B4CC]
                      to-[#F7D6E2]
                      rounded-t-full
                      transition-all duration-300
                      "
                    style={{ height: `${retentionHeight}%` }}
                  />
                  <div
                    className="
                      bg-gradient-to-t
                      from-[#EC396F]
                      to-[#FF5B93]
                      rounded-b-full
                      shadow-[0_4px_20px_rgba(236,57,111,0.35)]
                      transition-all duration-300
                      "
                    style={{ height: `${newHeight}%` }}
                  />
                </div>
              )}

              <span className="mt-3 text-xs font-medium text-[#7E85A8]">
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-300"></span>
          <span className="font-[Poppins] text-sm font-medium leading-4 text-[#313166] opacity-80">
            Retention Customer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500"></span>
          <span className="font-[Poppins] text-sm font-medium leading-4 text-[#313166] opacity-80">
            New Customers
          </span>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileCollection;
