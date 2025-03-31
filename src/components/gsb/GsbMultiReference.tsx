import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { GsbPagination } from './GsbPagination';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { DataTableQueryOptions } from '@/lib/gsb/services/entity/gsb-data-table.service';

interface GsbMultiReferenceProps {
  entity?: any;
  onChange?: (values: string[]) => void;
  propName: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  pageSize?: number;
  parentEntityDef: GsbEntityDef;
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
  tableOptions = {pageSize:10}
}: GsbMultiReferenceProps) {
  const [displayValues, setDisplayValues] = useState<Array<{ id: string; display: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);

  useEffect(() => {
    const loadDisplayValues = async () => {
      if (!parentEntityDef) return;

      setIsLoading(true);
      try {
        const entityService = GsbEntityService.getInstance();
        const tenantCode = getCurrentTenant();
        const displayField = 'title';
        
        // Get items for current page
        const startIndex = (currentPage - 1) * (tableOptions.pageSize || 10);
        const endIndex = startIndex + (tableOptions.pageSize || 10);
        let values = entity[propName] ;

        if(!values){
            const req = new QueryParams<any>(parentEntityDef.name || '');
            req.entityDef = parentEntityDef;
            req.propertyName = propName;
            req.startIndex = startIndex;
            req.count = tableOptions.pageSize;
            req.select(displayField).select('id');
            const resp = await entityService.queryMapped(req);
            values = resp.entities;
        }
        

        setDisplayValues(values);
            setTotalPages(Math.ceil(values.length / (tableOptions.pageSize || 10)   ));
      } catch (error) {
        console.error('Error loading reference display values:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisplayValues();
  }, [parentEntityDef, entity, currentPage, tableOptions]);


  useEffect(() => {
    const loadReferenceEntityDef = async () => {
      let referenceEntityDefId = parentEntityDef.properties?.find(p => p.name === propName)?.refEntDef_id;
      let referenceEntityDef = await GsbCacheService.getInstance().getEntityDefWithProperties({id:referenceEntityDefId});
      setReferenceEntityDef(referenceEntityDef);
    }
    loadReferenceEntityDef();
  }, [parentEntityDef]);

  const handleSelect = async (selectedValue: any) => {
    if (!selectedValue || !parentEntityDef) return;
    
    const entityService = GsbEntityService.getInstance();
    const tenantCode = getCurrentTenant();
    
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

  return (
    <div className={`space-y-4 ${className}`}>
        <h1>Multi Reference</h1>
      <GsbAutocomplete
        value=""
        onChange={handleSelect}
        entityDef={referenceEntityDef || {}}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-gray-500"></div>
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