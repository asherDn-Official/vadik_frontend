import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Database, Bell, Tag } from 'lucide-react';

const ActionNode = ({ data, selected }) => {
  const getActionInfo = (type) => {
    switch (type) {
      case 'database':
        return { icon: <Database size={14} />, label: 'Update Profile', color: 'bg-blue-500' };
      case 'notification':
        return { icon: <Bell size={14} />, label: 'Notify Staff', color: 'bg-amber-500' };
      case 'loyalty':
        return { icon: <Tag size={14} />, label: 'Add Points', color: 'bg-purple-500' };
      default:
        return { icon: <Zap size={14} />, label: 'Generic Action', color: 'bg-emerald-500' };
    }
  };

  const info = getActionInfo(data.actionType);

  return (
    <div className={`min-w-[180px] shadow-md rounded-lg bg-white border-2 transition-all ${selected ? 'border-[#CB376D] ring-2 ring-[#CB376D]/20' : 'border-gray-100'}`}>
      <div className="flex items-center gap-3 p-3">
        <div className={`p-2 ${info.color} text-white rounded-lg shadow-sm`}>
          {info.icon}
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Action</div>
          <div className="text-sm font-semibold text-gray-800">{data.label || info.label}</div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8, background: '#94a3b8' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 8, height: 8, background: '#CB376D' }}
      />
    </div>
  );
};

export default memo(ActionNode);