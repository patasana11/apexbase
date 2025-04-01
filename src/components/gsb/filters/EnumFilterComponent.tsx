import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EnumFilterProps extends IFilterParams {
  values: string[];
  labels: string[];
  isBitwise: boolean;
}

export const EnumFilterComponent = forwardRef((props: EnumFilterProps, ref) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (props.filterModel?.values) {
      setSelectedValues(props.filterModel.values);
    }
  }, [props.filterModel]);

  const handleValueChange = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    setSelectedValues(newValues);
    
    // Create filter model
    const filterModel = {
      type: 'enum',
      values: newValues,
      operator: 'OR'
    };

    // Call the filter changed callback if it exists
    if (props.filterChangedCallback) {
      props.filterChangedCallback();
    }

    // Update the filter model in AG Grid
    if (props.api && props.colDef.field) {
      props.api.setColumnFilterModel(props.colDef.field, filterModel);
    }
  };

  // Implement AG Grid's filter interface
  useImperativeHandle(ref, () => ({
    doesFilterPass(params: IDoesFilterPassParams) {
      if (!selectedValues.length) return true;
      
      const value = params.data[props.colDef.field!];
      if (props.isBitwise) {
        // For bitwise enums, check if any selected value is set
        return selectedValues.some(selected => (value & Number(selected)) === Number(selected));
      } else {
        // For regular enums, check if value is in selected values
        return selectedValues.includes(value);
      }
    },

    isFilterActive() {
      return selectedValues.length > 0;
    },

    getModel() {
      if (!selectedValues.length) return null;
      return {
        type: 'enum',
        values: selectedValues,
        operator: 'OR'
      };
    },

    setModel(model: any) {
      if (model?.values) {
        setSelectedValues(model.values);
      } else {
        setSelectedValues([]);
      }
    }
  }));

  const filteredValues = props.values.filter((value, index) => {
    const label = props.labels[index];
    return label.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Filter by {props.isBitwise ? 'Flags' : 'Values'}</Label>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        <div className="space-y-2">
          {filteredValues.map((value, index) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`value-${value}`}
                checked={selectedValues.includes(value)}
                onCheckedChange={() => handleValueChange(value)}
              />
              <Label htmlFor={`value-${value}`} className="text-sm">
                {props.labels[index]}
              </Label>
            </div>
          ))}
          {filteredValues.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              No values found
            </div>
          )}
        </div>
      </ScrollArea>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map(value => {
            const index = props.values.indexOf(value);
            return (
              <div
                key={value}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
              >
                {props.labels[index]}
                <button
                  onClick={() => handleValueChange(value)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}); 