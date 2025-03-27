import { GsbPermission, GsbUser } from './gsb-user.model';
import { GsbDocTemplate } from './gsb-doc-template.model';
import { GsbContact, GsbGroup, GsbRole } from './gsb-organization.model';
import { GsbEntityDef } from './gsb-entity-def.model';
import { QueryDto } from '../types/query-dto';

/**
 * Operation types for workflow functions
 */
export enum OperationType {
  SetProperties = 1,
  SendSms = 2,
  CallGSBAPI = 3,
  CallExternalAPI = 4,
  SendEmail = 5,
  SendEmailAdvanced = 6,
  RunScriptCode = 7,
  CommitChanges = 8,
  GetEntity = 9,
  SetEntity = 10,
  DeleteEntity = 11,
  CreatePDFDocument = 12,
  SendNotification = 13,
  SaveEntity = 14
}

/**
 * Property value for setting entity properties
 */
export interface PropertyValue {
  name: string;
  value: any;
}

/**
 * Dynamic attachment for email operations
 */
export interface GsbDynamicAttachment {
  template: string;
  fileName: string;
}

/**
 * Email message operation configuration
 */
export interface GsbMailMessageOp {
  toAddresses: any[];
  ccAddresses: any[];
  bccAddresses: any[];
  subject: string;
  distinct?: boolean;
  messageBody: GsbDocTemplate;
  attachments: GsbDocTemplate[];
}

/**
 * Notification operation recipients configuration
 */
export interface GsbNotificationOpRecipients {
  contacts: GsbContact[];
  users: GsbUser[];
  roles: GsbRole[];
  groups: GsbGroup[];
  excludeUsers: GsbUser[];
  excludeSender?: boolean;
}

/**
 * Advanced email message operation configuration
 */
export interface GsbAdvancedMailMessageOp {
  toAddresses: string;
  ccAddresses: string;
  attachments: string;
  subject: string;
  messageBody: string;
}

/**
 * Document generation operation configuration
 */
export interface GsbDocumentGenerateOp {
  docTemplate: GsbDocTemplate;
  propertyName: string;
  urlParam: string;
  htmlWfParam: string;
  htmlEntityParam: string;
  template: string;
  byteArrParam: string;
  fileNameProp: string;
  usePuppeteer: boolean;
}

/**
 * Get entity operation options
 */
export interface GsbGetEntityOptions {
  query: QueryDto;
}

/**
 * Set entity operation options
 */
export interface GsbSetEntityOptions {
  setProps: PropertyValue[];
  entityDef: GsbEntityDef;
}

/**
 * Notification data for notification operations
 */
export interface NotificationDto {
  title: string;
  message: string;
  recipients: GsbNotificationOpRecipients;
  priority?: number;
  category?: string;
  expiryDate?: Date;
}

/**
 * Represents a workflow operation
 */
export interface GsbWfOperation {
  id?: string;
  title: string;
  operationType?: OperationType;
  scriptCode?: string;
  scriptCodeStr?: string;
  docTemplate?: GsbDocumentGenerateOp;
  getEntityOptions?: GsbGetEntityOptions;
  setEntityOptions?: GsbSetEntityOptions;
  notification?: NotificationDto;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB WF Function entity
 */
export interface GsbWfFunction {
  id: string;
  name: string;
  title?: string;
  code?: string;
  references?: GsbWfCodeLibrary[];
  imports?: GsbModule[];
  permissions?: GsbPermission[];
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
  orderNumber?: number;
  wfLogs?: GsbWfLog[];
  createdBy?: GsbUser;
  activities?: GsbWfActivity[];
  module?: GsbModule;
  afterActivities?: GsbWfActivity[];
  lastUpdatedBy?: GsbUser;
  currentVersion?: string;
  bgTasks?: GsbRecurringJob[];
  standalone?: boolean;
  limits?: GsbUsageLimit[];
  operations?: string;
  operationsObj?: GsbWfOperation[];
  testInstance?: string;
  prevActivities?: GsbWfActivity[];
  module_id?: string;
}

/**
 * Represents a GSB WF Code Library
 */
export interface GsbWfCodeLibrary {
  id: string;
  name: string;
  code?: string;
  codeText?: string;
  references?: GsbWfCodeLibrary[];
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Module
 */
export interface GsbModule {
  id: string;
  name: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB WF Log
 */
export interface GsbWfLog {
  id: string;
  name: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB WF Activity
 */
export interface GsbWfActivity {
  id: string;
  name: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Recurring Job
 */
export interface GsbRecurringJob {
  id: string;
  name: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Represents a GSB Usage Limit
 */
export interface GsbUsageLimit {
  id: string;
  name: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}

/**
 * Helper function to check if a function is empty
 */
export function isGsbFunctionEmpty(func: GsbWfFunction): boolean {
  return (
    (!func.code || func.code.trim() === '') &&
    (!func.operations || func.operations.trim() === '') &&
    (!func.operationsObj || func.operationsObj.length === 0)
  );
}
