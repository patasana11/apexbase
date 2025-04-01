import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, GripVertical, Search, Columns, Eye, EyeOff, X, Save, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GsbProperty, GsbEntityDef, DataType } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { debounce } from 'lodash';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GsbUser } from '@/lib/gsb/models/gsb-user.model';
import { GsbModule } from '@/lib/gsb/models/gsb-module.model';
import { GsbResourcePackTmpl } from '@/lib/gsb/models/gsb-resource-pack-tmpl.model';
import { GsbGridUtils, GridViewState, GridColumnConfig } from '@/lib/gsb/utils/gsb-grid-utils';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ColumnManagementBarProps {
  view: GridViewState;
  onViewChange: (newQueryParams: QueryParams<any>) => void;
  onColumnVisibilityChange: (changes: { visible?: boolean; propertyName: string }[]) => void;
  onColumnOrderChange: (changes: { propertyName: string; orderNumber: number }[]) => void;
  entityDef: GsbEntityDef;
  onStateLoad?: (state: any) => void;
  className?: string;
}

interface PropertyNode {
  property: GsbProperty;
  isReference: boolean;
  refEntityDef?: GsbEntityDef;
  children?: PropertyNode[];
  expanded?: boolean;
}

export function ColumnManagementBar({
  view,
  onViewChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  entityDef,
  onStateLoad,
  className
}: ColumnManagementBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [savedStates, setSavedStates] = useState<any[]>([]);
  const [newViewTitle, setNewViewTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [propertyNodes, setPropertyNodes] = useState<PropertyNode[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dataTableService = GsbDataTableService.getInstance();

  // Load saved states
  useEffect(() => {
    const loadStates = async () => {
      const states = await dataTableService.loadGridStates(entityDef.id || '');
      setSavedStates(states);
    };
    loadStates();
  }, [entityDef]);

  // Load and organize properties
  useEffect(() => {
    const loadProperties = async () => {
      if (!entityDef?.properties) return;

      const nodes: PropertyNode[] = [];
      
      // Add non-reference properties
      const nonRefProps = entityDef.properties.filter(p => p.definition?.dataType !== DataType.Reference);
      nodes.push(...nonRefProps.map(prop => ({
        property: prop,
        isReference: false
      })));

      // Add reference properties
      const refProps = entityDef.properties.filter(p => p.definition?.dataType === DataType.Reference);
      for (const prop of refProps) {
        if (!prop.refEntDef_id) continue;
        
        const refDef = await GsbCacheService.getInstance().getEntityDefWithProperties({ id: prop.refEntDef_id });
        if (!refDef) continue;

        nodes.push({
          property: prop,
          isReference: true,
          refEntityDef: refDef,
          children: refDef.properties?.map(childProp => ({
            property: childProp,
            isReference: false
          }))
        });
      }

      setPropertyNodes(nodes);
    };

    loadProperties();
  }, [entityDef]);

  // Check if a property is selected in the view
  const isPropertySelected = (node: PropertyNode) => {
    if (!node.isReference) {
      return view.queryParams.selectCols?.some(col => col.name === (node.property.name ?? ''));
    }
    
    // For reference properties, check if the path exists in selectCols
    const path = node.property.name ?? '';
    return view.queryParams.selectCols?.some(col => col.name === path);
  };

  // Handle property selection
  const handlePropertyToggle = (node: PropertyNode) => {
    const isSelected = isPropertySelected(node);
    const newQueryParams = new QueryParams(view.queryParams.entDefName ?? '');
    Object.assign(newQueryParams, view.queryParams);

    const propertyName = node.property.name ?? '';
    if (isSelected) {
      newQueryParams.selectCols = newQueryParams.selectCols?.filter(col => col.name !== propertyName);
    } else {
      newQueryParams.selectCols = [
        ...(newQueryParams.selectCols || []),
        { name: propertyName }
      ];
    }

    onViewChange(newQueryParams);
  };

  // Handle reference property expansion
  const handleExpandReference = (node: PropertyNode) => {
    if (!node.isReference || !node.children) return;

    const propertyName = node.property.name ?? '';
    const newExpandedRefs = new Set(expandedRefs);
    if (newExpandedRefs.has(propertyName)) {
      newExpandedRefs.delete(propertyName);
    } else {
      newExpandedRefs.add(propertyName);
    }
    setExpandedRefs(newExpandedRefs);
  };

  // Render property node
  const renderPropertyNode = (node: PropertyNode, level: number = 0) => {
    const propertyName = node.property.name ?? '';
    const isSelected = isPropertySelected(node);
    const isExpanded = expandedRefs.has(propertyName);
    const hasChildren = node.isReference && node.children && node.children.length > 0;

    return (
      <div key={propertyName}>
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
              {node.property.title || propertyName}
            </Label>
            {node.isReference && (
              <div className="text-xs text-muted-foreground truncate">
                {propertyName}
              </div>
            )}
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

  // Filter properties based on search
  const filteredNodes = propertyNodes.filter(node => {
    const matchesSearch = searchQuery === '' || 
      (node.property.title || node.property.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSaveState = async () => {
    if (!newViewTitle.trim()) return;
    
    const state = {
      query: JSON.stringify(view.queryParams)
    };

    await dataTableService.saveGridState(entityDef.id || '', state, newViewTitle);
    const states = await dataTableService.loadGridStates(entityDef.id || '');
    setSavedStates(states);
    setShowSaveDialog(false);
    setNewViewTitle('');
  };

  const handleLoadState = async (state: any) => {
    let parsedState;
    try {
      const decodedQuery = atob(state.query);
      parsedState = JSON.parse(decodedQuery);
    } catch (e) {
      // If base64 decode fails, try direct JSON parse
      parsedState = JSON.parse(state.query);
    }
    onStateLoad?.(parsedState);
  };

  const handleDeleteState = async (stateId: string) => {
    await dataTableService.deleteGridState(stateId);
    const states = await dataTableService.loadGridStates(entityDef.id || '');
    setSavedStates(states);
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search columns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Save State */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="h-4 w-4 mr-2" />
          Save View
        </Button>

        {/* Load State */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Load View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Saved View</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {savedStates.map((state) => (
                  <div key={state.id} className="flex items-center justify-between p-2 border rounded">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start"
                      onClick={() => handleLoadState(state)}
                    >
                      {state.title}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteState(state.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Column Selector Sheet */}
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
              </div>

              {/* Sheet Search */}
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search columns..."
                  value={sheetSearchQuery}
                  onChange={(e) => setSheetSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {filteredNodes.map(node => renderPropertyNode(node))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newViewTitle}
                onChange={(e) => setNewViewTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" onClick={handleSaveState}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 