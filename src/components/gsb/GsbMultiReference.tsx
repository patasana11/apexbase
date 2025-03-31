import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { GsbPagination } from './GsbPagination';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { DataTableQueryOptions } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { property } from 'lodash';

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
  tableOptions?: DataTableQueryOptions
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
  tableOptions = {pageSize:10}
}: GsbMultiReferenceProps) {
  const [displayValues, setDisplayValues] = useState<Array<{ id: string; title: string }>>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial load of reference entity definition
  useEffect(() => {
    const loadReferenceEntityDef = async () => {
      try {
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
      } catch (error) {
        console.error('Error loading reference entity definition:', error);
        setError('Failed to load reference entity definition');
      }
    };

    loadReferenceEntityDef();
  }, [parentEntityDef, property]); // Only run when parentEntityDef or property changes

  // Initial load of display values
  useEffect(() => {
    const loadInitialValues = async () => {
      if (!entity || !referenceEntityDef) return;

      setIsLoading(true);
      try {
        // If we have values in the entity, use those
        if (entity[propName]?.length) {
          setDisplayValues(entity[propName]);
          setTotalPages(Math.ceil(entity[propName].length / (tableOptions.pageSize || 10)));
          return;
        }

        // Otherwise, load from server
        const entityService = GsbEntityService.getInstance();
        const req = new QueryParams<any>(referenceEntityDef.name || '');
        req.entityDef = parentEntityDef;
        req.propertyName = propName;
        req.startIndex = 0;
        req.count = tableOptions.pageSize;
        req.entityId = entity.id;
        req.select('title').select('id');
        const resp = await entityService.queryMapped(req);
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
  }, [entity, referenceEntityDef, propName]); // Only run when these core dependencies change

  // Handle pagination updates
  useEffect(() => {
    const loadPageValues = async () => {
      if (!entity || !referenceEntityDef || !entity[propName]?.length) return;

      setIsLoading(true);
      try {
        const startIndex = (currentPage - 1) * (tableOptions.pageSize || 10);
        const endIndex = startIndex + (tableOptions.pageSize || 10);
        const pageValues = entity[propName].slice(startIndex, endIndex);
        setDisplayValues(pageValues);
      } catch (error) {
        console.error('Error loading page values:', error);
        setError('Failed to load page values');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageValues();
  }, [currentPage, entity, propName, tableOptions.pageSize]); // Only run when pagination changes

  const handleSelect = async (selectedValue: any) => {
    if (!selectedValue || !parentEntityDef) return;
    
    const entityService = GsbEntityService.getInstance();
    
    try {
      await entityService.saveMappedItems(
        {
            entityDef: parentEntityDef,
            items: [{id:selectedValue.id}],
            entityId: entity.id,
            propName: propName
        }
      );

      let values = entity[propName] || [];
      const newValues = [...values, selectedValue];
      onChange?.(newValues);
    } catch (error) {
      console.error('Error saving mapped item:', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (!parentEntityDef) return;
    
    const entityService = GsbEntityService.getInstance();
    const tenantCode = getCurrentTenant();
    
    try {
      await entityService.removeMappedItems(
        {
            entityDef: parentEntityDef,
            items: [{id}],
            entityId: entity.id,
            propName: propName
        }
    );
    let values = entity[propName] ;
      
      const newValues = values.filter((v: any) => v.id !== id);
      onChange?.(newValues);
    } catch (error) {
      console.error('Error removing mapped item:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!referenceEntityDef) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <GsbAutocomplete
        value=""
        onChange={handleSelect}
        entityDef={referenceEntityDef}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <>
            {displayValues?.map(({ id, title }) => (
              <div
                key={id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{title}</span>
                <button
                  onClick={() => handleRemove(id)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {displayValues?.length && (
              <GsbPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 