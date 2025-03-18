'use client';

import { GsbWorkflow, GsbActivity, GsbTransition, ActivityType, TransitionType } from '@/models/workflow';

export class GsbWorkflowService {
  private workflows: Map<string, GsbWorkflow> = new Map();

  async getWorkflowById(id: string): Promise<GsbWorkflow | null> {
    // For demo purposes, return from memory or create a new one
    if (this.workflows.has(id)) {
      return this.workflows.get(id)!;
    }
    return null;
  }

  async saveWorkflow(workflow: GsbWorkflow): Promise<GsbWorkflow> {
    // For demo purposes, save to memory
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async testWorkflow(workflow: GsbWorkflow, context: any): Promise<{ visitedNodes: string[], visitedEdges: string[] }> {
    // Mock implementation for testing
    // In a real implementation, this would call the backend API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // For demo purposes, we'll simulate a path through the workflow
    const visitedNodes: string[] = [];
    const visitedEdges: string[] = [];
    
    let currentNode = workflow.activities.find(a => a.activityType === ActivityType.Start);
    if (!currentNode) {
      return { visitedNodes, visitedEdges };
    }

    while (currentNode) {
      visitedNodes.push(currentNode.id);
      
      // Find outgoing transitions
      const outgoingEdges = workflow.transitions.filter(t => t.from_id === currentNode!.id);
      
      if (outgoingEdges.length === 0) {
        // No more transitions, end the path
        break;
      }
      
      // For demo, just take the first transition
      const nextEdge = outgoingEdges[0];
      visitedEdges.push(nextEdge.id);
      
      // Move to the next node
      currentNode = workflow.activities.find(a => a.id === nextEdge.to_id);
    }

    return { visitedNodes, visitedEdges };
  }
} 