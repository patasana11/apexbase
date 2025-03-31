import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';

interface GsbReferenceProps {
    entity: any;
    onChange?: (value: string) => void;
    parentEntityDef: GsbEntityDef;
    propName: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    property: GsbProperty;
}

export function GsbReference({
    entity,
    onChange,
    parentEntityDef,
    propName,
    placeholder = 'Select reference...',
    className = '',
    disabled = false,
    property    
}: GsbReferenceProps) {
    const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);
    const [displayValue, setDisplayValue] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

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
    }, [parentEntityDef,property, propName]);

    useEffect(() => {
        const loadDisplayValue = async () => {
            if (!entity || !referenceEntityDef) return;
            const refEnt = entity[propName];

            try {
                if (!refEnt?.title) {
                    const entityService = GsbEntityService.getInstance();
                    const id = refEnt?.id || entity[propName + "_id"];
                    
                    if (id) {
                        const req = new QueryParams<any>(referenceEntityDef.name || '');
                        req.entityId = id;
                        req.entityDef = referenceEntityDef;
                        req.select('title');
                        const refResp = await entityService.get(req);
                        if (refResp?.entity?.title) {
                            setDisplayValue(refResp.entity.title);
                        }
                    }
                } else {
                    setDisplayValue(refEnt.title);
                }
            } catch (error) {
                console.error('Error loading reference display value:', error);
                setError('Failed to load reference value');
            }
        };

        loadDisplayValue();
    }, [entity, referenceEntityDef, propName]);

    const handleSelect = async (selectedValue: any) => {
        if (!selectedValue || !referenceEntityDef) return;

        const entityService = GsbEntityService.getInstance();
        const tenantCode = getCurrentTenant();

        try {
            entity[propName] = selectedValue;
            entity[propName + "_id"] = selectedValue?.id;

            const upEntity = {
                id:entity.id,
                [propName + "_id"]:selectedValue?.id
            }

            await entityService.save(
                {
                    entityDef: { name: parentEntityDef },
                    entity: upEntity
                }
            );

            setDisplayValue(selectedValue.title || '');
            onChange?.(selectedValue);
        } catch (error) {
            console.error('Error saving mapped item:', error);
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!referenceEntityDef) {
        return <div className="text-gray-500">Loading...</div>;
    }

    return (
        <div className="w-full h-full">
            <GsbAutocomplete
                value={displayValue}
                onChange={handleSelect}
                entityDef={referenceEntityDef}
                placeholder={placeholder}
                className={className}
                disabled={disabled}
            />
        </div>
    );
} 