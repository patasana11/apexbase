import { ColDef } from 'ag-grid-community';
import { GsbProperty, GsbPropertyDef, DataType, RefType, GsbEntityDef } from '../models/gsb-entity-def.model';
import { GsbEnum } from '../models/gsb-enum.model';

export interface GridColumnConfig extends ColDef {
  context: {
    property?: GsbProperty;
    propertyDef?: GsbPropertyDef;
    entityDef?: GsbEntityDef;

    propertyName?: string;
    dataType?: DataType;
    isSystemColumn?: boolean;
    isReference?: boolean;
    isEnum?: boolean;
    isRequired?: boolean;
    orderNumber?: number;
    isMultiple?: boolean;
    isSystem?: boolean;
  };
}

export class GsbGridUtils {
  private static readonly SYSTEM_COLUMNS = [
    'createDate',
    'lastUpdateDate',
    'lastUpdatedBy',
    'createdBy',
  ];

  public static isSystemColumn(prop: GsbProperty): boolean {
    return prop.isSystem || this.SYSTEM_COLUMNS.includes(prop.name || '');
  }

  public static createColumnDef(
    prop: GsbProperty,
    entityDef: GsbEntityDef,
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
      context: {
        property: prop,
        entityDef: entityDef,
        propertyName: prop.name,
        dataType: propDef.dataType,
        isSystemColumn: this.isSystemColumn(prop),
        isReference: propDef.dataType === DataType.Reference,
        isEnum: propDef.dataType === DataType.Enum,
        isRequired: prop.isRequired || false,
        orderNumber: prop.orderNumber,
        propertyDef: propDef,
        isMultiple: prop.isMultiple,
        isSystem: prop.isSystem
      },
      editable: !prop.isRequired && !this.isSystemColumn(prop),
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      minWidth: 100,
      maxWidth: 300,
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
          cellEditor: 'BitwiseEnumEditor',
          cellEditorParams: {
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value)
          },
          valueFormatter
        };
      } else {
        // Regular enum configuration
        return {
          ...baseConfig,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: enumValues.map(v => v.value),
            cellRenderer: (params: any) => {
              const value = params.value;
              const label = valueLabelMap.get(value) || value;
              return `<span>${label}</span>`;
            }
          },
          valueFormatter
        };
      }
    }

    // Handle reference fields
    if (propDef.dataType === DataType.Reference  && !prop.isMultiple) {
      return {
        ...baseConfig,
        cellEditor: 'ReferenceCellEditor',
        context: {
          ...baseConfig.context,
          isReference: true,
          isMultiple: false,
          property: propDef,
          entityDef: entityDef
        },
        valueFormatter: (params: any) => {
          return params.value ? params.value.title : '';
        }
      };
    }

    // Handle multi-reference fields
    if (propDef.dataType === DataType.Reference && prop.isMultiple) {
      return {
        ...baseConfig,
        cellRenderer: 'MultiReferenceCellRenderer',
        cellEditor: 'MultiReferenceCellEditor',
        context: {
          ...baseConfig.context,
          isReference: true,
          isMultiple: true,
          property: propDef
        },
        valueFormatter: (params: any) => {
          return params.value ? params.value.map((v: any) => v.title).join(', ') : '';
        }
      };
    }

    return baseConfig;
  }

  public static filterSystemColumns(columnDefs: GridColumnConfig[]): GridColumnConfig[] {
    return columnDefs.filter(col => !col.context.isSystemColumn);
  }

  public static sortColumnsByOrder(columnDefs: GridColumnConfig[]): GridColumnConfig[] {
    return [...columnDefs].sort((a, b) => (a.context.orderNumber || 0) - (b.context.orderNumber || 0));
  }
} 