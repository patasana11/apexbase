import { Node, Edge, MarkerType } from 'reactflow';
import {
  GsbWorkflow,
  GsbActivity,
  GsbTransition,
  ActivityType
} from '@/models/workflow';
import { getNodeTypeFromActivityType } from '@/components/workflow/activity-nodes';

// Default position if none is specified in the activity
const DEFAULT_POSITION = { x: 100, y: 100 };

/**
 * Parse stored position from settingsStr or return default
 */
export const getActivityPosition = (activity: GsbActivity) => {
  if (activity.position) {
    return activity.position;
  }

  try {
    if (activity.settingsStr) {
      const settings = JSON.parse(activity.settingsStr);
      if (settings.position && typeof settings.position.x === 'number' && typeof settings.position.y === 'number') {
        return settings.position;
      }
    }
  } catch (e) {
    console.warn('Error parsing activity settings:', e);
  }

  // Return default position
  return {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200
  };
};

/**
 * Convert GsbWorkflow to ReactFlow nodes and edges
 */
export const workflowToReactFlow = (workflow: GsbWorkflow): { nodes: Node[], edges: Edge[] } => {
  // Try to load saved layout from design if available
  try {
    if (workflow.design) {
      const savedDesign = JSON.parse(workflow.design);
      if (savedDesign.nodes && savedDesign.edges &&
          Array.isArray(savedDesign.nodes) && Array.isArray(savedDesign.edges)) {
        return {
          nodes: savedDesign.nodes,
          edges: savedDesign.edges
        };
      }
    }
  } catch (e) {
    console.warn('Error parsing saved workflow design:', e);
  }

  // If no saved design or parsing failed, generate from activities and transitions
  const nodes: Node[] = workflow.activities.map(activity => {
    const position = getActivityPosition(activity);
    const nodeType = getNodeTypeFromActivityType(activity.activityType);

    return {
      id: activity.id,
      type: nodeType,
      position,
      data: {
        label: activity.name || activity.title || 'Activity',
        activityType: activity.activityType,
        form_id: activity.form_id,
        role_id: activity.role_id,
        pauseDuration: activity.pauseDuration,
        functions: activity.functions || [],
        afterFunctions: activity.afterFunctions || [],
        prevFunctions: activity.prevFunctions || []
      }
    };
  });

  const edges: Edge[] = workflow.transitions.map(transition => ({
    id: transition.id,
    source: transition.from_id,
    target: transition.to_id,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      type: transition.type,
      route: transition.route,
      condition: transition.condition,
      propName: transition.propName,
      paramName: transition.paramName,
      value: transition.value
    }
  }));

  return { nodes, edges };
};

/**
 * Convert ReactFlow nodes and edges back to GsbWorkflow format
 */
export const reactFlowToWorkflow = (
  nodes: Node[],
  edges: Edge[],
  workflowId: string,
  workflowName: string
): GsbWorkflow => {
  const activities: GsbActivity[] = nodes.map(node => {
    return {
      id: node.id,
      name: node.data.label || 'Activity',
      title: node.data.label || 'Activity',
      activityType: node.data.activityType as ActivityType,
      form_id: node.data.form_id,
      role_id: node.data.role_id,
      pauseDuration: node.data.pauseDuration,
      functions: node.data.functions || [],
      afterFunctions: node.data.afterFunctions || [],
      prevFunctions: node.data.prevFunctions || [],
      workflow_id: workflowId,
      settingsStr: JSON.stringify({
        position: node.position
      })
    };
  });

  const transitions: GsbTransition[] = edges.map(edge => {
    const baseTransition = {
      id: edge.id,
      name: `${edge.source} to ${edge.target}`,
      title: `Transition from ${edge.source} to ${edge.target}`,
      from_id: edge.source,
      to_id: edge.target,
      type: edge.data?.type || 1, // Default to Standard
      workflow_id: workflowId
    };

    if (edge.data) {
      // Add additional edge data if available
      return {
        ...baseTransition,
        route: edge.data.route,
        condition: edge.data.condition,
        propName: edge.data.propName,
        paramName: edge.data.paramName,
        value: edge.data.value
      };
    }

    return baseTransition;
  });

  return {
    id: workflowId,
    name: workflowName,
    title: workflowName,
    activities,
    transitions,
    design: JSON.stringify({ nodes, edges })
  };
};

/**
 * Generate a new unique ID for nodes or edges
 */
export const generateId = (prefix: string = 'node'): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Creates a basic workflow structure with start and end nodes
 */
export const createEmptyWorkflow = (name: string): GsbWorkflow => {
  const startId = generateId('start');
  const endId = generateId('end');

  const activities: GsbActivity[] = [
    {
      id: startId,
      name: 'Start',
      title: 'Start',
      activityType: ActivityType.Start,
      position: { x: 250, y: 50 }
    },
    {
      id: endId,
      name: 'End',
      title: 'End',
      activityType: ActivityType.End,
      position: { x: 250, y: 250 }
    }
  ];

  const transitions: GsbTransition[] = [];

  return {
    id: generateId('wf'),
    name,
    title: name,
    activities,
    transitions,
    enableLog: true
  };
};
