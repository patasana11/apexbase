import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, GripVertical, Search, Columns, Eye, EyeOff, X, Save, Upload, XCircle } from 'lucide-react';
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
import { ColumnManagement } from './column-management';
import { DataExport } from './data-export';

interface DataTableToolbarProps {
  view: GridViewState;
  onViewChange: (newQueryParams: QueryParams<any>) => void;
  onColumnVisibilityChange: (changes: { visible?: boolean; propertyName: string }[]) => void;
  onColumnOrderChange: (changes: { propertyName: string; orderNumber: number }[]) => void;
  entityDef: GsbEntityDef;
  onStateLoad?: (state: any) => void;
  className?: string;
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
  className,
  currentPageData,
  totalCount,
}: DataTableToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
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
      
      onViewChange(newQueryParams);
    }, 300),
    [view.queryParams, onViewChange]
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
    
    // Set the userQuery property when loading a saved view
    const newView = {
      ...view,
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
    const newView = {
      ...view,
      queryParams: defaultQueryParams,
      userQuery: undefined
    };
    onViewChange(newView);
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
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
        <ColumnManagement
          view={view}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onColumnOrderChange={onColumnOrderChange}
          entityDef={entityDef}
        />

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