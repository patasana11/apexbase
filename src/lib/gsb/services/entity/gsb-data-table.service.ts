import { GsbEntityService } from './gsb-entity.service';
import { GsbEntityDef } from '../../models/gsb-entity-def.model';
import { QueryParams } from '../../types/query-params';
import { SingleQuery, QueryFunction, QueryRelation } from '../../types/query';
import { getGsbToken, getGsbTenantCode } from '../../config/gsb-config';
import { GsbSaveRequest } from '../../types/requests';

export interface DataTableQueryOptions {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export class GsbDataTableService {
  private entityService: GsbEntityService;

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Query entities for the data table
   * @param entityDef The entity definition
   * @param options Query options
   * @returns Promise with query results
   */
  async queryEntities(entityDef: GsbEntityDef, options: DataTableQueryOptions) {
    try {
      const queryParams = new QueryParams(entityDef.name);
      queryParams.startIndex = (options.page - 1) * options.pageSize;
      queryParams.count = options.pageSize;
      queryParams.calcTotalCount = true;

      // Add search query if provided
      if (options.searchQuery) {
        const searchableProps = entityDef.properties?.filter(p => p.isSearchable) || [];
        if (searchableProps.length > 0) {
          if (searchableProps.length > 1) {
            // Create a parent query with OR relation
            const parentQuery = new SingleQuery();
            parentQuery.relation = QueryRelation.Or;
            parentQuery.children = searchableProps.map(prop => 
              new SingleQuery(prop.name, options.searchQuery, QueryFunction.Like)
            );
            queryParams.query?.push(parentQuery);
          } else {
            // Single searchable property
            queryParams.query?.push(
              new SingleQuery(searchableProps[0].name, options.searchQuery, QueryFunction.Like)
            );
          }
        }
      }

      // Add filters if provided
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.query?.push(
              new SingleQuery(key, value, QueryFunction.Equals)
            );
          }
        });
      }

      // Add sorting if provided
      if (options.sortField) {
        queryParams.sortCols = [{
          col: {
            name: options.sortField
          },
          sortType: options.sortDirection || 'ASC'
        }];
      }

      // Execute query
      const result = await this.entityService.query(
        queryParams,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        data: result.entities || [],
        totalCount: result.totalCount || 0
      };
    } catch (error) {
      console.error('Error querying entities:', error);
      throw error;
    }
  }

  /**
   * Export entities to CSV
   * @param entityDef The entity definition
   * @param options Query options
   * @returns Promise with CSV data
   */
  async exportToCsv(entityDef: GsbEntityDef, options: DataTableQueryOptions) {
    try {
      // Get all data without pagination
      const result = await this.queryEntities(entityDef, {
        ...options,
        pageSize: 1000 // Get a larger chunk of data
      });

      // Convert to CSV
      const headers = entityDef.properties
        ?.filter(p => p.isListed)
        .map(p => p.title || p.name) || [];

      const rows = result.data.map(entity => 
        headers.map(header => {
          const prop = entityDef.properties?.find(p => p.title === header || p.name === header);
          if (!prop) return '';
          const value = entity[prop.name];
          return value?.toString() || '';
        })
      );

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Save entity data
   * @param entityDef The entity definition
   * @param data The entity data to save
   * @returns Promise with saved entity
   */
  async saveEntity(entityDef: GsbEntityDef, data: any) {
    try {
      const request = new GsbSaveRequest();
      request.entDefName = entityDef.name;
      request.entity = data;

      const result = await this.entityService.save(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      return result;
    } catch (error) {
      console.error('Error saving entity:', error);
      throw error;
    }
  }

  /**
   * Delete entity
   * @param entityDef The entity definition
   * @param entityId The entity ID to delete
   * @returns Promise
   */
  async deleteEntity(entityDef: GsbEntityDef, entityId: string) {
    try {
      const request = new GsbSaveRequest();
      request.entDefName = entityDef.name;
      request.entityId = entityId;

      await this.entityService.delete(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  }
} 