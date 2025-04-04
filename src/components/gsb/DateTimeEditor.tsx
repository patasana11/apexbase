import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface DateTimeEditorProps extends ICellEditorParams {
  value: string;
}

const DateTimeEditor = forwardRef((props: DateTimeEditorProps, ref) => {
  const [date, setDate] = useState<Date | undefined>(props.value ? new Date(props.value) : undefined);
  const [time, setTime] = useState<string>(props.value ? format(new Date(props.value), 'HH:mm:ss') : '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      props.api.stopEditing();
    } else if (event.key === 'Enter') {
      handleApply();
    }
  };

  // Apply changes and close editor
  const handleApply = () => {
    if (date) {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours || 0, minutes || 0, seconds || 0);
      props.node.setDataValue(props.column.getColId(), newDate.toISOString());
    }
    props.api.stopEditing();
  };

  // Handle time input change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  // Implement AG Grid's cell editor interface
  useImperativeHandle(ref, () => ({
    getValue() {
      if (date) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours || 0, minutes || 0, seconds || 0);
        return newDate.toISOString();
      }
      return null;
    },

    afterGuiAttached() {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },

    isPopup() {
      return true;
    },

    getPopupPosition() {
      return 'under';
    }
  }));

  return (
    <div 
      className="ag-cell-edit-wrapper"
      style={{
        height: 'auto',
        width: '400px',
        backgroundColor: 'var(--ag-background-color)',
        border: '1px solid var(--ag-border-color)',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'absolute',
        zIndex: 9999,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Select Date</span>
        </div>
        <div className="ag-calendar">
          <input
            type="date"
            value={date ? format(date, 'yyyy-MM-dd') : ''}
            onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
            className="ag-input-field-input ag-text-field-input"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--ag-border-color)',
              backgroundColor: 'var(--ag-background-color)',
              color: 'var(--ag-foreground-color)'
            }}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Select Time</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-full"
            style={{
              backgroundColor: 'var(--ag-background-color)',
              color: 'var(--ag-foreground-color)',
              borderColor: 'var(--ag-border-color)'
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--ag-border-color)' }}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => props.api.stopEditing()}
          className="hover:bg-destructive/10 hover:text-destructive"
          style={{
            backgroundColor: 'var(--ag-background-color)',
            color: 'var(--ag-foreground-color)',
            borderColor: 'var(--ag-border-color)'
          }}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleApply}
          className="bg-primary hover:bg-primary/90"
          style={{
            backgroundColor: 'var(--ag-primary-color)',
            color: 'var(--ag-primary-foreground-color)'
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
});

DateTimeEditor.displayName = 'DateTimeEditor';

export default DateTimeEditor; 