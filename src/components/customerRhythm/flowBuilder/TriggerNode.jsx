import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Tag, MessageCircle, UserPlus, Calendar, CheckCircle2, Webhook, Zap, Plus } from "lucide-react";

const getTriggerIcon = (type) => {
  switch (type) {
    case "whatsapp_keyword":
      return <Tag size={15} />;
    case "all_inbound":
      return <MessageCircle size={15} />;
    case "new_customer":
      return <UserPlus size={15} />;
    case "customer_field_date":
      return <Calendar size={15} />;
    case "customer_activity_completed":
      return <CheckCircle2 size={15} />;
    case "scheduled_recurring":
      return <Webhook size={15} />;
    default:
      return <Zap size={15} />;
  }
};

const TriggerNode = ({ data, selected }) => {
  const triggerType = data.triggerType || "whatsapp_keyword";
  const keywords = (data.keyword || "HI, HELLO, MENU, BOOK, START")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <div
      className={`min-w-[240px] max-w-[280px] bg-white rounded-2xl border-2 shadow-md transition-all ${
        selected ? "border-[#16A34A] ring-4 ring-[#16A34A]/20" : "border-emerald-200 hover:border-emerald-400"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 rounded-t-[14px] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs">
            {getTriggerIcon(triggerType)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">Trigger Entry</span>
            <h4 className="text-xs font-bold leading-tight">
              {triggerType === "whatsapp_keyword" ? "Keyword Match" :
               triggerType === "all_inbound" ? "Any Inbound Message" :
               triggerType === "new_customer" ? "New Customer" :
               triggerType === "customer_field_date" ? "Date Event" : "Scheduled Event"}
            </h4>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
          Start
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2">
        {triggerType === "whatsapp_keyword" ? (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Triggers on Keywords:</p>
            <div className="flex flex-wrap gap-1">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-600 font-medium">
            {data.description || "Triggers automated response immediately upon receiving user message."}
          </p>
        )}
      </div>

      {/* Footer / Connect Out */}
      <div className="px-3.5 py-2 bg-emerald-50/50 border-t border-emerald-100 rounded-b-[14px] flex items-center justify-between relative">
        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
          Initial Response ➔
        </span>

        {data.onAddNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onAddNext("default");
            }}
            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xs transition-colors"
            title="Connect Next Template"
          >
            <Plus size={11} />
          </button>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="default"
          style={{
            top: "50%",
            right: -8,
            width: 12,
            height: 12,
            background: "#16A34A",
            border: "2px solid #ffffff",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  );
};

export default memo(TriggerNode);
