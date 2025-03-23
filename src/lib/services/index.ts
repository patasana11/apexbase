'use client';

/**
 * Re-export services from the GSB module for backward compatibility
 * Note: New code should import directly from @/lib/gsb
 */

// Re-export auth services
export {
  GsbAuthService,
  authService
} from '../gsb/services/auth/auth.service';

export {
  SocialAuthService,
  socialAuthService
} from '../gsb/services/auth/social-auth.service';

// Re-export entity services
export {
  EntityDefService,
  entityDefService
} from '../gsb/services/entity/entity-def.service';

export {
  GsbEntityService
} from '../gsb/services/entity/gsb-entity.service';

// Re-export file services
export {
  FileService,
  fileService
} from '../gsb/services/file/file.service';

// Re-export function services
export {
  FunctionService,
  functionService
} from '../gsb/services/function/function.service';

// Re-export workflow services
export {
  GsbWorkflowService
} from '../gsb/services/workflow/gsb-workflow.service';

export {
  WorkflowMonitorService
} from '../gsb/services/workflow/workflow-monitor.service';

export {
  GsbWorkflowService as WorkflowService,
  gsbWorkflowService as workflowService
} from '../gsb/services/workflow/workflow.service';

// Re-export subscription services
export {
  PaddleClientService,
  paddleClientService
} from '../gsb/services/subscription/paddle-client.service';

export {
  PaddleService,
  paddleService
} from '../gsb/services/subscription/paddle.service';

export {
  SubscriptionService,
  subscriptionService
} from '../gsb/services/subscription/subscription.service';

// Re-export other services
export {
  AppInitializerService
} from '../gsb/services/app-initializer.service';

export {
  PermissionService,
  permissionService
} from '../gsb/services/permission.service';

export {
  RegistrationService,
  registrationService
} from '../gsb/services/registration.service';

export {
  RoleService,
  roleService
} from '../gsb/services/role.service';
