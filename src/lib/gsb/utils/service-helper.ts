'use client';

import { getGsbToken, getGsbTenantCode } from '../config/gsb-config';
import { QueryParams } from '../types/query-params';
import { QueryFunction, SortCol, WhereClause } from '../types/query';
import { GsbSaveRequest } from '../types/requests';
import { getGsbDateSortCols } from './gsb-utils';
import { logger } from './logger';

/**
 * ServiceHelper provides common utility functions for GSB services.
 * It standardizes operations like query preparation, entity validation, etc.
 */
export class ServiceHelper {
  /**
   * Prepares a standard query with pagination, sorting, and tenant info
   *
   * @param entity - Entity name to query
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @param whereClauses - Optional where clauses for filtering
   * @param sortCols - Optional sort columns (defaults to lastUpdateDate desc)
   * @param selectCols - Optional columns to select
   * @param calcTotalCount - Whether to calculate total count (default: true)
   * @returns Prepared QueryParams object
   */
  static prepareQuery(
    entity: string,
    page: number = 1,
    pageSize: number = 10,
    whereClauses: WhereClause[] = [],
    sortCols?: SortCol[],
    selectCols?: string[],
    calcTotalCount: boolean = true
  ): QueryParams {
    // Create base query
    const query: QueryParams = {
      entity,
      whereClauses,
      selectCols,
    };

    // Set pagination
    query.startIndex = (page - 1) * pageSize;
    query.count = pageSize;
    query.calcTotalCount = calcTotalCount;

    // Sort by lastUpdateDate desc by default
    query.sortCols = sortCols || getGsbDateSortCols();

    logger.debug('Prepared query params:', JSON.stringify(query));

    return query;
  }

  /**
   * Prepares a standard save request with tenant information
   *
   * @param entity - Entity name to save
   * @param data - Entity data to save
   * @param isNew - Whether this is a new entity
   * @returns Prepared GsbSaveRequest object
   */
  static prepareSaveRequest(
    entity: string,
    data: any,
    isNew: boolean = false
  ): GsbSaveRequest {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    // Create standard save request
    const saveRequest: GsbSaveRequest = {
      entity,
      data,
      token,
      tenantCode,
    };

    logger.debug(`Prepared save request for ${entity}:`,
      isNew ? 'Creating new entity' : `Updating entity ID: ${data.id}`);

    return saveRequest;
  }

  /**
   * Gets authorization header with GSB token
   *
   * @returns Authorization header or undefined if no token
   */
  static getAuthHeader(): { Authorization: string } | undefined {
    const token = getGsbToken();

    if (!token) {
      logger.warn('No GSB token found for request');
      return undefined;
    }

    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Gets tenant information for a request
   *
   * @returns Tenant code or undefined if no tenant
   */
  static getTenantInfo(): string | undefined {
    return getGsbTenantCode();
  }

  /**
   * Validates if a user has permission to access a resource
   *
   * @param permissionKey - The permission key to check
   * @param userPermissions - The user's permissions
   * @returns True if user has permission, false otherwise
   */
  static hasPermission(
    permissionKey: string,
    userPermissions: string[]
  ): boolean {
    if (!userPermissions || userPermissions.length === 0) {
      logger.warn(`Permission check failed: No permissions provided for key ${permissionKey}`);
      return false;
    }

    const hasPermission = userPermissions.includes(permissionKey);

    if (!hasPermission) {
      logger.warn(`Permission denied: ${permissionKey} not found in user permissions`);
    }

    return hasPermission;
  }

  /**
   * Prepares a function execution query
   *
   * @param functionName - Function name to execute
   * @param params - Function parameters
   * @returns Prepared QueryFunction object
   */
  static prepareFunctionQuery(
    functionName: string,
    params: Record<string, any> = {}
  ): QueryFunction {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    const query: QueryFunction = {
      name: functionName,
      params,
      token,
      tenantCode,
    };

    logger.debug(`Prepared function query for ${functionName}:`, JSON.stringify(params));

    return query;
  }
}
