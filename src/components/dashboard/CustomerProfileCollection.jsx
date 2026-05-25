import { useEffect, useState } from "react";
import api from "../../api/apiconfig";
import { eachDayOfInterval, format } from "date-fns";

const getNumericValue = (item, keys) => {
  for (const key of keys) {
    const value = Number(item?.[key]);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
};

const normalizeCustomerProfileData = (rawData, startDate, endDate) => {
  const safeData = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
      ? rawData.data
      : [];

  const lookup = new Map();

  safeData.forEach((item) => {
    if (!item?.date) {
      return;
    }

    const dateKey = format(new Date(item.date), "yyyy-MM-dd");
    lookup.set(dateKey, {
      date: new Date(item.date).toISOString(),
      newCustomers: getNumericValue(item, [
        "newCustomers",
        "newCustomer",
        "newProfiles",
        "newCount",
      ]),
      retentionCustomers: getNumericValue(item, [
        "retentionCustomers",
        "retentionCustomer",
        "retentionProfiles",
        "retainedCustomers",
        "retentionCount",
      ]),
    });
  });

  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");

    return (
      lookup.get(dateKey) || {
        date: day.toISOString(),
        newCustomers: 0,
        retentionCustomers: 0,
      }
    );
  });
};

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

        setData(
          normalizeCustomerProfileData(
            res.data,
            startDate,
            endDate,
          ),
        );
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
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="text-[2.8rem] font-bold leading-none tracking-[-0.04em] text-[#1F1C5C] sm:text-[3.25rem] xl:text-[3.4rem]">
          {loading ? "--" : total}
        </span>

        <span className="mb-1.5 text-sm font-medium text-[#7E85A8]">
          Total Profiles
        </span>
      </div>
      <div className="mt-auto">
        {/* Bar Graph */}
        <div className="mt-5 flex h-36 items-end justify-between gap-2 sm:h-40 sm:gap-3 xl:h-44 2xl:h-48">
          {data.map(({ date, newCustomers, retentionCustomers }, index) => {
            const totalHeight = newCustomers + retentionCustomers;
            const hasRetention = retentionCustomers > 0;
            const hasNewCustomers = newCustomers > 0;
            const hasBothSegments = hasRetention && hasNewCustomers;
            const retentionHeight =
              totalHeight > 0 && hasRetention
                ? Math.max((retentionCustomers / maxDailyTotal) * 100, 14)
                : 0;
            const newHeight =
              totalHeight > 0 && hasNewCustomers
                ? Math.max((newCustomers / maxDailyTotal) * 100, 14)
                : 0;
            const parsedDate = new Date(date);
            const dayLabel = format(parsedDate, "d");
            const monthLabel = format(parsedDate, "MMM");

            return (
              <div
                key={date}
                className="
                  relative group flex h-full min-w-[28px] flex-1 flex-col items-center justify-end
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
                      whitespace-nowrap rounded-2xl
                      border border-white/20
                      bg-[#1F1C5C]/95
                      px-4 py-2
                      text-xs text-white
                      shadow-2xl
                      backdrop-blur-xl
                    "
                  >
                    <div>New: {newCustomers}</div>
                    <div>Retention: {retentionCustomers}</div>
                  </div>
                )}

                {totalHeight === 0 ? (
                  <div className="h-full" />
                ) : (
                  <div className="flex h-full w-full max-w-[46px] flex-col justify-end overflow-hidden rounded-full">
                    {hasRetention && (
                      <div
                        className={`bg-gradient-to-t from-[#F9B4CC] to-[#F7D6E2] transition-all duration-300 ${
                          hasBothSegments ? "rounded-t-full" : "rounded-full"
                        }`}
                        style={{ height: `${retentionHeight}%` }}
                      />
                    )}
                    {hasNewCustomers && (
                      <div
                        className={`bg-gradient-to-t from-[#EC396F] to-[#FF5B93] shadow-[0_4px_20px_rgba(236,57,111,0.35)] transition-all duration-300 ${
                          hasBothSegments ? "rounded-b-full" : "rounded-full"
                        }`}
                        style={{ height: `${newHeight}%` }}
                      />
                    )}
                  </div>
                )}
                <div className="mt-3 flex min-h-[32px] flex-col items-center justify-start text-[#7E85A8]">
                  <span className="text-xs font-semibold leading-none">
                    {dayLabel}
                  </span>
                  <span className="mt-1 text-[10px] font-medium uppercase leading-none tracking-[0.08em]">
                    {monthLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-4 xl:mt-5">
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
    </div>
  );
}

export default CustomerProfileCollection;
