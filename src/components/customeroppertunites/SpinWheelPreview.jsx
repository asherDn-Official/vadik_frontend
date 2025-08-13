import React, { useState, useRef } from "react";

const SpinWheelPreview = ({ segments = [] }) => {
  const totalSegments = Array.isArray(segments) ? segments.length : 0;
  const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 0;
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);

  // Show placeholder when there are no segments yet
  if (totalSegments === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-80 h-80 mb-4 flex items-center justify-center border-8 border-dashed border-yellow-400 rounded-full">
          <span className="text-gray-500 text-sm">Add a spin to preview</span>
        </div>
      </div>
    );
  }

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const spins = 5; // Number of full rotations
    const randomSegment = Math.floor(Math.random() * totalSegments);
    const winningAngle = 360 - (randomSegment * segmentAngle + segmentAngle / 2);
    const newRotation = rotation + 360 * spins + winningAngle;
    
    setRotation(newRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      alert(`You won: ${segments[randomSegment].productName || "No name"} - ${segments[randomSegment].offer}% off`);
    }, 5000); // Match this with CSS transition duration
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80 mb-4">
        {/* Wheel Container */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden border-8 border-yellow-400 shadow-lg transition-transform duration-5000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
          ref={wheelRef}
        >
          {/* Wheel Segments */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {segments?.map((segment, index) => {
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

              // Calculate text position
              const textAngle = (startAngle + endAngle) / 2;
              const textX = 100 + 50 * Math.cos((textAngle * Math.PI) / 180);
              const textY = 100 + 50 * Math.sin((textAngle * Math.PI) / 180);

              return (
                <g key={segment.id}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                  {segment.image ? (
                    <image
                      href={segment.image}
                      x={textX - 15}
                      y={textY - 15}
                      width="30"
                      height="30"
                      transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                    />
                  ) : (
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                      transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                    >
                      {segment.productName || `Option ${index + 1}`}
                      {segment.offer !== "0.00" && `\n${segment.offer}%`}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center Circle - Spin Button */}
            <circle
              cx="100"
              cy="100"
              r="15"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="2"
              // onClick={spinWheel}
              style={{ cursor: isSpinning ? 'not-allowed' : 'pointer' }}
            />
            <text
              x="100"
              y="105"
              textAnchor="middle"
              fill="#000"
              fontSize="6"
              fontWeight="bold"
              // onClick={spinWheel}
              style={{ cursor: isSpinning ? 'not-allowed' : 'pointer' }}
            >
              SPIN
            </text>

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