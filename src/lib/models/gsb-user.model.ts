import { GsbFile } from './gsb-file.model';

/**
 * Represents a GSB User entity
 */
export interface GsbUser {
  id: string;
  name: string;
  variation?: any;
  token?: string;
  picture?: GsbFile;
  surname?: string;
  email?: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Role entity
 */
export interface GsbRole {
  id: string;
  name: string;
  users?: string[] | GsbUser[];
  positions?: string[];
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Position entity
 */
export interface GsbPosition {
  id: string;
  name: string;
  departments?: string[];
  users?: string[] | GsbUser[];
  roles?: string[] | GsbRole[];
  defaultDepartment_id?: string;
  defaultDepartment?: GsbDepartment;
  tanent_id?: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Department entity
 */
export interface GsbDepartment {
  id: string;
  name: string;
  positions?: string[] | GsbPosition[];
  defaultPosition?: GsbPosition;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents the type of permission
 */
export enum GsbPermissionType {
  Read = 1,
  Create = 2,
  Delete = 4,
  Edit = 8,
  Query = 16,
  Execute = 32
}

/**
 * Represents a GSB Permission entity
 */
export interface GsbPermission {
  id: string;
  name: string;
  users?: string[] | GsbUser[];
  roles?: string[] | GsbRole[];
  positions?: string[] | GsbPosition[];
  departments?: string[] | GsbDepartment[];
  entityDefs?: string[];
  query?: string;
  permissionType?: GsbPermissionType;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Position Token
 */
export interface GsbPosToken {
  jwtToken: string;
  positionName: string;
}
