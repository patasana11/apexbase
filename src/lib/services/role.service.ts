import { GsbEntityService } from '../gsb/services/gsb-entity.service';
import { GsbSaveRequest } from '../gsb/types/requests';
import { QueryParams } from '../gsb/types/query-params';
import { QueryFunction } from '../gsb/types/query';
import { getGsbToken, getGsbTenantCode } from '../config/gsb-config';
import { GsbRole, GsbUser } from '../models/gsb-user.model';
import { setGsbCreateFields, setGsbUpdateFields, getGsbDateSortCols } from '../utils/gsb-utils';

/**
 * Service for managing Roles in the application
 */
export class RoleService {
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbRole';

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Get role by ID
   * @param id The role ID
   * @returns The role or null if not found
   */
  async getRoleById(id: string): Promise<GsbRole | null> {
    try {
      const role = await this.entityService.getById<GsbRole>(
        this.ENTITY_NAME,
        id,
        getGsbToken(),
        getGsbTenantCode()
      );
      return role;
    } catch (error) {
      console.error('Error getting role by ID:', error);
      return null;
    }
  }

  /**
   * Get all roles with pagination
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of roles and the total count
   */
  async getRoles(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ roles: GsbRole[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbRole>(this.ENTITY_NAME);

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
        roles: (response.entities || []) as GsbRole[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error getting roles:', error);
      return { roles: [], totalCount: 0 };
    }
  }

  /**
   * Search for roles
   * @param searchTerm The search term
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of roles and the total count
   */
  async searchRoles(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ roles: GsbRole[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbRole>(this.ENTITY_NAME);

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
        roles: (response.entities || []) as GsbRole[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching roles:', error);
      return { roles: [], totalCount: 0 };
    }
  }

  /**
   * Create a new role
   * @param role The role to create
   * @returns The created role ID or null if failed
   */
  async createRole(role: GsbRole): Promise<string | null> {
    try {
      // Set create date fields
      const roleWithDates = setGsbCreateFields(role);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: roleWithDates,
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
      console.error('Error creating role:', error);
      return null;
    }
  }

  /**
   * Update an existing role
   * @param role The role to update
   * @returns True if updated successfully, false otherwise
   */
  async updateRole(role: GsbRole): Promise<boolean> {
    try {
      if (!role.id) {
        throw new Error('Role ID is required for updates');
      }

      // Get existing role to merge data
      const existingRole = await this.getRoleById(role.id);
      if (!existingRole) {
        throw new Error('Role not found');
      }

      const updatedRole: GsbRole = {
        ...existingRole,
        ...role
      };

      // Set update date fields
      const roleWithDates = setGsbUpdateFields(updatedRole);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: roleWithDates,
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
      console.error('Error updating role:', error);
      return false;
    }
  }

  /**
   * Delete a role
   * @param id The role ID to delete
   * @returns True if deleted successfully, false otherwise
   */
  async deleteRole(id: string): Promise<boolean> {
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
      console.error('Error deleting role:', error);
      return false;
    }
  }

  /**
   * Get users in a role
   * @param roleId The role ID
   * @returns Array of users in the role
   */
  async getUsersInRole(roleId: string): Promise<GsbUser[]> {
    try {
      const role = await this.getRoleById(roleId);
      if (!role || !role.users || !Array.isArray(role.users)) {
        return [];
      }

      // If users are already GsbUser objects, return them
      if (role.users.length > 0 && typeof role.users[0] === 'object') {
        return role.users as GsbUser[];
      }

      // Otherwise, fetch the users by ID
      const userIds = role.users as string[];
      const users: GsbUser[] = [];

      for (const userId of userIds) {
        const user = await this.entityService.getById<GsbUser>(
          'GsbUser',
          userId,
          getGsbToken(),
          getGsbTenantCode()
        );

        if (user) {
          users.push(user);
        }
      }

      return users;
    } catch (error) {
      console.error('Error getting users in role:', error);
      return [];
    }
  }

  /**
   * Add a user to a role
   * @param roleId The role ID
   * @param userId The user ID
   * @returns True if added successfully, false otherwise
   */
  async addUserToRole(roleId: string, userId: string): Promise<boolean> {
    try {
      const role = await this.getRoleById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Update the role's users array
      const users = role.users || [];
      if (Array.isArray(users)) {
        // Check if the user is already in the role
        if (users.includes(userId)) {
          return true; // User is already in the role
        }

        // Add the user to the role
        users.push(userId);
      } else {
        role.users = [userId];
      }

      return await this.updateRole(role);
    } catch (error) {
      console.error('Error adding user to role:', error);
      return false;
    }
  }

  /**
   * Remove a user from a role
   * @param roleId The role ID
   * @param userId The user ID
   * @returns True if removed successfully, false otherwise
   */
  async removeUserFromRole(roleId: string, userId: string): Promise<boolean> {
    try {
      const role = await this.getRoleById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Update the role's users array
      if (Array.isArray(role.users)) {
        role.users = role.users.filter(id => id !== userId);
      }

      return await this.updateRole(role);
    } catch (error) {
      console.error('Error removing user from role:', error);
      return false;
    }
  }
}
