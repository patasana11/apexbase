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
  Theme,
  TooltipModule
} from 'ag-grid-community';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';

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
  TooltipModule
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
}

export function GsbDataTable({ 
  entityDefName, 
  data, 
  onDataChange,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange
}: GsbDataTableProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columns, setColumns] = useState<Column[] | null>(null);
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [propertyDefs, setPropertyDefs] = useState<GsbProperty[]>([]);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [rowData, setRowData] = useState<any[]>([]);

  // Get specific column configuration based on property type
  const getColumnTypeConfig = (prop: GsbProperty): Partial<ColDef> => {
    // Handle required fields
    const baseConfig: Partial<ColDef> = {
      editable: !prop.isRequired,
      sortable: prop.isSearchable,
      filter: prop.isSearchable,
      resizable: true,
      floatingFilter: true,
      // Add validation for required fields
      ...(prop.isRequired && {
        cellClass: 'required-field',
        cellStyle: { 'background-color': '#fff3f3' }
      })
    };

    // Handle enum fields
    if (prop.enum_id) {
      const enumDef = enumCache.get(prop.enum_id);
      return {
        ...baseConfig,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: enumDef?.values?.map(v => v.value) || [],
          cellRenderer: (params: ICellRendererParams) => {
            const enumValue = enumDef?.values?.find(v => v.value === params.value);
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
    if (typeof prop.scale === 'number') {
      return {
        ...baseConfig,
        filter: 'agNumberColumnFilter',
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
    if (prop.name.toLowerCase().includes('date')) {
      return {
        ...baseConfig,
        filter: 'agDateColumnFilter',
        cellEditor: 'agDateCellEditor',
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return new Date(params.value).toLocaleDateString();
          }
          return '';
        }
      };
    }

    // Handle text fields with max length
    if (prop.maxLength) {
      return {
        ...baseConfig,
        filter: 'agTextColumnFilter',
        cellEditor: 'agTextCellEditor',
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
        headerTooltip: prop.isRequired ? `${prop.title} (Required)` : prop.title,
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
            .map(prop => prop.enum_id!)
            .filter(Boolean); // Filter out any undefined or null values

          if (enumIds.length > 0) {
            // Fetch all enums at once
            const enums = await cacheService.getEnums(enumIds);
            setEnumCache(enums);
          }
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

  // Grid options configuration
  const gridOptions: GridOptions = {
    theme: 'legacy', // Use legacy theme to avoid conflicts with CSS
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      // Add tooltip for all cells
      tooltipField: 'field'
    },
    rowSelection: 'multiple',
    animateRows: true,
    // Styling
    rowHeight: 28,
    headerHeight: 32,
    // Enable tooltips
    enableCellTextSelection: true,
    // Pagination
    pagination: true,
    paginationPageSize: pageSize,
    rowModelType: 'clientSide',
    // Events
    onCellValueChanged: (event) => {
      if (onDataChange) {
        const newData = [...rowData];
        const rowIndex = event.rowIndex!;
        newData[rowIndex] = event.data;
        onDataChange(newData);
      }
    },
    onGridReady: (params: GridReadyEvent) => {
      setGridApi(params.api);
      setColumns(params.api.getColumns());
      params.api.sizeColumnsToFit();
    },
    onPaginationChanged: (event) => {
      const newPage = event.api.paginationGetCurrentPage() + 1;
      const newPageSize = event.api.paginationGetPageSize();
      onPageChange(newPage);
      onPageSizeChange(newPageSize);
    }
  };

  return (
    <div className="w-full h-full ag-theme-alpine">
      <AgGridReact
        gridOptions={gridOptions}
        columnDefs={columnDefs}
        rowData={rowData}
        animateRows={true}
        rowSelection="multiple"
        suppressRowClickSelection={true}
        pagination={true}
        paginationPageSize={pageSize}
        rowModelType="clientSide"
      />
    </div>
  );
} 