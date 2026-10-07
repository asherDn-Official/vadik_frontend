import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  MessageSquare,
  Sparkles,
  Plus,
  CornerDownRight,
  Image,
  Video,
  FileText,
  Zap,
} from "lucide-react";
import { renderWhatsAppFormattedText } from "../../../utils/whatsappTextFormatter";

const StaticMessageNode = ({ data, selected }) => {
  const title = data.title || data.label || "Interactive Buttons";
  const bodyText = data.bodyText || "";
  const footerText = data.footerText || "";
  const headerText = data.headerText || "";
  const headerMediaType = (data.headerMediaType || data.headerFormat || "IMAGE").toUpperCase();
  const mediaUrl = data.mediaUrl || "";

  const buttons = (data.buttons || []).map((b, idx) => ({
    id: b.id || `btn_${idx}`,
    text: b.text || b.label || b.title || (typeof b === "string" ? b : `Option ${idx + 1}`),
  }));

  const borderClass = selected
    ? "border-cyan-500 ring-4 ring-cyan-400/20 shadow-xl shadow-cyan-900/10"
    : "border-cyan-200 hover:border-cyan-400 shadow-md";

  return (
    <div
      className={`min-w-[270px] max-w-[320px] bg-white rounded-2xl border-2 transition-all duration-200 ${borderClass}`}
    >
      {/* Target Input Handle on Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          top: 24,
          left: -8,
          width: 12,
          height: 12,
          background: "#0891b2",
          border: "2px solid #ffffff",
        }}
      />

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-cyan-800 via-teal-700 to-emerald-700 px-4 py-2.5 rounded-t-[14px] text-white flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs shrink-0">
            <MessageSquare size={15} className="text-cyan-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-200 block">
                Static Message
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-400/30 text-emerald-100 text-[8px] font-bold rounded-md">
                No Meta Delay
              </span>
            </div>
            <h4
              className="text-xs font-bold leading-tight truncate max-w-[140px]"
              title={title}
            >
              {title}
            </h4>
          </div>
        </div>

        <div className="shrink-0 ml-2">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
            <Zap size={10} className="text-emerald-600 fill-emerald-600" />
            Instant Live
          </span>
        </div>
      </div>

      {/* Media Header Preview (Optional) */}
      {mediaUrl && (
        <div className="px-3.5 pt-3">
          <div className="rounded-xl overflow-hidden border border-cyan-100 bg-slate-50 relative group">
            {headerMediaType === "IMAGE" ? (
              <img
                src={mediaUrl}
                alt="Header"
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : headerMediaType === "VIDEO" ? (
              <div className="w-full h-16 bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold gap-1.5">
                <Video size={16} className="text-cyan-400" />
                <span>Video Header Attached</span>
              </div>
            ) : (
              <div className="w-full p-2.5 bg-cyan-50 flex items-center text-cyan-900 text-[10px] font-bold gap-1.5">
                <FileText size={16} className="text-cyan-600" />
                <span className="truncate">Document Header Attached</span>
              </div>
            )}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold rounded-md uppercase">
              {headerMediaType}
            </div>
          </div>
        </div>
      )}

      {/* Header Text (if present) */}
      {headerText && (
        <div className="px-3.5 pt-2.5">
          <span className="text-xs font-bold text-slate-800 block">
            {headerText}
          </span>
        </div>
      )}

      {/* Body Text */}
      <div className="p-3.5 space-y-2">
        {!bodyText ? (
          <div className="p-3 rounded-xl border border-dashed border-cyan-200 bg-cyan-50/40 text-[11px] text-cyan-800 text-center flex flex-col items-center justify-center gap-1 py-3">
            <Sparkles size={16} className="text-cyan-500" />
            <span className="font-semibold">Type message in Inspector →</span>
            <span className="text-[9px] text-cyan-600">No Meta template approval needed!</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border border-cyan-100 bg-slate-50/80 text-[11px] text-slate-800 leading-relaxed font-sans max-h-24 overflow-hidden relative">
            <div
              dangerouslySetInnerHTML={{
                __html: renderWhatsAppFormattedText(bodyText, {
                  highlightVariables: true,
                  variableClassName: "text-cyan-700 font-bold bg-cyan-100 px-1 rounded",
                }),
              }}
            />
          </div>
        )}

        {/* Footer Text (if present) */}
        {footerText && (
          <div className="text-[10px] text-slate-400 italic px-1 truncate">
            {footerText}
          </div>
        )}

        {/* Dynamic Variable pill helper */}
        {(() => {
          const matches = [...bodyText.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)];
          const varCount = new Set(matches.map((m) => m[1])).size;
          if (varCount === 0) return null;

          return (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-50 border border-cyan-200/70 rounded-lg text-[10px] text-cyan-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>{varCount} Dynamic Variable{varCount > 1 ? "s" : ""}</span>
            </div>
          );
        })()}

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
          <span className="text-emerald-600 font-bold">⚡ Free In-Session</span>
          <span>{buttons.length} / 3 Buttons</span>
        </div>
      </div>

      {/* Button Branches List with individual handles */}
      {buttons.length > 0 ? (
        <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/70 rounded-b-[14px] overflow-visible">
          <div className="px-3.5 py-1.5 bg-slate-100/70 text-[9px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
            <span>Quick Reply Buttons</span>
            <CornerDownRight size={11} className="text-cyan-600" />
          </div>

          {buttons.map((btn, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2 flex items-center justify-between hover:bg-cyan-50/60 transition-colors relative group"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 text-[9px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate">{btn.text}</span>
              </div>

              {data.onAddNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onAddNext(`btn_${idx}`, btn.text);
                  }}
                  className="p-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full opacity-80 group-hover:opacity-100 transition-all mr-2 shadow-2xs cursor-pointer"
                  title={`Connect next action for "${btn.text}"`}
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
                  background: "#0891b2",
                  border: "2px solid #ffffff",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Fallback default handle */
        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 rounded-b-[14px] flex items-center justify-between relative">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Next Step ➔</span>
          {data.onAddNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onAddNext("default", "Next Step");
              }}
              className="p-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-xs cursor-pointer"
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
              background: "#0891b2",
              border: "2px solid #ffffff",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default memo(StaticMessageNode);
