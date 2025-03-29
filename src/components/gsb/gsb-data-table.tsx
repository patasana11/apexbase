import React, { useEffect, useState } from 'react';
import { DataTable, Column } from './data-table';
import { GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { GripVertical } from 'lucide-react';

interface GsbDataTableProps {
  entityDefId: string;
  data: any[];
  onDataChange?: (newData: any[]) => void;
}

interface ColumnConfig extends Column<any> {
  id: string;
  header: string;
  key: string;
  cell: (item: any, index: number) => React.ReactNode;
  isVisible: boolean;
  isSortable: boolean;
  isFilterable: boolean;
  propertyDef: GsbProperty;
}

export function GsbDataTable({ entityDefId, data, onDataChange }: GsbDataTableProps) {
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [propertyDefs, setPropertyDefs] = useState<GsbProperty[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [localData, setLocalData] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [viewMode, setViewMode] = useState<'normal' | 'transpose'>('normal');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntityDef();
  }, [entityDefId]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const loadEntityDef = async () => {
    const cacheService = GsbCacheService.getInstance();
    const { entityDef, propertyDefs } = await cacheService.getEntityDefWithProperties(entityDefId);
    setEntityDef(entityDef);

    // Convert PropertyDefinition[] to GsbProperty[]
    const gsbProperties = propertyDefs.map(def => ({
      ...def,
      definition_id: def.id,
      isRequired: false,
      isIndexed: false,
      isPrimaryKey: false,
      isPartialPrimaryKey: false,
      isUnique: false,
      isEncrypted: false,
      isSearchable: def.isSearchable || false,
      isListed: def.isListed || false,
      isMultiLingual: def.isMultiLingual || false,
      maxLength: def.maxLength,
      scale: def.scale,
      defaultValue: def.defaultValue,
      refType: def.refType,
      refEntDef_id: def.refEntDef_id,
      refEntPropName: def.refEntPropName,
      cascadeReference: def.cascadeReference || false,
      enum_id: def.enum_id,
      formModes: def.formModes,
      updateFormMode: def.updateFormMode,
      viewFormMode: def.viewFormMode,
      createFormMode: def.createFormMode,
      listScreens: def.listScreens,
      orderNumber: def.orderNumber
    } as GsbProperty));
    setPropertyDefs(gsbProperties);

    if (entityDef?.properties) {
      // Collect all enum IDs
      const enumIds = entityDef.properties
        .filter(prop => prop.enum_id)
        .map(prop => prop.enum_id!);

      // Fetch all enums at once
      const enums = await cacheService.getEnums(enumIds);
      setEnumCache(enums);

      // Create column configurations
      const newColumns = entityDef.properties.map(prop => {
        const propertyDef = gsbProperties.find(pd => pd.name === prop.name);
        return {
          id: prop.name,
          header: prop.title,
          key: prop.name,
          cell: (item: any, index: number) => {
            const value = item[prop.name];
            if (!value) return null;

            if (prop.enum_id) {
              const enumDef = enums.get(prop.enum_id);
              if (enumDef?.values) {
                const enumValue = enumDef.values.find(v => v.value === value);
                return enumValue?.title || value;
              }
            }

            if (prop.refType) {
              if (Array.isArray(value)) {
                return value.map((ref: any) => ref.title).join(', ');
              }
              return value.title;
            }

            return value;
          },
          isVisible: true,
          isSortable: prop.isSearchable || false,
          isFilterable: prop.isSearchable || false,
          propertyDef: prop
        };
      });

      setColumns(newColumns);
    }
  };

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    const newData = [...localData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnId]: value
    };
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const handleAddRow = () => {
    const newRow = columns.reduce((acc, col) => {
      acc[col.id] = null;
      return acc;
    }, {} as any);
    const newData = [...localData, newRow];
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newData = localData.filter((_, index) => index !== rowIndex);
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
    ));
  };

  const toggleColumnSort = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, isSortable: !col.isSortable } : col
    ));
  };

  const toggleColumnFilter = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, isFilterable: !col.isFilterable } : col
    ));
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'normal' ? 'transpose' : 'normal');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter clicked');
  };

  const visibleColumns = columns.filter(col => col.isVisible);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button onClick={handleAddRow}>Add Row</Button>
          <Button onClick={toggleViewMode}>
            {viewMode === 'normal' ? 'Transpose View' : 'Normal View'}
          </Button>
        </div>
        <Button onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </Button>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={showSettings ? 80 : 100}>
          <div className="h-full overflow-auto">
            {viewMode === 'normal' ? (
              <DataTable
                columns={visibleColumns}
                data={localData}
                totalItems={localData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onExport={handleExport}
                onFilter={handleFilter}
                isLoading={isLoading}
                error={error}
                onCellEdit={handleCellEdit}
                onDeleteRow={handleDeleteRow}
                className="w-full"
              />
            ) : (
              <div className="p-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2">Property</th>
                      {localData.map((_, index) => (
                        <th key={index} className="border p-2">Row {index + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleColumns.map(column => (
                      <tr key={column.id}>
                        <td className="border p-2 font-medium">{column.header}</td>
                        {localData.map((row, rowIndex) => (
                          <td key={rowIndex} className="border p-2">
                            {column.cell(row, rowIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ResizablePanel>

        {showSettings && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20}>
              <div className="p-4 h-full overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Column Settings</h3>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-4">
                    {columns.map(column => (
                      <div key={column.id} className="space-y-2 p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">{column.header}</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={column.isVisible}
                              onCheckedChange={() => toggleColumnVisibility(column.id)}
                            />
                            <span className="text-sm">Visible</span>
                            {column.propertyDef.isSearchable && (
                              <>
                                <Checkbox
                                  checked={column.isSortable}
                                  onCheckedChange={() => toggleColumnSort(column.id)}
                                />
                                <span className="text-sm">Sort</span>
                                <Checkbox
                                  checked={column.isFilterable}
                                  onCheckedChange={() => toggleColumnFilter(column.id)}
                                />
                                <span className="text-sm">Filter</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {column.propertyDef.description || 'No description available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
} 