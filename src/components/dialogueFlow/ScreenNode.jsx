import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layout, MessageSquare, Plus } from 'lucide-react';

const ScreenNode = ({ data, selected }) => {
  const hasError = data.hasError;
  const hasWarning = data.hasWarning;
  
  let borderClass = 'border-gray-100';
  if (hasError) {
    borderClass = 'border-red-500 ring-2 ring-red-500/20 bg-red-50/5';
  } else if (hasWarning) {
    borderClass = 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/5';
  } else if (selected) {
    borderClass = 'border-[#CB376D] ring-2 ring-[#CB376D]/20';
  }

  return (
    <div className={`min-w-[220px] shadow-lg rounded-lg bg-white border-2 transition-all ${borderClass}`}>
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${hasError ? 'bg-red-100 text-red-600' : hasWarning ? 'bg-amber-100 text-amber-600' : 'bg-[#CB376D]/10 text-[#CB376D]'}`}>
            <Layout size={14} />
          </div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Screen</span>
        </div>
        {hasError ? (
          <div className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[8px] font-bold uppercase tracking-wider flex items-center justify-center">Error</div>
        ) : hasWarning ? (
          <div className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-bold uppercase tracking-wider flex items-center justify-center">Warn</div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        )}
      </div>
      
      <div className="p-4">
        <div className="text-sm font-semibold text-gray-800 mb-1">{data.label || 'Unnamed Screen'}</div>
        <div className="text-[10px] text-gray-400 flex items-center gap-1">
          <MessageSquare size={10} />
          {data.fields?.length || 0} interactive elements
        </div>
      </div>

      {data.fields && data.fields.length > 0 && (
        <div className="px-4 pb-4 space-y-1.5">
          {data.fields.slice(0, 3).map((field, idx) => {
            const fieldName = field.name || (field.label || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const fieldHasError = data.errors?.some(err => 
              err.includes(`Field "${fieldName}"`) || err.includes(`field "${fieldName}"`)
            );
            return (
              <div key={idx} className={`flex items-center gap-2 px-2 py-1.5 border rounded text-[10px] italic ${fieldHasError ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${fieldHasError ? 'bg-red-400' : 'bg-[#CB376D]/40'}`}></div>
                {field.label}
              </div>
            );
          })}
          {data.fields.length > 3 && (
            <div className="text-[9px] text-center text-gray-400 font-medium">
              +{data.fields.length - 3} more fields
            </div>
          )}
        </div>
      )}

      <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-1">
        <div className="text-[9px] font-bold text-gray-400 uppercase">Transitions</div>
        
        {/* Branching based on fields with options */}
        {data.fields?.filter(f => ['radio', 'select', 'checkbox'].includes(f.type)).map((field) => (
          <div key={field.id} className="space-y-1 mt-1">
            <div className="text-[8px] text-[#CB376D] font-bold truncate px-1">{field.label}</div>
            {(field.options || []).map((option, oIdx) => {
              const optError = data.errors?.find(err => 
                err.includes(`Option "${option.label}"`) || 
                err.includes(`Option "${option.id || ''}"`)
              );
              const optWarning = data.warnings?.find(warn => 
                warn.includes(`Option "${option.label}"`) || 
                warn.includes(`Option "${option.id || ''}"`)
              );
              return (
                <div key={oIdx} className={`flex items-center justify-between group cursor-pointer hover:bg-white p-1 rounded transition-colors relative border ${optError ? 'border-red-200 bg-red-50/30' : optWarning ? 'border-amber-200 bg-amber-50/30' : 'border-transparent'}`}>
                  <span className={`text-[10px] truncate pr-8 ${optError ? 'text-red-600 font-bold' : optWarning ? 'text-amber-600 font-bold' : 'text-gray-500'}`}>{option.label}</span>
                  {optError ? (
                    <span className="text-[7px] text-red-500 absolute right-6 font-bold uppercase">Error</span>
                  ) : optWarning ? (
                    <span className="text-[7px] text-amber-500 absolute right-6 font-bold uppercase">Warn</span>
                  ) : null}
                  <button 
                    onClick={(e) => { e.stopPropagation(); data.onAddNext(`choice_${field.id}_${oIdx}`); }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#CB376D] rounded-full p-0.5 shadow-sm border border-gray-100 z-10"
                  >
                    <Plus size={8} />
                  </button>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`choice_${field.id}_${oIdx}`}
                    style={{ top: '50%', right: -8, width: 8, height: 8, background: optError ? '#ef4444' : optWarning ? '#f59e0b' : '#CB376D', transform: 'translateY(-50%)' }}
                  />
                </div>
              );
            })}
          </div>
        ))}

        <div className="flex items-center justify-between group cursor-pointer hover:bg-white p-1 rounded transition-colors mt-1 border-t border-gray-100 pt-2 relative">
          <span className="text-[11px] text-gray-600 font-medium">On Submit</span>
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddNext('submit'); }}
            className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-600 rounded-full p-0.5 shadow-sm border border-gray-100 z-10"
          >
            <Plus size={8} />
          </button>
          <Handle
            type="source"
            position={Position.Right}
            id="submit"
            style={{ top: 'auto', right: -8, width: 8, height: 8, background: '#334155' }}
          />
        </div>
      </div>

      {data.errors && data.errors.length > 0 && (
        <div className="bg-red-50 px-3 py-2 border-t border-red-100 rounded-b-lg space-y-1">
          {data.errors.map((err, i) => {
            const cleanedErr = err.replace(new RegExp(`^Screen\\s+["'][^"']+["']:\\s*`, 'i'), '');
            return (
              <div key={i} className="text-[8px] text-red-600 font-medium leading-normal">{cleanedErr}</div>
            );
          })}
        </div>
      )}
      {data.warnings && data.warnings.length > 0 && (!data.errors || data.errors.length === 0) && (
        <div className="bg-amber-50 px-3 py-2 border-t border-amber-100 rounded-b-lg space-y-1">
          {data.warnings.map((warn, i) => {
            const cleanedWarn = warn.replace(new RegExp(`^Screen\\s+["'][^"']+["']:\\s*`, 'i'), '');
            return (
              <div key={i} className="text-[8px] text-amber-600 font-medium leading-normal">{cleanedWarn}</div>
            );
          })}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8, background: '#94a3b8' }}
      />
    </div>
  );
};

export default memo(ScreenNode);
