"use client";

import React from 'react';
import { Node } from 'reactflow';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from 'lucide-react';
import { ActivityType } from '@/models/workflow';
import { getActivityTypeName } from './activity-nodes';

interface ActivityConfigPanelProps {
  activity: Node;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export default function ActivityConfigPanel({
  activity,
  onUpdate,
  onClose,
}: ActivityConfigPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Activity Properties</h3>
          <p className="text-sm text-muted-foreground">
            {getActivityTypeName(activity.data.activityType)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={activity.data.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>

        {activity.data.activityType === ActivityType.User && (
          <>
            <div className="space-y-2">
              <Label htmlFor="form_id">Form ID</Label>
              <Input
                id="form_id"
                value={activity.data.form_id || ''}
                onChange={(e) => onUpdate({ form_id: e.target.value })}
                placeholder="Enter form ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">Role ID</Label>
              <Input
                id="role_id"
                value={activity.data.role_id || ''}
                onChange={(e) => onUpdate({ role_id: e.target.value })}
                placeholder="Enter role ID"
              />
            </div>
          </>
        )}

        {activity.data.activityType === ActivityType.Timer && (
          <div className="space-y-2">
            <Label htmlFor="pauseDuration">Duration (minutes)</Label>
            <Input
              id="pauseDuration"
              type="number"
              value={activity.data.pauseDuration || 0}
              onChange={(e) => onUpdate({ pauseDuration: parseInt(e.target.value, 10) })}
              min={0}
            />
          </div>
        )}

        {activity.data.activityType === ActivityType.System && (
          <div className="space-y-2">
            <Label>Functions</Label>
            <div className="space-y-2">
              {activity.data.functions?.map((fn: any, index: number) => (
                <div key={fn.id || index} className="flex items-center gap-2">
                  <Input
                    value={fn.name}
                    onChange={(e) => {
                      const functions = [...(activity.data.functions || [])];
                      functions[index] = { ...fn, name: e.target.value };
                      onUpdate({ functions });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const functions = activity.data.functions.filter((_: any, i: number) => i !== index);
                      onUpdate({ functions });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const functions = [...(activity.data.functions || []), { name: 'New Function' }];
                  onUpdate({ functions });
                }}
              >
                Add Function
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 