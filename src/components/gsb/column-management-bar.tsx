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

export interface GsbUserQuery {
  resPackTmps: GsbResourcePackTmpl[];
  module_id: string;
  lastUpdatedBy_id: string;
  createdBy: GsbUser;
  entityDefinition_id: string;
  title: string;
  lastUpdateDate: Date;
  module: GsbModule;
  commonAccess: boolean;
  id: string;
  lastUpdatedBy: GsbUser;
  defaultQueryDef_id: string;
  query: string;
  createDate: Date;
  defaultQueryDef: GsbEntityDef;
  entityDefinition: GsbEntityDef;
  createdBy_id: string;
  name: string;
  transposeScript: string;
}

interface ColumnConfig {
  property: GsbProperty;
  visible: boolean;
  path?: string;
  isReference?: boolean;
  children?: ColumnConfig[];
  expanded?: boolean;
}

interface ColumnManagementBarProps {
  columns: ColumnConfig[];
  onColumnChange: (columns: ColumnConfig[]) => void;
  className?: string;
  entityDef: GsbEntityDef;
  onStateLoad?: (state: any) => void;
}

interface ReferencePropertyNode {
  property: GsbProperty;
  children?: ReferencePropertyNode[];
  expanded?: boolean;
  path: string;
  entityDef?: GsbEntityDef;
}

export function ColumnManagementBar({
  columns,
  onColumnChange,
  className,
  entityDef,
  onStateLoad
}: ColumnManagementBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [savedStates, setSavedStates] = useState<any[]>([]);
  const [newViewTitle, setNewViewTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
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

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    debouncedSearch(value);
  };

  const handleColumnToggle = (propertyName: string | undefined) => {
    if (!propertyName) return;
    
    onColumnChange(
      columns.map(col => {
        if (col.property.name === propertyName) {
          return { ...col, visible: !col.visible };
        }
        if (col.children) {
          return {
            ...col,
            children: col.children.map(child => 
              child.property.name === propertyName
                ? { ...child, visible: !child.visible }
                : child
            )
          };
        }
        return col;
      })
    );
  };

  const handleExpandReference = (propertyName: string | undefined) => {
    if (!propertyName) return;
    
    setExpandedRefs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyName)) {
        newSet.delete(propertyName);
      } else {
        newSet.add(propertyName);
      }
      return newSet;
    });
  };

  const handleShowAll = () => {
    onColumnChange(
      columns.map(col => ({
        ...col,
        visible: true,
        children: col.children?.map(child => ({ ...child, visible: true }))
      }))
    );
  };

  const handleHideAll = () => {
    onColumnChange(
      columns.map(col => ({
        ...col,
        visible: false,
        children: col.children?.map(child => ({ ...child, visible: false }))
      }))
    );
  };

  const handleSaveState = async () => {
    if (!newViewTitle.trim()) return;
    
    const state = {
      columns: columns.map(col => ({
        propertyName: col.property.name,
        visible: col.visible,
        path: col.path
      }))
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

  const renderColumnItem = (col: ColumnConfig, level: number = 0) => {
    const isVisible = columns.find(c => c.property.name === col.property.name)?.visible;
    const isExpanded = expandedRefs.has(col.property.name || '');
    const hasChildren = col.children && col.children.length > 0;
    const isReference = col.property.definition?.dataType === DataType.Reference;

    return (
      <div key={col.property.name}>
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
              onClick={() => handleExpandReference(col.property.name)}
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
              {col.property.title || col.property.name}
            </Label>
            {col.path && (
              <div className="text-xs text-muted-foreground truncate">
                {col.path}
              </div>
            )}
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={() => handleColumnToggle(col.property.name)}
          />
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {col.children?.map(child => renderColumnItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredColumns = columns.filter(col => {
    const matchesSearch = searchQuery === '' || 
      (col.property.title || col.property.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className={cn("flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search columns..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleHideAll}
        >
          <EyeOff className="h-4 w-4 mr-2" />
          Hide All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShowAll}
        >
          <Eye className="h-4 w-4 mr-2" />
          Show All
        </Button>

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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHideAll}
                  >
                    Hide All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAll}
                  >
                    Show All
                  </Button>
                </div>
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
                  {filteredColumns.map(renderColumnItem)}
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