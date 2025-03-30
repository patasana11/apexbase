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
 * Enum for data types that matches backend values
 */
export enum DataType {
  Unknown = 0,
  Guid = 1,
  Decimal = 2,
  Int = 3,
  Long = 4,
  StringUnicode = 5,
  Binary = 6,
  Bool = 7,
  Enum = 8,
  DateTime = 9,
  Reference = 10,
  Raw = 11,
  File = 12,
  StringASCII = 13,
  JSON = 14
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
  isMultiple: any;
  isSystem: boolean;
  id: string;
  name: string;
  title: string;
  description?: string;
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
  enum_id?: string;
  formModes?: number;
  updateFormMode?: number;
  viewFormMode?: number;
  createFormMode?: number;
  listScreens?: number;
  orderNumber?: number;
  definition?: GsbPropertyDef;
}

/**
 * Represents a property definition in the GSB system
 */
export interface GsbPropertyDef {
  id: string;
  dataType: DataType;
  title: string;
  name: string;
  description?: string;
  maxLength?: number;
  scale?: number;
  regex?: string;
  usage?: number;
  createDate?: Date;
  lastUpdateDate?: Date;
  lastUpdatedBy?: {
    title: string;
    id: string;
  };
  defaultControlComponent?: {
    title: string;
    id: string;
  };
  defaultControlComponentMulti?: {
    title: string;
    id: string;
  };
  module?: {
    title: string;
    id: string;
  };
  createdBy?: {
    title: string;
    id: string;
  };
}
