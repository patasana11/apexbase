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
  Theme,
  IGetRowsParams,
  IDatasource,
  CustomFilterModule,
} from 'ag-grid-community';
import { GsbEntityDef, GsbProperty, GsbPropertyDef, DataType, ViewMode, ScreenType } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';
import { GsbUtils } from '@/lib/gsb/utils/gsb-utils';
import { GridColumnConfig, GridColumnConfigContext, GsbGridUtils, GridViewState } from '@/lib/gsb/utils/gsb-grid-utils';
import BitwiseEnumEditor from './BitwiseEnumEditor';  // Import the custom editor
import DateTimeEditor from './DateTimeEditor';  // Import the datetime editor
import { GsbReference } from './GsbReference';
import { GsbMultiReference } from './GsbMultiReference';
import { DataTableToolbar } from './column-management-bar';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { SingleQuery, QueryFunction, QueryRelation, SelectCol } from '@/lib/gsb/types/query';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { useTheme } from 'next-themes';
import { EnumFilterComponent } from './filters/EnumFilterComponent';
import { ReferenceFilterComponent } from './filters/ReferenceFilterComponent';
// Import AG Grid styles for legacy theme
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { filter, isObject } from 'lodash';

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
  NumberEditorModule,
  CustomFilterModule
]);

interface GsbDataTableProps {
  entityDefName: string;
  data?: any[];
  onDataChange?: (newData: any[]) => void;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  const context: GridColumnConfigContext = (colDef as any).context;

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

// Add this helper function at the top level
const formatBitwiseEnumValue = (value: number, enumValues: { value: number; title: string }[]): string => {
  if (!value) return '';
  return enumValues
    .filter(v => (value & v.value) === v.value)
    .map(v => v.title)
    .join(', ');
};

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
  const { theme, resolvedTheme } = useTheme();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [propertyDefs, setPropertyDefs] = useState<GsbProperty[]>([]);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [rowData, setRowData] = useState<any[]>(data || []);
  const [totalRows, setTotalRows] = useState<number>(totalCount || 0);
  const [view, setView] = useState<GridViewState | null>(null);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);

  const gsbDataTableService = GsbDataTableService.getInstance();

  // Handle view changes
  const handleViewChange = useCallback(async (newView: GridViewState) => {
    if (!entityDef) return;
    const newQueryParams = new QueryParams(entityDefName);
    // Ensure startIndex is non-negative
    const newColumnDefs = await GsbGridUtils.createColumnDefsFromView(newQueryParams, entityDef);
    newView.columnDefs = newColumnDefs;

    setView(newView);
    onViewChange?.(newQueryParams);
  }, [page, pageSize, entityDef, onViewChange]);

  // Define dataSource before using it
  const dataSource = useMemo<IDatasource>(() => ({
    getRows: async (params: IGetRowsParams) => {
      try {
        const { startRow, endRow } = params;
        const currentPage = Math.floor(startRow / (pageSize || 10)) + 1;

        const queryParams = new QueryParams(entityDefName);
        if (view?.queryParams) {
          Object.assign(queryParams, view.queryParams);
        }
        queryParams.startIndex = startRow;
        queryParams.count = endRow - startRow;
        queryParams.calcTotalCount = true;

        // Fetch data
        const response = await GsbEntityService.getInstance().query(queryParams);

        // Return data to grid
        params.successCallback(response.entities || [], response.totalCount || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        params.failCallback();
      }
    }
  }), [entityDefName, pageSize, view?.queryParams]);

  // Handle filter changes
  const onFilterChanged = useCallback(async (event: FilterChangedEvent) => {
    if (!view || !entityDef) return;

    const apiFilterModel = event.api.getFilterModel();
    const newQueryParams = new QueryParams(entityDefName);

    Object.assign(newQueryParams, view.queryParams);

    newQueryParams.query = [];
    for (const filterName  of Object.keys(apiFilterModel)) {
      const filterModel = apiFilterModel[filterName];
      let property: GsbProperty | undefined = filterModel.colDef?.context?.property;
      if(!property) 
        property = entityDef?.properties?.find(p => p.name === filterName) ;
      if(!property) continue;

      const value = filterModel.filter;


      if (!value
        || Array.isArray(value) && !value.length
        || isObject(value) && !Object.keys(value).length
      ) {
        await handleViewChange({
          queryParams: newQueryParams,
          columnDefs: view?.columnDefs || []
        });
        return;
      }

      const colType: DataType = property?.definition?.dataType || DataType.StringUnicode;
      const isMultiple = property?.isMultiple;

      const newQuery = new SingleQuery(filterName);
      newQuery.name = filterName;
      if (isMultiple) {
        if (colType === DataType.Enum) {
          const bitwiseValue = value.reduce((acc: number, v: any) => acc | v, 0);
          newQuery.bitwiseAnd(bitwiseValue);

        } else if(colType === DataType.Reference){
          newQuery.contains(Array.isArray(value) ? value : [value]);
        }
      } else {
        if (Array.isArray(value)) {
          if (colType === DataType.Enum) {
            delete newQuery.col;
            delete newQuery.val;
            newQuery.children = value.map((v: any) => {
              const ret = new SingleQuery(filterName, v);
              ret.relation = QueryRelation.Or;
              return ret;
            });
          } else if(colType === DataType.Reference){
            newQuery.col = new SelectCol(filterName + "_id");
            newQuery.in(value);
          }
        }
      }

      if(!newQuery.val?.value){
        switch(filterModel.type){
          // Text Filters
          case 'contains':
            newQuery.isLike(value);
            break;
          case 'equals':
            newQuery.isEqual(value);
            break;
          case 'notEqual':
            newQuery.isEqual(value).not();
            break;
          case 'startsWith':
            newQuery.isLike(value + '%');
            break;
          case 'endsWith':
            newQuery.isLike('%' + value);
            break;
          case 'blank':
            newQuery.funcVal(QueryFunction.IsNull, null);
            break;
          case 'notBlank':
            newQuery.funcVal(QueryFunction.IsNull, null).not();
            break;

          // Number Filters
          case 'greaterThan':
            newQuery.isGreater(value);
            break;
          case 'lessThan':
            newQuery.isSmaller(value);
            break;
          case 'greaterThanOrEqual':
            newQuery.isGreater(value);
            break;
          case 'lessThanOrEqual':
            newQuery.isSmaller(value);
            break;
          case 'inRange':
            newQuery.funcVal(QueryFunction.Between, value);
            break;

          // Date Filters
          case 'dateEquals':
            newQuery.isEqual(value);
            break;
          case 'dateNotEqual':
            newQuery.isEqual(value).not();
            break;
          case 'dateBefore':
            newQuery.isSmaller(value);
            break;
          case 'dateAfter':
            newQuery.isGreater(value);
            break;
          case 'dateBetween':
            newQuery.funcVal(QueryFunction.Between, value);
            break;

          // Set Filters
          case 'in':
            newQuery.funcVal(QueryFunction.In, value);
            break;
          case 'notIn':
            newQuery.funcVal(QueryFunction.In, value).not();
            break;

          // Advanced Filters
          case 'regexMatch':
            newQuery.funcVal(QueryFunction.RegexMatch, value);
            break;
          case 'regexMatchCaseInsensitive':
            newQuery.funcVal(QueryFunction.RegexMatchCaseInsensitive, value);
            break;
          case 'fullTextSearch':
            newQuery.funcVal(QueryFunction.FullTextSearch, value);
            break;
          case 'phraseSearch':
            newQuery.funcVal(QueryFunction.PhraseSearch, value);
            break;
          case 'iLike':
            newQuery.funcVal(QueryFunction.ILike, value);
            break;

          // Default case
          default:
            // Default to contains if type is not recognized
            newQuery.isLike(value);
            break;
        }
      }

      newQueryParams.query.push(newQuery);
    }

    // Update view and trigger change
    await handleViewChange({
      queryParams: newQueryParams,
      columnDefs: view?.columnDefs || []
    });
  }, [entityDefName, view, entityDef, handleViewChange]);

  // Handle grid ready
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);

    // Apply column state if available
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

    // Force grid to load data
    if ('setDatasource' in params.api) {
      (params.api as any).setDatasource(dataSource);
    }
  }, [columnDefs, dataSource]);

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

  // Initialize view with screen type
  useEffect(() => {
    const initializeView = async () => {
      if (!entityDef?.properties?.length) return;

      if (initialView) {
        const columnDefs = await GsbGridUtils.createColumnDefsFromView(initialView, entityDef);
        setView({
          queryParams: initialView,
          columnDefs,
        });
        setColumnDefs(columnDefs);
      } else {
        // Get current screen type (default to PC)
        const screenType = ScreenType.PC;
        
        // Create default view with screen type
        const defaultView = await GsbGridUtils.createDefaultView(entityDef);
        setView(defaultView);
        setColumnDefs(defaultView.columnDefs);
      }
    };

    initializeView();
  }, [initialView, entityDef]);

  // Handle view changes
  useEffect(() => {
    const updateView = async () => {
      if (!view || !entityDef) return;

      const newColumnDefs = await GsbGridUtils.createColumnDefsFromView(view.queryParams, entityDef);
      setColumnDefs(newColumnDefs);
    };

    updateView();
  }, [view?.queryParams, entityDef]);

  // Handle column visibility changes
  const handleColumnVisibilityChanged = useCallback(async (changes: { visible?: boolean; propertyName: string }[]) => {
    if (!view || !entityDef) return;

    const updatedQueryParams = GsbGridUtils.updateViewFromColumnChanges(view.queryParams, changes);
    const newColumnDefs = await GsbGridUtils.createColumnDefsFromView(updatedQueryParams, entityDef);

    setView(prev => prev ? {
      ...prev,
      queryParams: updatedQueryParams,
      columnDefs: newColumnDefs
    } : null);
  }, [view, entityDef]);

  // Handle column order changes
  const handleColumnOrderChanged = useCallback(async (changes: { propertyName: string; orderNumber: number }[]) => {
    if (!view || !entityDef) return;

    const updatedQueryParams = GsbGridUtils.updateViewFromColumnChanges(view.queryParams, changes);
    const newColumnDefs = await GsbGridUtils.createColumnDefsFromView(updatedQueryParams, entityDef);

    setView(prev => prev ? {
      ...prev,
      queryParams: updatedQueryParams,
      columnDefs: newColumnDefs
    } : null);
  }, [view, entityDef]);

  // Handle sort changes
  const onSortChanged = useCallback(async (event: SortChangedEvent) => {
    if (!view || !entityDef) return;

    const columnDefs = event.api.getColumnDefs() as ColDef[];
    const newQueryParams = new QueryParams(entityDefName);
    Object.assign(newQueryParams, view.queryParams);

    newQueryParams.sortCols = columnDefs
      .filter(col => col.sort)
      .map(col => ({
        col: { name: col.field as string },
        sortType: col.sort as 'ASC' | 'DESC'
      }));

    await handleViewChange({
      queryParams: newQueryParams,
      columnDefs: view?.columnDefs || []
    });
  }, [entityDefName, view, entityDef, handleViewChange]);

  const handleStateLoad = (state: any) => {
    try {
      handleViewChange(state);
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  // Define the grid options before using them
  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    valueFormatter: (params: ValueFormatterParams): string => {
      const colDef = params.colDef;
      const context = (colDef as any).context;

      if (context?.property?.name === 'createFormMode' || 
          context?.property?.name === 'updateFormMode' || 
          context?.property?.name === 'viewFormMode') {
        const enumValues = [
          { value: ViewMode.Editable, title: 'Editable' },
          { value: ViewMode.ReadOnly, title: 'Read-only' },
          { value: ViewMode.Hidden, title: 'Hidden' }
        ];
        return formatBitwiseEnumValue(params.value as number, enumValues);
      }

      if (context?.property?.name === 'listScreens') {
        const enumValues = [
          { value: ScreenType.PC, title: 'PC' },
          { value: ScreenType.Tablet, title: 'Tablet' },
          { value: ScreenType.Mobile, title: 'Mobile' }
        ];
        return formatBitwiseEnumValue(params.value as number, enumValues);
      }

      return String(params.value || '');
    }
  };

  // Create a default data source if none is provided
  const defaultDataSource: IDatasource = {
    getRows: async (params: IGetRowsParams) => {
      return {
        rowData: [],
        rowCount: 0
      };
    }
  };

  // Create a default grid view state
  const defaultGridViewState: GridViewState = {
    queryParams: new QueryParams(entityDefName),
    columnDefs: []
  };

  const gridOptions: GridOptions = {
    columnDefs: columnDefs || [],
    rowModelType: 'infinite',
    cacheBlockSize: pageSize || 10,
    maxBlocksInCache: 10,
    infiniteInitialRowCount: 1,
    maxConcurrentDatasourceRequests: 1,
    defaultColDef,
    theme: 'legacy',
    pagination: true,
    paginationPageSize: pageSize || 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    suppressPaginationPanel: false,
    onPaginationChanged: (event: any) => {
      const newPage = event.api.paginationGetCurrentPage();
      const newPageSize = event.api.paginationGetPageSize();

      // Update pagination without triggering view changes
      onPageChange?.(newPage);
      onPageSizeChange?.(newPageSize);
    },
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
      datetimeEditor: DateTimeEditor,  // Add the datetime editor component
      referenceEditor: ReferenceCellEditor,
      multiReferenceEditor: MultiReferenceCellEditor,
      enumFilter: EnumFilterComponent,
      referenceFilter: ReferenceFilterComponent
    },
    onGridReady,
    datasource: dataSource,
    // Add these properties to ensure proper data loading
    suppressRowClickSelection: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    // Add these to improve performance
    suppressColumnVirtualisation: false,
    suppressRowVirtualisation: false,
    // Add these to ensure proper infinite scrolling
    blockLoadDebounceMillis: 100
  };

  // Add debug logging for data source changes
  useEffect(() => {
    console.log('Data source dependencies changed:', {
      entityDefName,
      pageSize,
      viewQueryParams: view?.queryParams
    });
  }, [entityDefName, pageSize, view?.queryParams]);

  // Add debug logging for grid ready
  useEffect(() => {
    if (gridApi && 'setDatasource' in gridApi) {
      console.log('Grid API is ready, forcing data load');
      (gridApi as any).setDatasource(dataSource);
    }
  }, [gridApi, dataSource]);

  return (
    <div className="flex flex-col h-full w-full">
      {entityDef && view && (
        <DataTableToolbar
          view={view || defaultGridViewState}
          onViewChange={handleViewChange}
          onColumnVisibilityChange={handleColumnVisibilityChanged}
          onColumnOrderChange={handleColumnOrderChanged}
          entityDef={entityDef}
          onStateLoad={handleStateLoad}
          currentPageData={rowData || []}
          totalCount={totalCount || 0}
        />
      )}
      <div
        className={`ag-theme-${resolvedTheme === 'dark' ? 'alpine-dark' : 'alpine'} flex-grow w-full overflow-auto`}
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <AgGridReact
          {...gridOptions}
          columnDefs={columnDefs}
          className="h-full w-full"
        />
      </div>
    </div>
  );
} 