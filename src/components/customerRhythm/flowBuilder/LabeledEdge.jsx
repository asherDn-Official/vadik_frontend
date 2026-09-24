import React, { memo } from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { X } from "lucide-react";

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
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = data?.label;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: "#CB376D",
          strokeWidth: 2.5,
          ...style,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-bold text-[#313166] border border-[#CB376D]/30 shadow-md flex items-center gap-1 group hover:border-[#CB376D] hover:scale-105 transition-all"
          >
            <span>{label}</span>
            {data?.onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete(id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-0.5"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(LabeledEdge);
