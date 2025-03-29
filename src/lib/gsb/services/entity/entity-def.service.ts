'use client';

import { GsbEntityDef, GsbProperty, PropertyDefinition } from '../../models/gsb-entity-def.model';
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
   * @returns The created entity definition ID
   * @throws Error with message from API if the request fails
   */
  async createEntityDef(entityDef: GsbEntityDef): Promise<string> {
    try {
      // Validate entity definition has required properties
      this.validateEntityDefProperties(entityDef);

      // Set defaults if not provided
      const newEntityDef: GsbEntityDef = {
        ...entityDef,
        isActive: entityDef.isActive ?? true,
        isDeleted: entityDef.isDeleted ?? false
      };

      // Note: We don't set create/update date fields as the GSB system handles these automatically
      // const entityWithDates = setGsbCreateFields(newEntityDef);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: newEntityDef,
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

      if (!response) {
        throw new Error('No response received from the server');
      }

      if (!response.id) {
        // Check for error message in response - GsbSaveResponse only has 'message', not 'error'
        const errorMsg = response.message || 'Failed to create entity definition';
        throw new Error(errorMsg);
      }

      return response.id;
    } catch (error) {
      console.error('Error creating entity definition:', error);
      // Propagate the error message to be handled by the UI
      throw error;
    }
  }

  /**
   * Validates that entity definition contains required properties (at least id and title)
   * @param entityDef The entity definition to validate
   * @throws Error if validation fails
   */
  private validateEntityDefProperties(entityDef: GsbEntityDef): void {
    if (!entityDef.properties || entityDef.properties.length === 0) {
      throw new Error('Entity definition must have at least id and title properties');
    }

    const hasIdProperty = entityDef.properties.some(prop => prop.name === 'id');
    const hasTitleProperty = entityDef.properties.some(prop => prop.name === 'title');

    if (!hasIdProperty || !hasTitleProperty) {
      throw new Error('Entity definition must have at least id and title properties');
    }
  }

  /**
   * Get default properties for a new entity definition.
   * Note: lastUpdateDate and createDate properties are included here for display in the UI
   * but the actual values of these fields are automatically managed by the GSB system.
   * 
   * @param defName The name of the entity definition
   * @returns Array of default GsbProperty objects
   */
  getDefaultProperties(defName: string): GsbProperty[] {
    return [
      {
        "name": "id",
        "title": "Id",
        "isSearchable": false,
        "isUnique": true,
        "isListed": false,
        "isPrimaryKey": true,
        "isIndexed": true,
        "formModes": 263172,
        "updateFormMode": 4,
        "viewFormMode": 4,
        "createFormMode": 4,
        "definition_id": "5C0AA76F-9C32-4E7E-A4BC-B56E93877883",
        "orderNumber": 0
      },
      {
        "name": "title",
        "title": "Title",
        "isRequired": false,
        "isSearchable": true,
        "isMultiLingual": true,
        "listScreens": 7,
        "definition_id": "C6C34BF3-F51B-4E69-A689-B09847BE74B9",
        "formModes": 66049,
        "updateFormMode": 1,
        "viewFormMode": 2,
        "createFormMode": 1,
        "orderNumber": 2
      },
      {
        "name": "createdBy",
        "title": "Created By",
        "listScreens": 7,
        "formModes": 262658,
        "updateFormMode": 2,
        "viewFormMode": 2,
        "createFormMode": 4,
        "definition_id": "924ACBA8-58C5-4881-940D-472EC01EBA5F",
        "refType": 2,
        "refEntPropName": ("created" + defName),
        "refEntDef_id": "98CDC0E8-58D6-4923-B22E-591430E52606",
        "orderNumber": 3
      },
      {
        "name": "lastUpdatedBy",
        "title": "Last Updated By",
        "isListed": false,
        "formModes": 262658,
        "updateFormMode": 2,
        "viewFormMode": 2,
        "createFormMode": 4,
        "definition_id": "924ACBA8-58C5-4881-940D-472EC01EBA5F",
        "refType": 2,
        "refEntPropName": ("updated" + defName),
        "refEntDef_id": "98CDC0E8-58D6-4923-B22E-591430E52606",
        "orderNumber": 4
      },
      {
        "name": "lastUpdateDate",
        "title": "Last Update Date",
        "isListed": false,
        "formModes": 262658,
        "updateFormMode": 2,
        "viewFormMode": 2,
        "createFormMode": 4,
        "definition_id": "12E647E0-EBD2-4EC2-A4E3-82C1DFE07DA2",
        "orderNumber": 5
      },
      {
        "name": "createDate",
        "title": "Create Date",
        "listScreens": 7,
        "formModes": 262658,
        "updateFormMode": 2,
        "viewFormMode": 2,
        "createFormMode": 4,
        "definition_id": "12E647E0-EBD2-4EC2-A4E3-82C1DFE07DA2",
        "orderNumber": 6
      }
    ];
  }

  /**
   * Update an existing entity definition
   * @param entityDef The entity definition to update
   * @returns True if updated successfully, false otherwise
   * @throws Error with message from API if the request fails
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

      // Note: We don't set lastUpdateDate as the GSB system handles it automatically

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: updatedEntityDef,
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

      if (!response) {
        throw new Error('No response received from the server');
      }

      if (!response.id) {
        const errorMsg = response.message || 'Failed to update entity definition';
        throw new Error(errorMsg);
      }

      return true;
    } catch (error) {
      console.error('Error updating entity definition:', error);
      throw error;
    }
  }

  /**
   * Delete an entity definition (soft delete)
   * @param id The entity definition ID to delete
   * @returns True if deleted successfully
   * @throws Error with message from API if the request fails
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
        entity: updatedEntityDef,
        entityDef: {},
        entityId: id,
        entDefId: '',
        query: []
      };

      const response = await this.entityService.save(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      if (!response) {
        throw new Error('No response received from the server');
      }

      if (!response.id) {
        const errorMsg = response.message || 'Failed to delete entity definition';
        throw new Error(errorMsg);
      }

      return true;
    } catch (error) {
      console.error('Error deleting entity definition:', error);
      throw error;
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

  /**
   * Check uniqueness of name and dbTableName
   * @param nameToCheck The name to check for uniqueness
   * @returns Matching entity defs with only name and dbTableName fields
   */
  async checkNameUniqueness(
    nameToCheck: string
  ): Promise<{ entityDefs: Pick<GsbEntityDef, 'name' | 'dbTableName' | 'id'>[]; totalCount: number }> {
    try {
      console.log(`Checking uniqueness for: "${nameToCheck}"`);

      const query = new QueryParams<GsbEntityDef>(this.ENTITY_NAME);

      // Set search filter
      if (nameToCheck) {
        query.filter = nameToCheck;
      }

      // Only select name and dbTableName fields for efficiency
      query.select(['name', 'dbTableName', 'id']);
      
      // Set pagination - only need a few results
      query.startIndex = 0;
      query.count = 20;
      query.calcTotalCount = true;

      console.log('Uniqueness check query params:', JSON.stringify(query));

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        entityDefs: (response.entities || []) as Pick<GsbEntityDef, 'name' | 'dbTableName' | 'id'>[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error checking name uniqueness:', error);
      return { entityDefs: [], totalCount: 0 };
    }
  }

  /**
   * Get property definitions from the GSB system
   * @returns Promise with the property definitions
   */
  async getPropertyDefinitions(): Promise<PropertyDefinition[]> {
    try {
      const response = await this.entityService.getDefinition({
        entityDef: {
          name: 'GsbPropertyDef'
        }
      });
      return response.entityDef?.properties || [];
    } catch (error) {
      console.error('Error getting property definitions:', error);
      return [];
    }
  }
}

/**
 * Note: Do not set 'createDate' or 'lastUpdateDate' fields manually.
 * The GSB system will automatically handle these fields and will ignore any values 
 * provided for them. The server is the source of truth for these timestamps.
 */
