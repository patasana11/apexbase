"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  User,
  Cog,
  Clock,
  PlayCircle,
  Square,
  FileSpreadsheet
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { ActivityType } from '@/models/workflow';

// Base node styles
const nodeBaseStyles = "px-4 py-2 rounded-md shadow-md border-2";

// Base ActivityNode component
const BaseActivityNode = ({
  data,
  icon,
  borderColor,
  children
}: {
  data: any;
  icon: React.ReactNode;
  borderColor: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={`${nodeBaseStyles} bg-card ${borderColor}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-primary !w-3 !h-3"
      />

      <div className="flex items-center mb-1 gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <div className="font-semibold text-sm truncate">{data.label}</div>
      </div>

      {children}

      {data.functions && data.functions.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="mt-1 cursor-default text-xs">
                <Cog className="mr-1 h-3 w-3" />
                {data.functions.length} function{data.functions.length > 1 ? 's' : ''}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {data.functions.map((fn: any) => (
                <div key={fn.id || fn.name} className="text-xs">{fn.name}</div>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-primary !w-3 !h-3"
      />
    </div>
  );
};

// Activity Types
export const ActivityNode = ({ data }: NodeProps) => {
  return (
    <BaseActivityNode
      data={data}
      icon={<User className="h-4 w-4" />}
      borderColor="border-blue-500"
    >
      {data.form_id && (
        <div className="text-xs text-muted-foreground flex items-center">
          <FileSpreadsheet className="h-3 w-3 mr-1" />
          Form: {data.form_id}
        </div>
      )}
      {data.role_id && (
        <div className="text-xs text-muted-foreground flex items-center">
          <User className="h-3 w-3 mr-1" />
          Role: {data.role_id}
        </div>
      )}
    </BaseActivityNode>
  );
};

export const SystemNode = ({ data }: NodeProps) => {
  return (
    <BaseActivityNode
      data={data}
      icon={<Cog className="h-4 w-4" />}
      borderColor="border-green-500"
    />
  );
};

export const StartNode = ({ data }: NodeProps) => {
  return (
    <BaseActivityNode
      data={data}
      icon={<PlayCircle className="h-4 w-4" />}
      borderColor="border-gray-500"
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-transparent !w-0 !h-0 !min-w-0 !min-h-0"
        style={{ visibility: 'hidden' }}
      />
    </BaseActivityNode>
  );
};

export const EndNode = ({ data }: NodeProps) => {
  return (
    <BaseActivityNode
      data={data}
      icon={<Square className="h-4 w-4" />}
      borderColor="border-red-500"
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-transparent !w-0 !h-0 !min-w-0 !min-h-0"
        style={{ visibility: 'hidden' }}
      />
    </BaseActivityNode>
  );
};

export const TimerNode = ({ data }: NodeProps) => {
  return (
    <BaseActivityNode
      data={data}
      icon={<Clock className="h-4 w-4" />}
      borderColor="border-yellow-500"
    >
      <div className="text-xs text-muted-foreground">
        Duration: {data.pauseDuration || 0} min
      </div>
    </BaseActivityNode>
  );
};

// Used to dynamically select the proper node type based on activity type
export const getNodeTypeFromActivityType = (activityType: ActivityType): string => {
  switch (activityType) {
    case ActivityType.System:
      return 'systemNode';
    case ActivityType.User:
      return 'activityNode';
    case ActivityType.Timer:
      return 'timerNode';
    case ActivityType.Start:
      return 'startNode';
    case ActivityType.End:
      return 'endNode';
    case ActivityType.MultiInnerWorkflow:
      return 'multiWorkflowNode';
    case ActivityType.AwaitParallel:
      return 'parallelNode';
    default:
      return 'activityNode';
  }
};

// Map activity type enum to human-readable string
export const getActivityTypeName = (type: ActivityType): string => {
  switch (type) {
    case ActivityType.System: return 'System Activity';
    case ActivityType.User: return 'User Activity';
    case ActivityType.Timer: return 'Timer Activity';
    case ActivityType.Start: return 'Start Activity';
    case ActivityType.End: return 'End Activity';
    case ActivityType.MultiInnerWorkflow: return 'Multi Inner Workflow';
    case ActivityType.AwaitParallel: return 'Await Parallel';
    default: return 'Unknown Activity Type';
  }
};
