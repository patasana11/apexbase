import { GsbEntityDef } from '../../models/gsb-entity-def.model';
import { GsbEntityService } from '../entity/gsb-entity.service';
import { PropertyDefinition } from '../../models/property-definition.model';
import { GsbEnum } from '../../models/gsb-enum.model';
import { getGsbToken, getGsbTenantCode, setGsbTenantCode } from '../../config/gsb-config';
import { GSB_CONFIG } from '../../config/gsb-config';
import { EntityQueryParams } from '../../types/query-params';
import { QueryFunction } from '../../types/query';
import { getCurrentTenant } from '../../config/tenant-config';

export class GsbCacheService {
  private static instance: GsbCacheService;
  private entityDefCache: Map<string, { data: GsbEntityDef; timestamp: number }> = new Map();
  private propertyDefCache: Map<string, { data: PropertyDefinition[]; timestamp: number }> = new Map();
  private enumCache: Map<string, { data: GsbEnum; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private enumCacheTimeout = 5 * 60 * 1000; // 5 minutes
  public entityService: GsbEntityService;

  private constructor() {
    this.entityService = GsbEntityService.getInstance();
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

  public async getEntityDefWithProperties(entityDefId: string): Promise<{ entityDef: GsbEntityDef | null; propertyDefs: PropertyDefinition[] }> {
    try {
      // Check cache first
      const cachedEntityDef = this.entityDefCache.get(entityDefId);
      const cachedPropertyDefs = this.propertyDefCache.get(entityDefId);

      if (cachedEntityDef && cachedPropertyDefs && 
          Date.now() - cachedEntityDef.timestamp < this.CACHE_DURATION &&
          Date.now() - cachedPropertyDefs.timestamp < this.CACHE_DURATION) {
        return {
          entityDef: cachedEntityDef.data,
          propertyDefs: cachedPropertyDefs.data
        };
      }

      // Get auth params
      const { token, tenantCode } = await this.getAuthParams();

      // If not in cache or expired, fetch from API
      const entityDefResponse = await this.entityService.getDefinition({
        entityDef: {
          id: entityDefId
        }
      }, token, tenantCode);

      if (!entityDefResponse?.entityDef) {
        return { entityDef: null, propertyDefs: [] };
      }

      const entityDef = entityDefResponse.entityDef;

      // Get property definitions
      const propertyDefResponse = await this.entityService.getDefinition({
        entityDef: {
          name: 'GsbPropertyDef'
        }
      }, token, tenantCode);

      const propertyDefs = propertyDefResponse?.entityDef?.properties || [];

      // Cache the results
      this.entityDefCache.set(entityDefId, {
        data: entityDef,
        timestamp: Date.now()
      });

      this.propertyDefCache.set(entityDefId, {
        data: propertyDefs,
        timestamp: Date.now()
      });

      // Set timeout to clear cache
      setTimeout(() => {
        this.entityDefCache.delete(entityDefId);
        this.propertyDefCache.delete(entityDefId);
      }, this.CACHE_DURATION);

      return { entityDef, propertyDefs };
    } catch (error) {
      console.error('Error fetching entity definition:', error);
      return { entityDef: null, propertyDefs: [] };
    }
  }

  public async getEntityDefWithPropertiesByName(entityDefName: string): Promise<{ entityDef: GsbEntityDef | null; propertyDefs: PropertyDefinition[] }> {
    try {
      // Check cache first
      const cachedEntityDef = this.entityDefCache.get(entityDefName);
      const cachedPropertyDefs = this.propertyDefCache.get(entityDefName);

      if (cachedEntityDef && cachedPropertyDefs && 
          Date.now() - cachedEntityDef.timestamp < this.CACHE_DURATION &&
          Date.now() - cachedPropertyDefs.timestamp < this.CACHE_DURATION) {
        return {
          entityDef: cachedEntityDef.data,
          propertyDefs: cachedPropertyDefs.data
        };
      }

      // Get auth params
      const { token, tenantCode } = await this.getAuthParams();

      // If not in cache or expired, fetch from API
      const entityDefResponse = await this.entityService.getDefinition({
        entityDef: {
          name: entityDefName
        }
      }, token, tenantCode);

      if (!entityDefResponse?.entityDef) {
        return { entityDef: null, propertyDefs: [] };
      }

      const entityDef = entityDefResponse.entityDef;

      // Get property definitions
      const propertyDefResponse = await this.entityService.getDefinition({
        entityDef: {
          name: 'GsbPropertyDef'
        }
      }, token, tenantCode);

      const propertyDefs = propertyDefResponse?.entityDef?.properties || [];

      // Cache the results
      this.entityDefCache.set(entityDefName, {
        data: entityDef,
        timestamp: Date.now()
      });

      this.propertyDefCache.set(entityDefName, {
        data: propertyDefs,
        timestamp: Date.now()
      });

      // Set timeout to clear cache
      setTimeout(() => {
        this.entityDefCache.delete(entityDefName);
        this.propertyDefCache.delete(entityDefName);
      }, this.CACHE_DURATION);

      return { entityDef, propertyDefs };
    } catch (error) {
      console.error('Error fetching entity definition:', error);
      return { entityDef: null, propertyDefs: [] };
    }
  }

  public async getEnum(enumId: string): Promise<GsbEnum | null> {
    try {
      // Check cache first
      const cached = this.enumCache.get(enumId);
      if (cached && Date.now() - cached.timestamp < this.enumCacheTimeout) {
        return cached.data;
      }

      // Get auth params
      const { token, tenantCode } = await this.getAuthParams();

      // If not in cache or expired, fetch from API
      const queryParams = new EntityQueryParams("GsbEnum");
      queryParams.where('id', enumId);
      queryParams.incS('values');

      const response = await this.entityService.query(queryParams, token, tenantCode);

      if (!response?.entities?.[0]) {
        return null;
      }

      const enumDef = response.entities[0] as GsbEnum;

      // Cache the result
      this.enumCache.set(enumId, {
        data: enumDef,
        timestamp: Date.now()
      });

      // Set timeout to clear cache
      setTimeout(() => {
        this.enumCache.delete(enumId);
      }, this.enumCacheTimeout);

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
        const queryParams = new EntityQueryParams(GsbEnum);
        queryParams
          .where('id', uncachedIds, QueryFunction.In)
          .incS('values');

        const response = await this.entityService.query(queryParams, getGsbToken(), getGsbTenantCode());

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

  public async getEntityDefinitions(): Promise<GsbEntityDef[]> {
    try {
      // Get auth params
      const { token, tenantCode } = await this.getAuthParams();

      // Query all entity definitions
      const queryParams = new EntityQueryParams('GsbEntityDef');
      queryParams.incS('properties');

      const response = await this.entityService.query(queryParams, token, tenantCode);

      if (!response?.entities) {
        return [];
      }

      return response.entities as GsbEntityDef[];
    } catch (error) {
      console.error('Error fetching entity definitions:', error);
      return [];
    }
  }
} 