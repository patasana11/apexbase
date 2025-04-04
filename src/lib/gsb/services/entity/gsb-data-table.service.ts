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
      let {
        page = 1,
        pageSize = 10,
        searchQuery,
        sortField,
        sortDirection = 'ASC',
        filters
      } = options;

      if(page < 1) {
        page = 1;
      }
      if(pageSize < 1) {
        pageSize = 10;
      }
      
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
   * Get data from the entity service
   * @param query The query parameters
   * @returns Promise with query results
   */
  getData(query: QueryParams<object>) {
    return this.entityService.query(query);
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

  /**
   * Save grid state
   * @param entityDefId The entity definition id
   * @param state The grid state to save
   * @param title The title for the saved view
   * @returns Promise with save response
   */
  async saveGridState(entityDefId: string, state: any, title: string) {
    try {
      
      const saveRequest: GsbSaveRequest = {
        entDefName: 'GsbUserQuery',
        entity: {
          title,
          query: JSON.stringify(state),
          type: 'grid_state',
          entityDefinition_id: entityDefId,
        }
      };

      return await this.entityService.save(saveRequest);
    } catch (error) {
      console.error('Error saving grid state:', error);
      throw error;
    }
  }

  /**
   * Load grid states
   * @param entityDefId The entity definition id
   * @returns Promise with grid states
   */
  async loadGridStates(entityDefId: string) {
    try {
      
      const queryParams = new QueryParams('GsbUserQuery');
      queryParams.where('entityDefinition_id', entityDefId);
      queryParams.queryType = QueryType.Full;

      const response = await this.entityService.query(queryParams);
      return response.entities || [];
    } catch (error) {
      console.error('Error loading grid states:', error);
      throw error;
    }
  }

  /**
   * Delete grid state
   * @param stateId The ID of the grid state to delete
   * @returns Promise with delete response
   */
  async deleteGridState(stateId: string) {
    try {
      const { token, tenantCode } = await this.cacheService.getAuthParams();
      
      const deleteRequest: GsbSaveRequest = {
        entDefName: 'GsbUserQuery',
        entityId: stateId
      };

      return await this.entityService.delete(deleteRequest, token, tenantCode);
    } catch (error) {
      console.error('Error deleting grid state:', error);
      throw error;
    }
  }
} 