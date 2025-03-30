import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ICellEditorParams } from 'ag-grid-community';

interface BitwiseEnumEditorProps extends ICellEditorParams {
  values: number[];
  labels: string[];
}

const BitwiseEnumEditor = forwardRef((props: BitwiseEnumEditorProps, ref) => {
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize selected values from current cell value
  useEffect(() => {
    if (props.value) {
      // Convert bitwise value to array of selected values
      const selected = props.values.filter(val => 
        (props.value & val) === val && val !== 0
      );
      setSelectedValues(selected);
    }
  }, [props.value, props.values]);

  // Focus the search input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Implement AG Grid's cell editor interface
  useImperativeHandle(ref, () => ({
    // Return the current value when editing is complete
    getValue() {
      return selectedValues.length > 0 
        ? selectedValues.reduce((acc, val) => acc | val, 0) 
        : 0;
    },

    // Focus the dropdown when the editor starts
    afterGuiAttached() {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    
    // We need this for proper popup handling
    isPopup() {
      return true;
    }
  }));

  // Toggle value selection
  const toggleValue = (value: number) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(prev => prev.filter(v => v !== value));
    } else {
      setSelectedValues(prev => [...prev, value]);
    }
  };

  // Select all visible values
  const selectAll = () => {
    const filteredValues = props.values.filter(value => {
      const index = props.values.indexOf(value);
      const label = props.labels[index] || String(value);
      return label.toLowerCase().includes(searchText.toLowerCase());
    });
    setSelectedValues(prev => {
      const newValues = [...prev];
      filteredValues.forEach(value => {
        if (!newValues.includes(value)) {
          newValues.push(value);
        }
      });
      return newValues;
    });
  };

  // Deselect all visible values
  const deselectAll = () => {
    const filteredValues = props.values.filter(value => {
      const index = props.values.indexOf(value);
      const label = props.labels[index] || String(value);
      return label.toLowerCase().includes(searchText.toLowerCase());
    });
    setSelectedValues(prev => prev.filter(value => !filteredValues.includes(value)));
  };

  // Filter the options based on search text
  const filteredOptions = props.values.filter(value => {
    const index = props.values.indexOf(value);
    const label = props.labels[index] || String(value);
    return label.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div 
      ref={containerRef}
      className="ag-cell-edit-wrapper"
      style={{
        height: 'auto',
        width: '250px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'absolute',
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with search */}
      <div style={{ 
        padding: '8px', 
        borderBottom: '1px solid #eee',
        backgroundColor: '#f9f9f9'
      }}>
        <input 
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        />
      </div>
      
      {/* Select/Deselect All Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        padding: '6px 8px',
        borderBottom: '1px solid #eee',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>
            <strong>{selectedValues.length}</strong> selected
          </span>
        </div>
        <div>
          <button 
            onClick={selectAll}
            style={{ 
              marginRight: '8px', 
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#0066cc',
              fontSize: '12px'
            }}
          >
            Select All
          </button>
          <button 
            onClick={deselectAll}
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#0066cc',
              fontSize: '12px'
            }}
          >
            Deselect All
          </button>
        </div>
      </div>
      
      {/* Options List */}
      <div style={{ 
        maxHeight: '200px', 
        overflowY: 'auto',
        padding: '4px 0'
      }}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((value, index) => {
            const labelIndex = props.values.indexOf(value);
            const label = props.labels[labelIndex] || String(value);
            
            return (
              <div 
                key={value}
                style={{ 
                  padding: '6px 10px', 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: selectedValues.includes(value) ? '#f0f7ff' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                  borderRadius: '2px'
                }}
                onClick={() => toggleValue(value)}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = selectedValues.includes(value) 
                    ? '#e1efff' 
                    : '#f5f5f5';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = selectedValues.includes(value) 
                    ? '#f0f7ff' 
                    : 'transparent';
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  marginRight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedValues.includes(value) ? '#0066cc' : 'white'
                }}>
                  {selectedValues.includes(value) && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
                    </svg>
                  )}
                </div>
                <span style={{ 
                  fontSize: '13px',
                  color: selectedValues.includes(value) ? '#0066cc' : '#333'
                }}>
                  {label}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ 
            padding: '10px', 
            textAlign: 'center',
            color: '#999',
            fontSize: '13px'
          }}>
            No options match your search
          </div>
        )}
      </div>
      
      {/* Footer with actions */}
      <div style={{ 
        padding: '8px', 
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: '#f9f9f9'
      }}>
        <button 
          onClick={() => props.stopEditing()}
          style={{ 
            padding: '6px 12px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
});

export default BitwiseEnumEditor; 