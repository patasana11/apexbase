import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { GsbPagination } from './GsbPagination';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { DataTableQueryOptions } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GsbMultiReferenceProps {
  entity?: any;
  onChange?: (values: string[]) => void;
  propName: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  pageSize?: number;
  parentEntityDef: GsbEntityDef;
  property: GsbProperty;
  tableOptions?: DataTableQueryOptions,
  useOfflineValues?: boolean;
  useMainDef?: boolean;
  queryNonMapped?: boolean;
}

export function GsbMultiReference({
  entity,
  onChange,
  parentEntityDef,
  propName,
  placeholder = 'Select references...',
  className = '',
  disabled = false,
  property,
  tableOptions = { pageSize: 10 },
  useMainDef = false,
  useOfflineValues = false,
  queryNonMapped = false,
}: GsbMultiReferenceProps) {
  const [displayValues, setDisplayValues] = useState<Array<{ id: string; title: string }>>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial load of reference entity definition
  useEffect(() => {
    const loadReferenceEntityDef = async () => {
      try {
        if (useMainDef) {
          setReferenceEntityDef(parentEntityDef);
        } else {
          if (!parentEntityDef?.properties) {
            setError('Invalid parent entity definition');
            return;
          }

          if (!property?.refEntDef_id) {
            setError('Reference entity definition ID not found');
            return;
          }

          const cacheService = GsbCacheService.getInstance();
          const { entityDef } = await cacheService.getEntityDefWithProperties({
            id: property.refEntDef_id,
            name: '',
            properties: []
          });
          if (!entityDef) {
            setError('Reference entity definition not found');
            return;
          }
          setReferenceEntityDef(entityDef);
        }
      } catch (error) {
        console.error('Error loading reference entity definition:', error);
        setError('Failed to load reference entity definition');
      }
    };

    loadReferenceEntityDef();
  }, [parentEntityDef, property, useMainDef]);

  // Initial load of display values
  useEffect(() => {
    const loadInitialValues = async () => {
      if (!referenceEntityDef) return;

      setIsLoading(true);
      try {
        if (useOfflineValues) {
          // In offline mode, use selectedValues directly
          setDisplayValues(selectedValues);
          setTotalPages(Math.ceil(selectedValues.length / (tableOptions.pageSize || 10)));
          return;
        }

        if (entity && entity[propName]?.length) {
          setDisplayValues(entity[propName]);
          setTotalPages(Math.ceil(entity[propName].length / (tableOptions.pageSize || 10)));
          return;
        }

        const entityService = GsbEntityService.getInstance();
        const req = new QueryParams<any>(referenceEntityDef.name || '');
        req.entityDef = parentEntityDef;
        req.propertyName = propName;
        req.startIndex = 0;
        req.count = tableOptions.pageSize;
        req.select('title').select('id');
        let resp;
        if (queryNonMapped) {
          resp = await entityService.query(req);
        } else {
          req.entityId = entity.id;
          resp = await entityService.queryMapped(req);
        }
        if (resp.entities) {
          setDisplayValues(resp.entities);
          setTotalPages(Math.ceil(resp.entities.length / (tableOptions.pageSize || 10)));
        }
      } catch (error) {
        console.error('Error loading reference display values:', error);
        setError('Failed to load reference values');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialValues();
  }, [entity, referenceEntityDef, propName, useOfflineValues, selectedValues, queryNonMapped]);

  // Handle pagination updates
  useEffect(() => {
    const loadPageValues = async () => {
      if (!referenceEntityDef) return;

      setIsLoading(true);
      try {
        if (useOfflineValues) {
          // In offline mode, paginate through selectedValues
          const startIndex = (currentPage - 1) * (tableOptions.pageSize || 10);
          const endIndex = startIndex + (tableOptions.pageSize || 10);
          const pageValues = selectedValues.slice(startIndex, endIndex);
          setDisplayValues(pageValues);
        } else if (entity && entity[propName]?.length) {
          const startIndex = (currentPage - 1) * (tableOptions.pageSize || 10);
          const endIndex = startIndex + (tableOptions.pageSize || 10);
          const pageValues = entity[propName].slice(startIndex, endIndex);
          setDisplayValues(pageValues);
        }
      } catch (error) {
        console.error('Error loading page values:', error);
        setError('Failed to load page values');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageValues();
  }, [currentPage, entity, propName, tableOptions.pageSize, useOfflineValues, selectedValues]);

  const handleSelect = async (selectedValue: any) => {
    if (!selectedValue || !parentEntityDef) return;

    setIsAdding(true);
    try {
      if (useOfflineValues) {
        const newValues = [...selectedValues, selectedValue];
        setSelectedValues(newValues);
        onChange?.(newValues.map((v: { id: string }) => v.id));
      } else {
        const entityService = GsbEntityService.getInstance();
        await entityService.saveMappedItems(
          {
            entityDef: parentEntityDef,
            items: [{ id: selectedValue.id }],
            entityId: entity.id,
            propName: propName
          }
        );

        let values = entity[propName] || [];
        const newValues = [...values, selectedValue];
        setSelectedValues(newValues);
        onChange?.(newValues.map((v: { id: string }) => v.id));
      }
    } catch (error) {
      console.error('Error saving mapped item:', error);
      setError('Failed to add reference');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!parentEntityDef) return;

    setIsLoading(true);
    try {
      if (useOfflineValues) {
        const newValues = selectedValues.filter((v: any) => v.id !== id);
        setSelectedValues(newValues);
        onChange?.(newValues.map((v: { id: string }) => v.id));
      } else {
        const entityService = GsbEntityService.getInstance();
        await entityService.removeMappedItems(
          {
            entityDef: parentEntityDef,
            items: [{ id }],
            entityId: entity.id,
            propName: propName
          }
        );

        let values = entity[propName];
        const newValues = values.filter((v: any) => v.id !== id);
        setSelectedValues(newValues);
        onChange?.(newValues.map((v: { id: string }) => v.id));
      }
    } catch (error) {
      console.error('Error removing mapped item:', error);
      setError('Failed to remove reference');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-md">
        <X className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (!referenceEntityDef) {
    return (
      <div className="flex items-center gap-2 p-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading references...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <GsbAutocomplete
          value=""
          onChange={handleSelect}
          entityDef={referenceEntityDef}
          placeholder={placeholder}
          disabled={disabled || isAdding}
          className="flex-1"
        />
        {isAdding && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2 p-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {(displayValues || []).map(({ id, title }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {title}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(id)}
                      disabled={disabled || isLoading}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!displayValues || displayValues.length === 0) && (
                  <div className="flex items-center justify-center h-20 text-gray-500">
                    No references selected
                  </div>
                )}
              </div>
            </ScrollArea>

            {(displayValues || []).length > 0 && (
              <div className="flex justify-center">
                <GsbPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 