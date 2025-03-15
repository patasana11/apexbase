import { GsbPermission, GsbUser } from './gsb-user.model';

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
