import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Tag, Clock, Database, Bell, Plus, Zap } from "lucide-react";

const ActionNode = ({ data, selected }) => {
  const actionType = data.actionType || "tag";
  const label = data.label || (actionType === "tag" ? "Add Customer Tag" : actionType === "delay" ? "Wait Delay" : "Custom Action");

  return (
    <div
      className={`min-w-[200px] bg-white rounded-2xl border-2 shadow-md transition-all ${
        selected ? "border-amber-500 ring-4 ring-amber-500/20" : "border-amber-200 hover:border-amber-400"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          top: "50%",
          left: -8,
          width: 12,
          height: 12,
          background: "#D97706",
          border: "2px solid #ffffff",
          transform: "translateY(-50%)",
        }}
      />

      <div className="flex items-center gap-2.5 p-3">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
          {actionType === "tag" ? <Tag size={14} /> : actionType === "delay" ? <Clock size={14} /> : <Zap size={14} />}
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">CRM Action</span>
          <h5 className="text-xs font-bold text-gray-800">{label}</h5>
          {data.value && <p className="text-[10px] text-gray-500 font-mono mt-0.5">{data.value}</p>}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          top: "50%",
          right: -8,
          width: 12,
          height: 12,
          background: "#D97706",
          border: "2px solid #ffffff",
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

export default memo(ActionNode);
