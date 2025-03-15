/**
 * Represents a GSB Entity Definition
 */
export interface GsbEntityDef {
  id: string;
  name: string;
  dbTableName?: string;
  securityLevel?: 'Authorized' | 'SuperSafe' | 'Public';
  properties?: GsbProperty[];
  isActive?: boolean;
  isDeleted?: boolean;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a property of a GSB Entity Definition
 */
export interface GsbProperty {
  id?: string;
  name: string;
  definition_id: string;
  isRequired?: boolean;
  isIndexed?: boolean;
  isPrimaryKey?: boolean;
  isPartialPrimaryKey?: boolean;
  isUnique?: boolean;
  isEncrypted?: boolean;
  isSearchable?: boolean;
  maxLength?: number;
  scale?: number;
  defaultValue?: any;
  refType?: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  refEntDef_id?: string;
  refEntPropName?: string;
  cascadeReference?: boolean;
}
