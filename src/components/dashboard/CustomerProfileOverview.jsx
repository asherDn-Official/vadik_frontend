// import { useEffect, useState } from "react";
// import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
// import { Doughnut } from "react-chartjs-2";
// import api from "../../api/apiconfig"; // adjust this path as needed

// ChartJS.register(ArcElement, Tooltip);

// function CustomerProfileOverview() {
//   const [active, setActive] = useState(250);
//   const [inactive, setInactive] = useState(12);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const fetchCustomerData = async () => {
//         try {
//           const res = await api.get(
//             "api/dashboard/activeInactiveCustomerCount",
//           );
//           setActive(res.data.active || 0);
//           setInactive(res.data.inactive || 0);
//         } catch (err) {
//           console.error("Error fetching customer profile data:", err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchCustomerData();
//     }, 1000); // Delay by 1 second

//     return () => clearTimeout(timer); // Cleanup on unmount
//   }, []);

//   const total = active + inactive;

//   const data = {
//     datasets: [
//       {
//         data: [active, inactive],
//         backgroundColor: ["#db2777", "#313166"], // pink & dark blue
//         borderWidth: 0,
//         spacing: 4,
//         hoverOffset: 2,
//         cutout: "82%",
//         borderRadius: 30,
//         circumference: 360,
//         rotation: -90,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       tooltip: { enabled: false },
//       legend: { display: false },
//     },
//   };

//   return (
//     <div className="dashboard-card flex h-full min-h-[260px] flex-col justify-between sm:min-h-[280px] xl:min-h-[300px]">
//       {/* Title */}
//       <div>
//         <h2 className="dashboard-card-title text-center">
//           Customer Profile Overview
//         </h2>
//       </div>

//       {/* Chart */}
//       <div className="flex items-center justify-center py-4">
//         <div className="relative h-[148px] w-[148px] sm:h-[180px] sm:w-[180px] xl:h-[168px] xl:w-[168px]">
//           <Doughnut data={data} options={options} />

//           {/* Center Content */}
//           <div className="absolute inset-0 flex flex-col items-center justify-center">
//             <span className="text-[2.3rem] font-bold leading-none tracking-[-0.04em] text-[#1F1C5C] sm:text-[2.5rem] xl:text-[2.7rem]">
//               {loading ? "..." : total}
//             </span>

//             <span className="mt-1 text-center text-xs font-medium text-[#7E85A8] sm:text-sm">
//               Total Customers
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Stats Footer */}
//       <div className="mt-2 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-3">
//         {/* Active */}
//         <div className="dashboard-stat-panel">
//           <div className="flex items-center gap-2">
//             <span className="h-3 w-3 rounded-full bg-[#db2777]" />

//             <span className="dashboard-stat-label">
//               Active Customers
//             </span>
//           </div>

//           <div className="dashboard-stat-value">
//             {loading ? "--" : active}
//           </div>
//         </div>

//         {/* Inactive */}
//         <div className="dashboard-stat-panel">
//           <div className="flex items-center gap-2">
//             <span className="h-3 w-3 rounded-full bg-[#313166]" />

//             <span className="dashboard-stat-label">
//               Inactive Customers
//             </span>
//           </div>

//           <div className="dashboard-stat-value">
//             {loading ? "--" : inactive}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CustomerProfileOverview;




import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../../api/apiconfig";

ChartJS.register(ArcElement, Tooltip);

function CustomerProfileOverview() {
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const res = await api.get("api/dashboard/activeInactiveCustomerCount");
        setActive(res.data.active || 0);
        setInactive(res.data.inactive || 0);
      } catch (err) {
        console.error("Error fetching customer profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const total = active + inactive;

  // Format numbers cleanly (e.g. 1,00,000)
  const formatNum = (num) => (num || num === 0 ? num.toLocaleString("en-IN") : "--");

  // Dynamic font sizing so large numbers (e.g., 100,000+) fit inside the circle ring
  const getTotalFontSize = (num) => {
    const formatted = formatNum(num);
    if (formatted.length > 8) return "text-sm sm:text-base font-bold";
    if (formatted.length > 5) return "text-base sm:text-lg font-bold";
    if (formatted.length > 4) return "text-lg sm:text-xl font-bold";
    return "text-2xl sm:text-3xl font-bold";
  };

  const data = {
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ["#db2777", "#313166"], // pink & dark blue
        borderWidth: 0,
        spacing: 4,
        hoverOffset: 2,
        cutout: "80%",
        borderRadius: 30,
        circumference: 360,
        rotation: -90,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div className="dashboard-card flex h-full min-h-[260px] flex-col justify-between p-3.5 sm:p-5">
      {/* Header & Subtitle */}
      <div>
        <h2 className="dashboard-card-title text-center text-base sm:text-lg font-bold text-[#1F1C5C]">
          Customer Profile Overview
        </h2>
        <p className="text-[10px] text-[#7E85A8] text-center mt-0.5 leading-tight">
          Based on 30-day customer-originated engagement
        </p>
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center py-2">
        <div className="relative h-[135px] w-[135px] sm:h-[155px] sm:w-[155px] xl:h-[150px] xl:w-[150px]">
          <Doughnut data={data} options={options} />

          {/* Center Content with Dynamic Font Size */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
            <span className={`${getTotalFontSize(total)} leading-none tracking-tight text-[#1F1C5C]`}>
              {loading ? "..." : formatNum(total)}
            </span>

            <span className="mt-1 text-center text-[10px] sm:text-[11px] font-medium text-[#7E85A8] leading-tight">
              Total Customers
            </span>
          </div>
        </div>
      </div>

      {/* Stats Footer - Optimized Non-Clipping Pill Layout */}
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">
        {/* Active Pill */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#db2777] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#7E85A8] leading-none tracking-tight">
                Active
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-[#7E85A8] leading-none mt-1 tracking-tight">
              Customers
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#1F1C5C] leading-none pt-2">
            {loading ? "--" : formatNum(active)}
          </div>
        </div>

        {/* Inactive Pill */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#313166] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#7E85A8] leading-none tracking-tight">
                Inactive
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-[#7E85A8] leading-none mt-1 tracking-tight">
              Customers
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#1F1C5C] leading-none pt-2">
            {loading ? "--" : formatNum(inactive)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfileOverview;
