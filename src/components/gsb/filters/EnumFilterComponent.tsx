import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnumFilterProps extends IFilterParams {
  values: number[];
  labels: string[];
  isBitwise?: boolean;
}

export const EnumFilterComponent = forwardRef((props: EnumFilterProps, ref) => {
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredValues, setFilteredValues] = useState<number[]>([]);

  // Initialize selected values from filter model
  useEffect(() => {
    if (props.filterModel?.values) {
      setSelectedValues(props.filterModel.values);
    }
  }, [props.filterModel]);

  // Filter values based on search text
  useEffect(() => {
    const filtered = props.values.filter((value, index) => {
      const label = props.labels[index] || String(value);
      return label.toLowerCase().includes(searchText.toLowerCase());
    });
    setFilteredValues(filtered);
  }, [searchText, props.values, props.labels]);

  // Handle value selection
  const handleValueSelect = (value: number) => {
    setSelectedValues(prev => {
      const newValues = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value];
      
      // Update filter model
      props.filterChangedCallback();
      return newValues;
    });
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    setSelectedValues(filteredValues);
    props.filterChangedCallback();
  };

  const handleDeselectAll = () => {
    setSelectedValues([]);
    props.filterChangedCallback();
  };

  // Implement AG Grid's filter interface
  useImperativeHandle(ref, () => ({
    doesFilterPass(params: IDoesFilterPassParams) {
      if (!selectedValues.length) return true;
      
      const value = params.data[props.colDef.field!];
      if (props.isBitwise) {
        // For bitwise enums, check if any selected value is set
        return selectedValues.some(selected => (value & selected) === selected);
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

  return (
    <div className="p-2 w-[250px]">
      <Input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="mb-2"
      />
      
      <div className="flex justify-between mb-2">
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Select All
        </button>
        <button
          onClick={handleDeselectAll}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Deselect All
        </button>
      </div>
      
      <ScrollArea className="h-[200px]">
        {filteredValues.map((value, index) => (
          <div key={value} className="flex items-center space-x-2 py-1">
            <Checkbox
              id={`value-${value}`}
              checked={selectedValues.includes(value)}
              onCheckedChange={() => handleValueSelect(value)}
            />
            <label
              htmlFor={`value-${value}`}
              className="text-sm cursor-pointer"
            >
              {props.labels[index] || String(value)}
            </label>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}); 