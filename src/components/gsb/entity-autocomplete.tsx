'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityUiService } from '@/lib/services/ui/entity-ui.service';

export interface EntityItem {
  id: string;
  name: string;
  title?: string;
  [key: string]: any;
}

interface EntityAutocompleteProps {
  /**
   * List of entity items to select from - if provided, entityType will be ignored
   */
  entities?: EntityItem[];
  
  /**
   * The entity type (definition name) to fetch data for
   * If provided and entities is not provided, will use EntityUiService to fetch data
   */
  entityType?: string;
  
  /**
   * The currently selected value (entity ID)
   */
  value?: string;
  
  /**
   * Called when a selection is made
   * @param value The selected entity ID
   * @param item The full entity item object
   */
  onValueChange: (value: string, item?: EntityItem) => void;
  
  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;
  
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  
  /**
   * Message to display when no items match the search
   */
  emptyMessage?: string;
  
  /**
   * The field to display from the entity
   */
  displayField?: string;
  
  /**
   * Additional class name for styling
   */
  className?: string;
  
  /**
   * Whether the control is disabled
   */
  disabled?: boolean;
  
  /**
   * Called when the user searches for an entity
   * If entityType is provided, this is optional as search will be handled internally
   */
  onSearch?: (query: string) => Promise<void>;
}

export function EntityAutocomplete({
  entities,
  entityType,
  value,
  onValueChange,
  isLoading: externalIsLoading = false,
  placeholder = 'Select an item...',
  emptyMessage = 'No items found.',
  displayField = 'name',
  className,
  disabled = false,
  onSearch
}: EntityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalEntities, setInternalEntities] = useState<EntityItem[]>([]);
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  
  // Use either provided entities or internally fetched ones
  const effectiveEntities = entities || internalEntities;
  
  // Use either external or internal loading state
  const isLoading = externalIsLoading || internalIsLoading;
  
  // Get entity service for direct fetching
  const entityUiService = EntityUiService.getInstance();
  
  // Load initial data when entityType is provided and no entities are explicitly passed
  useEffect(() => {
    if (entityType && !entities) {
      fetchEntities();
    }
  }, [entityType, entities]);
  
  // Function to fetch entities based on entityType
  const fetchEntities = async (query?: string) => {
    if (!entityType) return;
    
    setInternalIsLoading(true);
    try {
      const items = await entityUiService.getEntities(entityType, query);
      setInternalEntities(items);
    } catch (error) {
      console.error(`Error fetching entities of type ${entityType}:`, error);
      setInternalEntities([]);
    } finally {
      setInternalIsLoading(false);
    }
  };
  
  // Ensure entities is always an array
  const safeEntities = Array.isArray(effectiveEntities) ? effectiveEntities : [];
  
  // Find the selected item object
  const selectedItem = safeEntities.find(item => item.id === value);
  
  // Display value in the button
  const displayValue = selectedItem 
    ? (selectedItem[displayField] || selectedItem.name || selectedItem.title || selectedItem.id) 
    : '';

  // Handle input change for search
  const handleInputChange = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      if (entityType && !entities) {
        // Handle search internally if entityType is provided
        await fetchEntities(query);
      } else if (onSearch) {
        // Otherwise use provided onSearch callback
        await onSearch(query);
      }
    }
  };

  // Handle option selection
  const handleSelect = (itemId: string) => {
    const item = safeEntities.find(i => i.id === itemId);
    onValueChange(itemId, item);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value ? displayValue : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            className="h-9"
            onValueChange={handleInputChange}
            value={searchQuery}
          />
          {isLoading ? (
            <div className="p-2 space-y-1">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {safeEntities.map((item) => {
                  const itemDisplay = item[displayField] || item.name || item.title || item.id;
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{itemDisplay}</span>
                      {item.id !== itemDisplay && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {item.id}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
} 