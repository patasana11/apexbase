/**
 * Enum for reference types that matches backend values
 */
export enum RefType {
  NoRef = 0,
  OneToOne = 1,
  OneToMany = 2,
  ManyToOne = 3,
  ManyToMany = 4
}

/**
 * Enum for activity logging levels that matches backend values
 */
export enum ActivityLogLevel {
  None = 0,
  Read = 1,
  Create = 2,
  Update = 4,
  Delete = 8,
  Execute = 16,
  List = 32
}

/**
 * Represents a GSB Entity Definition
 */
export interface GsbEntityDef {
  id: string;
  name: string;
  title?: string;
  description?: string;
  dbTableName?: string;
  publicAccess?: boolean;
  activityLogLevel?: ActivityLogLevel;
  properties?: GsbProperty[];
  isActive?: boolean;
  isDeleted?: boolean;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
  permissions?: {
  };
}

/**
 * Represents a property of a GSB Entity Definition
 */
export interface GsbProperty {
  id?: string;
  name: string;
  title?: string;
  definition_id: string;
  isRequired?: boolean;
  isIndexed?: boolean;
  isPrimaryKey?: boolean;
  isPartialPrimaryKey?: boolean;
  isUnique?: boolean;
  isEncrypted?: boolean;
  isSearchable?: boolean;
  isListed?: boolean;
  isMultiLingual?: boolean;
  maxLength?: number;
  scale?: number;
  defaultValue?: any;
  refType?: RefType;
  refEntDef_id?: string;
  refEntPropName?: string;
  cascadeReference?: boolean;
  formModes?: number;
  updateFormMode?: number;
  viewFormMode?: number;
  createFormMode?: number;
  listScreens?: number;
  orderNumber?: number;
}
