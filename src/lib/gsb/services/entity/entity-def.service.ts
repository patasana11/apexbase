'use client';

import { GsbEntityDef, GsbProperty } from '../../models/gsb-entity-def.model';
import { GsbEntityService } from './gsb-entity.service';
import { GsbSaveRequest } from '../../types/requests';
import { QueryParams } from '../../types/query-params';
import { QueryFunction } from '../../types/query';
import { getGsbToken, getGsbTenantCode } from '../../config/gsb-config';
import { setGsbCreateFields, setGsbUpdateFields, getGsbDateSortCols } from '../../utils/gsb-utils';


/**
 * Service for managing Entity Definitions (Database Tables) in the application
 */
export class EntityDefService {
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbEntityDef';

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Get entity definition by ID
   * @param id The entity definition ID
   * @returns The entity definition or null if not found
   */
  async getEntityDefById(id: string): Promise<GsbEntityDef | null> {
    try {
      console.log('Getting entity definition by ID:', id);
      const entityDef = await this.entityService.getById<GsbEntityDef>(
        this.ENTITY_NAME,
        id,
        getGsbToken(),
        getGsbTenantCode()
      );
      console.log('Entity definition result:', entityDef);
      return entityDef;
    } catch (error) {
      console.error('Error getting entity definition by ID:', error);
      return null;
    }
  }

  /**
   * Get all entity definitions with pagination
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of entity definitions and the total count
   */
  async getEntityDefs(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ entityDefs: GsbEntityDef[]; totalCount: number }> {
    try {
      console.log(`Getting entity definitions - page: ${page}, pageSize: ${pageSize}`);

      const query = new QueryParams<GsbEntityDef>(this.ENTITY_NAME);

      const token = getGsbToken();
      const tenantCode = getGsbTenantCode();

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;
      
      console.log('Using token:', token ? 'Token available' : 'No token');
      console.log('Using tenant code:', tenantCode);

      const response = await this.entityService.query(
        query,
        token,
        tenantCode
      );

      console.log('Query response:', response ? 'Response received' : 'No response');
      console.log('Entity definitions count:', response.entities?.length || 0);
      console.log('Total count:', response.totalCount || 0);

      return {
        entityDefs: (response.entities || []) as GsbEntityDef[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error getting entity definitions:', error);
      // Log the error in more detail
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { entityDefs: [], totalCount: 0 };
    }
  }

  /**
   * Search for entity definitions
   * @param searchTerm The search term
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of entity definitions and the total count
   */
  async searchEntityDefs(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ entityDefs: GsbEntityDef[]; totalCount: number }> {
    try {
      console.log(`Searching entity definitions - term: "${searchTerm}", page: ${page}, pageSize: ${pageSize}`);

      const query = new QueryParams<GsbEntityDef>(this.ENTITY_NAME);

      // Set search filter
      if (searchTerm) {
        query.filter = searchTerm;
      }

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      console.log('Search query params:', JSON.stringify(query));

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      console.log('Search response:', response ? 'Response received' : 'No response');
      console.log('Search results count:', response.entities?.length || 0);
      console.log('Total count:', response.totalCount || 0);

      return {
        entityDefs: (response.entities || []) as GsbEntityDef[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching entity definitions:', error);
      // Log the error in more detail
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { entityDefs: [], totalCount: 0 };
    }
  }

  /**
   * Create a new entity definition
   * @param entityDef The entity definition to create
   * @returns The created entity definition ID or null if failed
   */
  async createEntityDef(entityDef: GsbEntityDef): Promise<string | null> {
    try {
      // Set defaults if not provided
      const newEntityDef: GsbEntityDef = {
        ...entityDef,
        isActive: entityDef.isActive ?? true,
        isDeleted: entityDef.isDeleted ?? false
      };

      // Set create date fields
      const entityWithDates = setGsbCreateFields(newEntityDef);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: entityWithDates,
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
      console.error('Error creating entity definition:', error);
      return null;
    }
  }

  /**
   * Update an existing entity definition
   * @param entityDef The entity definition to update
   * @returns True if updated successfully, false otherwise
   */
  async updateEntityDef(entityDef: GsbEntityDef): Promise<boolean> {
    try {
      if (!entityDef.id) {
        throw new Error('Entity definition ID is required for updates');
      }

      // Get existing entity definition to merge data
      const existingEntityDef = await this.getEntityDefById(entityDef.id);
      if (!existingEntityDef) {
        throw new Error('Entity definition not found');
      }

      const updatedEntityDef: GsbEntityDef = {
        ...existingEntityDef,
        ...entityDef
      };

      // Set update date fields
      const entityWithDates = setGsbUpdateFields(updatedEntityDef);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: entityWithDates,
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
      console.error('Error updating entity definition:', error);
      return false;
    }
  }

  /**
   * Delete an entity definition (soft delete)
   * @param id The entity definition ID to delete
   * @returns True if deleted successfully, false otherwise
   */
  async deleteEntityDef(id: string): Promise<boolean> {
    try {
      // Get existing entity definition
      const existingEntityDef = await this.getEntityDefById(id);
      if (!existingEntityDef) {
        throw new Error('Entity definition not found');
      }

      // Soft delete by updating isDeleted flag
      const updatedEntityDef: GsbEntityDef = {
        ...existingEntityDef,
        isDeleted: true
      };


      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entityId: id,
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
      console.error('Error deleting entity definition:', error);
      return false;
    }
  }

  /**
   * Get entity definition properties
   * @param entityDefId The entity definition ID
   * @returns The entity definition properties
   */
  async getEntityDefProperties(entityDefId: string): Promise<GsbProperty[] | null> {
    try {
      const entityDef = await this.getEntityDefById(entityDefId);
      if (!entityDef) {
        throw new Error('Entity definition not found');
      }

      return entityDef.properties || [];
    } catch (error) {
      console.error('Error getting entity definition properties:', error);
      return null;
    }
  }
}
