import { useRef, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../../api/apiconfig";

ChartJS.register(ArcElement, Tooltip);

function ChurnRate() {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);
  const [churn, setChurn] = useState(88);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChurn = async () => {
      try {
        const res = await api.get("api/dashboard/churnRate");
        const churnValue = parseFloat(res.data.churnRate.replace("%", ""));
        setChurn(churnValue);
      } catch (err) {
        console.error("Error fetching churn rate:", err);
        setChurn(0);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchChurn();
    }, 1000); // Delay API call by 3 seconds

    return () => clearTimeout(timer); // cleanup if component unmounts
  }, []);

  const safeChurn = Number.isFinite(churn)
    ? Math.min(Math.max(churn, 0), 100)
    : 0;

  useEffect(() => {
    if (chartRef.current && chartRef.current.canvas) {
      const ctx = chartRef.current.canvas.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 300, 0);
      grad.addColorStop(0, "#FF4D8D");
      grad.addColorStop(0.5, "#E9357B");
      grad.addColorStop(1, "#312E81");
      setGradient(grad);
    }
  }, []);

  const data = {
    labels: ["Churn", "Remaining"],
    datasets: [
      {
        data: [safeChurn, 100 - safeChurn],
        backgroundColor: gradient
          ? [gradient, "#f1f5f9"]
          : ["#db2777", "#f1f5f9"],
        borderWidth: 0,
        borderRadius: 30,
        cutout: "78%",
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        padding: 12,
        cornerRadius: 14,
        displayColors: false,
        backgroundColor: "#1e1b4b",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="dashboard-card flex h-full min-h-[220px] flex-col sm:min-h-[250px] lg:min-h-[210px] xl:min-h-[240px]">
      <h2 className="dashboard-card-title">
        Churn Rate
      </h2>

      <div className="relative mt-4 flex h-[155px] items-center justify-center sm:h-[180px] lg:h-[145px] xl:h-[185px]">
        {
          <>
            <Doughnut ref={chartRef} data={data} options={options} />

            {/* Center Percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 pointer-events-none">
              <span className="text-3xl font-bold leading-none text-[#1F1C5C] sm:text-[34px] lg:text-[30px] xl:text-[34px]">
                {loading ? "--" : `${safeChurn.toFixed(1)}%`}
              </span>

              <span className="mt-1 text-sm font-medium text-[#7E85A8]">
                Churn Rate
              </span>
            </div>
          </>
        }
      </div>
    </div>
  );
}

export default ChurnRate;
