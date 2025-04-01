import React, { useEffect, useState, useMemo, forwardRef, useCallback } from 'react';
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
  CustomEditorModule,
  SortChangedEvent,
  FilterChangedEvent,
  NumberEditorModule,
  Theme
} from 'ag-grid-community';
import { GsbEntityDef, GsbProperty, GsbPropertyDef, DataType } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { GsbUtils } from '@/lib/gsb/utils/gsb-utils';
import { GridColumnConfig, GridColumnConfigContext, GsbGridUtils, GridViewState } from '@/lib/gsb/utils/gsb-grid-utils';
import BitwiseEnumEditor from './BitwiseEnumEditor';  // Import the custom editor
import { GsbReference } from './GsbReference';
import { GsbMultiReference } from './GsbMultiReference';
import { ColumnManagementBar } from './column-management-bar';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { SingleQuery, QueryFunction } from '@/lib/gsb/types/query';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';

// Import AG Grid styles for legacy theme
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
  CustomEditorModule,
  NumberEditorModule
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
  view?: QueryParams<any>;
  onViewChange?: (view: QueryParams<any>) => void;
}

interface ColumnConfig {
  property: GsbProperty;
  visible: boolean;
  path?: string;
}

// Custom cell editor for reference fields
const ReferenceCellEditor = forwardRef((props: any, ref) => {
  const { value, data, colDef, stopEditing } = props;
  const context : GridColumnConfigContext = (colDef as any).context;

  if (!context?.entityDef || !context?.propertyDef) {
    console.error('Missing required context for ReferenceCellEditor');
    return null;
  }

  const handleChange = (newValue: any) => {
    if (!newValue) return;
    props.setValue(newValue);
    stopEditing();
  }

  return (
    <GsbReference
      entity={data}
      onChange={handleChange}
      parentEntityDef={context.entityDef}
      propName={context.property?.name || ''}
    />
  );
});

// Custom cell editor for multi-reference fields
const MultiReferenceCellEditor = forwardRef((props: any, ref) => {
  const { value, data, colDef, stopEditing } = props;
  const context = (colDef as any).context;

  if (!context?.entityDef || !context?.propertyDef) {
    console.error('Missing required context for MultiReferenceCellEditor');
    return null;
  }

  const handleChange = (newValues: any[]) => {
    if (!newValues) return;
    props.setValue(newValues);
    stopEditing();
  };

  return (
    <GsbMultiReference
      entity={data}
      onChange={handleChange}
      parentEntityDef={context.entityDef}
      propName={context.property.name}
      property={context.property}
    />
  );
});

export function GsbDataTable({ 
  entityDefName,
  view: initialView,
  onViewChange,
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
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [propertyDefs, setPropertyDefs] = useState<GsbProperty[]>([]);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [view, setView] = useState<GridViewState>(() => {
    if (initialView) {
      return {
        queryParams: initialView,
        columnDefs: GsbGridUtils.createColumnDefsFromView(initialView, entityDef || {}, enumCache)
      };
    }
    return GsbGridUtils.createDefaultView(entityDef || {}, propertyDefs, enumCache);
  });
  const [rowData, setRowData] = useState<any[]>(data);
  const [totalRows, setTotalRows] = useState<number>(totalCount);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(view.columnDefs);

  const gsbDataTableService = GsbDataTableService.getInstance();

  // Load entity definition and properties
  useEffect(() => {
    const loadEntityDef = async () => {
      const cacheService = GsbCacheService.getInstance();
      const { entityDef, properties } = await cacheService.getEntityDefWithPropertiesByName(entityDefName);
      setEntityDef(entityDef);
      setPropertyDefs(properties);

      // Load enums
      if (entityDef?.properties) {
        const enumIds = entityDef.properties
          .filter(prop => prop.enum_id && GsbUtils.isValidId(prop.enum_id))
          .map(prop => prop.enum_id!);

        const enums = await Promise.all(
          enumIds.map(id => cacheService.getEnum(id))
        );

        const enumMap = new Map<string, GsbEnum>();
        enums.forEach(enumDef => {
          if (enumDef && GsbUtils.isValidId(enumDef.id)) {
            enumMap.set(enumDef.id!, enumDef);
          }
        });
        setEnumCache(enumMap);
      }
    };

    loadEntityDef();
  }, [entityDefName]);

  // Initialize view
  useEffect(() => {
    if (!entityDef?.properties?.length) return;

    // Create default view if we don't have one
    if (!view || !view.columnDefs?.length) {
      const defaultView = GsbGridUtils.createDefaultView(entityDef, entityDef.properties, enumCache);
      setView(defaultView);
      setColumnDefs(defaultView.columnDefs);
    }
  }, [entityDef, enumCache]);

  // Handle pagination changes
  const handlePaginationChanged = useCallback((event: any) => {
    const newPage = event.api.paginationGetCurrentPage();
    const newPageSize = event.api.paginationGetPageSize();
    
    // Update pagination without triggering view changes
    onPageChange(newPage);
    onPageSizeChange(newPageSize);
  }, [onPageChange, onPageSizeChange]);

  // Load data when pagination or view changes
  useEffect(() => {
    if (!entityDef?.properties?.length || !view) return;

    const loadDataWithView = async () => {
      try {
        const response = await gsbDataTableService.queryEntities(entityDefName, {
          page: Math.floor((view.queryParams.startIndex || 0) / pageSize) + 1,
          pageSize,
          sortField: view.queryParams.sortCols?.[0]?.col?.name,
          sortDirection: view.queryParams.sortCols?.[0]?.sortType as 'ASC' | 'DESC' | undefined,
          filters: view.queryParams.filter ? JSON.parse(view.queryParams.filter) : undefined
        });
        setRowData(response.data);
        setTotalRows(response.totalCount);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadDataWithView();
  }, [entityDefName, page, pageSize, view.queryParams]);

  // Handle view changes
  useEffect(() => {
    if (!view || !entityDef) return;
    
    // Update column definitions when view changes
    const newColumnDefs = GsbGridUtils.createColumnDefsFromView(view.queryParams, entityDef, enumCache);
    setColumnDefs(newColumnDefs);
  }, [view.queryParams, entityDef, enumCache]);

  // Handle column visibility changes
  const handleColumnVisibilityChanged = useCallback((changes: { visible?: boolean; propertyName: string }[]) => {
    if (!view) return;
    
    const updatedQueryParams = GsbGridUtils.updateViewFromColumnChanges(view.queryParams, changes);
    setView(prev => ({
      ...prev,
      queryParams: updatedQueryParams
    }));
  }, [view]);

  // Handle column order changes
  const handleColumnOrderChanged = useCallback((changes: { propertyName: string; orderNumber: number }[]) => {
    if (!view) return;
    
    const updatedQueryParams = GsbGridUtils.updateViewFromColumnChanges(view.queryParams, changes);
    setView(prev => ({
      ...prev,
      queryParams: updatedQueryParams
    }));
  }, [view]);

  // Handle view changes from ColumnManagementBar
  const handleViewChange = useCallback((newQueryParams: QueryParams<any>) => {
    if (!entityDef) return;

    // Ensure startIndex is non-negative
    newQueryParams.startIndex = Math.max(0, (page - 1) * pageSize);
    newQueryParams.count = pageSize;

    const newView = {
      queryParams: newQueryParams,
      columnDefs: GsbGridUtils.createColumnDefsFromView(newQueryParams, entityDef, enumCache)
    };
    setView(newView);
    onViewChange?.(newQueryParams);
  }, [page, pageSize, entityDef, enumCache, onViewChange]);

  // Handle sort changes
  const onSortChanged = useCallback((event: SortChangedEvent) => {
    const columnDefs = event.api.getColumnDefs() as ColDef[];
    const newQueryParams = new QueryParams(entityDefName);
    Object.assign(newQueryParams, view.queryParams);
    
    newQueryParams.sortCols = columnDefs
      .filter(col => col.sort)
      .map(col => ({
        col: { name: col.field as string },
        sortType: col.sort as 'ASC' | 'DESC'
      }));
    
    handleViewChange(newQueryParams);
  }, [entityDefName, view.queryParams, handleViewChange]);

  // Handle filter changes
  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    const filterModel = event.api.getFilterModel() as FilterModel;
    const newQueryParams = new QueryParams(entityDefName);
    Object.assign(newQueryParams, view.queryParams);
    
    newQueryParams.query = Object.entries(filterModel).map(([field, filter]) => {
      const query = new SingleQuery(field);
      query.isEqual(filter);
      return query;
    });
    
    handleViewChange(newQueryParams);
  }, [entityDefName, view.queryParams, handleViewChange]);

  // Handle grid ready
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    if (columnDefs?.length) {
      const columnState = columnDefs.map(col => ({
        colId: col.field as string,
        hide: col.hide,
        sort: col.sort,
        width: col.width,
        pinned: col.pinned
      }));
      params.api.applyColumnState({
        state: columnState,
        applyOrder: true
      });
    }
  }, [columnDefs]);

  const handleStateLoad = (state: any) => {
    try {
      // Try to parse the query as base64 first
        handleViewChange(state);
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const gridOptions: GridOptions = {
    rowData: rowData,
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: pageSize,
    defaultColDef: {
      sortable: true,
      filter: true
    },
    theme: 'legacy',
    onPaginationChanged: handlePaginationChanged,
    onSortChanged,
    onFilterChanged,
    onCellValueChanged: (event: any) => {
      if (onDataChange) {
        const updatedData = [...rowData];
        const index = updatedData.findIndex(row => row.id === event.data.id);
        if (index !== -1) {
          updatedData[index] = { ...updatedData[index], [event.colDef.field]: event.newValue };
          onDataChange(updatedData);
        }
      }
    },
    components: {
      bitwiseEnumEditor: BitwiseEnumEditor,
      referenceEditor: ReferenceCellEditor,
      multiReferenceEditor: MultiReferenceCellEditor
    },
    onGridReady
  };

  return (
    <div className="flex flex-col h-full w-full">
      {entityDef && (
        <ColumnManagementBar
          columns={view.columnDefs.map(col => {
            const property = propertyDefs.find(p => p.name === col.field);
            if (property) {
              return {
                property,
                visible: !col.hide,
                path: col.field as string
              };
            }
            const defaultProperty: GsbProperty = {
              name: col.field as string,
              title: col.headerName as string,
              definition: {
                id: col.field as string,
                name: col.field as string,
                title: col.headerName as string,
                dataType: DataType.StringUnicode
              }
            };
            return {
              property: defaultProperty,
              visible: !col.hide,
              path: col.field as string
            };
          })}
          onColumnChange={(changes) => {
            const columnChanges = changes.map(change => ({
              visible: change.visible,
              propertyName: change.property.name || ''
            }));
            const newView = GsbGridUtils.updateViewFromColumnChanges(view.queryParams, columnChanges);
            handleViewChange(newView);
          }}
          entityDef={entityDef}
          onStateLoad={handleStateLoad}
        />
      )}
      <div className="ag-theme-alpine flex-grow w-full overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
        <AgGridReact
          {...gridOptions}
          className="h-full w-full"
        />
      </div>
    </div>
  );
} 