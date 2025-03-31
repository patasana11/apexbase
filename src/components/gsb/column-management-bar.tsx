import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, GripVertical, Search, Filter, Columns, Eye, EyeOff, SortAsc, SortDesc, Filter as FilterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';

interface ColumnManagementBarProps {
  columns: Array<{
    property: GsbProperty;
    visible: boolean;
    sortable: boolean;
    filterable: boolean;
  }>;
  onColumnChange: (columns: any[]) => void;
  className?: string;
}

export function ColumnManagementBar({
  columns,
  onColumnChange,
  className
}: ColumnManagementBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'system' | 'reference' | 'custom'>('all');
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const filteredColumns = columns.filter(col => {
    const matchesSearch = searchQuery === '' || 
      (col.property.title || col.property.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'system':
        return col.property.name === 'createdAt' || 
               col.property.name === 'updatedAt' || 
               col.property.name === 'createdBy' || 
               col.property.name === 'updatedBy';
      case 'reference':
        return col.property.name?.endsWith('_id');
      case 'custom':
        return !col.property.name?.endsWith('_id') && 
               col.property.name !== 'createdAt' && 
               col.property.name !== 'updatedAt' && 
               col.property.name !== 'createdBy' && 
               col.property.name !== 'updatedBy';
      default:
        return true;
    }
  });

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

  return (
    <div className={cn("flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      {/* Search and Filters */}
      <div className="flex-1 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            <Columns className="h-4 w-4 mr-2" />
            All
          </Button>
          <Button
            variant={activeFilter === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('system')}
          >
            <Filter className="h-4 w-4 mr-2" />
            System
          </Button>
          <Button
            variant={activeFilter === 'reference' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('reference')}
          >
            <Filter className="h-4 w-4 mr-2" />
            References
          </Button>
          <Button
            variant={activeFilter === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('custom')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Custom
          </Button>
        </div>
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

              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {filteredColumns.map((col) => (
                    <div
                      key={col.property.name}
                      className="flex items-center gap-4 p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium truncate">
                          {col.property.title || col.property.name}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={col.visible}
                          onCheckedChange={() => handleColumnToggle(col.property.name || '')}
                        />
                        <Switch
                          checked={col.sortable}
                          onCheckedChange={() => handleSortableToggle(col.property.name || '')}
                        />
                        <Switch
                          checked={col.filterable}
                          onCheckedChange={() => handleFilterableToggle(col.property.name || '')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 