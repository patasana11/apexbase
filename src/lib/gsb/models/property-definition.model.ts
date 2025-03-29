import { RefType } from './gsb-entity-def.model';

/**
 * Represents a property definition in the GSB system
 */
export interface PropertyDefinition {
  id: string;
  dataType: string;
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
  isSearchable?: boolean;
  isListed?: boolean;
  isMultiLingual?: boolean;
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
} 