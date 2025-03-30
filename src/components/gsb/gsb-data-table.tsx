import React, { useEffect, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  GridOptions, 
  GridApi, 
  GetContextMenuItemsParams,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  Column,
  ColDef,
  ModuleRegistry,
  ClientSideRowModelModule,
  RowApiModule,
  ColumnApiModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
  DateEditorModule,
  SelectEditorModule,
  TextEditorModule,
  CellStyleModule,
  RowSelectionModule,
  TooltipModule,
  PaginationModule,
  SortModelItem,
  FilterModel,
  EventApiModule,
  CheckboxEditorModule,
  InfiniteRowModelModule
} from 'ag-grid-community';
import { GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { PropertyDefinition } from '@/lib/gsb/models/property-definition.model';
import { GsbUtils } from '@/lib/gsb/utils/gsb-utils';

// Import AG Grid styles - using only the new theme
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowApiModule,
  ColumnApiModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
  DateEditorModule,
  SelectEditorModule,
  TextEditorModule,
  CellStyleModule,
  RowSelectionModule,
  TooltipModule,
  PaginationModule,
  EventApiModule,
  CheckboxEditorModule,
  InfiniteRowModelModule
]);

interface GsbDataTableProps {
  entityDefName: string;
  data: any[];
  onDataChange?: (newData: any[]) => void;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange?: (field: string, direction: 'ASC' | 'DESC') => void;
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function GsbDataTable({ 
  entityDefName, 
  data, 
  onDataChange,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange
}: GsbDataTableProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columns, setColumns] = useState<Column[] | null>(null);
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [propertyDefs, setPropertyDefs] = useState<PropertyDefinition[]>([]);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [rowData, setRowData] = useState<any[]>([]);

  // Get specific column configuration based on property type
  const getColumnTypeConfig = (prop: PropertyDefinition): Partial<ColDef> => {
    // Handle required fields
    const baseConfig: Partial<ColDef> = {
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      minWidth: 100,
      maxWidth: 300,
      // Add validation for required fields
      ...(prop.usage === 1 && {
        cellClass: 'required-field',
        cellStyle: { backgroundColor: '#fff3f3' }
      })
    };

    // Handle enum fields
    if (prop.enum_id) {
      return {
        ...baseConfig,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: [], // Will be populated from enum cache
          cellRenderer: (params: ICellRendererParams) => {
            const enumValue = enumCache.get(prop.enum_id!)?.values?.find(v => v.value === params.value);
            return enumValue?.title || params.value;
          }
        }
      };
    }

    // Handle reference fields
    if (prop.refType) {
      return {
        ...baseConfig,
        filter: 'agTextColumnFilter',
        cellEditor: 'agSelectCellEditor',
        cellRenderer: (params: ICellRendererParams) => {
          if (!params.value) return '';
          if (Array.isArray(params.value)) {
            return params.value.map((ref: any) => ref.title).join(', ');
          }
          return params.value.title || params.value;
        }
      };
    }

    // Handle numeric fields
    if (prop.dataType === 'DECIMAL' || prop.dataType === 'INT' || prop.dataType === 'LONG') {
      return {
        ...baseConfig,
        filter: 'agNumberColumnFilter',
        minWidth: 120,
        maxWidth: 150,
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return Number(params.value).toLocaleString(undefined, {
              minimumFractionDigits: prop.scale || 0,
              maximumFractionDigits: prop.scale || 0
            });
          }
          return '';
        }
      };
    }

    // Handle date fields
    if (prop.dataType === 'DATETIME') {
      return {
        ...baseConfig,
        filter: 'agDateFilter',
        cellEditor: 'agDateCellEditor',
        minWidth: 150,
        maxWidth: 180,
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return new Date(params.value).toLocaleDateString();
          }
          return '';
        }
      };
    }

    // Handle text fields with max length
    if (prop.dataType === 'STRING_UNICODE' || prop.dataType === 'STRING_ASCII') {
      return {
        ...baseConfig,
        filter: 'agTextColumnFilter',
        cellEditor: 'agTextCellEditor',
        minWidth: 150,
        maxWidth: 300,
        cellEditorParams: {
          maxLength: prop.maxLength
        }
      };
    }

    // Default to text column
    return {
      ...baseConfig,
      filter: 'agTextColumnFilter'
    };
  };

  // Configure column definitions
  const columnDefs = useMemo(() => {
    if (!propertyDefs.length) return [];

    return propertyDefs
      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0))
      .map(prop => ({
        field: prop.name,
        headerName: prop.title,
        // Add tooltip for required fields
        headerTooltip: prop.usage === 1 ? `${prop.title} (Required)` : prop.title,
        // Add tooltip for fields with description
        tooltipField: prop.name,
        // Add tooltip for reference fields
        ...(prop.refType && {
          tooltipValueGetter: (params: any) => {
            if (!params.value) return '';
            if (Array.isArray(params.value)) {
              return params.value.map((ref: any) => ref.title).join(', ');
            }
            return params.value.title || params.value;
          }
        }),
        // Additional column configuration based on property type
        ...getColumnTypeConfig(prop)
      }));
  }, [propertyDefs, enumCache]);

  // Load entity definition and properties
  useEffect(() => {
    const loadEntityDef = async () => {
      try {
        const cacheService = GsbCacheService.getInstance();
        const { entityDef, propertyDefs } = await cacheService.getEntityDefWithPropertiesByName(entityDefName);
        setEntityDef(entityDef);
        setPropertyDefs(propertyDefs);

        if (entityDef?.properties) {
          // Collect all enum IDs
          const enumIds = entityDef.properties
            .filter(prop => prop.enum_id && GsbUtils.isValidId(prop.enum_id))
            .map(prop => prop.enum_id!);

          // Load all enums
          const enums = await Promise.all(
            enumIds.map(id => cacheService.getEnum(id))
          );

          // Create enum cache
          const enumMap = new Map<string, GsbEnum>();
          enums.forEach(enumDef => {
            if (enumDef && GsbUtils.isValidId(enumDef.id)) {
              enumMap.set(enumDef.id!, enumDef);
            }
          });
          setEnumCache(enumMap);
        }
      } catch (error) {
        console.error('Error loading entity definition:', error);
      }
    };

    loadEntityDef();
  }, [entityDefName]);

  // Update row data when data prop changes
  useEffect(() => {
    setRowData(data);
  }, [data]);

  // Grid ready event handler
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    if (params.api) {
      setColumns(params.api.getColumnDefs() as Column[]);
      params.api.sizeColumnsToFit();

      // Add event listeners for sorting and filtering
      params.api.addEventListener('sortChanged', () => {
        const sortModel = params.api.getColumnDefs() as SortModelItem[];
        if (sortModel.length > 0) {
          const { colId, sort } = sortModel[0];
          onSortChange?.(colId, sort as 'ASC' | 'DESC');
        }
      });

      params.api.addEventListener('filterChanged', () => {
        const filterModel = params.api.getFilterModel() as FilterModel;
        onFilterChange?.(filterModel);
      });
    }
  };

  // Grid options
  const gridOptions: GridOptions = {
    columnDefs,
    rowData,
    onGridReady,
    pagination: true,
    paginationPageSize: pageSize,
    rowModelType: 'infinite',
    rowSelection: 'multiple',
    enableCellTextSelection: true,
    ensureDomOrder: true,
    suppressColumnVirtualisation: true,
    theme: 'legacy',
    domLayout: 'normal',
    maxBlocksInCache: 1,
    cacheBlockSize: pageSize,
    infiniteInitialRowCount: totalCount,
    maxConcurrentDatasourceRequests: 1,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      sortingOrder: ['asc', 'desc', null]
    },
    // Add these options for better scrolling behavior
    suppressRowClickSelection: true,
    suppressCellFocus: false,
    suppressRowVirtualisation: true,
    datasource: {
      getRows: (params) => {
        const page = params.startRow / pageSize;
        onPageChange(page + 1);
        params.successCallback(data, totalCount);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="ag-theme-alpine flex-grow w-full overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
        <AgGridReact
          {...gridOptions}
          className="h-full w-full"
        />
      </div>
    </div>
  );
} 