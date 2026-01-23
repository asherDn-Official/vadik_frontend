import { useState, useRef } from "react";

const colors = [
  "#E91E63",
  "#FF4081",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
];

const getFontSize = () => {
  if (typeof window === "undefined") return 8;
  return window.innerWidth < 640 ? 7 : 8;
};

const getDisplayText = (segment) => {
  const name = segment?.productName || segment?.coupon?.name || segment?.name || "";
  const discount = segment?.coupon?.discount ?? segment?.offer;
  const maxLength = typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 14;
  const text = name || (discount ? `${discount}% OFF` : "");
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
};

const SpinWheelPreview = ({ segments = [] }) => {
  const totalSegments = Array.isArray(segments) ? segments.length : 0;
  const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 0;
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const wheelRef = useRef(null);

  if (totalSegments === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative flex items-center justify-center rounded-full bg-gray-100 border-4 border-dashed border-gray-300 shadow-inner w-64 h-64 sm:w-80 sm:h-80">
          <div className="text-center text-gray-400">
            <span className="text-sm font-medium">Add segments to preview</span>
          </div>
        </div>
      </div>
    );
  }

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const winningIndex = Math.floor(Math.random() * totalSegments);
    const segmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = 360 - segmentCenter;
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.12);

    const currentRotation = rotation % 360;
    let delta = targetAngle + randomOffset - currentRotation;
    if (delta < 0) delta += 360;

    const minSpins = 8;
    const maxSpins = 12;
    const spins = minSpins + Math.floor(Math.random() * (maxSpins - minSpins + 1));
    const finalRotation = rotation + spins * 360 + delta;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsWaiting(true);
      setTimeout(() => {
        setIsWaiting(false);
        setIsSpinning(false);
      }, 2000);
    }, 8000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="relative w-full flex justify-center">
          <div
            className="w-0 h-0 border-l-[16px] sm:border-l-[22px] border-r-[16px] sm:border-r-[22px] border-t-[20px] sm:border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-2xl shadow-2xl transform translate-y-6 sm:translate-y-9 rotate-180"
            style={{
              filter:
                "drop-shadow(0 6px 12px rgba(255, 215, 0, 0.7)) drop-shadow(0 3px 6px rgba(255, 193, 7, 0.9))",
              background:
                "linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF8C00 50%, #FFA500 75%, #FFD700 100%)",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              boxShadow:
                "inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.3)",
              zIndex: 99,
            }}
          ></div>
        </div>
      </div>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mb-6 sm:mb-8">
        <div className="relative w-full h-full">
          <div
            className={`absolute inset-0 rounded-full overflow-hidden ${
              isSpinning ? "animate-pulse" : ""
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? "transform 8s cubic-bezier(0.25, 0.1, 0.25, 1)"
                : "none",
            }}
            ref={wheelRef}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {segments.map((segment, index) => {
                const startAngle = index * segmentAngle - 90;
                const endAngle = (index + 1) * segmentAngle - 90;

                const x1 = 100 + 85 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 100 + 85 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 100 + 85 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 100 + 85 * Math.sin((endAngle * Math.PI) / 180);

                const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 85 85 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  "Z",
                ].join(" ");

                const textAngle = (startAngle + endAngle) / 2;
                const textX = 100 + 50 * Math.cos((textAngle * Math.PI) / 180);
                const textY = 100 + 50 * Math.sin((textAngle * Math.PI) / 180);

                return (
                  <g key={segment.id || index}>
                    <defs>
                      <filter
                        id={`shadow-${index}`}
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feDropShadow
                          dx="2"
                          dy="2"
                          stdDeviation="3"
                          floodColor="rgba(0,0,0,0.3)"
                        />
                      </filter>
                    </defs>
                    <path
                      d={pathData}
                      fill={colors[index % colors.length]}
                      stroke="#fff"
                      strokeWidth="2"
                      filter={`url(#shadow-${index})`}
                      className="drop-shadow-lg"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontWeight="bold"
                      transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                      className="drop-shadow-md"
                      style={{
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                        fontSize: `${getFontSize()}px`,
                        pointerEvents: "none",
                      }}
                    >
                      {getDisplayText(segment)}
                    </text>
                  </g>
                );
              })}

              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#DC2626"
                strokeWidth="4"
                filter="drop-shadow(0 4px 8px rgba(220, 38, 38, 0.4))"
              />
            </svg>

            {Array.from({ length: 18 }, (_, i) => {
              const angle = i * 20 * (Math.PI / 180);
              const x = 50 + 42 * Math.cos(angle);
              const y = 50 + 42 * Math.sin(angle);
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-lg"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                    background:
                      "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
                    border: "1px solid #FF8C00",
                    filter: "drop-shadow(0 2px 4px rgba(255, 215, 0, 0.6))",
                    boxShadow:
                      "inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                />
              );
            })}
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 ${
                isWaiting
                  ? "animate-pulse ring-4 ring-green-400 ring-opacity-50"
                  : ""
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF8C00 50%, #FFA500 75%, #FFD700 100%)",
                border: "4px solid #FF8C00",
                filter:
                  "drop-shadow(0 6px 12px rgba(255, 215, 0, 0.5)) drop-shadow(0 3px 6px rgba(255, 193, 7, 0.7))",
                boxShadow:
                  "inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(255, 215, 0, 0.5)",
              }}
              onClick={spinWheel}
            >
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-white mb-1">
                  {isWaiting ? "WAIT" : isSpinning ? "SPINNING" : "SPIN"}
                </div>
              </div>
            </div>
          </div>

          {isSpinning && (
            <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-ping"></div>
          )}

          {isWaiting && (
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse"></div>
          )}
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`px-4 sm:px-4 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isSpinning
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-orange-600"
        }`}
      >
        {isSpinning ? "Spinning..." : "SPIN THE WHEEL!"}
      </button>
    </div>
  );
};

export default SpinWheelPreview;
