'use client';

import { GsbEntityService } from '../../services/entity/gsb-entity.service';
import { getGsbToken, getGsbTenantCode } from '../../config/gsb-config';
import { GsbWorkflow, GsbWorkflowInstance, TaskStatus } from '@/models/workflow';
import { QueryParams } from '../../types/query-params';
import { SelectCol, SortCol } from '../../types/query';

export interface WorkflowStatus {
  id: string;
  name: string;
  status: 'Operational' | 'Degraded' | 'Down';
  lastCheck: Date;
  activeInstances: number;
  errorCount: number;
  performance: {
    avgExecutionTime: number;
    successRate: number;
  };
}

interface WorkflowQueryResponse {
  items: GsbWorkflowInstance[];
  totalCount: number;
}

export class WorkflowMonitorService {
  private entityService: GsbEntityService;
  private statusCache: Map<string, WorkflowStatus>;
  private pollInterval: number = 60000; // 1 minute
  private pollTimer?: NodeJS.Timeout;

  constructor() {
    this.entityService = new GsbEntityService();
    this.statusCache = new Map();
    this.startPolling();
  }

  private startPolling() {
    // Clear existing timer if any
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    // Start polling
    this.pollTimer = setInterval(() => {
      this.updateAllWorkflowStatuses();
    }, this.pollInterval);

    // Initial update
    this.updateAllWorkflowStatuses();
  }

  private async updateAllWorkflowStatuses() {
    try {
      const token = getGsbToken();
      const tenantCode = getGsbTenantCode();

      // Get all workflow instances
      const queryParams = new QueryParams<GsbWorkflowInstance>('GsbWorkflowInstance');
      queryParams.calcTotalCount = true;
      queryParams.startIndex = 0;
      queryParams.count = 1000;
      
      const sortCol = new SelectCol('lastUpdateDate');
      const sort = new SortCol();
      sort.col = sortCol;
      sort.sortType = 'desc';
      queryParams.sortCols = [sort];

      const response = await this.entityService.query(
        queryParams,
        token,
        tenantCode
      ) as WorkflowQueryResponse;

      const instances = response.items;
      const workflowStats = new Map<string, {
        total: number;
        errors: number;
        active: number;
        executionTimes: number[];
      }>();

      // Process instances
      instances.forEach(instance => {
        const stats = workflowStats.get(instance.workflow_id) || {
          total: 0,
          errors: 0,
          active: 0,
          executionTimes: []
        };

        stats.total++;

        if (instance.status === TaskStatus.Error) {
          stats.errors++;
        }

        if (instance.status === TaskStatus.Started) {
          stats.active++;
        }

        if (instance.startDate && instance.lastUpdateDate) {
          const executionTime = new Date(instance.lastUpdateDate).getTime() - 
                               new Date(instance.startDate).getTime();
          stats.executionTimes.push(executionTime);
        }

        workflowStats.set(instance.workflow_id, stats);
      });

      // Update status cache
      for (const [workflowId, stats] of workflowStats) {
        const status: WorkflowStatus = {
          id: workflowId,
          name: 'Workflow', // Will be updated when we get workflow details
          status: this.calculateStatus(stats),
          lastCheck: new Date(),
          activeInstances: stats.active,
          errorCount: stats.errors,
          performance: {
            avgExecutionTime: this.calculateAverage(stats.executionTimes),
            successRate: ((stats.total - stats.errors) / stats.total) * 100
          }
        };

        this.statusCache.set(workflowId, status);
      }
    } catch (error) {
      console.error('Error updating workflow statuses:', error);
    }
  }

  private calculateStatus(stats: { total: number; errors: number; active: number }): 'Operational' | 'Degraded' | 'Down' {
    const errorRate = stats.errors / stats.total;
    
    if (errorRate >= 0.25) { // 25% or more errors
      return 'Down';
    } else if (errorRate >= 0.1) { // 10% or more errors
      return 'Degraded';
    }
    return 'Operational';
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  public async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus | null> {
    return this.statusCache.get(workflowId) || null;
  }

  public async getAllWorkflowStatuses(): Promise<WorkflowStatus[]> {
    return Array.from(this.statusCache.values());
  }

  public async getOverallWorkflowStatus(): Promise<'Operational' | 'Degraded' | 'Down'> {
    const statuses = await this.getAllWorkflowStatuses();
    
    if (statuses.length === 0) return 'Operational';
    
    if (statuses.some(s => s.status === 'Down')) {
      return 'Down';
    }
    
    if (statuses.some(s => s.status === 'Degraded')) {
      return 'Degraded';
    }
    
    return 'Operational';
  }

  /**
   * Get workflow instances for a specific workflow
   */
  public async getWorkflowInstances(workflowId: string): Promise<GsbWorkflowInstance[]> {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    try {
      const queryParams = new QueryParams<GsbWorkflowInstance>('GsbWorkflowInstance');
      queryParams.calcTotalCount = true;
      queryParams.startIndex = 0;
      queryParams.count = 1000;
      
      // Add workflow ID filter
      queryParams.where('workflow_id', workflowId);
      
      // Sort by last update date
      const sortCol = new SelectCol('lastUpdateDate');
      const sort = new SortCol();
      sort.col = sortCol;
      sort.sortType = 'desc';
      queryParams.sortCols = [sort];

      const response = await this.entityService.query(
        queryParams,
        token,
        tenantCode
      ) as WorkflowQueryResponse;

      return response.items || [];
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      return [];
    }
  }

  public destroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }
} 