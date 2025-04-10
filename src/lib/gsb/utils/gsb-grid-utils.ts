import { ColDef } from 'ag-grid-community';
import { GsbProperty, GsbPropertyDef, DataType, RefType, GsbEntityDef, ScreenType } from '../models/gsb-entity-def.model';
import { GsbEnum } from '../models/gsb-enum.model';
import { QueryParams } from '../types/query-params';
import { GsbCacheService } from '../services/cache/gsb-cache.service';
import { BASE_PROPERTY_DEFINITIONS } from '../models/gsb-base-definitions';
import { EnumFloatingFilterComponent } from '@/components/gsb/filters/EnumFilterComponent';
import { EnumFilterComponent } from '@/components/gsb/filters/EnumFilterComponent';
import { ReferenceFloatingFilterComponent } from '@/components/gsb/filters/ReferenceFilterComponent';
import { ReferenceFilterComponent } from '@/components/gsb/filters/ReferenceFilterComponent';

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
  userQuery?: {
    id: string;
    title: string;
    query: string;
  };
  columnDefs: GridColumnConfig[];
}

export class GsbGridUtils {

  public static isSystemColumn(prop: GsbProperty): boolean {
    return prop.isSystemOnly;
  }

  public static async createDefaultView(
    entityDef: GsbEntityDef
  ): Promise<GridViewState> {
    const queryParams = new QueryParams(entityDef.name || '');
    if (!entityDef.properties) return { queryParams, columnDefs: [] };

    // Get the current screen type (default to PC)
    const screenType = ScreenType.PC;

    // Filter properties based on screen type and listing status
    const filteredProperties = entityDef.properties.filter(prop => {
      // Include system columns
      
      // Check if property is listed for the current screen type
      const isListedForScreen = (prop.listScreens & screenType) === screenType;
      

      // For reference properties, only include if they are listed and not system columns
      return isListedForScreen;
    });

    // Create column definitions for filtered properties
    const columnDefs = await Promise.all(
      filteredProperties
        .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0))
        .map(async prop => await this.createColumnDef(prop, entityDef))
    );

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
        isSystem: prop.isSystemOnly
      },
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      minWidth: 100,
      maxWidth: 300,

      // Add validation for required fields
      ...(prop.isRequired && {
      })
    };

    // Handle enum fields
    if (propDef.dataType === DataType.Enum && prop.enum_id) {
      const enumDef = await GsbCacheService.getInstance().getEnum(prop.enum_id);
      if (!enumDef?.values?.length) return baseConfig;

      const enumValues = enumDef.values;
      const isBitwiseEnum = prop.isMultiple;

      // Create value-label mapping for dropdowns
      const valueLabelMap = new Map(
        enumValues.map(v => [v.value, v.title || v.value])
      );

      if (isBitwiseEnum) {
        return {
          ...baseConfig,
          cellEditor: 'bitwiseEnumEditor',
          cellEditorPopup: true,
          filter: EnumFilterComponent,
          filterParams: {
            enumDef: enumDef,
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value),
            isBitwise: true
          },
          cellEditorParams: {
            enumDef: enumDef,
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value)
          },
          valueFormatter: (params: any) => {
            const selectedValues = enumValues
              .filter(v => (params.value & (v.value || 0)) === (v.value || 0))
              .map(v => v.title)
              .join(', ');
            return selectedValues || params.value;
          },
          floatingFilterComponent: EnumFloatingFilterComponent,
          floatingFilterComponentParams: {
            enumDef: enumDef,
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value),
            isBitwise: true
          }
        };
      } else {
        return {
          ...baseConfig,
          cellEditor: 'agSelectCellEditor',
          filter: EnumFilterComponent,
          filterParams: {
            enumDef: enumDef,
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value),
            isBitwise: false
          },
          cellEditorParams: { 
            enumDef: enumDef,
            values: enumValues.map(v => v.value),
            cellRenderer: (params: any) => {
              const value = params.value;
              const label = valueLabelMap.get(value) || value;
              return `<span>${label}</span>`;
            }
          },
          valueFormatter: (params: any) => {
            return valueLabelMap.get(params.value) || params.value;
          },
          floatingFilterComponent: EnumFloatingFilterComponent,
          floatingFilterComponentParams: {
            enumDef: enumDef,
            values: enumValues.map(v => v.value),
            labels: enumValues.map(v => v.title || v.value),
            isBitwise: false
          }
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
          filter: ReferenceFilterComponent,
          filterParams: {
            property: prop,
            propertyDef: propDef,
            entityDef: entityDef,
            isMultiple: true
          },
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
          },
          floatingFilterComponent: ReferenceFloatingFilterComponent,
          floatingFilterComponentParams: {
            property: prop,
            entityDef: entityDef,
            isMultiple: true
          }
        };
      } else {
        return {
          ...baseConfig,
          cellEditor: 'referenceEditor',
          cellEditorPopup: true,
          filter: ReferenceFilterComponent,
          filterParams: {
            property: prop,
            propertyDef: propDef,
            entityDef: entityDef,
            isMultiple: false
          },
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
          },
          floatingFilterComponent: ReferenceFloatingFilterComponent,
          floatingFilterComponentParams: {
            property: prop,
            entityDef: entityDef,
            isMultiple: false
          }
        };
      }
    }

    // Check property name for high-level types
    const propDefName = propDef.name.toLowerCase();

    // Handle different data types with appropriate formatting and editors
    switch (propDef.dataType) {
      case DataType.DateTime:
        return {
          ...baseConfig,
          cellEditor: 'datetimeEditor',
          cellEditorPopup: true,
          filter: 'agDateColumnFilter',
          filterParams: {
            filterOptions: [
              'equals',
              'notEqual',
              'greaterThan',
              'lessThan',
              'greaterThanOrEqual',
              'lessThanOrEqual',
              'inRange'
            ],
            defaultOption: 'equals'
          },
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            const date = new Date(params.value);
            return date.toLocaleString(undefined, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
        };

      case DataType.Bool:
        return {
          ...baseConfig,
          cellEditor: 'agCheckboxCellEditor',
          cellRenderer: 'agCheckboxCellRenderer',
          filter: 'agSetColumnFilter',
          filterParams: {
            values: [true, false],
            buttons: ['reset', 'apply'],
            closeOnApply: true
          },
          valueFormatter: (params: any) => {
            return params.value ? 'Yes' : 'No';
          }
        };

      case DataType.Int:
      case DataType.Long:
        // Check if this is an ID field
        if (propDefName.endsWith('id')) {
          return {
            ...baseConfig,
            cellEditor: 'numberEditor',
            filter: 'agNumberColumnFilter',
            filterParams: {
              filterOptions: ['equals', 'notEqual'],
              defaultOption: 'equals'
            },
            valueFormatter: (params: any) => {
              if (params.value === null || params.value === undefined) return '';
              return new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(params.value);
            }
          };
        }
        return {
          ...baseConfig,
          cellEditor: 'numberEditor',
          filter: 'agNumberColumnFilter',
          filterParams: {
            filterOptions: [
              'equals',
              'notEqual',
              'greaterThan',
              'lessThan',
              'greaterThanOrEqual',
              'lessThanOrEqual',
              'inRange'
            ],
            defaultOption: 'equals'
          },
          valueFormatter: (params: any) => {
            if (params.value === null || params.value === undefined) return '';
            return new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(params.value);
          }
        };

      case DataType.Decimal:
        return {
          ...baseConfig,
          cellEditor: 'numberEditor',
          filter: 'agNumberColumnFilter',
          filterParams: {
            filterOptions: [
              'equals',
              'notEqual',
              'greaterThan',
              'lessThan',
              'greaterThanOrEqual',
              'lessThanOrEqual',
              'inRange'
            ],
            defaultOption: 'equals'
          },
          valueFormatter: (params: any) => {
            if (params.value === null || params.value === undefined) return '';
            return new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4
            }).format(params.value);
          }
        };

      case DataType.StringUnicode:
      case DataType.StringASCII:
        // Check property name for specific text types
        if (propDefName.includes('email')) {
          return {
            ...baseConfig,
            cellEditor: 'emailEditor',
            filter: 'agTextColumnFilter',
            filterParams: {
              filterOptions: [
                'contains',
                'notContains',
                'equals',
                'notEqual',
                'startsWith',
                'endsWith'
              ],
              defaultOption: 'contains'
            },
            valueFormatter: (params: any) => {
              return params.value || '';
            },
            cellRenderer: (params: any) => {
              if (!params.value) return '';
              return `<a href="mailto:${params.value}" class="text-blue-500 hover:underline">${params.value}</a>`;
            }
          };
        }

        if (propDefName.includes('phone') || propDefName.includes('mobile')) {
          return {
            ...baseConfig,
            cellEditor: 'phoneEditor',
            filter: 'agTextColumnFilter',
            filterParams: {
              filterOptions: [
                'contains',
                'notContains',
                'equals',
                'notEqual',
                'startsWith',
                'endsWith'
              ],
              defaultOption: 'contains'
            },
            valueFormatter: (params: any) => {
              if (!params.value) return '';
              // Format phone number as (XXX) XXX-XXXX
              const cleaned = params.value.replace(/\D/g, '');
              const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
              if (match) {
                return '(' + match[1] + ') ' + match[2] + '-' + match[3];
              }
              return params.value;
            }
          };
        }

        if (propDefName.includes('url') || propDefName.includes('link')) {
          return {
            ...baseConfig,
            cellEditor: 'urlEditor',
            filter: 'agTextColumnFilter',
            filterParams: {
              filterOptions: [
                'contains',
                'notContains',
                'equals',
                'notEqual',
                'startsWith',
                'endsWith'
              ],
              defaultOption: 'contains'
            },
            valueFormatter: (params: any) => {
              return params.value || '';
            },
            cellRenderer: (params: any) => {
              if (!params.value) return '';
              return `<a href="${params.value}" target="_blank" class="text-blue-500 hover:underline">${params.value}</a>`;
            }
          };
        }

        if (propDefName.includes('password')) {
          return {
            ...baseConfig,
            cellEditor: 'passwordEditor',
            filter: 'agTextColumnFilter',
            filterParams: {
              filterOptions: [
                'contains',
                'notContains',
                'equals',
                'notEqual'
              ],
              defaultOption: 'equals'
            },
            valueFormatter: (params: any) => {
              return params.value ? '••••••••' : '';
            }
          };
        }

        if (propDefName.includes('image') || propDefName.includes('photo')) {
          return {
            ...baseConfig,
            cellEditor: 'imageEditor',
            cellEditorPopup: true,
            filter: 'agTextColumnFilter',
            filterParams: {
              filterOptions: [
                'contains',
                'notContains',
                'equals',
                'notEqual'
              ],
              defaultOption: 'contains'
            },
            valueFormatter: (params: any) => {
              return params.value || '';
            },
            cellRenderer: (params: any) => {
              if (!params.value?.publicUrl) return '';
              return `<img src="${params.value?.publicUrl}" alt="Image" class="max-w-[100px] max-h-[100px] object-contain" />`;
            }
          };
        }

        if (propDefName.includes('file')) {
          return {
            ...baseConfig,
            cellEditor: 'fileEditor',
            cellEditorPopup: true,
            filter: 'agTextColumnFilter',
            filterParams: {
              filterOptions: [
                'contains',
                'notContains',
                'equals',
                'notEqual'
              ],
              defaultOption: 'contains'
            },
            valueFormatter: (params: any) => {
              return params.value || '';
            },
            cellRenderer: (params: any) => {
              if (!params.value?.publicUrl) return '';
              return `<a href="${params.value?.publicUrl}" target="_blank" class="text-blue-500 hover:underline">Download File</a>`;
            }
          };
        }

        // Default text editor
        return {
          ...baseConfig,
          cellEditor: 'textEditor',
          filter: 'agTextColumnFilter',
          filterParams: {
            filterOptions: [
              'contains',
              'notContains',
              'equals',
              'notEqual',
              'startsWith',
              'endsWith'
            ],
            defaultOption: 'contains'
          },
          valueFormatter: (params: any) => {
            return params.value || '';
          }
        };

      case DataType.Binary:
        return {
          ...baseConfig,
          cellEditor: 'binaryEditor',
          cellEditorPopup: true,
          filter: 'agTextColumnFilter',
          filterParams: {
            filterOptions: [
              'contains',
              'notContains',
              'equals',
              'notEqual'
            ],
            defaultOption: 'equals'
          },
          valueFormatter: (params: any) => {
            return params.value ? 'Binary Data' : '';
          }
        };

      case DataType.JSON:
        return {
          ...baseConfig,
          cellEditor: 'jsonEditor',
          cellEditorPopup: true,
          filter: 'agTextColumnFilter',
          filterParams: {
            filterOptions: [
              'contains',
              'notContains',
              'equals',
              'notEqual'
            ],
            defaultOption: 'contains'
          },
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            try {
              return JSON.stringify(params.value, null, 2);
            } catch {
              return params.value;
            }
          }
        };

      default:
        return baseConfig;
    }
  }

  public static filterSystemColumns(columnDefs: GridColumnConfig[]): GridColumnConfig[] {
    return columnDefs.filter(col => !col.context.isSystemColumn);
  }

  public static sortColumnsByOrder(columnDefs: GridColumnConfig[]): GridColumnConfig[] {
    return [...columnDefs].sort((a, b) => (a.context.orderNumber || 0) - (b.context.orderNumber || 0));
  }

} 