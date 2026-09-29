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
  UploadCloud,
  PauseCircle,
  FileQuestion,
} from "lucide-react";
import { renderWhatsAppFormattedText } from "../../../utils/whatsappTextFormatter";

const TemplateNode = ({ data, selected }) => {
  const template = data.template || {};
  const templateName = data.templateName || template.name || "";
  const language = data.language || template.language || "en_US";
  const bodyText =
    data.bodyText ||
    template.components?.find((c) => c.type === "BODY")?.text ||
    "";

  const buttonsComp = template.components?.find((c) => c.type === "BUTTONS");
  const buttons = (buttonsComp?.buttons || data.buttons || []).map((b) => ({
    text: b.text || b.label || (typeof b === "string" ? b : "Option"),
    type: b.type || "QUICK_REPLY",
  }));

  // ── Normalize status ────────────────────────────────────────────────────────
  const rawStatus = (data.status || template.status || "").toUpperCase();
  const isSelected = Boolean(templateName && rawStatus !== "NOT_SELECTED" && data.templateSelected !== false);

  let status = "NOT_SELECTED";
  if (isSelected) {
    if (rawStatus === "APPROVED") {
      status = "APPROVED";
    } else if (
      ["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED", "IN_APPEAL"].includes(rawStatus)
    ) {
      status = "PENDING";
    } else if (rawStatus === "REJECTED") {
      status = "REJECTED";
    } else if (["PAUSED", "DISABLED"].includes(rawStatus)) {
      status = "PAUSED";
    } else if (rawStatus === "NOT_IN_ACCOUNT" || rawStatus === "DRAFT") {
      status = "NOT_IN_ACCOUNT";
    } else if (rawStatus) {
      status = rawStatus;
    } else {
      status = "NOT_IN_ACCOUNT";
    }
  } else {
    status = "NOT_SELECTED";
  }

  // Status flags
  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const isPaused = status === "PAUSED";
  const isNotInAccount = status === "NOT_IN_ACCOUNT";
  const isNotSelected = status === "NOT_SELECTED";

  // ── Status-based styling ────────────────────────────────────────────────────
  // Border color
  const borderClass = selected
    ? isApproved
      ? "border-[#313166] ring-4 ring-[#313166]/20"
      : isPending
      ? "border-amber-500 ring-4 ring-amber-300/40"
      : isRejected
      ? "border-red-500 ring-4 ring-red-300/40"
      : isNotSelected
      ? "border-[#CB376D] ring-4 ring-[#CB376D]/20"
      : "border-indigo-500 ring-4 ring-indigo-300/30"
    : isApproved
    ? "border-purple-200 hover:border-purple-400"
    : isPending
    ? "border-amber-300 hover:border-amber-400"
    : isRejected
    ? "border-red-400 hover:border-red-500"
    : isNotSelected
    ? "border-dashed border-2 border-slate-300 hover:border-slate-400 bg-slate-50/30"
    : "border-indigo-200 hover:border-indigo-300";

  // Header gradient
  const headerClass = isApproved
    ? "bg-gradient-to-r from-[#313166] to-[#4A4A8A]"
    : isPending
    ? "bg-gradient-to-r from-amber-600 to-orange-500"
    : isRejected
    ? "bg-gradient-to-r from-red-600 to-red-500"
    : isNotSelected
    ? "bg-gradient-to-r from-slate-600 to-slate-700"
    : isPaused
    ? "bg-gradient-to-r from-orange-600 to-amber-600"
    : "bg-gradient-to-r from-slate-700 to-indigo-900";

  // Handle color
  const handleColor = isApproved
    ? "#313166"
    : isPending
    ? "#d97706"
    : isRejected
    ? "#ef4444"
    : isNotSelected
    ? "#64748b"
    : "#4f46e5";

  const getStatusBadge = () => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <CheckCircle2 size={10} className="text-emerald-600" />
            Meta Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <Clock size={10} className="text-amber-600 animate-pulse" />
            In Progress
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <XCircle size={10} className="text-red-600" />
            Rejected
          </span>
        );
      case "PAUSED":
        return (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-300 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <PauseCircle size={10} className="text-orange-600" />
            Paused
          </span>
        );
      case "NOT_IN_ACCOUNT":
        return (
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <UploadCloud size={10} className="text-indigo-600" />
            Draft / Not in Meta
          </span>
        );
      case "NOT_SELECTED":
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 border border-slate-300 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <HelpCircle size={10} className="text-slate-500" />
            Not Selected
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
          background: handleColor,
          border: "2px solid #ffffff",
        }}
      />

      {/* Header */}
      <div className={`${headerClass} px-4 py-2.5 rounded-t-[14px] text-white flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs shrink-0">
            {isApproved ? (
              <FileText size={15} />
            ) : isNotSelected ? (
              <FileQuestion size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 block">
              WhatsApp Template
            </span>
            <h4
              className="text-xs font-bold leading-tight truncate max-w-[130px]"
              title={templateName || "No Template Selected"}
            >
              {templateName || "No Template Selected"}
            </h4>
          </div>
        </div>
        <div className="shrink-0 ml-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* ── Status Alert Banners ──────────────────────────────────────── */}
      {isNotSelected && (
        <div className="px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 bg-slate-100 text-slate-700 border-b border-slate-200">
          <AlertCircle size={12} className="text-slate-500 shrink-0" />
          <span>No template selected for this step.</span>
        </div>
      )}

      {isPending && (
        <div className="px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 bg-amber-50 text-amber-800 border-b border-amber-200">
          <Clock size={12} className="text-amber-600 shrink-0" />
          <span>Awaiting Meta approval (In Progress). Flow will stay as Draft.</span>
        </div>
      )}

      {isRejected && (
        <div className="px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 bg-red-50 text-red-700 border-b border-red-200">
          <XCircle size={12} className="text-red-500 shrink-0" />
          <span>Template rejected by Meta. Please fix or recreate.</span>
        </div>
      )}

      {isNotInAccount && (
        <div className="px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border-b border-indigo-200">
          <UploadCloud size={12} className="text-indigo-600 shrink-0" />
          <span>Draft template. Click to submit to Meta account.</span>
        </div>
      )}

      {isPaused && (
        <div className="px-3 py-1.5 text-[10px] font-semibold flex items-center gap-1.5 bg-orange-50 text-orange-800 border-b border-orange-200">
          <PauseCircle size={12} className="text-orange-600 shrink-0" />
          <span>Template is paused by Meta.</span>
        </div>
      )}

      {/* Body Preview */}
      <div className="p-3.5 space-y-2">
        {isNotSelected || !bodyText ? (
          <div className="p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 text-[11px] text-gray-500 text-center flex flex-col items-center justify-center gap-1 py-3">
            <FileText size={16} className="text-gray-400" />
            <span className="font-medium">No template message selected</span>
            <span className="text-[9px] text-[#CB376D] font-bold">Select from Inspector →</span>
          </div>
        ) : (
          <div
            className={`p-2.5 rounded-xl border text-[11px] text-gray-700 leading-relaxed font-sans max-h-24 overflow-hidden relative ${
              isApproved
                ? "bg-[#EFEAE2]/60 border-gray-100"
                : isPending
                ? "bg-amber-50/40 border-amber-100"
                : isRejected
                ? "bg-red-50/40 border-red-100"
                : "bg-gray-50/60 border-gray-100"
            }`}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: renderWhatsAppFormattedText(bodyText, {
                  highlightVariables: true,
                  variableClassName: "text-blue-600 font-bold bg-blue-50 px-1 rounded",
                }),
              }}
            />
          </div>
        )}

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
