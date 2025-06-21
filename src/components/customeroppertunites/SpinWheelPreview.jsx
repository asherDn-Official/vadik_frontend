import React from "react";

const SpinWheelPreview = ({ segments }) => {
  const totalSegments = segments.length;
  const segmentAngle = 360 / totalSegments;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80 mb-4">
        {/* Wheel Container */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-yellow-400 shadow-lg">
          {/* Wheel Segments */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {segments.map((segment, index) => {
              const startAngle = index * segmentAngle - 90; // Start from top
              const endAngle = (index + 1) * segmentAngle - 90;

              const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = segmentAngle > 180 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                "Z",
              ].join(" ");

              return (
                <path
                  key={segment.id}
                  d={pathData}
                  fill={segment.color}
                  stroke="#fff"
                  strokeWidth="1"
                />
              );
            })}

            {/* Center Circle */}
            <circle
              cx="100"
              cy="100"
              r="15"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="2"
            />

            {/* Decorative dots around the wheel */}
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i * 22.5 - 90) * (Math.PI / 180);
              const x = 100 + 95 * Math.cos(angle);
              const y = 100 + 95 * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="3" fill="#FFD700" />;
            })}
          </svg>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelPreview;
