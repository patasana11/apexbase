import { GsbEntityDef } from '../../models/gsb-entity-def.model';
import { GsbEntityService } from '../entity/gsb-entity.service';
import { PropertyDefinition } from '../../models/property-definition.model';
import { GsbEnum } from '../../models/gsb-enum.model';
import { getGsbToken, getGsbTenantCode } from '../../config/gsb-config';
import { GSB_CONFIG } from '../../config/gsb-config';
import { EntityQueryParams } from '../../types/query-params';

export class GsbCacheService {
  private static instance: GsbCacheService;
  private entityDefCache: Map<string, { data: GsbEntityDef; timestamp: number }> = new Map();
  private propertyDefCache: Map<string, { data: PropertyDefinition[]; timestamp: number }> = new Map();
  private enumCache: Map<string, { data: GsbEnum; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private enumCacheTimeout = 5 * 60 * 1000; // 5 minutes
  private entityService: GsbEntityService;

  private constructor() {
    this.entityService = GsbEntityService.getInstance();
  }

  public static getInstance(): GsbCacheService {
    if (!GsbCacheService.instance) {
      GsbCacheService.instance = new GsbCacheService();
    }
    return GsbCacheService.instance;
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

      // If not in cache or expired, fetch from API
      const entityDefResponse = await this.entityService.getDefinition({
        entityDef: {
          id: entityDefId
        }
      }, getGsbToken(), getGsbTenantCode());

      if (!entityDefResponse?.entityDef) {
        return { entityDef: null, propertyDefs: [] };
      }

      const entityDef = entityDefResponse.entityDef;

      // Get property definitions
      const propertyDefResponse = await this.entityService.getDefinition({
        entityDef: {
          name: 'GsbPropertyDef'
        }
      }, getGsbToken(), getGsbTenantCode());

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

  public async getEnum(enumId: string): Promise<GsbEnum | null> {
    try {
      // Check cache first
      const cached = this.enumCache.get(enumId);
      if (cached && Date.now() - cached.timestamp < this.enumCacheTimeout) {
        return cached.data;
      }

      // If not in cache or expired, fetch from API
      const queryParams = new EntityQueryParams(GsbEnum);
      queryParams
        .prop(item => item.id)
        .isEqual(enumId);
      queryParams.incS('values');

      const response = await this.entityService.query(queryParams, getGsbToken(), getGsbTenantCode());

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
          .prop(item => item.id)
          .in(uncachedIds);
        queryParams.incS('values');

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
} 