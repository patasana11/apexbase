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
  InfiniteRowModelModule,
  CustomEditorModule
} from 'ag-grid-community';
import { GsbEntityDef, GsbProperty, GsbPropertyDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { GsbUtils } from '@/lib/gsb/utils/gsb-utils';
import { GridColumnConfig, GsbGridUtils } from '@/lib/gsb/utils/gsb-grid-utils';
import BitwiseEnumEditor from './BitwiseEnumEditor';  // Import the custom editor
import { GsbReference } from './GsbReference';
import { GsbMultiReference } from './GsbMultiReference';

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
  InfiniteRowModelModule,
  CustomEditorModule
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

// Custom cell renderer for reference fields
const ReferenceCellRenderer = (props: ICellRendererParams) => {
  const { value, data, colDef } = props;
  const context = (colDef as any).context;

  if (!context?.isReference) {
    return <span>{value}</span>;
  }

  return (
    <GsbReference
      entity={data}
      parentEntityDef={context.propertyDef.refEntDef_id}
      propName={context.propertyDef.name}
      disabled={true}
    />
  );
};

// Custom cell editor for reference fields
const ReferenceCellEditor = (props: any) => {
  const { value, data, colDef, stopEditing } = props;
  const context = (colDef as any).context;

  if (!context?.isReference) {
    return null;
  }

  const handleChange = (newValue: string) => {
    props.setValue(newValue);
    stopEditing();
  };

  return (
    <GsbReference
      entity={data}
      onChange={handleChange}
      parentEntityDef={context.propertyDef.refEntDef_id}
      propName={context.propertyDef.name}
    />
  );
};

// Custom cell renderer for multi-reference fields
const MultiReferenceCellRenderer = (props: ICellRendererParams) => {
  const { value, data, colDef } = props;
  const context = (colDef as any).context;

  if (!context?.isReference || !context.isMultiple) {
    return <span>{value}</span>;
  }

  return (
    <GsbMultiReference
      entity={data}
      parentEntityDefName={context.propertyDef.refEntDef_id}
      propName={context.propertyDef.name}
      disabled={true}
    />
  );
};

// Custom cell editor for multi-reference fields
const MultiReferenceCellEditor = (props: any) => {
  const { value, data, colDef, stopEditing } = props;
  const context = (colDef as any).context;

  if (!context?.isReference || !context.isMultiple) {
    return null;
  }

  const handleChange = (newValues: string[]) => {
    props.setValue(newValues);
    stopEditing();
  };

  return (
    <GsbMultiReference
      entity={data}
      onChange={handleChange}
      parentEntityDefName={context.propertyDef.refEntDef_id}
      propName={context.propertyDef.name}
    />
  );
};

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
  const [propertyDefs, setPropertyDefs] = useState<GsbProperty[]>([]);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<GridColumnConfig[]>([]);

  // Configure column definitions
  useEffect(() => {
    if (!propertyDefs.length) return;

    const newColumnDefs = propertyDefs
      .map(prop => GsbGridUtils.createColumnDef(prop, enumCache))
      .filter(col => !col.context.isSystemColumn)
      .sort((a, b) => (a.context.orderNumber || 0) - (b.context.orderNumber || 0));

    setColumnDefs(newColumnDefs);
  }, [propertyDefs, enumCache]);

  // Load entity definition and properties
  useEffect(() => {
    const loadEntityDef = async () => {
      try {
        const cacheService = GsbCacheService.getInstance();
        const { entityDef, properties: propertyDefs } = await cacheService.getEntityDefWithPropertiesByName(entityDefName);
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
    components: {
      BitwiseEnumEditor,
      ReferenceCellRenderer,
      ReferenceCellEditor,
      MultiReferenceCellRenderer,
      MultiReferenceCellEditor
    },
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      sortingOrder: ['asc', 'desc', null],
      editable: true,
      cellRenderer: (params: ICellRendererParams) => {
        const context = (params.colDef as any).context;
        
        if (context?.isReference) {
          return context.isMultiple ? 'MultiReferenceCellRenderer' : 'ReferenceCellRenderer';
        }
        
        return undefined;
      },
      cellEditor: (params: ICellRendererParams) => {
        const context = (params.colDef as any).context;
        
        if (context?.isReference) {
          return context.isMultiple ? 'MultiReferenceCellEditor' : 'ReferenceCellEditor';
        }
        
        return undefined;
      }
    },
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