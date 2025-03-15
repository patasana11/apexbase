// Enum types from GSB workflow
export enum ActivityType {
  System = 1,
  User = 2,
  Timer = 4,
  Start = 8,
  End = 16,
  MultiInnerWorkflow = 32,
  AwaitParallel = 64
}

export enum TransitionType {
  Standard = 1,
  Parallel = 2,
  Conditional = 4
}

export enum TaskStatus {
  OnHold = 1,
  Started = 2,
  Completed = 4,
  Cancelled = 8,
  ReAssigned = 16,
  Error = 32
}

export enum ProcessAction {
  Continue = 1,
  BreakOperation = 2,
  BreakFunction = 4,
  BreakActivity = 8,
  BreakWorkflow = 16,
  ReRunOperation = 32,
  ReRunFunction = 64,
  ReRunActivity = 128,
  RestartWorkflow = 256,
  CancelWorkflow = 512
}

// Simplified interfaces for frontend use
export interface GsbWorkflowFunction {
  id: string;
  name: string;
  title?: string;
  functionType?: number;
  operationType?: number;
  parametersStr?: string;
  code?: string;
}

export interface GsbActivity {
  id: string;
  name: string;
  title?: string;
  activityType: ActivityType;
  refId?: string;
  form_id?: string;
  role_id?: string;
  position_id?: string;
  pauseDuration?: number;
  starterUser?: boolean;
  isManagerApprove?: boolean;
  settingsStr?: string;
  functions?: GsbWorkflowFunction[];
  afterFunctions?: GsbWorkflowFunction[];
  prevFunctions?: GsbWorkflowFunction[];
  workflow_id?: string;

  // UI display properties
  position?: { x: number; y: number };
}

export interface GsbTransition {
  id: string;
  name: string;
  title?: string;
  from_id: string;
  to_id: string;
  type: TransitionType;
  route?: string;
  propName?: string;
  paramName?: string;
  value?: string;
  condition?: number;
  refId?: string;
  workflow_id?: string;
}

export interface GsbWorkflowInstance {
  id: string;
  name: string;
  title?: string;
  status: TaskStatus;
  workflow_id: string;
  activity_id?: string;
  starter_id?: string;
  entity_id?: string;
  startDate?: Date;
  createDate?: Date;
  lastUpdateDate?: Date;
  result?: string;
  responseStr?: string;
  action?: ProcessAction;
}

export interface GsbWorkflowLog {
  id: string;
  instance_id?: string;
  activity_id?: string;
  function_id?: string;
  operation?: string;
  details?: string;
  result?: string;
  processDate?: Date;
  createDate?: Date;
}

export interface GsbWorkflow {
  id: string;
  name: string;
  title?: string;
  design?: string;
  enableLog?: boolean;
  enableUseExisting?: boolean;
  module_id?: string;
  activities: GsbActivity[];
  transitions: GsbTransition[];
  instances?: GsbWorkflowInstance[];
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}
