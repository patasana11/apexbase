import { ColDef } from 'ag-grid-community';
import { GsbProperty, GsbPropertyDef, DataType, RefType } from '../models/gsb-entity-def.model';
import { GsbEnum } from '../models/gsb-enum.model';

export interface GridColumnConfig extends ColDef {
  propertyName: string;
  dataType: DataType;
  isSystemColumn: boolean;
  isReference: boolean;
  isEnum: boolean;
  isRequired: boolean;
  orderNumber?: number;
}

export class GsbGridUtils {
  private static readonly SYSTEM_COLUMNS = [
    'createDate',
    'lastUpdateDate',
    'lastUpdatedBy',
    'createdBy',
  ];

  public static isSystemColumn(prop: GsbProperty): boolean {
    return prop.isSystem || this.SYSTEM_COLUMNS.includes(prop.name);
  }



  public static createColumnDef(
    prop: GsbProperty,
    enumCache: Map<string, GsbEnum>
  ): GridColumnConfig {
    // Use the definition if available
    const propDef = prop.definition;
    if (!propDef) {
      throw new Error(`Property definition not found for property ${prop.name}`);
    }

    const baseConfig: GridColumnConfig = {
      field: prop.name,
      headerName: prop.title,
      propertyName: prop.name,
      dataType: propDef.dataType,
      isSystemColumn: this.isSystemColumn(prop),
      isReference: propDef.dataType === DataType.Reference,
      isEnum: propDef.dataType === DataType.Enum,
      isRequired: prop.isRequired || false,
      editable: !prop.isRequired && !this.isSystemColumn(prop),
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      minWidth: 100,
      maxWidth: 300,
      orderNumber: prop.orderNumber,
      // Add validation for required fields
      ...(prop.isRequired && {
        cellClass: 'required-field',
        cellStyle: { backgroundColor: '#fff3f3' }
      })
    };

    // Handle enum fields
    if (propDef.dataType === DataType.Enum && prop.enum_id) {
      const enumDef = enumCache.get(prop.enum_id);
      if (!enumDef?.values?.length) return baseConfig;

      const enumValues = enumDef.values;
      const isBitwiseEnum = prop.isMultiple;

      // Create value-label mapping for dropdowns
      const valueLabelMap = new Map(
        enumValues.map(v => [v.value, v.title || v.value])
      );

      // Common formatter for both types
      const valueFormatter = (params: any) => {
        if (params.value === undefined || params.value === null) return '';
        
        if (isBitwiseEnum) {
          const selectedValues = enumValues
            .filter(v => (params.value & (v.value || 0)) === (v.value || 0))
            .map(v => v.title)
            .join(', ');
          return selectedValues || params.value;
        } else {
          return valueLabelMap.get(params.value) || params.value;
        }
      };

      if (isBitwiseEnum) {
        // Bitwise enum configuration using custom editor component
        return {
          ...baseConfig,
          // In AG Grid, when you pass a component directly like this, 
          // it doesn't need to be registered via components property
          cellEditor: 'BitwiseEnumEditor',  
          cellEditorParams: {
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value)
          },
          valueFormatter: (params: any) => {
            if (params.value === undefined || params.value === null) return '';
            
            // Show comma-separated list of selected values
            const selectedValues = enumValues
              .filter(v => (params.value & (v.value || 0)) === (v.value || 0))
              .map(v => v.title)
              .join(', ');
            return selectedValues || params.value;
          },
          filter: 'agTextColumnFilter'
        };
      } else {
        // Single value enum configuration using community edition components
        return {
          ...baseConfig,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value)
          },
          valueFormatter,
          cellRenderer: valueFormatter,
          filter: 'agTextColumnFilter'
        };
      }
    }

    // Handle reference fields
    if (propDef.dataType === DataType.Reference) {
      return {
        ...baseConfig,
        filter: 'agTextColumnFilter',
        cellEditor: 'agSelectCellEditor',
        cellRenderer: (params: any) => {
          if (!params.value) return '';
          if (Array.isArray(params.value)) {
            return params.value.map((ref: any) => ref.title).join(', ');
          }
          return params.value.title || params.value;
        }
      };
    }

    // Handle numeric fields
    if (propDef.dataType === DataType.Decimal || propDef.dataType === DataType.Int || propDef.dataType === DataType.Long) {
      return {
        ...baseConfig,
        filter: 'agNumberColumnFilter',
        minWidth: 120,
        maxWidth: 150,
        valueFormatter: (params: any) => {
          if (params.value) {
            return Number(params.value).toLocaleString(undefined, {
              minimumFractionDigits: propDef.scale || 0,
              maximumFractionDigits: propDef.scale || 0
            });
          }
          return '';
        }
      };
    }

    // Handle date fields
    if (propDef.dataType === DataType.DateTime) {
      return {
        ...baseConfig,
        filter: 'agDateFilter',
        cellEditor: 'agDateCellEditor',
        minWidth: 150,
        maxWidth: 180,
        valueFormatter: (params: any) => {
          if (params.value) {
            return new Date(params.value).toLocaleDateString();
          }
          return '';
        }
      };
    }

    // Handle boolean fields
    if (propDef.dataType === DataType.Bool) {
      return {
        ...baseConfig,
        filter: 'agTextColumnFilter',
        cellEditor: 'agCheckboxCellEditor',
        minWidth: 100,
        maxWidth: 100,
        valueFormatter: (params: any) => {
          return params.value ? 'Yes' : 'No';
        }
      };
    }

    // Handle text fields with max length
    if (propDef.dataType === DataType.StringUnicode || propDef.dataType === DataType.StringASCII) {
      return {
        ...baseConfig,
        filter: 'agTextColumnFilter',
        cellEditor: 'agTextCellEditor',
        minWidth: 150,
        maxWidth: 300,
        cellEditorParams: {
          maxLength: propDef.maxLength
        }
      };
    }

    // Default to text column
    return {
      ...baseConfig,
      filter: 'agTextColumnFilter'
    };
  }

  public static filterSystemColumns(columnDefs: GridColumnConfig[]): GridColumnConfig[] {
    return columnDefs.filter(col => !col.isSystemColumn);
  }

  public static sortColumnsByOrder(columnDefs: GridColumnConfig[]): GridColumnConfig[] {
    return [...columnDefs].sort((a, b) => {
      const aOrder = a.orderNumber || 0;
      const bOrder = b.orderNumber || 0;
      return aOrder - bOrder;
    });
  }
} 