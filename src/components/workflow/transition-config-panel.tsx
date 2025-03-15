"use client";

import React from 'react';
import { Edge } from 'reactflow';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from 'lucide-react';
import { TransitionType } from '@/models/workflow';

interface TransitionConfigPanelProps {
  transition: Edge;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export default function TransitionConfigPanel({
  transition,
  onUpdate,
  onClose,
}: TransitionConfigPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Transition Properties</h3>
          <p className="text-sm text-muted-foreground">
            Configure transition settings
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
            value={transition.data?.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter transition label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={transition.data?.type?.toString() || TransitionType.Standard.toString()}
            onValueChange={(value) => onUpdate({ type: parseInt(value, 10) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TransitionType.Standard.toString()}>Standard</SelectItem>
              <SelectItem value={TransitionType.Conditional.toString()}>Conditional</SelectItem>
              <SelectItem value={TransitionType.Parallel.toString()}>Parallel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {transition.data?.type === TransitionType.Conditional && (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={transition.data?.condition || ''}
                onChange={(e) => onUpdate({ condition: e.target.value })}
                placeholder="Enter condition expression"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propName">Property Name</Label>
              <Input
                id="propName"
                value={transition.data?.propName || ''}
                onChange={(e) => onUpdate({ propName: e.target.value })}
                placeholder="Enter property name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Expected Value</Label>
              <Input
                id="value"
                value={transition.data?.value || ''}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder="Enter expected value"
              />
            </div>
          </>
        )}

        {transition.data?.type === TransitionType.Parallel && (
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              value={transition.data?.route || ''}
              onChange={(e) => onUpdate({ route: e.target.value })}
              placeholder="Enter parallel route name"
            />
          </div>
        )}
      </div>
    </div>
  );
} 