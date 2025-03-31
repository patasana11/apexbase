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
}

export function GsbReference({
    entity,
    onChange,
    parentEntityDef,
    propName,
    placeholder = 'Select reference...',
    className = '',
    disabled = false
}: GsbReferenceProps) {
    const [referenceEntityDef, setReferenceEntityDef] = useState<GsbEntityDef | null>(null);
    const [displayValue, setDisplayValue] = useState<string>('');


    useEffect(() => {
        const loadDisplayValue = async () => {
            if (!entity || !referenceEntityDef) return;
            const refEnt = entity[propName ];

            try {
                if(!refEnt?.title  ){
                    const entityService = GsbEntityService.getInstance();
    
                    if (!refEnt) {
                        let id = refEnt?.id || entity[propName + "_id"];
                        if (id) {
                            let req = new QueryParams<any>(referenceEntityDef.name || '');
                            req.entityId =id ;
                            req.entityDef = referenceEntityDef;
                            req.select('title');
                            let refResp = await entityService.get(req);
                            if (refResp) {
                                refEnt.title = refResp.entity?.title;
                            }
                        }
                    }
                }


                setDisplayValue(refEnt);

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


    return (
            <div className="w-full h-full">
                <h1>Reference</h1>
            <GsbAutocomplete
                value={displayValue}
                onChange={handleSelect}
                entityDef={referenceEntityDef  || {}}
                placeholder={placeholder}
                className={className}
                disabled={disabled}
            />
        </div>
    );
} 