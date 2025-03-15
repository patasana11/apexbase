"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  MarkerType,
  NodeTypes,
  Node,
  useReactFlow,
  useViewport,
  ConnectionMode,
  getBezierPath,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Save,
  ArrowLeft,
  Play,
  Settings,
  History,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Square,
  Cog,
  User,
  Clock,
  GitBranch,
  Split,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Editor } from '@monaco-editor/react';
import { GsbWorkflow, GsbActivity, GsbTransition, ActivityType, TransitionType } from '@/models/workflow';
import { GsbWorkflowService } from '@/lib/services/workflow.service';

// Import our custom components and utils
import { getActivityTypeName } from '@/components/workflow/activity-nodes';
import { workflowToReactFlow, reactFlowToWorkflow, generateId } from '@/lib/workflow-utils';
import { WorkflowMonitorService } from '@/lib/services/workflow-monitor.service';
import { format } from 'date-fns';
import { QueryParams } from '@/lib/gsb/types/query-params';
import ActivityConfigPanel from '@/components/workflow/activity-config-panel';
import ActivityNode from '@/components/workflow/activity-node';
import TransitionConfigPanel from '@/components/workflow/transition-config-panel';

// Define our node types
const nodeTypes = {
  activity: ActivityNode,
};

const activityTypes = [
  {
    type: ActivityType.Start,
    label: 'Start',
    description: 'Initiates the workflow',
    icon: <Play className="h-4 w-4" />,
  },
  {
    type: ActivityType.End,
    label: 'End',
    description: 'Terminates the workflow',
    icon: <Square className="h-4 w-4" />,
  },
  {
    type: ActivityType.System,
    label: 'System',
    description: 'Executes system functions',
    icon: <Cog className="h-4 w-4" />,
  },
  {
    type: ActivityType.User,
    label: 'User',
    description: 'Requires user interaction',
    icon: <User className="h-4 w-4" />,
  },
  {
    type: ActivityType.Timer,
    label: 'Timer',
    description: 'Adds a timed delay',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    type: ActivityType.MultiInnerWorkflow,
    label: 'Sub-Workflow',
    description: 'Executes a nested workflow',
    icon: <GitBranch className="h-4 w-4" />,
  },
  {
    type: ActivityType.AwaitParallel,
    label: 'Parallel',
    description: 'Executes activities in parallel',
    icon: <Split className="h-4 w-4" />,
  },
];

const defaultEdgeOptions = {
  type: 'custom',
  animated: true,
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
};

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeStyle = () => {
    const baseStyle = {
      ...style,
      strokeWidth: 2,
    };

    if (data?.type === TransitionType.Conditional) {
      return {
        ...baseStyle,
        strokeDasharray: '5 5',
      };
    }

    return baseStyle;
  };

  return (
    <>
      <path
        id={id}
        style={getEdgeStyle()}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12 }}
            startOffset="50%"
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
}

const edgeTypes = {
  custom: CustomEdge,
};

function WorkflowDesignerContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isNewWorkflow = id === 'new';
  const reactFlowInstance = useReactFlow();
  const viewport = useViewport();
  const workflowService = new GsbWorkflowService();

  const [workflow, setWorkflow] = useState<GsbWorkflow | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testData, setTestData] = useState('{}');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  const monitorService = new WorkflowMonitorService();

  // Load workflow data
  useEffect(() => {
    const loadWorkflow = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isNewWorkflow) {
          // Load the new workflow from session storage
          const newWorkflowStr = sessionStorage.getItem("newWorkflow");
          if (!newWorkflowStr) {
            router.replace("/dashboard/workflow");
            return;
          }

          const newWorkflow = JSON.parse(newWorkflowStr);
          setWorkflow(newWorkflow);
          setWorkflowName(newWorkflow.name);
          
          // Initialize with a start node
          const startNode = {
            id: generateId(),
            type: 'activity',
            position: { x: viewport.x + 250, y: viewport.y + 200 },
            data: {
              type: ActivityType.Start,
              label: 'Start',
              config: {}
            }
          };

          setNodes([startNode]);
          setEdges([]);
          setIsLoading(false);
          return;
        }

        const workflow = await workflowService.getWorkflowById(id);
        if (workflow) {
          const { nodes: flowNodes, edges: flowEdges } = workflowToReactFlow(workflow);
          setNodes(flowNodes);
          setEdges(flowEdges);
          setWorkflow(workflow);
          setWorkflowName(workflow.name || `Workflow ${id}`);
        } else {
          setError(`Workflow with ID ${id} not found`);
        }
      } catch (err) {
        console.error('Error loading workflow:', err);
        setError('Failed to load workflow data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [id]);

  // Load workflow instances
  const loadInstances = useCallback(async () => {
    if (!workflow || isNewWorkflow) return;

    setIsLoadingInstances(true);
    try {
      const data = await monitorService.getWorkflowInstances(workflow.id);
      setInstances(data);
    } catch (err) {
      console.error('Error loading workflow instances:', err);
      toast({
        title: "Error",
        description: "Failed to load workflow instances",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInstances(false);
    }
  }, [workflow, isNewWorkflow]);

  // Load instances when workflow changes or after starting a test
  useEffect(() => {
    loadInstances();
  }, [workflow, loadInstances]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false;

      // Get source and target nodes
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Start nodes can't have incoming connections
      if (targetNode.data.activityType === ActivityType.Start) return false;

      // End nodes can't have outgoing connections
      if (sourceNode.data.activityType === ActivityType.End) return false;

      // Check if connection already exists
      const connectionExists = edges.some(
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );

      return !connectionExists;
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      if (!isValidConnection(connection)) {
        toast({
          title: 'Invalid Connection',
          description: 'This connection is not allowed',
          variant: 'destructive',
        });
        return;
      }

      const newEdge: Edge = {
        id: generateId('edge'),
        type: 'custom',
      animated: true,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || null,
        targetHandle: connection.targetHandle || null,
        style: {
          stroke: '#64748b',
          strokeWidth: 2,
        },
      markerEnd: {
        type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
      },
      data: {
          label: 'Transition',
          type: TransitionType.Standard,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, isValidConnection, toast]
  );

  // Add new node
  const addNode = (type: string, activityType: ActivityType) => {
    const newNode: Node = {
      id: generateId('act'),
      type,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100
      },
      data: {
        label: `New ${type.replace('Node', '')}`,
        activityType,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Update node data
  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  };

  // Update edge data
  const updateEdgeData = (edgeId: string, newData: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
        data: {
              ...edge.data,
          ...newData,
        },
          };
    }
        return edge;
      })
    );
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );
    setSelectedNode(null);
  };

  const deleteSelectedEdge = () => {
    if (!selectedEdge) return;

    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdge(null);
  };

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode) {
          deleteSelectedNode();
        } else if (selectedEdge) {
          deleteSelectedEdge();
        }
      }
    },
    [selectedNode, selectedEdge]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const validateWorkflow = () => {
    // Check if workflow has a name
    if (!workflowName) {
      toast({
        title: 'Validation Error',
        description: 'Workflow must have a name',
        variant: 'destructive',
      });
      return false;
    }

    // Check if workflow has at least one start and one end node
    const startNodes = nodes.filter(
      (node) => node.data.activityType === ActivityType.Start
    );
    const endNodes = nodes.filter(
      (node) => node.data.activityType === ActivityType.End
    );

    if (startNodes.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Workflow must have at least one Start activity',
        variant: 'destructive',
      });
      return false;
    }

    if (endNodes.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Workflow must have at least one End activity',
        variant: 'destructive',
      });
      return false;
    }

    // Check if all activities are connected
    const connectedNodes = new Set<string>();
    const addConnectedNodes = (nodeId: string) => {
      if (connectedNodes.has(nodeId)) return;
      connectedNodes.add(nodeId);

      // Add all nodes connected by outgoing edges
      edges
        .filter((edge) => edge.source === nodeId)
        .forEach((edge) => addConnectedNodes(edge.target));

      // Add all nodes connected by incoming edges
      edges
        .filter((edge) => edge.target === nodeId)
        .forEach((edge) => addConnectedNodes(edge.source));
    };

    // Start from all start nodes
    startNodes.forEach((node) => addConnectedNodes(node.id));

    const disconnectedNodes = nodes.filter(
      (node) => !connectedNodes.has(node.id)
    );

    if (disconnectedNodes.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Found ${disconnectedNodes.length} disconnected activities`,
        variant: 'destructive',
      });
      return false;
    }

    // Check if all conditional transitions have at least one condition
    const invalidTransitions = edges.filter(
      (edge) =>
        edge.data?.type === TransitionType.Conditional &&
        (!edge.data.conditions || edge.data.conditions.length === 0)
    );

    if (invalidTransitions.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Found ${invalidTransitions.length} conditional transitions without conditions`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const onSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updatedWorkflow: GsbWorkflow = {
        ...workflow!,
        name: workflowName,
        activities: nodes.map(node => ({
          id: node.id,
          name: node.data.label,
          activityType: node.data.type,
          position: node.position,
        })),
        transitions: edges.map(edge => ({
          id: edge.id,
          name: edge.data?.label || '',
          from_id: edge.source,
          to_id: edge.target,
          type: edge.data?.type || TransitionType.Standard,
        })),
      };

      await workflowService.saveWorkflow(updatedWorkflow);
      setSaveSuccess(true);
      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (err) {
      setError('Failed to save workflow');
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onTest = async () => {
    setIsTestRunning(true);
    setError(null);

    try {
      const result = await workflowService.testWorkflow(workflow as GsbWorkflow, JSON.parse(testData));
      setInstances([{
        id: generateId(),
        visitedNodes: result.visitedNodes,
        visitedEdges: result.visitedEdges,
        timestamp: new Date(),
      }, ...instances]);
    } catch (err) {
      setError('Failed to test workflow');
      toast({
        title: "Error",
        description: "Failed to test workflow",
        variant: "destructive",
      });
    } finally {
      setIsTestRunning(false);
      setShowTestDialog(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/workflow')}
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="border-none bg-transparent h-9 text-lg font-medium"
                disabled={isLoading || isSaving}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <div className="text-destructive text-sm flex items-center mr-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="text-green-600 text-sm flex items-center mr-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                Workflow saved
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTestDialog(true)}
              disabled={isSaving || isTestRunning}
            >
              {isTestRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving || isTestRunning}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading workflow...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Flow designer */}
            <div className="flex-1 h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => {
                  setSelectedNode(node);
                  setSelectedEdge(null);
                }}
                onEdgeClick={(_, edge) => {
                  setSelectedEdge(edge);
                  setSelectedNode(null);
                }}
                onPaneClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionMode={ConnectionMode.Loose}
                deleteKeyCode={null}
                fitView
                className="bg-muted/10"
              >
                <Controls />
                <Background />
                <MiniMap
                  nodeColor={(node) => {
                    switch (node.data.activityType) {
                      case ActivityType.Start:
                        return '#86efac'; // green-300
                      case ActivityType.End:
                        return '#fca5a5'; // red-300
                      case ActivityType.System:
                        return '#93c5fd'; // blue-300
                      case ActivityType.User:
                        return '#d8b4fe'; // purple-300
                      case ActivityType.Timer:
                        return '#fdba74'; // orange-300
                      case ActivityType.MultiInnerWorkflow:
                        return '#a5b4fc'; // indigo-300
                      case ActivityType.AwaitParallel:
                        return '#67e8f9'; // cyan-300
                      default:
                        return '#e5e7eb'; // gray-200
                    }
                  }}
                  nodeStrokeWidth={3}
                  maskColor="rgb(0, 0, 0, 0.1)"
                />

                {/* Activity palette */}
                <Panel position="top-left" className="bg-background shadow-md rounded-md p-3 m-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-medium text-sm mb-1">Add Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {activityTypes.map((activity) => (
                      <Button
                          key={activity.type}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                          onClick={() => {
                            const position = {
                              x: viewport.x + window.innerWidth / (2 * viewport.zoom),
                              y: viewport.y + window.innerHeight / (2 * viewport.zoom),
                            };
                            
                            const newNode = {
                              id: generateId('node'),
                              type: 'activity',
                              position,
                              data: {
                                label: `${activity.label} ${nodes.length + 1}`,
                                activityType: activity.type,
                              },
                            };
                            
                            setNodes((nds) => [...nds, newNode]);
                          }}
                        >
                          {activity.icon}
                          <span className="ml-1">{activity.label}</span>
                      </Button>
                      ))}
                    </div>
                  </div>
                </Panel>
              </ReactFlow>
            </div>

            {/* Properties sidebar */}
            <div className="w-96 border-l overflow-hidden flex flex-col">
              <Tabs defaultValue="properties" className="flex-1 flex flex-col">
                <div className="border-b px-4 py-2">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="properties">
                      <Settings className="h-4 w-4 mr-1" />
                      Properties
                    </TabsTrigger>
                    <TabsTrigger value="logs">
                      <History className="h-4 w-4 mr-1" />
                      Logs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="properties" className="flex-1 overflow-auto">
                  {selectedNode ? (
                    <ActivityConfigPanel
                      activity={selectedNode}
                      onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                      onClose={() => {
                        deleteSelectedNode();
                      }}
                    />
                  ) : selectedEdge ? (
                    <TransitionConfigPanel
                      transition={selectedEdge}
                      onUpdate={(data) => updateEdgeData(selectedEdge.id, data)}
                      onClose={() => {
                        deleteSelectedEdge();
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center p-4 text-center">
                      <div>
                        <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Activity Selected</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Select an activity in the workflow to view and edit its properties.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="flex-1 overflow-auto p-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Workflow Instances</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadInstances}
                          disabled={isLoadingInstances || isNewWorkflow}
                        >
                          {isLoadingInstances ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <History className="h-4 w-4" />
                          )}
                          <span className="ml-2">Refresh</span>
                        </Button>
                      </div>
                      {isNewWorkflow ? (
                        <p className="text-sm text-muted-foreground">
                          Instances will be available after the workflow is saved and executed.
                        </p>
                      ) : isLoadingInstances ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Loading instances...</p>
                        </div>
                      ) : instances.length === 0 ? (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No instances found</p>
                        </div>
                      ) :
                        <div className="space-y-4">
                          {instances.map((instance: any) => (
                            <Card key={instance.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{instance.name || instance.id}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Started: {format(new Date(instance.startDate), 'PPpp')}
                                  </p>
                                  {instance.endDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Ended: {format(new Date(instance.endDate), 'PPpp')}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    instance.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    instance.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                                    instance.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {instance.status}
                                  </span>
                                </div>
                              </div>
                              {instance.currentActivity && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Current Activity:</span>{' '}
                                    {instance.currentActivity.name}
                                  </p>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      }
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Test Workflow</DialogTitle>
            <DialogDescription>
              Enter test data in JSON format to simulate workflow execution.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="testData">Test Data (JSON)</Label>
              <div className="flex-1 min-h-[400px] border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                value={testData}
                  onChange={(value) => setTestData(value || '{}')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
              />
            </div>
          </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={onTest} disabled={isTestRunning}>
              {isTestRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                  <Play className="h-4 w-4 mr-1" />
              )}
              Run Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WorkflowDesigner() {
  return (
    <ReactFlowProvider>
      <WorkflowDesignerContent />
    </ReactFlowProvider>
  );
}
