import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layout, MessageSquare, Plus } from 'lucide-react';

const ScreenNode = ({ data, selected }) => {
  return (
    <div className={`min-w-[200px] shadow-lg rounded-lg bg-white border-2 transition-all ${selected ? 'border-[#CB376D] ring-2 ring-[#CB376D]/20' : 'border-gray-100'}`}>
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#CB376D]/10 rounded text-[#CB376D]">
            <Layout size={14} />
          </div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Screen</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
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
          {data.fields.slice(0, 3).map((field, idx) => (
            <div key={idx} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-500 italic">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CB376D]/40"></div>
              {field.label}
            </div>
          ))}
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
            {(field.options || []).map((option, oIdx) => (
              <div key={oIdx} className="flex items-center justify-between group cursor-pointer hover:bg-white p-1 rounded transition-colors relative">
                <span className="text-[10px] text-gray-500 truncate pr-4">{option.label}</span>
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
                  style={{ top: '50%', right: -8, width: 8, height: 8, background: '#CB376D', transform: 'translateY(-50%)' }}
                />
              </div>
            ))}
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

      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8, background: '#94a3b8' }}
      />
    </div>
  );
};

export default memo(ScreenNode);
