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
