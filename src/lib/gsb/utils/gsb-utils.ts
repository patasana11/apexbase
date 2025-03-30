'use client';

/**
 * Utility functions for working with GSB entities
 */

/**
 * Standard GSB date field names
 */
export const GSB_DATE_FIELDS = {
  CREATE_DATE: 'createDate',
  LAST_UPDATE_DATE: 'lastUpdateDate',
  CREATED_BY_ID: 'createdBy_id',
  LAST_UPDATED_BY_ID: 'lastUpdatedBy_id'
};

/**
 * Sets the standard date fields for a new GSB entity
 * @param entity The entity to update
 * @returns The entity with standard date fields set
 */
export function setGsbCreateFields<T extends Record<string, any>>(entity: T): T {
  return {
    ...entity,
    [GSB_DATE_FIELDS.CREATE_DATE]: new Date(),
    [GSB_DATE_FIELDS.LAST_UPDATE_DATE]: new Date()
  };
}

/**
 * Updates the standard date fields for an existing GSB entity
 * @param entity The entity to update
 * @returns The entity with updated date fields
 */
export function setGsbUpdateFields<T extends Record<string, any>>(entity: T): T {
  return {
    ...entity,
    [GSB_DATE_FIELDS.LAST_UPDATE_DATE]: new Date()
  };
}

/**
 * Gets the correct sorting configuration for GSB entities
 * @param sortByCreateDate Whether to sort by creation date (true) or last update date (false)
 * @param ascending Whether to sort in ascending order
 * @returns The sort columns configuration for GSB queries
 */
export function getGsbDateSortCols(sortByCreateDate = false, ascending = false) {
  return [
    {
      col: {
        name: sortByCreateDate ? GSB_DATE_FIELDS.CREATE_DATE : GSB_DATE_FIELDS.LAST_UPDATE_DATE
      },
      sortType: ascending ? 'ASC' : 'DESC'
    }
  ];
}

/**
 * Utility class for GSB operations
 */
export class GsbUtils {
  /**
   * Checks if an ID is empty (null, undefined, or empty GUID)
   * @param id The ID to check
   * @returns true if the ID is empty, false otherwise
   */
  public static isIdEmpty(id: string | null | undefined): boolean {
    if (!id) return true;
    
    // Check for empty GUID (all zeros)
    const emptyGuidRegex = /^[0-]{36}$/;
    return emptyGuidRegex.test(id);
  }

  /**
   * Checks if an ID is valid (not empty and not an empty GUID)
   * @param id The ID to check
   * @returns true if the ID is valid, false otherwise
   */
  public static isValidId(id: string | null | undefined): boolean {
    return !this.isIdEmpty(id);
  }

  /**
   * Checks if an array of IDs contains any empty IDs
   * @param ids Array of IDs to check
   * @returns true if any ID is empty, false otherwise
   */
  public static hasEmptyIds(ids: (string | null | undefined)[]): boolean {
    return ids.some(id => this.isIdEmpty(id));
  }

  /**
   * Filters out empty IDs from an array
   * @param ids Array of IDs to filter
   * @returns Array of valid IDs
   */
  public static filterEmptyIds(ids: (string | null | undefined)[]): string[] {
    return ids.filter(id => this.isValidId(id)) as string[];
  }
}
