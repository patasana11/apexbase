import { GsbUser } from './gsb-user.model';
import { GsbEnum } from './gsb-enum.model';
import { GsbPermission } from './gsb-user.model';

/**
 * Represents a widget template for UI controls
 */
export interface GsbWidgetTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  type: string;
  properties?: any;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a code generator for entity properties
 */
export interface GsbCodeGenerator {
  id: string;
  name: string;
  title: string;
  description?: string;
  code: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

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
 * Enum for view modes
 */
export enum ViewMode {
  Disabled = 8,
  Editable = 1,
  ReadOnly = 2,
  Hidden = 4
}

/**
 * Enum for copy actions
 */
export enum CopyAction {
  Default = 0,
  Include = 1,
  Exclude = 2,
  Reference = 3
}

/**
 * Enum for screen types (bitwise)
 */
export enum ScreenType {
  PC = 1,
  Tablet = 2,
  Mobile = 4
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
  id?: string;
  name?: string;
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
export class GsbProperty {
  constructor() {
    // Initialize default values
    this.maxLength = 0;
    this.isVisible = true;
    this.lastEditTime = new Date();
    this.createFormMode = ViewMode.Editable;
    this.isUnique = false;
    this.defaultValue = '';
    this.refEntDef_id = '';
    this.refCount = 0;
    this.isPartialPrimaryKey = false;
    this.cascadeReference = false;
    this.isEncrypted = false;
    this.name = '';
    this.scale = 0;
    this.multiControlComponent_id = '';
    this.refType = RefType.NoRef;
    this.clientValidationScript = '';
    this.dataMemberName = '';
    this.isMultiple = false;
    this.groupName = '';
    this.isIndexed = false;
    this.isMultiLingual = false;
    this.controlComponent_id = '';
    this.refEntPropName = '';
    this.fullTextIndex = false;
    this.categoryDef_id = '';
    this.formModes = 0;
    this.noDeploy = false;
    this.id = '';
    this.definition_id = '';
    this.ownerEntDef_id = '';
    this.isEditable = true;
    this.isQuickEditable = false;
    this.createdBy_id = '';
    this.permissions = [];
    this.contains = [];
    this.multiTableName = '';
    this.orderNumber = 0;
    this.enum_id = '';
    this.description = '';
    this.title = '';
    this.viewFormMode = ViewMode.Editable;
    this.serverValidationScript = '';
    this.lastUpdateDate = new Date();
    this.createDate = new Date();
    this.codeGenerator_id = '';
    this.isSystemOnly = false;
    this.copyAction = CopyAction.Default;
    this.isRequired = false;
    this.isSearchable = false;
    this.isPublic = false;
    this.undeletable = false;
    this.listScreens = ScreenType.PC;
    this.lastUpdatedBy_id = '';
    this.defUiCtrlName = '';
    this.within_id = '';
    this.isPrimaryKey = false;
    this.isDynamic = false;
    this.updateFormMode = ViewMode.Editable;
    this.isListed = false;
    this.availableColumn = '';
    this.regex = '';
  }

  public maxLength: number;
  public isVisible: boolean;
  public lastEditTime: Date;
  public createFormMode: ViewMode;
  public isUnique: boolean;
  public defaultValue: string;
  public refEntDef_id: string;
  public multiControlComponent?: GsbWidgetTemplate;
  public definition?: GsbPropertyDef;
  public refCount: number;
  public isPartialPrimaryKey: boolean;
  public enum?: GsbEnum;
  public cascadeReference: boolean;
  public isEncrypted: boolean;
  public name: string;
  public scale: number;
  public multiControlComponent_id: string;
  public refType: RefType;
  public refEntDef?: GsbEntityDef;
  public clientValidationScript: string;
  public dataMemberName: string;
  public isMultiple: boolean;
  public groupName: string;
  public isIndexed: boolean;
  public isMultiLingual: boolean;
  public controlComponent_id: string;
  public refEntPropName: string;
  public fullTextIndex: boolean;
  public categoryDef_id: string;
  public formModes: number;
  public noDeploy: boolean;
  public id: string;
  public definition_id: string;
  public ownerEntDef_id: string;
  public isEditable: boolean;
  public isQuickEditable: boolean;
  public ownerEntDef?: GsbEntityDef;
  public createdBy_id: string;
  public permissions: GsbPermission[];
  public codeGenerator?: GsbCodeGenerator;
  public contains: GsbProperty[];
  public within?: GsbProperty;
  public multiTableName: string;
  public categoryDef?: GsbEntityDef;
  public lastUpdatedBy?: GsbUser;
  public orderNumber: number;
  public enum_id: string;
  public description: string;
  public title: string;
  public viewFormMode: ViewMode;
  public serverValidationScript: string;
  public lastUpdateDate: Date;
  public createDate: Date;
  public codeGenerator_id: string;
  public isSystemOnly: boolean;
  public createdBy?: GsbUser;
  public copyAction: CopyAction;
  public isRequired: boolean;
  public isSearchable: boolean;
  public isPublic: boolean;
  public controlComponent?: GsbWidgetTemplate;
  public undeletable: boolean;
  public listScreens: ScreenType;
  public lastUpdatedBy_id: string;
  public defUiCtrlName: string;
  public within_id: string;
  public isPrimaryKey: boolean;
  public isDynamic: boolean;
  public updateFormMode: ViewMode;
  public isListed: boolean;
  public availableColumn: string;
  public regex: string;
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
