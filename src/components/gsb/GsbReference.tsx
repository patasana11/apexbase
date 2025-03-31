import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';

interface GsbReferenceProps {
    entity: any;
    onChange?: (value: string) => void;
    parentEntityDefName: string;
    propName: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function GsbReference({
    entity,
    onChange,
    parentEntityDefName,
    propName,
    placeholder = 'Select reference...',
    className = '',
    disabled = false
}: GsbReferenceProps) {
    const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);
    const [displayValue, setDisplayValue] = useState<string>('');

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
        const loadDisplayValue = async () => {
            if (!entity || !referenceEntityDef) return;

            try {
                const entityService = GsbEntityService.getInstance();
                const tenantCode = getCurrentTenant();
                const displayField = referenceEntityDef.title || 'id';

                let refEnt = entity[displayField];
                if (!refEnt) {
                    if (entity[displayField + "_id"]) {
                        let refResp = await entityService.getById(referenceEntityDef.name, entity[displayField + "_id"]);
                        if (refResp) {
                            refEnt = refResp.entity;
                        }
                    }
                }

                setDisplayValue(refEnt?.title || '');

                //if no title just 
            } catch (error) {
                console.error('Error loading reference display value:', error);
            }
        };

        loadDisplayValue();
    }, [entity, referenceEntityDef]);

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
                    entityDef: { name: parentEntityDefName },
                    entity: upEntity
                }
            );

            setDisplayValue(selectedValue.title || '');
            onChange?.(selectedValue);
        } catch (error) {
            console.error('Error saving mapped item:', error);
        }
    };

    if (!referenceEntityDef) {
        return <div className="text-gray-500">Loading reference...</div>;
    }

    return (
        <GsbAutocomplete
            value={displayValue}
            onChange={handleSelect}
            entityDefName={referenceEntityDef.name}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
        />
    );
} 