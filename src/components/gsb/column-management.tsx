import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, GripVertical, Search, Columns, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GsbProperty, GsbEntityDef, DataType } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { GridViewState } from '@/lib/gsb/utils/gsb-grid-utils';

interface PropertyNode {
  property: GsbProperty;
  isReference: boolean;
  refEntityDef?: GsbEntityDef;
  children?: PropertyNode[];
  expanded?: boolean;
  path: string;
  id: string;
}

interface ColumnManagementProps {
  view: GridViewState;
  onColumnVisibilityChange: (changes: { visible?: boolean; propertyName: string }[]) => void;
  onColumnOrderChange: (changes: { propertyName: string; orderNumber: number }[]) => void;
  entityDef: GsbEntityDef;
}

export function ColumnManagement({
  view,
  onColumnVisibilityChange,
  onColumnOrderChange,
  entityDef,
}: ColumnManagementProps) {
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [propertyNodes, setPropertyNodes] = useState<PropertyNode[]>([]);

  // Load and organize properties
  useEffect(() => {
    const loadProperties = async () => {
      if (!entityDef?.properties) return;

      const nodes: PropertyNode[] = [];
      
      // Add non-reference properties
      const nonRefProps = entityDef.properties
        .filter(p => p.definition?.dataType !== DataType.Reference)
        .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
      
      nodes.push(...nonRefProps.map(prop => ({
        property: prop,
        isReference: false,
        path: prop.name ?? '',
        id: `non-ref-${prop.name}`
      })));

      // Add reference properties
      const refProps = entityDef.properties
        .filter(p => p.definition?.dataType === DataType.Reference)
        .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
      
      for (const prop of refProps) {
        if (!prop.refEntDef_id) continue;
        
        nodes.push({
          property: prop,
          isReference: true,
          path: prop.name ?? '',
          id: `ref-${prop.name}`
        });
      }

      setPropertyNodes(nodes);
    };

    loadProperties();
  }, [entityDef]);

  // Load reference properties when expanded
  const loadReferenceProperties = async (node: PropertyNode) => {
    if (!node.isReference || !node.property.refEntDef_id) return;

    const refDef = await GsbCacheService.getInstance().getEntityDefWithProperties({ id: node.property.refEntDef_id });
    if (!refDef) return;

    const children: PropertyNode[] = [];

    // Add non-reference properties
    const nonRefProps = (refDef.properties?.filter(p => p.definition?.dataType !== DataType.Reference) || [])
      .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    
    children.push(...nonRefProps.map(prop => ({
      property: prop,
      isReference: false,
      path: `${node.path}.${prop.name}`,
      id: `${node.id}-non-ref-${prop.name}`
    })));

    // Add reference properties
    const refProps = (refDef.properties?.filter(p => p.definition?.dataType === DataType.Reference) || [])
      .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    
    children.push(...refProps.map(prop => ({
      property: prop,
      isReference: true,
      path: `${node.path}.${prop.name}`,
      id: `${node.id}-ref-${prop.name}`
    })));

    // Update the node with its children
    setPropertyNodes(prev => prev.map(n => 
      n.id === node.id ? { ...n, children } : n
    ));
  };

  // Check if a property is selected in the view
  const isPropertySelected = (node: PropertyNode) => {
    return view.queryParams.selectCols?.some(col => col.name === node.path);
  };

  // Handle property selection
  const handlePropertyToggle = (node: PropertyNode) => {
    const isSelected = isPropertySelected(node);
    onColumnVisibilityChange([{ visible: !isSelected, propertyName: node.path }]);
  };

  // Handle unselect all
  const handleUnselectAll = () => {
    const selectedColumns = propertyNodes
      .filter(node => isPropertySelected(node))
      .map(node => ({ visible: false, propertyName: node.path }));
    onColumnVisibilityChange(selectedColumns);
  };

  // Handle reference property expansion
  const handleExpandReference = async (node: PropertyNode) => {
    if (!node.isReference) return;

    const newExpandedRefs = new Set(expandedRefs);
    if (newExpandedRefs.has(node.path)) {
      newExpandedRefs.delete(node.path);
    } else {
      newExpandedRefs.add(node.path);
      // Load reference properties if not already loaded
      if (!node.children) {
        await loadReferenceProperties(node);
      }
    }
    setExpandedRefs(newExpandedRefs);
  };

  // Render property node
  const renderPropertyNode = (node: PropertyNode, level: number = 0) => {
    const isSelected = isPropertySelected(node);
    const isExpanded = expandedRefs.has(node.path);
    const hasChildren = node.isReference;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-4 p-2 rounded-md hover:bg-accent/50 transition-colors",
            level > 0 && "ml-4"
          )}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => handleExpandReference(node)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium truncate">
              {node.property.title || node.property.name}
            </Label>
            <div className="text-xs text-muted-foreground truncate">
              {node.path}
            </div>
          </div>
          <Switch
            checked={isSelected}
            onCheckedChange={() => handlePropertyToggle(node)}
          />
        </div>
        {hasChildren && isExpanded && node.children && (
          <div className="space-y-1">
            {node.children.map(child => renderPropertyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={showColumnSelector} onOpenChange={setShowColumnSelector}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns className="h-4 w-4 mr-2" />
          Select Columns
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Column Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnselectAll}
            >
              Unselect All
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {propertyNodes.map(node => renderPropertyNode(node))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
} 