import React, { useState, useEffect } from 'react';
import { GsbAutocomplete } from './GsbAutocomplete';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { getCurrentTenant } from '@/lib/gsb/config/tenant-config';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { Loader2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    const [isLoading, setIsLoading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReferenceEntityDef = async () => {
            try {
                if (!parentEntityDef?.properties) {
                    setError('Invalid parent entity definition');
                    return;
                }

                const property = parentEntityDef.properties.find(p => p.name === propName);
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
    }, [parentEntityDef, propName]);

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
        if (!selectedValue || !parentEntityDef) return;

        setIsLoading(true);
        try {
            entity[propName] = selectedValue;
            entity[propName + "_id"] = selectedValue?.id;

            const upEntity = {
                id: entity.id,
                [propName + "_id"]: selectedValue?.id
            };

            const entityService = GsbEntityService.getInstance();
            await entityService.save(
                {
                    entDefId: parentEntityDef.id,
                    entity: upEntity
                }
            );

            setDisplayValue(selectedValue.title || '');
            onChange?.(selectedValue);
        } catch (error) {
            console.error('Error saving mapped item:', error);
            setError('Failed to save reference');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        if (!parentEntityDef) return;

        setIsClearing(true);
        try {
            const entityService = GsbEntityService.getInstance();
            await entityService.save(
                {
                    entityDef: { name: parentEntityDef },
                    entity: {
                        id: entity.id,
                        [propName + "_id"]: null
                    }
                }
            );

            setDisplayValue('');
            onChange?.('');
        } catch (error) {
            console.error('Error clearing reference:', error);
            setError('Failed to clear reference');
        } finally {
            setIsClearing(false);
        }
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
                <span>Loading reference...</span>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex-1">
                <GsbAutocomplete
                    value={displayValue}
                    onChange={handleSelect}
                    entityDef={referenceEntityDef}
                    placeholder={placeholder}
                    disabled={disabled || isLoading || isClearing}
                />
            </div>
            {displayValue && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    disabled={disabled || isLoading || isClearing}
                    className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                >
                    {isClearing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <X className="h-4 w-4" />
                    )}
                </Button>
            )}
            {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            )}
        </div>
    );
} 