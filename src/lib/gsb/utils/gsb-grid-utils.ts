import { ColDef } from 'ag-grid-community';
import { GsbProperty, GsbPropertyDef, DataType, RefType, GsbEntityDef } from '../models/gsb-entity-def.model';
import { GsbEnum } from '../models/gsb-enum.model';
import { QueryParams } from '../types/query-params';
import { GsbCacheService } from '../services/cache/gsb-cache.service';

export interface GridColumnConfigContext {
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
}

export interface GridColumnConfig extends ColDef {
    context: GridColumnConfigContext;
}

export interface GridViewState {
  queryParams: QueryParams<any>;
  columnDefs: GridColumnConfig[];
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

  public static async createDefaultView(
    entityDef: GsbEntityDef
  ): Promise<GridViewState> {
    const queryParams = new QueryParams(entityDef.name || '');
    if(!entityDef.properties) return { queryParams, columnDefs: [] };
    // Create column definitions for all non-system, non-reference properties
    const columnDefs = await Promise.all(entityDef.properties
      .filter(prop => !this.isSystemColumn(prop) && prop.definition?.dataType !== DataType.Reference)
      .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''))
      .map(async prop => await this.createColumnDef(prop, entityDef)) || []);

    // Set initial selectCols
    queryParams.selectCols = columnDefs.map(col => ({
      name: col.field || ''
    }));

    return { queryParams, columnDefs };
  }

  public static async createColumnDefsFromEntityDef(
    entityDef: GsbEntityDef
  ): Promise<GridColumnConfig[]> {
    return await Promise.all(entityDef?.properties?.map(async prop => await this.createColumnDef(prop, entityDef)) || []);
  } 

  public static async createColumnDefsFromView(
    view: QueryParams<any>,
    entityDef: GsbEntityDef
  ): Promise<GridColumnConfig[]> {
    if (!view.selectCols || !entityDef?.properties?.length) return [];

    // Get all properties that match the selectCols
    const selectedProperties = view.selectCols
      .map(selectCol => entityDef.properties?.find(p => p.name === selectCol.name))
      .filter((p): p is GsbProperty => p !== undefined);

    // Create column definitions maintaining order from selectCols
    return await Promise.all(selectedProperties.map(async prop => 
      await this.createColumnDef(prop, entityDef)
    ));
  }

  public static updateViewFromColumnChanges(
    view: QueryParams<any>,
    changes: {
      visible?: boolean;
      propertyName: string;
    }[]
  ): QueryParams<any> {
    const newView = new QueryParams(view.entDefName || '');
    const selectCols = view.selectCols || [];

    changes.forEach(change => {
      if (change.visible) {
        // Add column if not present
        if (!selectCols.some(col => col.name === change.propertyName)) {
          selectCols.push({ name: change.propertyName });
        }
      } else {
        // Remove column if present
        const index = selectCols.findIndex(col => col.name === change.propertyName);
        if (index !== -1) {
          selectCols.splice(index, 1);
        }
      }
    });

    newView.selectCols = selectCols;
    return newView;
  }

  public static async createColumnDef(
    prop: GsbProperty,
    entityDef: GsbEntityDef
  ): Promise<GridColumnConfig> {
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
      const enumDef = await GsbCacheService.getInstance().getEnum( prop.enum_id);
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
          cellEditor: 'bitwiseEnumEditor',
          cellEditorPopup: true,
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
    if (propDef.dataType === DataType.Reference) {
      if (prop.isMultiple) {
        return {
          ...baseConfig,
          cellEditor: 'multiReferenceEditor',
          cellEditorPopup: true,
          context: {
            ...baseConfig.context,
            isReference: true,
            isMultiple: true,
            property: prop,
            propertyDef: propDef,
            entityDef: entityDef
          },
          valueFormatter: (params: any) => {
            return params.value ? params.value.map((v: any) => v.title).join(', ') : '';
          }
        };
      } else {
        return {
          ...baseConfig,
          cellEditor: 'referenceEditor',
          cellEditorPopup: true,
          context: {
            ...baseConfig.context,
            isReference: true,
            isMultiple: false,
            property: prop,
            propertyDef: propDef,
            entityDef: entityDef
          },
          valueFormatter: (params: any) => {
            return params.value ? params.value.title : '';
          }
        };
      }
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