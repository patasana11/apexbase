/**
 * Represents a query for retrieving entities
 */
export interface QueryDto {
  filter?: string;
  startIndex?: number;
  count?: number;
  sortCols?: string[];
  sortDirs?: string[];
  selectCols?: string[];
  groupByCols?: string[];
  calcTotalCount?: boolean;
  query?: any[];
} 