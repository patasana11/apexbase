import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { GsbProperty, GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { cn } from '@/lib/utils';
import { DataType } from '@/lib/gsb/models/gsb-entity-def.model';

interface ColumnConfig {
  property: GsbProperty;
  propertyDef: {
    id: string;
    dataType: DataType;
    title: string;
    name: string;
    description?: string;
    maxLength?: number;
    regex?: string;
    scale?: number;
    enumValues?: Array<{
      value: string;
      label: string;
    }>;
  };
  visible: boolean;
  order: number;
  sortable: boolean;
  filterable: boolean;
  key: string;
  header: React.ReactNode;
  cell: (item: any) => React.ReactNode;
  editor?: (value: any, onChange: (value: any) => void) => React.ReactNode;
}

interface ColumnSettingsPanelProps {
  entityDefId: string;
  columns: ColumnConfig[];
  onColumnChange: (columns: ColumnConfig[]) => void;
  className?: string;
}

interface ReferenceTypeNode {
  property: GsbProperty;
  entityDef?: GsbEntityDef;
  children?: ReferenceTypeNode[];
  expanded?: boolean;
}

export function ColumnSettingsPanel({
  entityDefId,
  columns,
  onColumnChange,
  className
}: ColumnSettingsPanelProps) {
  const [referenceTypes, setReferenceTypes] = useState<ReferenceTypeNode[]>([]);
  const [enums, setEnums] = useState<Record<string, GsbEnum>>({});
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadReferenceTypes = async () => {
      const cacheService = GsbCacheService.getInstance();
      const { entityDef } = await cacheService.getEntityDefWithProperties(entityDefId);
      
      if (!entityDef) return;

      // Separate reference and non-reference types
      const refTypes = entityDef.properties?.filter(p => p.refType) || [];
      const nonRefTypes = entityDef.properties?.filter(p => !p.refType) || [];

      // Sort alphabetically
      const sortedNonRefTypes = [...nonRefTypes].sort((a, b) => 
        (a.title || a.name).localeCompare(b.title || b.name)
      );
      const sortedRefTypes = [...refTypes].sort((a, b) => 
        (a.title || a.name).localeCompare(b.title || b.name)
      );

      // Create reference type tree
      const refTypeTree = await Promise.all(
        sortedRefTypes.map(async (prop) => {
          const refEntityDef = await cacheService.getEntityDefWithProperties(prop.refType!);
          return {
            property: prop,
            entityDef: refEntityDef.entityDef,
            children: refEntityDef.entityDef?.properties
              ?.filter(p => !p.refType)
              .sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name))
              .map(p => ({
                property: p,
                expanded: false
              }))
          };
        })
      );

      setReferenceTypes(refTypeTree);
    };

    loadReferenceTypes();
  }, [entityDefId]);

  useEffect(() => {
    const loadEnums = async () => {
      const cacheService = GsbCacheService.getInstance();
      const { entityDef } = await cacheService.getEntityDefWithProperties(entityDefId);
      
      if (!entityDef) return;

      const enumProps = entityDef.properties?.filter(p => p.enumType) || [];
      const enumMap: Record<string, GsbEnum> = {};

      await Promise.all(
        enumProps.map(async (prop) => {
          if (prop.enumType && !enumMap[prop.enumType]) {
            const enumDef = await cacheService.getEnum(prop.enumType);
            if (enumDef) {
              enumMap[prop.enumType] = enumDef;
            }
          }
        })
      );

      setEnums(enumMap);
    };

    loadEnums();
  }, [entityDefId]);

  const toggleRefExpansion = (refId: string) => {
    const newExpandedRefs = new Set(expandedRefs);
    if (newExpandedRefs.has(refId)) {
      newExpandedRefs.delete(refId);
    } else {
      newExpandedRefs.add(refId);
    }
    setExpandedRefs(newExpandedRefs);
  };

  const handleColumnToggle = (propertyName: string) => {
    onColumnChange(
      columns.map(col => 
        col.property.name === propertyName
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  const handleSortableToggle = (propertyName: string) => {
    onColumnChange(
      columns.map(col => 
        col.property.name === propertyName
          ? { ...col, sortable: !col.sortable }
          : col
      )
    );
  };

  const handleFilterableToggle = (propertyName: string) => {
    onColumnChange(
      columns.map(col => 
        col.property.name === propertyName
          ? { ...col, filterable: !col.filterable }
          : col
      )
    );
  };

  const renderPropertyNode = (node: ReferenceTypeNode, level: number = 0) => {
    const isExpanded = expandedRefs.has(node.property.name);
    const hasChildren = node.children && node.children.length > 0;
    const column = columns.find(c => c.property.name === node.property.name);

    return (
      <div key={node.property.name} className="space-y-1">
        <div 
          className={cn(
            "flex items-center gap-2 py-1",
            level > 0 && "ml-4"
          )}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => toggleRefExpansion(node.property.name)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <Label className="text-sm font-medium">
              {node.property.title || node.property.name}
            </Label>
            {node.property.enumType && enums[node.property.enumType] && (
              <div className="text-xs text-muted-foreground">
                {enums[node.property.enumType].values?.length || 0} values
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={column?.visible}
              onCheckedChange={() => handleColumnToggle(node.property.name)}
            />
            <Switch
              checked={column?.sortable}
              onCheckedChange={() => handleSortableToggle(node.property.name)}
            />
            <Switch
              checked={column?.filterable}
              onCheckedChange={() => handleFilterableToggle(node.property.name)}
            />
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4 space-y-1">
            {node.children?.map(child => renderPropertyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Column Settings</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onColumnChange(
              columns.map(col => ({
                ...col,
                visible: true,
                sortable: true,
                filterable: true
              }))
            );
          }}
        >
          Show All
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {/* Non-reference types */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Basic Properties</h4>
            {columns
              .filter(col => !col.property.refType)
              .sort((a, b) => (a.property.title || a.property.name).localeCompare(b.property.title || b.property.name))
              .map(col => renderPropertyNode({ property: col.property }))}
          </div>

          {/* Reference types */}
          {referenceTypes.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Reference Properties</h4>
              {referenceTypes.map(ref => renderPropertyNode(ref))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 