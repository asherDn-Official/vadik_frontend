import React, { memo, useState } from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { X, Trash2, GitFork } from "lucide-react";

const LabeledEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);
  const label = data?.label || "";

  const handleDelete = (e) => {
    e.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <>
      {/* Invisible wider hover path for easy interaction */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "#EF4444" : isHovered ? "#F43F5E" : "#CB376D",
          strokeWidth: selected ? 3.5 : isHovered ? 3 : 2.5,
          filter: selected
            ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))"
            : isHovered
            ? "drop-shadow(0 0 4px rgba(244, 63, 94, 0.4))"
            : undefined,
          ...style,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="nodrag nopan flex items-center gap-1 group"
        >
          {/* Route badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
              selected
                ? "bg-red-600 text-white ring-2 ring-red-300 scale-105"
                : isHovered
                ? "bg-slate-900 text-white border border-[#CB376D] scale-105 shadow-lg"
                : "bg-white/95 text-[#313166] border border-[#CB376D]/40"
            }`}
          >
            <GitFork size={10} className={selected ? "text-white" : "text-[#CB376D]"} />
            <span className="max-w-[120px] truncate">{label || "Route"}</span>

            {/* Remove / Delete Route button */}
            <button
              onClick={handleDelete}
              title="Remove this route line"
              aria-label="Remove Route"
              className={`p-0.5 rounded-full transition-all flex items-center justify-center ${
                selected
                  ? "bg-white text-red-600 hover:bg-red-100"
                  : isHovered
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600"
              }`}
            >
              <X size={11} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Remove Route tooltip pill on hover or selection */}
          {(isHovered || selected) && (
            <button
              onClick={handleDelete}
              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-[9px] font-bold shadow-md flex items-center gap-1 animate-in fade-in zoom-in-90 duration-150 transition-colors"
              title="Remove this route line"
            >
              <Trash2 size={10} />
              <span>Remove</span>
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(LabeledEdge);
