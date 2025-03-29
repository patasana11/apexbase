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
  ClientSideRowModelModule
} from 'ag-grid-community';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEnum } from '@/lib/gsb/models/gsb-enum.model';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule
]);

interface GsbDataTableProps {
  entityDefId: string;
  data: any[];
  onDataChange?: (newData: any[]) => void;
}

export function GsbDataTable({ entityDefId, data, onDataChange }: GsbDataTableProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columns, setColumns] = useState<Column[] | null>(null);
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [propertyDefs, setPropertyDefs] = useState<GsbProperty[]>([]);
  const [enumCache, setEnumCache] = useState<Map<string, GsbEnum>>(new Map());
  const [rowData, setRowData] = useState<any[]>([]);

  // Get specific column configuration based on property type
  const getColumnTypeConfig = (prop: GsbProperty): Partial<ColDef> => {
    if (prop.enum_id) {
      const enumDef = enumCache.get(prop.enum_id);
      return {
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: enumDef?.values?.map(v => v.value) || []
        }
      };
    }

    // Determine column configuration based on property characteristics
    if (prop.refType) {
      return {
        filter: 'agTextColumnFilter',
        cellEditor: 'agSelectCellEditor'
      };
    }

    // Infer numeric type from scale property
    if (typeof prop.scale === 'number') {
      return {
        type: 'numericColumn',
        filter: 'agNumberColumnFilter'
      };
    }

    // Infer date type from property characteristics
    if (prop.name.toLowerCase().includes('date')) {
      return {
        type: 'dateColumn',
        filter: 'agDateColumnFilter',
        cellEditor: 'agDateCellEditor'
      };
    }

    // Default to text column
    return {
      filter: 'agTextColumnFilter'
    };
  };

  // Configure column definitions
  const columnDefs = useMemo(() => {
    if (!propertyDefs.length) return [];

    return propertyDefs.map(prop => ({
      field: prop.name,
      headerName: prop.title,
      editable: true,
      sortable: prop.isSearchable,
      filter: prop.isSearchable,
      resizable: true,
      // Handle enum values
      valueFormatter: (params: ValueFormatterParams) => {
        const value = params.value;
        if (!value) return '';

        if (prop.enum_id) {
          const enumDef = enumCache.get(prop.enum_id);
          if (enumDef?.values) {
            const enumValue = enumDef.values.find(v => v.value === value);
            return enumValue?.title || value;
          }
        }

        if (prop.refType) {
          if (Array.isArray(value)) {
            return value.map((ref: any) => ref.title).join(', ');
          }
          return value.title || value;
        }

        return value;
      },
      // Additional column configuration based on property type
      ...getColumnTypeConfig(prop)
    }));
  }, [propertyDefs, enumCache]);

  // Load entity definition and properties
  useEffect(() => {
    const loadEntityDef = async () => {
      try {
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
  }, [entityDefId]);

  // Update row data when data prop changes
  useEffect(() => {
    setRowData(data);
  }, [data]);

  // Grid options configuration
  const gridOptions: GridOptions = {
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true
    },
    rowSelection: 'multiple',
    animateRows: true,
    // Styling
    rowHeight: 28,
    headerHeight: 32,
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
      />
    </div>
  );
} 