import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { IFilterParams, IDoesFilterPassParams, IFloatingFilterComp, IFloatingFilterParams } from 'ag-grid-community';
import { GsbMultiReference } from '../GsbMultiReference';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { Input } from '@/components/ui/input';

interface ReferenceOption {
  id: string;
  title: string;
}

interface ReferenceFilterProps extends IFilterParams {
  property: GsbProperty;
  propertyDef: GsbProperty;
  entityDef: GsbEntityDef;
  isMultiple: boolean;
  filterModel?: {
    refs: ReferenceOption[];
    type: 'contains' | 'in';
  };
}

export class ReferenceFloatingFilterComponent implements IFloatingFilterComp {
  private eGui: HTMLDivElement;
  private currentRefs: ReferenceOption[] = [];
  private params: IFloatingFilterParams;
  private property: GsbProperty | null = null;
  private entityDef: GsbEntityDef | null = null;
  private isMultiple: boolean = false;
  private eFilterInput: HTMLInputElement;

  constructor() {
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-floating-filter-input';
    this.eGui.innerHTML = `
      <input type="text" class="ag-input-field-input" placeholder="Select references..." readonly />
    `;
    this.eFilterInput = this.eGui.querySelector('input')!;
  }

  init(params: IFloatingFilterParams) {
    this.params = params;
    
    // Get property and entityDef from floatingFilterComponentParams
    const componentParams = params.floatingFilterComponentParams as { property: GsbProperty; entityDef: GsbEntityDef; isMultiple: boolean };
    if (componentParams) {
      this.property = componentParams.property;
      this.entityDef = componentParams.entityDef;
      this.isMultiple = componentParams.isMultiple || false;
    }

    this.eFilterInput.addEventListener('click', () => {
      // Show the filter popup
      params.showParentFilter();
    });
  }

  onParentModelChanged(parentModel: any) {
    if (!parentModel) {
      this.currentRefs = [];
      this.eFilterInput.value = '';
    } else {
      this.currentRefs = parentModel.refs || [];
      // Show selected values in the input
      this.eFilterInput.value = this.currentRefs
        .map(ref => ref.title)
        .filter(Boolean)
        .join(', ');
    }
  }

  getGui() {
    return this.eGui;
  }

  destroy() {
    // Cleanup if needed
  }
}

export const ReferenceFilterComponent = React.forwardRef((props: ReferenceFilterProps, ref) => {
  const [selectedRefs, setSelectedRefs] = useState<ReferenceOption[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ReferenceOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const filterRef = useRef<{ doesFilterPass: (params: IDoesFilterPassParams) => boolean }>(null);

  useEffect(() => {
    if (props.filterModel?.refs) {
      setSelectedRefs(props.filterModel.refs);
    }
  }, [props.filterModel]);

  const handleReferenceChange = (newRefIds: string[]) => {
    if (!props.property.name) return;

    const newRefs = newRefIds.map(id => ({
      id,
      title: searchResults.find(r => r.id === id)?.title || id
    }));

    setSelectedRefs(newRefs);
    
    // Create filter model
    const filterModel = {
      filter: newRefs,
      colDef : props.colDef
    };

    // Call the filter changed callback if it exists
    if (props.filterChangedCallback) {
      props.filterChangedCallback();
    }

    // Update the filter model in AG Grid
    if (props.api && props.colDef.field) {
      props.api.setColumnFilterModel(props.colDef.field, filterModel);
      // Force grid to refresh
      props.api.onFilterChanged();
    }

  };

  useImperativeHandle(ref, () => ({
    doesFilterPass: (params: IDoesFilterPassParams) => {
      if (!props.property.name) return false;
      if (selectedRefs.length === 0) return true;

      const value = params.data[props.property.name];
      if (!value) return false;

      if (props.isMultiple) {
        // For multiple references, check if any of the selected refs are in the value array
        return selectedRefs.some(ref => value.some((v: any) => v.id === ref.id));
      } else {
        // For single reference, check if the value matches any of the selected refs
        return selectedRefs.some(ref => value.id === ref.id);
      }
    },
    isFilterActive: () => selectedRefs.length > 0,
    getModel: () => {
      if (selectedRefs.length === 0) return null;
      return {
        refs: selectedRefs,
        type: props.isMultiple ? 'contains' : 'in' as const
      };
    },
    setModel: (model: any) => {
      if (model?.refs) {
        setSelectedRefs(model.refs);
      } else {
        setSelectedRefs([]);
      }
    }
  }));

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Search references..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
        />
      </div>

      <GsbMultiReference
        entity={null}
        onChange={handleReferenceChange}
        parentEntityDef={props.entityDef}
        propName={props.property.name || ''}
        property={props.property}
        useOfflineValues={true}
        tableOptions={{ pageSize: 10 }}
      />

      {selectedRefs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRefs.map(ref => (
            <div
              key={ref.id}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
            >
              {ref.title}
              <button
                onClick={() => handleReferenceChange(selectedRefs.filter(r => r.id !== ref.id).map(r => r.id))}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}); 