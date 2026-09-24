import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Smartphone, CheckCircle2, Plus, Sparkles, FormInput, ArrowRight } from "lucide-react";

const FlowNode = ({ data, selected }) => {
  const flowName = data.flowName || "Meta WhatsApp Flow";
  const screensCount = data.screensCount || 2;
  const buttonText = data.buttonText || "Open Form";

  return (
    <div
      className={`min-w-[240px] max-w-[290px] bg-white rounded-2xl border-2 shadow-lg transition-all ${
        selected ? "border-blue-600 ring-4 ring-blue-600/20" : "border-blue-200 hover:border-blue-400"
      }`}
    >
      {/* Target input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          top: 24,
          left: -8,
          width: 12,
          height: 12,
          background: "#2563EB",
          border: "2px solid #ffffff",
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 rounded-t-[14px] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs">
            <Smartphone size={15} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200 block">Meta WhatsApp Flow</span>
            <h4 className="text-xs font-bold leading-tight truncate max-w-[140px]" title={flowName}>
              {flowName}
            </h4>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-white/20 text-white text-[9px] font-bold rounded-full uppercase">
          Flow UI
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2">
        <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FormInput size={14} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-950">Interactive Form Screen</span>
          </div>
          <span className="text-[10px] font-bold text-blue-600">{screensCount} Screens</span>
        </div>
        <p className="text-[11px] text-gray-500">
          WhatsApp opens native mini-app form with button: <strong className="text-gray-800">"{buttonText}"</strong>
        </p>
      </div>

      {/* Output Handle: On Flow Submit */}
      <div className="px-3.5 py-2 bg-blue-50/40 border-t border-blue-100 rounded-b-[14px] flex items-center justify-between relative">
        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 size={11} className="text-emerald-600" />
          On Submit ➔
        </span>

        {data.onAddNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onAddNext("on_submit", "Flow Submitted");
            }}
            className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xs"
            title="Connect Post-Flow Confirmation Template"
          >
            <Plus size={10} />
          </button>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="on_submit"
          style={{
            top: "50%",
            right: -8,
            width: 12,
            height: 12,
            background: "#2563EB",
            border: "2px solid #ffffff",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  );
};

export default memo(FlowNode);
