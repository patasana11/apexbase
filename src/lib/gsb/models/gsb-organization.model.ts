/**
 * Represents a contact in the system
 */
export interface GsbContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a user group in the system
 */
export interface GsbGroup {
  id: string;
  name: string;
  description?: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a role in the system
 */
export interface GsbRole {
  id: string;
  name: string;
  description?: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
} 