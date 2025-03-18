'use client';

import { GsbEntityService } from '../../services/entity/gsb-entity.service';
import { getGsbToken, getGsbTenantCode } from '../../config/gsb-config';
import { GsbWorkflow, GsbActivity, GsbTransition } from '@/models/workflow';
import { QueryParams } from '../../types/query-params';
import { createEmptyWorkflow } from './workflow-utils';
import { GsbSaveRequest } from '../../types/requests';
import { GsbQueryResponse, GsbSaveResponse, GsbQueryOpResponse } from '../../types/responses';

export class GsbWorkflowService {
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbWorkflow';

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Get a list of all workflows
   */
  async getWorkflows(): Promise<GsbWorkflow[]> {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    const queryParams = new QueryParams<GsbWorkflow>(this.ENTITY_NAME);
    queryParams.calcTotalCount = true;
    queryParams.startIndex = 0;
    queryParams.count = 1000;

    // Include activities and transitions
    queryParams.incS(['activities', 'transitions']);

    const response = await this.entityService.query(queryParams, token, tenantCode);
    return (response.entities || []) as GsbWorkflow[];
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflowById(id: string): Promise<GsbWorkflow | null> {
    if (id === 'new') {
      return createEmptyWorkflow('New Workflow');
    }

    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    try {
      const queryParams = new QueryParams<GsbWorkflow>(this.ENTITY_NAME);
      queryParams.entityId = id;
      
      // Include activities and transitions
      queryParams.incS(['activities', 'transitions']);

      const response = await this.entityService.query(queryParams, token, tenantCode);
      return (response.entity || null) as GsbWorkflow;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  /**
   * Save or update a workflow
   */
  async saveWorkflow(workflow: GsbWorkflow): Promise<GsbWorkflow> {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    try {
      // Prepare the save request
      const saveRequest = new GsbSaveRequest();
      saveRequest.entDefId = this.ENTITY_NAME;
      saveRequest.entDefName = this.ENTITY_NAME;
      saveRequest.entityDef = {};
      saveRequest.entity = workflow;
      saveRequest.entityId = workflow.id === 'new' ? '' : workflow.id;
      saveRequest.query = [];

      const response = await this.entityService.save(saveRequest, token, tenantCode);
      
      // After saving, fetch the updated workflow
      if (!response.id) {
        throw new Error('No ID returned from save operation');
      }

      const savedWorkflow = await this.getWorkflowById(response.id);
      if (!savedWorkflow) {
        throw new Error('Could not fetch saved workflow');
      }

      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    try {
      const deleteRequest = new GsbSaveRequest();
      deleteRequest.entDefName = 'GsbWorkflow';
      deleteRequest.entityId = id;

      await this.entityService.delete(deleteRequest, token, tenantCode);
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  /**
   * Start a workflow instance
   */
  async startWorkflow(workflowId: string, data?: any): Promise<any> {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    try {
      const response = await this.entityService.startWorkflow({
        workflow_id: workflowId,
        data
      }, token, tenantCode);

      return response;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Run a workflow function
   */
  async runWorkflowFunction(functionId: string, data?: any): Promise<any> {
    const token = getGsbToken();
    const tenantCode = getGsbTenantCode();

    try {
      const response = await this.entityService.runWfFunction({
        function_id: functionId,
        data
      }, token, tenantCode);

      return response;
    } catch (error) {
      console.error('Error running workflow function:', error);
      throw error;
    }
  }
} 