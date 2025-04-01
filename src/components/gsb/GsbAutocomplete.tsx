import React, { useState, useEffect, useRef } from 'react';
import { GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface GsbAutocompleteProps {
  value: string;
  onChange: (value: any) => void;
  entityDef: GsbEntityDef;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function GsbAutocomplete({
  value,
  onChange,
  entityDef,
  placeholder = 'Search...',
  className = '',
  disabled = false
}: GsbAutocompleteProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        const displayField =  'title';
        const tenantCode = getCurrentTenant();
        
        const req = new QueryParams<any>(entityDef.name || '');
        req.entityDef = entityDef;
        req.filter = searchText;
        req.count = 10;
        req.select(displayField).select('id');
        const searchResults = await entityService.query(req);

        setSearchResults(searchResults.entities?.map((entity: any) => ({
          id: entity.id,
          title: entity[displayField] || entity.id || '',
          description: entity.description || ''
        })) || []);
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

  const handleSelect = (result: any) => {
    setSearchText(result.title);
    onChange(result);
    setIsOpen(false);
  };

  if (!entityDef) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            // handleSearch(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            "w-full pr-8",
            "bg-background text-foreground",
            "border-input hover:border-input/80",
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "dark:bg-background dark:text-foreground",
            "dark:border-input dark:hover:border-input/80",
            "dark:focus:ring-2 dark:focus:ring-ring dark:focus:ring-offset-2"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (searchResults.length > 0 || isLoading) && (
        <div className={cn(
          "absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg",
          "dark:bg-background dark:border-border",
          "max-h-60 overflow-auto"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="py-1">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-accent",
                    "dark:hover:bg-accent/80",
                    "transition-colors"
                  )}
                >
                  <div className="font-medium text-foreground">{result.title}</div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground">{result.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 