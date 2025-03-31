import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { GsbPagination } from './GsbPagination';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';

interface GsbMultiReferenceProps {
  entity?: any;
  onChange?: (values: string[]) => void;
  parentEntityDefName: string;
  propName: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  pageSize?: number;
}

export function GsbMultiReference({
  entity,
  onChange,
  parentEntityDefName,
  propName,
  placeholder = 'Select references...',
  className = '',
  disabled = false,
  pageSize = 10
}: GsbMultiReferenceProps) {
  const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);
  const [displayValues, setDisplayValues] = useState<Array<{ id: string; display: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReferenceEntityDef = async () => {
      try {
        const cacheService = GsbCacheService.getInstance();
        const { entityDef } = await cacheService.getEntityDefWithPropertiesByName(parentEntityDefName);
        const property = entityDef.properties?.find(p => p.name === propName);
        if (!property?.refEntDef_id) {
          throw new Error(`Property ${propName} not found or is not a reference`);
        }
        const { entityDef: refDef } = await cacheService.getEntityDefWithPropertiesByName(property.refEntDef_id);
        setReferenceEntityDef(refDef);
      } catch (error) {
        console.error('Error loading reference entity definition:', error);
      }
    };

    loadReferenceEntityDef();
  }, [parentEntityDefName, propName]);

  useEffect(() => {
    const loadDisplayValues = async () => {
      if (!referenceEntityDef) return;

      setIsLoading(true);
      try {
        const entityService = GsbEntityService.getInstance();
        const tenantCode = getCurrentTenant();
        const displayField = referenceEntityDef.title || 'id';
        
        // Get items for current page
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        let values = entity[propName] ;

        if(!values){
            const req = new QueryParams<any>(parentEntityDefName);
            req.propertyName = propName;
            req.startIndex = startIndex;
            req.count = pageSize;
            const resp = await entityService.queryMapped(req);
            values = resp.entities;
        }
        

        setDisplayValues(values);
        setTotalPages(Math.ceil(values.length / pageSize));
      } catch (error) {
        console.error('Error loading reference display values:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisplayValues();
  }, [referenceEntityDef, entity, currentPage, pageSize]);

  const handleSelect = async (selectedValue: any) => {
    if (!selectedValue || !referenceEntityDef) return;
    
    const entityService = GsbEntityService.getInstance();
    const tenantCode = getCurrentTenant();
    
    try {
      await entityService.saveMappedItems(
        {
            entDefName: parentEntityDefName,
            entDefId: '',
            entityDef: {},
            items: [{id:selectedValue.id}],
            entityId: entity.id,
            propName: propName
        }
      );

      const newValues = [...values, selectedValue];
      onChange?.(newValues);
    } catch (error) {
      console.error('Error saving mapped item:', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (!referenceEntityDef) return;
    
    const entityService = GsbEntityService.getInstance();
    const tenantCode = getCurrentTenant();
    
    try {
      await entityService.removeMappedItems(
        {
            entDefName: parentEntityDefName,
            entDefId: '',
            entityDef: {},
            items: [{id}],
            entityId: entity.id,
            propName: propName
        }
    );
      
      const newValues = values.filter(v => v !== id);
      onChange?.(newValues);
    } catch (error) {
      console.error('Error removing mapped item:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!referenceEntityDef) {
    return <div className="text-gray-500">Loading reference...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <GsbAutocomplete
        value=""
        onChange={handleSelect}
        entityDefName={referenceEntityDef.name}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-gray-500">Loading references...</div>
        ) : (
          <>
            {displayValues.map(({ id, display }) => (
              <div
                key={id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{display}</span>
                <button
                  onClick={() => handleRemove(id)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {displayValues.length > 0 && (
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