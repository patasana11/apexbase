import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, GripVertical, Search, Columns, Eye, EyeOff, X, Save, Upload, XCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GsbProperty, GsbEntityDef, DataType, ScreenType } from '@/lib/gsb/models/gsb-entity-def.model';
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
import { ColumnManagement } from './column-management';
import { DataExport } from './data-export';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PropertyNode {
  property: GsbProperty;
  isReference: boolean;
  refEntityDef?: GsbEntityDef;
  children?: PropertyNode[];
  expanded?: boolean;
  path: string;
  id: string;
}

interface DataTableToolbarProps {
  view: GridViewState;
  onViewChange: (view: GridViewState) => void;
  onColumnVisibilityChange: (changes: { visible?: boolean; propertyName: string }[]) => void;
  onColumnOrderChange: (changes: { propertyName: string; orderNumber: number }[]) => void;
  entityDef: GsbEntityDef;
  onStateLoad: (state: any) => void;
  currentPageData: any[];
  totalCount: number;
}

export function DataTableToolbar({
  view,
  onViewChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  entityDef,
  onStateLoad,
  currentPageData,
  totalCount
}: DataTableToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedStates, setSavedStates] = useState<any[]>([]);
  const [newViewTitle, setNewViewTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dataTableService = GsbDataTableService.getInstance();
  const [isOpen, setIsOpen] = useState(false);
  const [propertyNodes, setPropertyNodes] = useState<PropertyNode[]>([]);

  // Load saved states
  useEffect(() => {
    const loadStates = async () => {
      const states = await dataTableService.loadGridStates(entityDef.id || '');
      setSavedStates(states);
    };
    loadStates();
  }, [entityDef]);

  // Initialize property nodes with tree structure
  useEffect(() => {
    const initializePropertyNodes = async () => {
      if (!entityDef?.properties) return;

      // First create flat nodes
      const nodes: PropertyNode[] = entityDef.properties.map(prop => ({
        property: prop,
        isReference: prop.definition?.dataType === DataType.Reference,
        refEntityDef: undefined,
        path: prop.name,
        id: prop.name,
        expanded: false,
        children: []
      }));

      // Build tree structure
      const treeNodes: PropertyNode[] = [];
      const nodeMap = new Map<string, PropertyNode>();

      // First pass: create map of all nodes
      nodes.forEach(node => {
        nodeMap.set(node.id, node);
      });

      // Second pass: build tree structure
      nodes.forEach(node => {
        if (node.isReference && node.property.refEntDef_id) {
          // This is a reference field, it will be a parent node
          treeNodes.push(node);
        } else if (!node.property.name.includes('.')) {
          // This is a top-level field
          treeNodes.push(node);
        }
      });

      setPropertyNodes(treeNodes);

      // Load reference entity definitions
      const referenceNodes = nodes.filter(node => node.isReference);
      if (referenceNodes.length > 0) {
        const cacheService = GsbCacheService.getInstance();
        const updatedNodes = [...treeNodes];
        
        for (const node of referenceNodes) {
          if (node.property.refEntDef_id) {
            try {
              const refEntityDef = await cacheService.getEntityDefWithProperties({id: node.property.refEntDef_id});
              const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
              if (nodeIndex !== -1) {
                // Create child nodes for reference properties
                const childNodes = refEntityDef.entityDef.properties?.map(prop => ({
                  property: prop,
                  isReference: prop.definition?.dataType === DataType.Reference,
                  refEntityDef: undefined,
                  path: `${node.property.name}.${prop.name}`,
                  id: `${node.property.name}.${prop.name}`,
                  expanded: false,
                  children: []
                })) || [];

                updatedNodes[nodeIndex] = {
                  ...updatedNodes[nodeIndex],
                  refEntityDef: refEntityDef.entityDef,
                  children: childNodes
                };
              }
            } catch (error) {
              console.error(`Failed to load reference entity for ${node.property.name}:`, error);
            }
          }
        }

        setPropertyNodes(updatedNodes);
      }
    };

    initializePropertyNodes();
  }, [entityDef]);

  // Handle search with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      const newQueryParams = new QueryParams(view.queryParams.entDefName ?? '');
      Object.assign(newQueryParams, view.queryParams);
      
      if (query.trim()) {
        newQueryParams.filter = query.trim();
      } else {
        delete newQueryParams.filter;
      }
      
      onViewChange({
        ...view,
        queryParams: newQueryParams
      });
    }, 300),
    [view, onViewChange]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

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
    
    // Create a new QueryParams instance with the parsed state
    const newQueryParams = new QueryParams(view.queryParams.entDefName ?? '');
    Object.assign(newQueryParams, parsedState);
    
    // Set the userQuery property when loading a saved view
    const newView: GridViewState = {
      ...view,
      queryParams: newQueryParams,
      userQuery: {
        id: state.id,
        title: state.title,
        query: state.query
      }
    };
    
    onStateLoad?.(newView);
  };

  const handleDeleteState = async (stateId: string) => {
    await dataTableService.deleteGridState(stateId);
    const states = await dataTableService.loadGridStates(entityDef.id || '');
    setSavedStates(states);
  };

  const handleResetView = () => {
    const defaultQueryParams = new QueryParams(view.queryParams.entDefName ?? '');
    const newView: GridViewState = {
      ...view,
      queryParams: defaultQueryParams,
      userQuery: undefined
    };
    onViewChange(newView);
  };

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return propertyNodes;

    const query = searchQuery.toLowerCase();
    return propertyNodes.filter(node => {
      const matchesTitle = node.property.title?.toLowerCase().includes(query);
      const matchesName = node.property.name.toLowerCase().includes(query);
      const matchesDescription = node.property.description?.toLowerCase().includes(query);
      return matchesTitle || matchesName || matchesDescription;
    });
  }, [propertyNodes, searchQuery]);

  // Handle column selection
  const handleSelectColumns = (type: 'listed' | 'all' | 'smart') => {
    if (!entityDef?.properties) return;

    const changes: { visible: boolean; propertyName: string }[] = [];
    const screenType = ScreenType.PC; // Default to PC

    entityDef.properties.forEach(prop => {
      let shouldShow = false;

      switch (type) {
        case 'listed':
          shouldShow = (prop.listScreens & screenType) === screenType;
          break;
        case 'all':
          shouldShow = true;
          break;
        case 'smart':
          shouldShow = !prop.name.endsWith('_id') && 
                      !['id', 'createDate', 'lastUpdateDate', 'createdBy_id', 'lastUpdatedBy_id'].includes(prop.name) &&
                      prop.definition?.dataType !== DataType.Reference;
          break;
      }

      if (shouldShow) {
        changes.push({ visible: true, propertyName: prop.name });
      }
    });

    onColumnVisibilityChange(changes);
  };

  // Render tree node recursively
  const renderTreeNode = (node: PropertyNode, level: number = 0) => {
    const isSelected = view.queryParams.selectCols?.some(col => col.name === node.property.name);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div 
          className={cn(
            "flex items-center space-x-2 p-2 hover:bg-accent rounded-md",
            level > 0 && "ml-4"
          )}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => {
                setPropertyNodes(prev => 
                  prev.map(n => 
                    n.id === node.id 
                      ? { ...n, expanded: !n.expanded }
                      : n
                  )
                );
              }}
            >
              {node.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <Switch
            checked={isSelected}
            onCheckedChange={(checked) => {
              onColumnVisibilityChange([{
                visible: checked,
                propertyName: node.property.name
              }]);
            }}
          />
          <div className="flex flex-col">
            <Label className="font-medium">{node.property.title || node.property.name}</Label>
            {node.property.description && (
              <span className="text-sm text-muted-foreground">
                {node.property.description}
              </span>
            )}
          </div>
        </div>
        {hasChildren && node.expanded && (
          <div className="space-y-2">
            {node.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      {/* Entity Title */}
      <div className="font-semibold text-lg">
        {entityDef.title || entityDef.name}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search data..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
            onClick={() => {
              setSearchQuery('');
              debouncedSearch('');
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* View Selection */}
      {view.userQuery && (
        <div className="flex items-center gap-2 bg-accent px-3 py-1 rounded-md">
          <span className="text-sm">{view.userQuery.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={handleResetView}
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      )}

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

        {/* Column Management */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Manage Columns
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search columns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Select Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSelectColumns('listed')}>
                      Select Listed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelectColumns('all')}>
                      Select All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSelectColumns('smart')}>
                      Smart Select
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredProperties.map(node => renderTreeNode(node))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Data Export */}
        <DataExport
          entityDefId={entityDef.id || ''}
          queryParams={view.queryParams}
          currentPageData={currentPageData}
          totalCount={totalCount}
        />
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