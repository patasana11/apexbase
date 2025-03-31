import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, GripVertical, Search, Filter, Columns } from 'lucide-react';
import { GsbProperty, GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { cn } from '@/lib/utils';
import { DataType } from '@/lib/gsb/models/gsb-entity-def.model';
import { ColumnManagementBar } from './column-management-bar';
import { QueryParams } from '@/lib';

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
  entityDef: GsbEntityDef;
  columns: ColumnConfig[];
  onColumnChange: (columns: ColumnConfig[]) => void;
  className?: string;
  state: QueryParams<any>
}

interface ReferenceTypeNode {
  property: GsbProperty;
  entityDef?: GsbEntityDef;
  children?: ReferenceTypeNode[];
  expanded?: boolean;
}

export function ColumnSettingsPanel({
  entityDef,
  columns,
  onColumnChange,
  className
}: ColumnSettingsPanelProps) {
  const [referenceTypes, setReferenceTypes] = useState<ReferenceTypeNode[]>([]);
  const [enums, setEnums] = useState<Record<string, GsbEnum>>({});
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'system' | 'reference' | 'custom'>('all');

  useEffect(() => {
    const loadReferenceTypes = async () => {
      const cacheService = GsbCacheService.getInstance();
      entityDef = await cacheService.getEntityDefWithProperties(entityDef);
      
      if (!entityDef) return;

      // Separate reference and non-reference types
      const refTypes = entityDef.properties?.filter(p => p.definition?.dataType === DataType.Reference) || [];
      const nonRefTypes = entityDef.properties?.filter(p => p.definition?.dataType !== DataType.Reference ) || [];

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
  }, [entityDef]);

  useEffect(() => {
    const loadEnums = async () => {
      const cacheService = GsbCacheService.getInstance();
      entityDef  = await cacheService.getEntityDefWithProperties(entityDef);
      
      if (!entityDef) return;

      const enumProps = entityDef.properties?.filter(p => p.definition?.dataType === DataType.Enum) || [];
      const enumMap: Record<string, GsbEnum> = {};

      await Promise.all(
        enumProps.map(async (prop) => {
          if (prop.enum_id && !enumMap[prop.enum_id]) {
            const enumDef = await cacheService.getEnum(prop.enum_id);
            if (enumDef) {
              enumMap[prop.enum_id] = enumDef;
            }
          }
        })
      );

      setEnums(enumMap);
    };

    loadEnums();
  }, [entityDef]);

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

  const filteredColumns = useMemo(() => {
    return columns.filter(col => {
      const matchesSearch = searchQuery === '' || 
        (col.property.title || col.property.name).toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'system':
          return col.property.name === 'createdAt' || 
                 col.property.name === 'updatedAt' || 
                 col.property.name === 'createdBy' || 
                 col.property.name === 'updatedBy';
        case 'reference':
          return col.property.name.endsWith('_id');
        case 'custom':
          return !col.property.name.endsWith('_id') && 
                 col.property.name !== 'createdAt' && 
                 col.property.name !== 'updatedAt' && 
                 col.property.name !== 'createdBy' && 
                 col.property.name !== 'updatedBy';
        default:
          return true;
      }
    });
  }, [columns, searchQuery, activeFilter]);

  const handleShowAll = () => {
    onColumnChange(
      columns.map(col => ({
        ...col,
        visible: true,
        sortable: true,
        filterable: true
      }))
    );
  };

  const handleHideAll = () => {
    onColumnChange(
      columns.map(col => ({
        ...col,
        visible: false,
        sortable: false,
        filterable: false
      }))
    );
  };

  const renderPropertyNode = (node: ReferenceTypeNode, level: number = 0) => {
    const isExpanded = expandedRefs.has(node.property.name || '');
    const hasChildren = node.children && node.children.length > 0;
    const column = columns.find(c => c.property.name === node.property.name);

    if (!column) return null;

    return (
      <div key={node.property.name} className="space-y-1">
        <div 
          className={cn(
            "flex items-center gap-2 py-2 px-2 rounded-md hover:bg-accent/50 transition-colors",
            level > 0 && "ml-4"
          )}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => toggleRefExpansion(node.property.name || '')}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium truncate">
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
              onCheckedChange={() => handleColumnToggle(node.property.name || '')}
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
      <ColumnManagementBar
        columns={columns}
        onColumnChange={onColumnChange}
      />

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {/* Non-reference types */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground px-2">Basic Properties</h4>
            {columns
              .filter(col => !col.property.refType)
              .sort((a, b) => (a.property.title || a.property.name || '').localeCompare(b.property.title || b.property.name || ''))
              .map(col => renderPropertyNode({ property: col.property }))}
          </div>

          {/* Reference types */}
          {referenceTypes.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground px-2">Reference Properties</h4>
              {referenceTypes
                .filter(ref => columns.some(col => col.property.name === ref.property.name))
                .map(ref => renderPropertyNode(ref))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 