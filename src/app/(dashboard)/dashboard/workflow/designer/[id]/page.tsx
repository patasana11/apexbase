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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  CheckCircle
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

// Import our custom components and utils
import {
  ActivityNode,
  SystemNode,
  StartNode,
  EndNode,
  TimerNode,
  getActivityTypeName
} from '@/components/workflow/activity-nodes';
import { WorkflowService } from '@/lib/workflow-service';
import { GsbWorkflowService } from '@/lib/services/gsb-workflow.service';
import { workflowToReactFlow, reactFlowToWorkflow, generateId } from '@/lib/workflow-utils';
import { ActivityType, GsbWorkflow } from '@/models/workflow';
import { WorkflowMonitorService } from '@/lib/services/workflow-monitor.service';
import { format } from 'date-fns';
import { QueryParams } from '@/lib/gsb/types/query-params';

// Define our node types
const nodeTypes: NodeTypes = {
  activityNode: ActivityNode,
  systemNode: SystemNode,
  startNode: StartNode,
  endNode: EndNode,
  timerNode: TimerNode,
};

export default function WorkflowDesigner() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNewWorkflow = id === 'new';
  const reactFlowInstance = useReactFlow();

  const [workflow, setWorkflow] = useState<GsbWorkflow | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testData, setTestData] = useState('{}');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  const workflowService = new GsbWorkflowService();
  const monitorService = new WorkflowMonitorService();

  // Load workflow data
  useEffect(() => {
    const loadWorkflow = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await workflowService.getWorkflowById(id as string);

        if (data) {
          setWorkflow(data);
          setWorkflowName(data.name || 'New Workflow');

          if (isNewWorkflow) {
            // For new workflow, just set up empty nodes
            setNodes([]);
            setEdges([]);
          } else {
            // Convert existing workflow to React Flow format
            const flowData = workflowToReactFlow(data);
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
          }
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
  }, []);

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Update selected node if needed
      const selectChange = changes.find(change => change.type === 'select');
      if (selectChange && 'selected' in selectChange && !selectChange.selected) {
        setSelectedNode(null);
      }
    },
    []
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({
      ...connection,
      id: `edge_${generateId()}`,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      data: {
        type: 1, // Standard transition type by default
      }
    }, eds)),
    []
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

    // Also update selected node if it's the one being modified
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          ...newData,
        },
      });
    }
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
  };

  // Save workflow
  const saveWorkflow = async () => {
    if (!workflow) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Convert React Flow data back to GSB workflow format
      const updatedWorkflow = reactFlowToWorkflow(
        nodes,
        edges,
        workflow.id,
        workflowName
      );

      // Save workflow
      const savedWorkflow = await workflowService.saveWorkflow(updatedWorkflow);
      setWorkflow(savedWorkflow);

      // If new workflow, update URL
      if (isNewWorkflow) {
        router.push(`/dashboard/workflow/designer/${savedWorkflow.id}`);
      }

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving workflow:', err);
      setError('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  // Start workflow test
  const startWorkflowTest = async () => {
    if (!workflow) return;

    setIsTestRunning(true);
    try {
      let data = {};
      try {
        data = JSON.parse(testData);
      } catch (err) {
        toast({
          title: "Invalid JSON",
          description: "Please enter valid JSON data",
          variant: "destructive",
        });
        return;
      }

      await workflowService.startWorkflow(workflow.id, data);
      
      toast({
        title: "Workflow Started",
        description: "The workflow test has been initiated successfully.",
      });
      
      setIsTestDialogOpen(false);
      // Reload instances after starting a test
      loadInstances();
    } catch (err) {
      console.error('Error starting workflow:', err);
      toast({
        title: "Error",
        description: "Failed to start workflow test",
        variant: "destructive",
      });
    } finally {
      setIsTestRunning(false);
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
              onClick={saveWorkflow}
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsTestDialogOpen(true)}
              disabled={isLoading || isSaving || isNewWorkflow}
            >
              <Play className="h-4 w-4 mr-1" />
              Test
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
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={2}
                defaultEdgeOptions={{
                  animated: true,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                  },
                }}
              >
                <Background />
                <Controls />
                <MiniMap />

                {/* Node palette */}
                <Panel position="top-left" className="bg-background shadow-md rounded-md p-3 m-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-medium text-sm mb-1">Add Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addNode('startNode', ActivityType.Start)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addNode('activityNode', ActivityType.User)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addNode('systemNode', ActivityType.System)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        System
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addNode('timerNode', ActivityType.Timer)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Timer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addNode('endNode', ActivityType.End)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        End
                      </Button>
                    </div>
                  </div>
                </Panel>
              </ReactFlow>
            </div>

            {/* Properties sidebar */}
            <div className="w-96 border-l overflow-hidden flex flex-col">
              <Tabs defaultValue="properties" className="flex-1 flex flex-col">
                <div className="border-b px-4 py-2">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="properties">
                      <Settings className="h-4 w-4 mr-1" />
                      Properties
                    </TabsTrigger>
                    <TabsTrigger value="functions">
                      <Settings className="h-4 w-4 mr-1" />
                      Functions
                    </TabsTrigger>
                    <TabsTrigger value="logs">
                      <History className="h-4 w-4 mr-1" />
                      Logs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="properties" className="flex-1 overflow-auto">
                  {selectedNode ? (
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{selectedNode.data.label || 'Node'}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={deleteSelectedNode}
                          disabled={isSaving}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="node-name">Name</Label>
                        <Input
                          id="node-name"
                          value={selectedNode.data.label || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Activity Type</Label>
                        <div className="bg-muted p-2 rounded text-sm">
                          {getActivityTypeName(selectedNode.data.activityType)}
                        </div>
                      </div>

                      {selectedNode.data.activityType === ActivityType.User && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="form">Form</Label>
                            <Input
                              id="form"
                              placeholder="Select a form..."
                              value={selectedNode.data.form_id || ''}
                              onChange={(e) => updateNodeData(selectedNode.id, { form_id: e.target.value })}
                              disabled={isSaving}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                              id="role"
                              placeholder="Select a role..."
                              value={selectedNode.data.role_id || ''}
                              onChange={(e) => updateNodeData(selectedNode.id, { role_id: e.target.value })}
                              disabled={isSaving}
                            />
                          </div>
                        </>
                      )}

                      {selectedNode.data.activityType === ActivityType.Timer && (
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            placeholder="0"
                            value={selectedNode.data.pauseDuration || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, {
                              pauseDuration: parseInt(e.target.value) || 0
                            })}
                            disabled={isSaving}
                          />
                        </div>
                      )}

                      {/* Functions list for activities that can have them */}
                      {(selectedNode.data.activityType === ActivityType.System ||
                        selectedNode.data.activityType === ActivityType.User) && (
                        <div className="space-y-2">
                          <Label>Activity Functions</Label>
                          <div className="border rounded-md p-2">
                            {selectedNode.data.functions && selectedNode.data.functions.length > 0 ? (
                              <div className="space-y-2">
                                {selectedNode.data.functions.map((fn: any, index: number) => (
                                  <div
                                    key={fn.id || index}
                                    className="bg-muted p-2 rounded-md text-sm flex justify-between items-center"
                                  >
                                    <span>{fn.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        const functions = [...(selectedNode.data.functions || [])];
                                        functions.splice(index, 1);
                                        updateNodeData(selectedNode.id, { functions });
                                      }}
                                      disabled={isSaving}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                No functions defined
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                const functions = [...(selectedNode.data.functions || [])];
                                functions.push({
                                  id: generateId('fn'),
                                  name: `New Function ${functions.length + 1}`
                                });
                                updateNodeData(selectedNode.id, { functions });
                              }}
                              disabled={isSaving}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Function
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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

                <TabsContent value="functions" className="flex-1 overflow-auto p-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-medium mb-4">Workflow Functions</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure global functions that can be used in activity transitions and operations.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" className="w-full" disabled={isSaving}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Global Function
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                      ) : (
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
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Workflow</DialogTitle>
            <DialogDescription>
              Enter test data in JSON format to start a new workflow instance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Input Data (JSON)</Label>
              <Textarea
                placeholder="{}"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="font-mono"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTestDialogOpen(false)}
              disabled={isTestRunning}
            >
              Cancel
            </Button>
            <Button
              onClick={startWorkflowTest}
              disabled={isTestRunning}
            >
              {isTestRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
