import React from "react";
import { 
  X, 
  Smartphone, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  ExternalLink, 
  Phone 
} from "lucide-react";
import { renderWhatsAppFormattedText } from "../../utils/whatsappTextFormatter";

const TemplatePreviewModal = ({ template, isOpen, onClose }) => {
  if (!isOpen || !template) return null;

  const header = template.components?.find(c => c.type === "HEADER");
  const body = template.components?.find(c => c.type === "BODY");
  const footer = template.components?.find(c => c.type === "FOOTER");
  const buttons = template.components?.find(c => c.type === "BUTTONS")?.buttons || [];

  const formatText = (text) => {
    const variableValues = {};
    (text?.match(/\{\{(\d+)\}\}/g) || []).forEach((variable) => {
      variableValues[variable] = variable;
    });

    return renderWhatsAppFormattedText(text, {
      variableValues,
      highlightVariables: true,
      variableClassName: "text-blue-600 font-bold",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
        {/* Left Side: Info */}
        <div className="flex-1 p-8 border-r border-gray-100 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#313166]">{template.name}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                <p className="font-semibold text-[#313166]">{template.category}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Language</p>
                <p className="font-semibold text-[#313166]">{template.language}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p className="font-semibold text-[#313166]">{template.status}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quality</p>
                <p className={`font-bold ${
                  template.qualityRating === 'HIGH' ? 'text-green-600' :
                  template.qualityRating === 'MEDIUM' ? 'text-yellow-600' :
                  template.qualityRating === 'LOW' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {template.qualityRating || 'UNKNOWN'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Template Content</h3>
              
              {header && (
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Header ({header.format})</p>
                  {header.format === "TEXT" ? (
                    <p
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: formatText(header.text) }}
                    />
                  ) : (
                    <p className="text-sm text-blue-600 break-all">{header.mediaUrl || header.example?.header_handle?.[0] || "Media Template"}</p>
                  )}
                </div>
              )}

              {body && (
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Body</p>
                  <p
                    className="text-sm text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatText(body.text) }}
                  />
                </div>
              )}

              {footer && (
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Footer</p>
                  <p
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: formatText(footer.text) }}
                  />
                </div>
              )}

              {buttons.length > 0 && (
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Buttons</p>
                  <div className="flex flex-wrap gap-2">
                    {buttons.map((btn, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-[#313166] text-xs font-medium rounded-lg border border-gray-200">
                        {btn.text} ({btn.type})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Visual Preview */}
        <div className="w-full md:w-[380px] bg-gray-50 p-8 flex flex-col items-center justify-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full transition-colors hidden md:block"
          >
            <X size={24} className="text-gray-500" />
          </button>

          <div className="relative w-full max-w-[280px] h-[520px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl flex flex-col overflow-hidden scale-90 md:scale-100">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-xl z-10"></div>
            
            {/* Top Bar */}
            <div className="bg-[#075e54] h-14 pt-4 px-4 flex items-center gap-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Smartphone size={14} className="text-white" />
              </div>
              <div className="text-white text-xs font-medium">WhatsApp Preview</div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 bg-[#e5ddd5] p-3 overflow-y-auto space-y-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-[95%]">
                {header && (
                  <div className="p-2 pb-0 font-bold text-[13px] text-gray-800">
                    {header.format === "TEXT" ? (
                      <div dangerouslySetInnerHTML={{ __html: formatText(header.text) }} />
                    ) : (
                      <div className="bg-gray-100 min-h-[100px] rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                         {header.format === "IMAGE" ? (
                            (header.mediaUrl || header.example?.header_handle?.[0]) ? (
                              <img src={header.mediaUrl || header.example?.header_handle?.[0]} alt="Preview" className="w-full h-full object-cover" />
                            ) : <ImageIcon size={20} />
                         ) : header.format === "VIDEO" ? (
                            <Video size={20} />
                         ) : (
                            <FileText size={20} />
                         )}
                         {!(header.mediaUrl || header.example?.header_handle?.[0]) && <span className="text-[8px] mt-1">Media Placeholder</span>}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-3 text-[13px] text-gray-800 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: formatText(body?.text) }} />
                </div>

                {footer && (
                  <div
                    className="px-3 pb-2 text-[9px] text-gray-400 uppercase tracking-wide"
                    dangerouslySetInnerHTML={{ __html: formatText(footer.text) }}
                  />
                )}

                {buttons.length > 0 && (
                  <div className="border-t border-gray-100">
                    {buttons.map((btn, i) => (
                      <div key={i} className="py-2 px-3 text-center border-b border-gray-50 last:border-0 text-[#00a884] font-medium text-[13px] flex items-center justify-center gap-2">
                        {btn.type === "URL" && <ExternalLink size={12} />}
                        {btn.type === "PHONE_NUMBER" && <Phone size={12} />}
                        {btn.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
