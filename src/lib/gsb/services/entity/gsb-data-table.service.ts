import { GsbEntityService } from './gsb-entity.service';
import { GsbEntityDef } from '../../models/gsb-entity-def.model';
import { QueryParams } from '../../types/query-params';
import { SingleQuery, QueryFunction, QueryRelation, QueryType } from '../../types/query';
import { getGsbToken, getGsbTenantCode } from '../../config/gsb-config';
import { GsbSaveRequest } from '../../types/requests';
import { GsbCacheService } from '../cache/gsb-cache.service';

export interface DataTableQueryOptions {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface DataTableResponse {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class GsbDataTableService {
  private static instance: GsbDataTableService;
  private entityService: GsbEntityService;
  private cacheService: GsbCacheService;

  private constructor() {
    this.entityService = GsbEntityService.getInstance();
    this.cacheService = GsbCacheService.getInstance();
  }

  public static getInstance(): GsbDataTableService {
    if (!GsbDataTableService.instance) {
      GsbDataTableService.instance = new GsbDataTableService();
    }
    return GsbDataTableService.instance;
  }

  /**
   * Get entity definition with properties
   * @param entityDefName The name of the entity definition
   * @returns Promise with entity definition and properties
   */
  public async getEntityDefinition(entityDefName: string) {
    return this.cacheService.getEntityDefWithPropertiesByName(entityDefName);
  }

  /**
   * Query entities for the data table with pagination and search
   * @param entityDefName The entity definition name
   * @param options Query options including pagination, search, and filtering
   * @returns Promise with query results and pagination info
   */
  async queryEntities(
    entityDefName: string,
    options: DataTableQueryOptions = {}
  ): Promise<DataTableResponse> {
    try {
      const {
        page = 1,
        pageSize = 10,
        searchQuery,
        sortField,
        sortDirection = 'ASC',
        filters
      } = options;

      // Get entity definition
      const { entityDef } = await this.getEntityDefinition(entityDefName);
      
      if (!entityDef) {
        throw new Error('Entity definition not found');
      }

      // Get auth params

      // Create query parameters
      const queryParams = new QueryParams(entityDefName);
      queryParams.queryType = QueryType.Full;

      // Add pagination
      queryParams.startIndex = (page - 1) * pageSize;
      queryParams.count = pageSize;
      queryParams.calcTotalCount = true;

      // Add search query if provided
      if (searchQuery) {
        queryParams.filter = searchQuery; // GSB handles search automatically
      }

      // Add sorting if provided
      if (sortField) {
        queryParams.sortCols = [{
          col: { name: sortField },
          sortType: sortDirection
        }];
      }

      // Add filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.where(key, value);
          }
        });
      }

      // Execute query
      const response = await this.entityService.query(queryParams);

      return {
        data: response.entities || [],
        totalCount: response.totalCount || 0,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error querying entities:', error);
      throw error;
    }
  }

  /**
   * Save entity changes
   * @param entityDefName The entity definition name
   * @param entity The entity data to save
   * @returns Promise with save response
   */
  async saveEntity(entityDefName: string, entity: any) {
    try {
      const { token, tenantCode } = await this.cacheService.getAuthParams();
      
      const saveRequest: GsbSaveRequest = {
        entDefName: entityDefName,
        entity
      };

      return await this.entityService.save(saveRequest, token, tenantCode);
    } catch (error) {
      console.error('Error saving entity:', error);
      throw error;
    }
  }

  /**
   * Delete entities
   * @param entityDefName The entity definition name
   * @param entityIds Array of entity IDs to delete
   * @returns Promise with delete response
   */
  async deleteEntities(entityDefName: string, entityIds: string[]) {
    try {
      const { token, tenantCode } = await this.cacheService.getAuthParams();
      
      const deleteRequest: GsbSaveRequest = {
        entDefName: entityDefName,
        entity: { ids: entityIds }
      };

      return await this.entityService.delete(deleteRequest, token, tenantCode);
    } catch (error) {
      console.error('Error deleting entities:', error);
      throw error;
    }
  }
} 