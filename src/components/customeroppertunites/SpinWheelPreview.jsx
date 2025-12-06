// import React, { useState, useRef } from "react";

// const SpinWheelPreview = ({ segments = [] }) => {
//   const totalSegments = Array.isArray(segments) ? segments.length : 0;
//   const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 0;
//   const [rotation, setRotation] = useState(0);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const wheelRef = useRef(null);

//   // Show placeholder when there are no segments yet
//   if (totalSegments === 0) {
//     return (
//       <div className="flex flex-col items-center">
//         <div className="relative w-80 h-80 mb-4 flex items-center justify-center border-8 border-dashed border-yellow-400 rounded-full">
//           <span className="text-gray-500 text-sm">Add a spin to preview</span>
//         </div>
//       </div>
//     );
//   }

//   const spinWheel = () => {
//     if (isSpinning) return;
    
//     setIsSpinning(true);
//     const spins = 5; // Number of full rotations
//     const randomSegment = Math.floor(Math.random() * totalSegments);
//     const winningAngle = 360 - (randomSegment * segmentAngle + segmentAngle / 2);
//     const newRotation = rotation + 360 * spins + winningAngle;
    
//     setRotation(newRotation);
    
//     setTimeout(() => {
//       setIsSpinning(false);
//       alert(`You won: ${segments[randomSegment].productName || "No name"} - ${segments[randomSegment].offer}% off`);
//     }, 5000); // Match this with CSS transition duration
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <div className="relative w-80 h-80 mb-4">
//         {/* Wheel Container */}
//         <div 
//           className="relative w-full h-full rounded-full overflow-hidden border-8 border-yellow-400 shadow-lg transition-transform duration-5000 ease-out"
//           style={{ transform: `rotate(${rotation}deg)` }}
//           ref={wheelRef}
//         >
//           {/* Wheel Segments */}
//           <svg className="w-full h-full" viewBox="0 0 200 200">
//             {segments?.map((segment, index) => {
//               const startAngle = index * segmentAngle - 90; // Start from top
//               const endAngle = (index + 1) * segmentAngle - 90;

//               const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180);
//               const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180);
//               const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180);
//               const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180);

//               const largeArcFlag = segmentAngle > 180 ? 1 : 0;

//               const pathData = [
//                 `M 100 100`,
//                 `L ${x1} ${y1}`,
//                 `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
//                 "Z",
//               ].join(" ");

//               // Calculate text position
//               const textAngle = (startAngle + endAngle) / 2;
//               const textX = 100 + 50 * Math.cos((textAngle * Math.PI) / 180);
//               const textY = 100 + 50 * Math.sin((textAngle * Math.PI) / 180);

//               return (
//                 <g key={segment.id}>
//                   <path
//                     d={pathData}
//                     fill={segment.color}
//                     stroke="#fff"
//                     strokeWidth="1"
//                   />
//                   {segment.image ? (
//                     <image
//                       href={segment.image}
//                       x={textX - 15}
//                       y={textY - 15}
//                       width="30"
//                       height="30"
//                       transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
//                     />
//                   ) : (
//                     <text
//                       x={textX}
//                       y={textY}
//                       textAnchor="middle"
//                       fill="white"
//                       fontSize="8"
//                       fontWeight="bold"
//                       transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
//                     >
//                       {segment.productName || `Option ${index + 1}`}
//                       {segment.offer !== "0.00" && `\n${segment.offer}%`}
//                     </text>
//                   )}
//                 </g>
//               );
//             })}

//             {/* Center Circle - Spin Button */}
//             <circle
//               cx="100"
//               cy="100"
//               r="15"
//               fill="#FFD700"
//               stroke="#FFA500"
//               strokeWidth="2"
//               // onClick={spinWheel}
//               style={{ cursor: isSpinning ? 'not-allowed' : 'pointer' }}
//             />
//             <text
//               x="100"
//               y="105"
//               textAnchor="middle"
//               fill="#000"
//               fontSize="6"
//               fontWeight="bold"
//               // onClick={spinWheel}
//               style={{ cursor: isSpinning ? 'not-allowed' : 'pointer' }}
//             >
//               SPIN
//             </text>

//             {/* Decorative dots around the wheel */}
//             {Array.from({ length: 16 }, (_, i) => {
//               const angle = (i * 22.5 - 90) * (Math.PI / 180);
//               const x = 100 + 95 * Math.cos(angle);
//               const y = 100 + 95 * Math.sin(angle);
//               return <circle key={i} cx={x} cy={y} r="3" fill="#FFD700" />;
//             })}
//           </svg>
//         </div>

//         {/* Pointer */}
//         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
//           <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpinWheelPreview;
import React, { useState, useRef } from "react";

const SpinWheelPreview = ({ segments = [] }) => {
  const totalSegments = Array.isArray(segments) ? segments.length : 0;
  const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 0;
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);

  // --- CONFIGURATION ---
  const wheelSize = 400; // Increased from 320
  const center = wheelSize / 2;
  const radius = wheelSize / 2 - 10; // Padding for outer rim

  // --- PLACEHOLDER VIEW ---
  if (totalSegments === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div 
          className="relative flex items-center justify-center rounded-full bg-gray-100 border-4 border-dashed border-gray-300 shadow-inner"
          style={{ width: wheelSize, height: wheelSize }}
        >
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
    const spins = 8;
    const randomSegment = Math.floor(Math.random() * totalSegments);
    const winningAngle = 360 - (randomSegment * segmentAngle + segmentAngle / 2);
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.4); 
    const newRotation = rotation + 360 * spins + winningAngle + randomOffset;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div
        className="relative"
        style={{ width: wheelSize, height: wheelSize }}
      >
        {/* 1. OUTER RIM (Metallic Gold) */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox={`0 0 ${wheelSize} ${wheelSize}`}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BF953F" />
              <stop offset="25%" stopColor="#FCF6BA" />
              <stop offset="50%" stopColor="#B38728" />
              <stop offset="75%" stopColor="#FBF5B7" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
            <filter id="hubShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
            </filter>
          </defs>
          <circle cx={center} cy={center} r={radius + 8} fill="none" stroke="url(#goldGradient)" strokeWidth="16"/>
          <circle cx={center} cy={center} r={radius + 1} fill="none" stroke="#7a5c1c" strokeWidth="2"/>
        </svg>

        {/* 2. SPINNING WHEEL */}
        <div
          className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 5000ms cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
          }}
          ref={wheelRef}
        >
          <svg className="w-full h-full" viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            {segments?.map((segment, index) => {
              const startAngle = index * segmentAngle - 90;
              const endAngle = (index + 1) * segmentAngle - 90;

              const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = segmentAngle > 180 ? 1 : 0;

              const pathData = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                "Z",
              ].join(" ");

              const textAngle = (startAngle + endAngle) / 2;
              // Adjusted multiplier slightly for larger radius
              const textX = center + (radius * 0.62) * Math.cos((textAngle * Math.PI) / 180);
              const textY = center + (radius * 0.62) * Math.sin((textAngle * Math.PI) / 180);

              return (
                <g key={segment.id || index}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    stroke="#222"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                    style={{ paintOrder: "stroke" }}
                    fontSize="13" // Increased font size
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    transform={`rotate(${textAngle + 180}, ${textX}, ${textY})`}
                  >
                    <tspan x={textX} dy="-0.4em" fontWeight="900" letterSpacing="0.5px">
                      {(segment.productName || `Item ${index + 1}`).toUpperCase()}
                    </tspan>
                    {segment.offer && segment.offer !== "0.00" && (
                      <tspan x={textX} dy="1.4em" fontSize="11">
                        {segment.offer}% OFF
                      </tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 3. CENTER HUB (Scaled up) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <g filter="url(#hubShadow)" cursor={isSpinning ? "not-allowed" : "pointer"} onClick={spinWheel}>
                {/* Scaled coordinates for 80x80 box */}
                <circle cx="40" cy="40" r="36" fill="url(#goldGradient)" stroke="#96711c" strokeWidth="2"/>
                <circle cx="40" cy="40" r="28" fill="url(#goldGradient)" stroke="#FFF" strokeOpacity="0.5" strokeWidth="3" />
                <text x="40" y="45" textAnchor="middle" fill="#3e2d0a" fontSize="16" fontWeight="900">SPIN</text>
            </g>
          </svg>
        </div>

        {/* 4. POINTER (Scaled up) */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-20 filter drop-shadow-lg">
         <svg width="45" height="55" viewBox="0 0 45 55">
             <path d="M 22.5 55 L 6 22 Q 0 11 11 6 L 22.5 0 L 34 6 Q 45 11 39 22 Z" fill="url(#goldGradient)" stroke="#7a5c1c" strokeWidth="2" />
         </svg>
        </div>

        {/* 5. DECORATIVE RIVETS */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            {Array.from({ length: 12 }, (_, i) => {
              const angle = i * 30 * (Math.PI / 180);
              const r = radius + 8; 
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="5" fill="url(#goldGradient)" stroke="#7a5c1c" strokeWidth="1" />;
            })}
        </svg>

      </div>
    </div>
  );
};

export default SpinWheelPreview;