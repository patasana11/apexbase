import { Handle, Position } from 'reactflow';
import { ActivityType } from '@/models/workflow';
import { Play, Square, Cog, User, Clock, GitBranch, Split } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityNodeProps {
  data: {
    label: string;
    activityType: ActivityType;
  };
  selected: boolean;
  dragging: boolean;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Start:
      return <Play className="h-4 w-4" />;
    case ActivityType.End:
      return <Square className="h-4 w-4" />;
    case ActivityType.System:
      return <Cog className="h-4 w-4" />;
    case ActivityType.User:
      return <User className="h-4 w-4" />;
    case ActivityType.Timer:
      return <Clock className="h-4 w-4" />;
    case ActivityType.MultiInnerWorkflow:
      return <GitBranch className="h-4 w-4" />;
    case ActivityType.AwaitParallel:
      return <Split className="h-4 w-4" />;
    default:
      return <Cog className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Start:
      return 'bg-green-50 border-green-500 text-green-700';
    case ActivityType.End:
      return 'bg-red-50 border-red-500 text-red-700';
    case ActivityType.System:
      return 'bg-blue-50 border-blue-500 text-blue-700';
    case ActivityType.User:
      return 'bg-purple-50 border-purple-500 text-purple-700';
    case ActivityType.Timer:
      return 'bg-orange-50 border-orange-500 text-orange-700';
    case ActivityType.MultiInnerWorkflow:
      return 'bg-indigo-50 border-indigo-500 text-indigo-700';
    case ActivityType.AwaitParallel:
      return 'bg-cyan-50 border-cyan-500 text-cyan-700';
    default:
      return 'bg-gray-50 border-gray-500 text-gray-700';
  }
};

const getHandleStyle = (type: ActivityType) => {
  const baseStyle = {
    width: 8,
    height: 8,
    background: '#64748b', // slate-500
  };

  switch (type) {
    case ActivityType.Start:
      return { ...baseStyle, background: '#22c55e' }; // green-500
    case ActivityType.End:
      return { ...baseStyle, background: '#ef4444' }; // red-500
    case ActivityType.System:
      return { ...baseStyle, background: '#3b82f6' }; // blue-500
    case ActivityType.User:
      return { ...baseStyle, background: '#a855f7' }; // purple-500
    case ActivityType.Timer:
      return { ...baseStyle, background: '#f97316' }; // orange-500
    case ActivityType.MultiInnerWorkflow:
      return { ...baseStyle, background: '#6366f1' }; // indigo-500
    case ActivityType.AwaitParallel:
      return { ...baseStyle, background: '#06b6d4' }; // cyan-500
    default:
      return baseStyle;
  }
};

export default function ActivityNode({ data, selected, dragging }: ActivityNodeProps) {
  const icon = getActivityIcon(data.activityType);
  const colorClasses = getActivityColor(data.activityType);
  const handleStyle = getHandleStyle(data.activityType);

  return (
    <div
      className={cn(
        'min-w-[150px] rounded-lg border-2 shadow-sm transition-all',
        colorClasses,
        selected && 'shadow-md ring-2 ring-black ring-opacity-10',
        dragging && 'shadow-lg'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
        isConnectable={data.activityType !== ActivityType.Start}
      />
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm truncate">{data.label}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
        isConnectable={data.activityType !== ActivityType.End}
      />
    </div>
  );
} 