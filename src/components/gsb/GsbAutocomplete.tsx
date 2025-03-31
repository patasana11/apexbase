import React, { useState, useEffect, useRef } from 'react';
import { GsbEntityDef } from '@/lib/gsb/models/property-definition.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/gsb-entity.service';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';

interface GsbAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  entityDefName: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function GsbAutocomplete({
  value,
  onChange,
  entityDefName,
  placeholder = 'Search...',
  className = '',
  disabled = false
}: GsbAutocompleteProps) {
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; display: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadEntityDef = async () => {
      try {
        const cacheService = GsbCacheService.getInstance();
        const { entityDef } = await cacheService.getEntityDefWithPropertiesByName(entityDefName);
        setEntityDef(entityDef);
      } catch (error) {
        console.error('Error loading entity definition:', error);
      }
    };

    loadEntityDef();
  }, [entityDefName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchEntities = async () => {
      if (!searchText.trim() || !entityDef) return;

      setIsLoading(true);
      try {
        const entityService = GsbEntityService.getInstance();
        const displayField = entityDef.display_field || 'id';
        const tenantCode = getCurrentTenant();
        
        const searchResults = await entityService.searchEntities(
          entityDef.id!,
          searchText,
          displayField,
          '', // Token will be handled by the service
          tenantCode
        );

        setSuggestions(searchResults.map((entity: any) => ({
          id: entity.id,
          display: entity[displayField] || entity.id || ''
        })));
      } catch (error) {
        console.error('Error searching entities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchEntities, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchText, entityDef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (suggestion: { id: string; display: string }) => {
    setSearchText(suggestion.display);
    onChange(suggestion.id);
    setIsOpen(false);
  };

  if (!entityDef) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={searchText}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100' : 'bg-white'
        } ${className}`}
      />
      
      {isOpen && (searchText || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion.display}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
} 