import {
  GsbWorkflow,
  GsbActivity,
  GsbTransition,
  ActivityType,
  TransitionType
} from '@/models/workflow';
import { createEmptyWorkflow } from './gsb/services/workflow/workflow-utils';

// Mock data for demo purposes
const MOCK_WORKFLOWS: Record<string, GsbWorkflow> = {
  'wf1': {
    id: 'wf1',
    name: 'Employee Onboarding',
    title: 'Employee Onboarding Process',
    activities: [
      {
        id: 'act1',
        name: 'Start',
        title: 'Start',
        activityType: ActivityType.Start,
        position: { x: 200, y: 50 },
      },
      {
        id: 'act2',
        name: 'HR Approval',
        title: 'HR Department Approval',
        activityType: ActivityType.User,
        role_id: 'hr_role',
        form_id: 'employee_form',
        position: { x: 200, y: 150 },
        functions: [
          { id: 'fn1', name: 'Validate Employee Data' },
          { id: 'fn2', name: 'Check Background' }
        ]
      },
      {
        id: 'act3',
        name: 'IT Setup',
        title: 'IT Department Setup',
        activityType: ActivityType.System,
        position: { x: 200, y: 250 },
        functions: [
          { id: 'fn3', name: 'Create Email Account' },
          { id: 'fn4', name: 'Provision Laptop' }
        ]
      },
      {
        id: 'act4',
        name: 'Manager Approval',
        title: 'Department Manager Approval',
        activityType: ActivityType.User,
        role_id: 'manager_role',
        position: { x: 200, y: 350 },
      },
      {
        id: 'act5',
        name: 'End',
        title: 'End',
        activityType: ActivityType.End,
        position: { x: 200, y: 450 },
      }
    ],
    transitions: [
      {
        id: 'tr1',
        name: 'Start to HR',
        from_id: 'act1',
        to_id: 'act2',
        type: TransitionType.Standard,
      },
      {
        id: 'tr2',
        name: 'HR to IT',
        from_id: 'act2',
        to_id: 'act3',
        type: TransitionType.Standard,
      },
      {
        id: 'tr3',
        name: 'IT to Manager',
        from_id: 'act3',
        to_id: 'act4',
        type: TransitionType.Standard,
      },
      {
        id: 'tr4',
        name: 'Manager to End',
        from_id: 'act4',
        to_id: 'act5',
        type: TransitionType.Standard,
      }
    ],
    enableLog: true,
  },

  'wf2': {
    id: 'wf2',
    name: 'Customer Support Ticket',
    title: 'Customer Support Ticket Workflow',
    activities: [
      {
        id: 'act1',
        name: 'Start',
        title: 'Start',
        activityType: ActivityType.Start,
        position: { x: 250, y: 50 },
      },
      {
        id: 'act2',
        name: 'Support Triage',
        title: 'Support Team Triage',
        activityType: ActivityType.User,
        role_id: 'support_agent',
        position: { x: 250, y: 150 },
      },
      {
        id: 'act3',
        name: 'Waiting for Response',
        title: 'Waiting for Customer Response',
        activityType: ActivityType.Timer,
        pauseDuration: 1440, // 24 hours
        position: { x: 100, y: 250 },
      },
      {
        id: 'act4',
        name: 'Technical Review',
        title: 'Technical Team Review',
        activityType: ActivityType.User,
        role_id: 'tech_team',
        position: { x: 400, y: 250 },
      },
      {
        id: 'act5',
        name: 'Resolution',
        title: 'Issue Resolution',
        activityType: ActivityType.System,
        position: { x: 250, y: 350 },
        functions: [
          { id: 'fn1', name: 'Update Customer Record' },
          { id: 'fn2', name: 'Send Satisfaction Survey' }
        ]
      },
      {
        id: 'act6',
        name: 'End',
        title: 'End',
        activityType: ActivityType.End,
        position: { x: 250, y: 450 },
      }
    ],
    transitions: [
      {
        id: 'tr1',
        name: 'Start to Triage',
        from_id: 'act1',
        to_id: 'act2',
        type: TransitionType.Standard,
      },
      {
        id: 'tr2',
        name: 'Triage to Wait',
        from_id: 'act2',
        to_id: 'act3',
        type: TransitionType.Conditional,
        condition: 0, // Equals
        propName: 'needs_customer_input',
        value: 'true',
      },
      {
        id: 'tr3',
        name: 'Triage to Tech',
        from_id: 'act2',
        to_id: 'act4',
        type: TransitionType.Conditional,
        condition: 0, // Equals
        propName: 'needs_customer_input',
        value: 'false',
      },
      {
        id: 'tr4',
        name: 'Wait to Tech',
        from_id: 'act3',
        to_id: 'act4',
        type: TransitionType.Standard,
      },
      {
        id: 'tr5',
        name: 'Tech to Resolution',
        from_id: 'act4',
        to_id: 'act5',
        type: TransitionType.Standard,
      },
      {
        id: 'tr6',
        name: 'Resolution to End',
        from_id: 'act5',
        to_id: 'act6',
        type: TransitionType.Standard,
      }
    ],
    enableLog: true,
  }
};

// Add mock workflow designs
Object.values(MOCK_WORKFLOWS).forEach(workflow => {
  // For mock purposes we assume there's no design data saved yet
  // In a real system, this would be loaded from the database
  workflow.design = JSON.stringify({
    nodes: workflow.activities.map(activity => ({
      id: activity.id,
      position: activity.position || { x: 0, y: 0 },
      type: getNodeTypeFromActivityType(activity.activityType),
      data: {
        label: activity.name,
        activityType: activity.activityType,
        form_id: activity.form_id,
        role_id: activity.role_id,
        pauseDuration: activity.pauseDuration,
        functions: activity.functions || [],
      }
    })),
    edges: workflow.transitions.map(transition => ({
      id: transition.id,
      source: transition.from_id,
      target: transition.to_id,
      animated: true,
      type: 'default',
      markerEnd: { type: 'arrowclosed' },
      data: {
        type: transition.type,
        condition: transition.condition,
        propName: transition.propName,
        value: transition.value,
      }
    }))
  });
});

function getNodeTypeFromActivityType(activityType: ActivityType): string {
  switch (activityType) {
    case ActivityType.System:
      return 'systemNode';
    case ActivityType.User:
      return 'activityNode';
    case ActivityType.Timer:
      return 'timerNode';
    case ActivityType.Start:
      return 'startNode';
    case ActivityType.End:
      return 'endNode';
    default:
      return 'activityNode';
  }
}

/**
 * Workflow service for accessing workflow data
 */
export const WorkflowService = {
  /**
   * Get a list of all workflows
   */
  getWorkflows: async (): Promise<GsbWorkflow[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.values(MOCK_WORKFLOWS);
  },

  /**
   * Get a specific workflow by ID
   */
  getWorkflowById: async (id: string): Promise<GsbWorkflow | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (id === 'new') {
      return createEmptyWorkflow('New Workflow');
    }

    return MOCK_WORKFLOWS[id] || null;
  },

  /**
   * Save or update a workflow
   */
  saveWorkflow: async (workflow: GsbWorkflow): Promise<GsbWorkflow> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate ID for new workflow
    if (workflow.id === 'new' || !workflow.id) {
      workflow.id = `wf${Date.now()}`;
    }

    // Update mock data (in real app this would send to server)
    MOCK_WORKFLOWS[workflow.id] = {
      ...workflow
    };

    return MOCK_WORKFLOWS[workflow.id];
  },

  /**
   * Delete a workflow
   */
  deleteWorkflow: async (id: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (MOCK_WORKFLOWS[id]) {
      delete MOCK_WORKFLOWS[id];
      return true;
    }

    return false;
  }
};
