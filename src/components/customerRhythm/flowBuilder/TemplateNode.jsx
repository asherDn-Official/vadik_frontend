import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  CornerDownRight,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { renderWhatsAppFormattedText } from "../../../utils/whatsappTextFormatter";

const TemplateNode = ({ data, selected }) => {
  const template = data.template || {};
  const templateName = data.templateName || template.name || "Untitled Template";
  const language = data.language || template.language || "en_US";
  const status = data.status || template.status || "APPROVED";
  const bodyText =
    data.bodyText ||
    template.components?.find((c) => c.type === "BODY")?.text ||
    "Please choose an option:";

  const buttonsComp = template.components?.find((c) => c.type === "BUTTONS");
  const buttons = (buttonsComp?.buttons || data.buttons || []).map((b) => ({
    text: b.text || b.label || (typeof b === "string" ? b : "Option"),
    type: b.type || "QUICK_REPLY",
  }));

  // ── Status-based styling ────────────────────────────────────────────────────
  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const isUnknown = !isApproved && !isPending && !isRejected;

  // Border color
  const borderClass = selected
    ? isApproved
      ? "border-[#313166] ring-4 ring-[#313166]/20"
      : "border-red-500 ring-4 ring-red-300/40"
    : isApproved
    ? "border-purple-200 hover:border-purple-400"
    : "border-red-400 hover:border-red-500";

  // Header gradient
  const headerClass = isApproved
    ? "bg-gradient-to-r from-[#313166] to-[#4A4A8A]"
    : isRejected
    ? "bg-gradient-to-r from-red-600 to-red-500"
    : "bg-gradient-to-r from-orange-500 to-amber-500";

  const getStatusBadge = () => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-600" />
            Meta Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-900 text-[9px] font-bold rounded-full flex items-center gap-1">
            <Clock size={10} className="text-yellow-600" />
            Pending Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold rounded-full flex items-center gap-1">
            <XCircle size={10} className="text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-bold rounded-full flex items-center gap-1">
            <HelpCircle size={10} />
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div
      className={`min-w-[260px] max-w-[310px] bg-white rounded-2xl border-2 shadow-lg transition-all ${borderClass}`}
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
          background: isApproved ? "#313166" : "#ef4444",
          border: "2px solid #ffffff",
        }}
      />

      {/* Header */}
      <div className={`${headerClass} px-4 py-2.5 rounded-t-[14px] text-white flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs">
            {isApproved ? <FileText size={15} /> : <AlertCircle size={15} />}
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 block">
              WhatsApp Template
            </span>
            <h4 className="text-xs font-bold leading-tight truncate max-w-[140px]" title={templateName}>
              {templateName}
            </h4>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* ── Not-Approved Alert Banner ──────────────────────────────────────── */}
      {!isApproved && (
        <div
          className={`px-3 py-2 text-[10px] font-semibold flex items-center gap-1.5 ${
            isRejected
              ? "bg-red-50 text-red-700 border-b border-red-200"
              : "bg-amber-50 text-amber-800 border-b border-amber-200"
          }`}
        >
          <AlertCircle size={12} className={isRejected ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
          {isRejected
            ? "Template rejected by Meta. Please recreate or fix it."
            : "Awaiting Meta approval. This automation cannot go live until approved."}
        </div>
      )}

      {/* Body Preview */}
      <div className="p-3.5 space-y-2">
        <div className={`p-2.5 rounded-xl border text-[11px] text-gray-700 leading-relaxed font-sans max-h-24 overflow-hidden relative ${
          isApproved ? "bg-[#EFEAE2]/60 border-gray-100" : "bg-red-50/40 border-red-100"
        }`}>
          <div
            dangerouslySetInnerHTML={{
              __html: renderWhatsAppFormattedText(bodyText, {
                highlightVariables: true,
                variableClassName: "text-blue-600 font-bold bg-blue-50 px-1 rounded",
              }),
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>Lang: {language}</span>
          <span>{buttons.length} Interactive Button{buttons.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Button Branches List with individual handles */}
      {buttons.length > 0 ? (
        <div className="border-t border-gray-100 divide-y divide-gray-100 bg-gray-50/70 rounded-b-[14px] overflow-visible">
          <div className="px-3.5 py-1.5 bg-gray-100/60 text-[9px] font-bold uppercase text-gray-500 tracking-wider flex items-center justify-between">
            <span>Button Branches (Transitions)</span>
            <CornerDownRight size={11} className="text-gray-400" />
          </div>

          {buttons.map((btn, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2 flex items-center justify-between hover:bg-purple-50/50 transition-colors relative group"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-[#313166] truncate">{btn.text}</span>
              </div>

              {data.onAddNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onAddNext(`btn_${idx}`, btn.text);
                  }}
                  className="p-1 bg-[#CB376D] hover:bg-[#b02c5c] text-white rounded-full opacity-80 group-hover:opacity-100 transition-all mr-2 shadow-2xs"
                  title={`Connect action for "${btn.text}"`}
                >
                  <Plus size={10} />
                </button>
              )}

              <Handle
                type="source"
                position={Position.Right}
                id={`btn_${idx}`}
                style={{
                  top: "50%",
                  right: -8,
                  width: 12,
                  height: 12,
                  background: "#CB376D",
                  border: "2px solid #ffffff",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Fallback default handle */
        <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-100 rounded-b-[14px] flex items-center justify-between relative">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Next Step ➔</span>
          {data.onAddNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onAddNext("default", "Next Step");
              }}
              className="p-1 bg-[#313166] hover:bg-[#252550] text-white rounded-full shadow-xs"
            >
              <Plus size={10} />
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
              background: "#313166",
              border: "2px solid #ffffff",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default memo(TemplateNode);
