import { GsbEntityService } from '../gsb/services/gsb-entity.service';
import { GsbSaveRequest } from '../gsb/types/requests';
import { QueryParams } from '../gsb/types/query-params';
import { QueryFunction } from '../gsb/types/query';
import { getGsbToken, getGsbTenantCode } from '../config/gsb-config';
import { GsbPermission, GsbPermissionType } from '../models/gsb-user.model';
import { setGsbCreateFields, setGsbUpdateFields, getGsbDateSortCols } from '../utils/gsb-utils';

/**
 * Service for managing Permissions (Policies) in the application
 */
export class PermissionService {
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbPermission';

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Get permission by ID
   * @param id The permission ID
   * @returns The permission or null if not found
   */
  async getPermissionById(id: string): Promise<GsbPermission | null> {
    try {
      const permission = await this.entityService.getById<GsbPermission>(
        this.ENTITY_NAME,
        id,
        getGsbToken(),
        getGsbTenantCode()
      );
      return permission;
    } catch (error) {
      console.error('Error getting permission by ID:', error);
      return null;
    }
  }

  /**
   * Get all permissions with pagination
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of permissions and the total count
   */
  async getPermissions(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ permissions: GsbPermission[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbPermission>(this.ENTITY_NAME);

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      // Sort by creation date
      query.sortCols = getGsbDateSortCols();

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        permissions: (response.entities || []) as GsbPermission[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error getting permissions:', error);
      return { permissions: [], totalCount: 0 };
    }
  }

  /**
   * Search for permissions
   * @param searchTerm The search term
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of permissions and the total count
   */
  async searchPermissions(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ permissions: GsbPermission[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbPermission>(this.ENTITY_NAME);

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
        permissions: (response.entities || []) as GsbPermission[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching permissions:', error);
      return { permissions: [], totalCount: 0 };
    }
  }

  /**
   * Create a new permission
   * @param permission The permission to create
   * @returns The created permission ID or null if failed
   */
  async createPermission(permission: GsbPermission): Promise<string | null> {
    try {
      // Set create date fields
      const permissionWithDates = setGsbCreateFields(permission);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: permissionWithDates,
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
      console.error('Error creating permission:', error);
      return null;
    }
  }

  /**
   * Update an existing permission
   * @param permission The permission to update
   * @returns True if updated successfully, false otherwise
   */
  async updatePermission(permission: GsbPermission): Promise<boolean> {
    try {
      if (!permission.id) {
        throw new Error('Permission ID is required for updates');
      }

      // Get existing permission to merge data
      const existingPermission = await this.getPermissionById(permission.id);
      if (!existingPermission) {
        throw new Error('Permission not found');
      }

      const updatedPermission: GsbPermission = {
        ...existingPermission,
        ...permission
      };

      // Set update date fields
      const permissionWithDates = setGsbUpdateFields(updatedPermission);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: permissionWithDates,
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
      console.error('Error updating permission:', error);
      return false;
    }
  }

  /**
   * Delete a permission
   * @param id The permission ID to delete
   * @returns True if deleted successfully, false otherwise
   */
  async deletePermission(id: string): Promise<boolean> {
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
      console.error('Error deleting permission:', error);
      return false;
    }
  }

  /**
   * Get entity permissions
   * @param entityDefId The entity definition ID
   * @returns The entity permissions
   */
  async getEntityPermissions(entityDefId: string): Promise<GsbPermission[]> {
    try {
      const query = new QueryParams<GsbPermission>(this.ENTITY_NAME);

      // Add filter for entity definition
      query.query = [
        {
          propVal: {
            name: 'entityDefs',
            value: `%${entityDefId}%`
          },
          function: QueryFunction.Like
        }
      ];

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return (response.entities || []) as GsbPermission[];
    } catch (error) {
      console.error('Error getting entity permissions:', error);
      return [];
    }
  }

  /**
   * Get user permissions
   * @param userId The user ID
   * @returns The user permissions
   */
  async getUserPermissions(userId: string): Promise<GsbPermission[]> {
    try {
      const query = new QueryParams<GsbPermission>(this.ENTITY_NAME);

      // Add filter for user
      query.query = [
        {
          propVal: {
            name: 'users',
            value: `%${userId}%`
          },
          function: QueryFunction.Like
        }
      ];

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return (response.entities || []) as GsbPermission[];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get role permissions
   * @param roleId The role ID
   * @returns The role permissions
   */
  async getRolePermissions(roleId: string): Promise<GsbPermission[]> {
    try {
      const query = new QueryParams<GsbPermission>(this.ENTITY_NAME);

      // Add filter for role
      query.query = [
        {
          propVal: {
            name: 'roles',
            value: `%${roleId}%`
          },
          function: QueryFunction.Like
        }
      ];

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return (response.entities || []) as GsbPermission[];
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return [];
    }
  }
}
