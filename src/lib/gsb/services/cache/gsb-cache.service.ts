import { GsbEntityDef, GsbProperty, GsbPropertyDef } from '../../models/gsb-entity-def.model';
import { GsbEntityService } from '../entity/gsb-entity.service';
import { GsbEnum } from '../../models/gsb-enum.model';
import { getGsbToken, getGsbTenantCode, setGsbTenantCode } from '../../config/gsb-config';
import { EntityQueryParams } from '../../types/query-params';
import { QueryFunction, QueryType } from '../../types/query';
import { getCurrentTenant } from '../../config/tenant-config';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class GsbCacheService {
    private static instance: GsbCacheService;
    private entityDefCache: Map<string, CacheEntry<GsbEntityDef>> = new Map();
    private entityCache: Map<string, CacheEntry<any>> = new Map();
    private baseUrl: string;
    private enumCache: Map<string, CacheEntry<GsbEnum>> = new Map();
    private propertyDefCache: Map<string, CacheEntry<GsbPropertyDef>> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private enumCacheTimeout = 5 * 60 * 1000; // 5 minutes
    private entityService: GsbEntityService;

    private constructor() {
        this.entityService = GsbEntityService.getInstance();
        this.baseUrl = process.env.NEXT_PUBLIC_GSB_API_URL || '';
        // Initialize tenant code
        const currentTenant = getCurrentTenant();
        if (currentTenant) {
            setGsbTenantCode(currentTenant);
        }
    }

    public static getInstance(): GsbCacheService {
        if (!GsbCacheService.instance) {
            GsbCacheService.instance = new GsbCacheService();
        }
        return GsbCacheService.instance;
    }

    public async getAuthParams(): Promise<{ token: string; tenantCode: string }> {
        const token = await getGsbToken();
        const tenantCode = getGsbTenantCode();
        return { token, tenantCode };
    }

    private async getPropertyDefs(): Promise<GsbPropertyDef[]> {
        if (this.propertyDefCache.size > 0) {
            return Array.from(this.propertyDefCache.values()).map(entry => entry.data);
        }

        const { token, tenantCode } = await this.getAuthParams();
        let queryParams = new EntityQueryParams('GsbPropertyDef');
        queryParams.queryType = QueryType.FullNonPersonal;
        const propertyDefResponse = await this.entityService.query(queryParams, token, tenantCode);


        if (!propertyDefResponse.entities) {
            throw new Error('Property definitions not found');
        }

        for (const prop of propertyDefResponse.entities) {

            // Cache the property definition
            this.propertyDefCache.set(prop.id, {
                data: prop,
                timestamp: Date.now()
            });
        }

        return propertyDefResponse.entities;
    }

    public async getEntityDefWithPropertiesByName(name: string): 
    Promise<{ entityDef: GsbEntityDef; properties: GsbProperty[] }> {
        return this.getEntityDefWithProperties({name: name});
    }


    public async getEntityDefWithProperties(def: GsbEntityDef): 
    Promise<{ entityDef: GsbEntityDef; properties: GsbProperty[] }> {
        try {
            if(!def) {
                throw new Error('Entity definition name is required');
            }
            let cached;


            // Check cache first
            if(def.name) {
                cached = this.entityDefCache.get(def.name);
            }
            else if(def.id) {
                cached = this.entityDefCache.values().find(entry => entry.data.id === def.id);
            }
            else {
                throw new Error('Entity definition name or id is required');
            }

            def = {id: def.id, name: def.name};

            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return { entityDef: cached.data, properties: cached.data.properties || [] };
            }

            // Get auth params
            const { token, tenantCode } = await this.getAuthParams();

            // Fetch entity definition
            const entityDefResponse = await this.entityService.getDefinition({
                entityDef: def
            }, token, tenantCode);

            if (!entityDefResponse?.entityDef) {
                throw new Error('Entity definition not found');
            }

            const entityDef: GsbEntityDef = entityDefResponse.entityDef;

            // Fetch property definitions for each property
            if (entityDef.properties) {
                const allPropertyDefs = await this.getPropertyDefs();

                for (let prop of entityDef.properties) {
                    // Check cache first
                    const cachedDef = allPropertyDefs.find(p => p.id === prop.definition_id);
                    if (cachedDef) {
                        prop.definition = cachedDef;
                    } else {
                        throw new Error(`Property definition not found for ${prop.name}`);
                    }
                }
            }

            // Cache the updated entity definition
            this.entityDefCache.set(entityDef.name || '', {
                data: entityDef,
                timestamp: Date.now()
            });

            return { entityDef, properties: entityDef.properties || [] };
        } catch (error) {
            console.error('Error fetching entity definition:', error);
            throw error;
        }
    }

    public async getEnum(id: string): Promise<GsbEnum | null> {
        try {
            // Check cache first
            const cached = this.enumCache.get(id);
            if (cached && Date.now() - cached.timestamp < this.enumCacheTimeout) {
                return cached.data;
            }

            // Get auth params
            const { token, tenantCode } = await this.getAuthParams();

            const queryParams = new EntityQueryParams('GsbEnum');
            queryParams.queryType = QueryType.FullNonPersonal;
            queryParams.entityId = id;
            queryParams.incS('values');
            // Fetch enum definition
            const enumResponse = await this.entityService.get(queryParams, token, tenantCode);

            if (!enumResponse?.entity) {
                return null;
            }

            const enumDef = enumResponse.entity as GsbEnum;

            // Cache the enum definition
            this.enumCache.set(id, {
                data: enumDef,
                timestamp: Date.now()
            });

            return enumDef;
        } catch (error) {
            console.error('Error fetching enum definition:', error);
            return null;
        }
    }

    public async getEnums(enumIds: string[]): Promise<Map<string, GsbEnum>> {
        try {
            const result = new Map<string, GsbEnum>();
            const uncachedIds = enumIds.filter(id => {
                const cached = this.enumCache.get(id);
                if (cached && Date.now() - cached.timestamp < this.enumCacheTimeout) {
                    result.set(id, cached.data);
                    return false;
                }
                return true;
            });

            if (uncachedIds.length > 0) {
                const { token, tenantCode } = await this.getAuthParams();
                const queryParams = new EntityQueryParams('GsbEnum');
                queryParams
                    .where('id', uncachedIds, QueryFunction.In)
                    .incS('values');

                const response = await this.entityService.query(queryParams, token, tenantCode);

                if (response?.entities) {
                    for (const entity of response.entities) {
                        const enumData = entity as GsbEnum;
                        if (enumData.id) {
                            // Cache the result
                            this.enumCache.set(enumData.id, {
                                data: enumData,
                                timestamp: Date.now()
                            });

                            result.set(enumData.id, enumData);
                        }
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('Error fetching enum definitions:', error);
            return new Map();
        }
    }

    public clearCache(): void {
        this.entityDefCache.clear();
        this.entityCache.clear();
        this.enumCache.clear();
        this.propertyDefCache.clear();
    }
} 