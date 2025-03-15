import { GsbEntityService } from '../gsb/services/gsb-entity.service';
import { GsbSaveRequest } from '../gsb/types/requests';
import { QueryParams } from '../gsb/types/query-params';
import { QueryFunction } from '../gsb/types/query';
import { getGsbToken, getGsbTenantCode } from '../config/gsb-config';
import { GsbWfFunction } from '../models/gsb-function.model';
import { setGsbCreateFields, setGsbUpdateFields, getGsbDateSortCols } from '../utils/gsb-utils';

/**
 * Service for managing Serverless Functions in the application
 */
export class FunctionService {
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbWfFunction';

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Get function by ID
   * @param id The function ID
   * @returns The function or null if not found
   */
  async getFunctionById(id: string): Promise<GsbWfFunction | null> {
    try {
      const func = await this.entityService.getById<GsbWfFunction>(
        this.ENTITY_NAME,
        id,
        getGsbToken(),
        getGsbTenantCode()
      );
      return func;
    } catch (error) {
      console.error('Error getting function by ID:', error);
      return null;
    }
  }

  /**
   * Get all functions with pagination
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of functions and the total count
   */
  async getFunctions(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ functions: GsbWfFunction[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbWfFunction>(this.ENTITY_NAME);

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      // Sort by last update date
      query.sortCols = getGsbDateSortCols();

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        functions: (response.entities || []) as GsbWfFunction[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error getting functions:', error);
      return { functions: [], totalCount: 0 };
    }
  }

  /**
   * Search for functions
   * @param searchTerm The search term
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of functions and the total count
   */
  async searchFunctions(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ functions: GsbWfFunction[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbWfFunction>(this.ENTITY_NAME);

      // Set search filter
      if (searchTerm) {
        query.filter = searchTerm;
      }

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        functions: (response.entities || []) as GsbWfFunction[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching functions:', error);
      return { functions: [], totalCount: 0 };
    }
  }

  /**
   * Create a new function
   * @param func The function to create
   * @returns The created function ID or null if failed
   */
  async createFunction(func: GsbWfFunction): Promise<string | null> {
    try {
      // Set defaults
      const newFunc: GsbWfFunction = {
        ...func,
        standalone: func.standalone ?? true
      };

      // Set create date fields
      const funcWithDates = setGsbCreateFields(newFunc);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: funcWithDates,
        entityDef: {},
        entityId: '',
        entDefId: '',
        query: []
      };

      const response = await this.entityService.save(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      if (!response.id) {
        return null;
      }

      return response.id;
    } catch (error) {
      console.error('Error creating function:', error);
      return null;
    }
  }

  /**
   * Update an existing function
   * @param func The function to update
   * @returns True if updated successfully, false otherwise
   */
  async updateFunction(func: GsbWfFunction): Promise<boolean> {
    try {
      if (!func.id) {
        throw new Error('Function ID is required for updates');
      }

      // Get existing function to merge data
      const existingFunc = await this.getFunctionById(func.id);
      if (!existingFunc) {
        throw new Error('Function not found');
      }

      const updatedFunc: GsbWfFunction = {
        ...existingFunc,
        ...func
      };

      // Set update date fields
      const funcWithDates = setGsbUpdateFields(updatedFunc);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: funcWithDates,
        entityDef: {},
        entityId: '',
        entDefId: '',
        query: []
      };

      const response = await this.entityService.save(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      return !!response.id;
    } catch (error) {
      console.error('Error updating function:', error);
      return false;
    }
  }

  /**
   * Delete a function
   * @param id The function ID to delete
   * @returns True if deleted successfully, false otherwise
   */
  async deleteFunction(id: string): Promise<boolean> {
    try {
      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entityId: id,
        entity: {},
        entityDef: {},
        entDefId: '',
        query: []
      };

      const response = await this.entityService.delete(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      return response.deleteCount === 1;
    } catch (error) {
      console.error('Error deleting function:', error);
      return false;
    }
  }

  /**
   * Execute a function
   * @param id The function ID to execute
   * @param params The parameters to pass to the function
   * @returns The result of the function execution
   */
  async executeFunction(id: string, params: any = {}): Promise<any> {
    try {
      const func = await this.getFunctionById(id);
      if (!func) {
        throw new Error('Function not found');
      }

      const request = {
        functionId: id,
        params: params
      };

      const response = await this.entityService.runWfFunction(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      return response;
    } catch (error) {
      console.error('Error executing function:', error);
      throw error;
    }
  }
}
