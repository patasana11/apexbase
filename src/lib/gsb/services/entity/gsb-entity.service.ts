'use client';

import { GsbApiService } from '../../api/gsb-api.service';
import { QueryParams } from '../../types/query-params';
import { GsbSaveRequest, GsbSaveMultiRequest, GsbSaveMappedRequest, GsbGetCodeRequest } from '../../types/requests';
import { GsbQueryResponse, GsbSaveResponse, GsbQueryOpResponse, GsbSaveMultiResponse, GsbDefinitionResponse, GsbGetCodeResponse } from '../../types/responses';

// Store a singleton instance
let serviceInstance: GsbEntityService | null = null;

interface GetTokenRequest {
    email: string;
    password: string;
    remember?: boolean;
    includeUserInfo?: boolean;
    variation?: {
        tenantCode: string;
    };
}

interface AuthResponse {
    auth: {
        userId: string;
        token: string;
        name: string;
        email: string;
        roles: string[];
        groups: string[];
        expireDate: string;
        title: string;
        opResult: boolean;
    };
    status: number;
}

export class GsbEntityService {
    private apiService: GsbApiService;
    private baseUrl: string;

    constructor(baseUrl: string = 'https://dev1.gsbapps.net') {
        console.log('Initializing GsbEntityService with baseUrl:', baseUrl);
        this.apiService = GsbApiService.getInstance();
        this.baseUrl = baseUrl;
    }

    // Static method to get the singleton instance
    static getInstance(baseUrl: string = 'https://dev1.gsbapps.net'): GsbEntityService {
        if (!serviceInstance) {
            serviceInstance = new GsbEntityService(baseUrl);
        }
        return serviceInstance;
    }

    async getToken(request: GetTokenRequest): Promise<AuthResponse> {
        console.log('Getting token from:', `${this.baseUrl}/api/auth/getToken`);
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/getToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Authentication request failed:', error);
            throw error;
        }
    }

    private async makeRequest(endpoint: string, method: string, token: string, tenant: string, body?: any): Promise<any> {
        console.log(`Making request to: ${this.baseUrl}${endpoint}, tenant: ${tenant}`);
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant': tenant
                },
                body: body ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No error details available');
                console.error(`HTTP error! status: ${response.status}, details:`, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error(`Request to ${endpoint} failed:`, error);
            throw error;
        }
    }

    async getById<T extends object>(definitionType: (new () => T) | string, id: string, token?: string, tenantCode?: string): Promise<T | null> {
        console.log(`Getting entity by ID: ${id}, definition type: ${typeof definitionType === 'string' ? definitionType : 'constructor'}`);
        const req = new GsbSaveRequest();
        if (typeof definitionType === 'string') {
            req.entDefName = definitionType;
        } else {
            const instance = new definitionType();
            if ('_entDefName' in instance) {
                req.entDefName = (instance as any)._entDefName;
            }
        }
        req.entityId = id;
        const result = await this.get(req, token, tenantCode);
        return result.entity as T;
    }

    async getCopy<T extends object>(definitionType: (new () => T) | string, id: string, token?: string, tenantCode?: string): Promise<T | null> {
        const entity = await this.getById(definitionType, id, token, tenantCode);
        if (entity) {
            delete (entity as any).id;
        }
        return entity;
    }

    async get(req: GsbSaveRequest, token?: string, tenantCode?: string): Promise<GsbQueryResponse> {
        console.log(`Getting entity, definition: ${req.entDefName}, id: ${req.entityId}`);
        try {
            const response = await this.apiService.callApi({
                method: 'POST',
                protocol: 'https',
                hostName: 'api',
                content: req
            }, '/api/entity/get', token, tenantCode);
            return response as GsbQueryResponse;
        } catch (error) {
            console.error(`Get entity failed for ${req.entDefName}:`, error);
            throw error;
        }
    }

    async query(req: QueryParams<any>, token?: string, tenantCode?: string): Promise<GsbQueryResponse> {
        console.log(`Querying entities, definition: ${req.entDefName}`);
        try {
            const response = await this.apiService.callApi({
                method: 'POST',
                protocol: 'https',
                hostName: 'api',
                content: req
            }, '/api/entity/query', token, tenantCode);
            return response as GsbQueryResponse;
        } catch (error) {
            console.error(`Query failed for ${req.entDefName}:`, error);
            throw error;
        }
    }

    async queryMapped(req: QueryParams<any>, token?: string, tenantCode?: string): Promise<GsbQueryResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/queryMapped', token, tenantCode);
        return response as GsbQueryResponse;
    }

    async saveEnt(entity: any, token?: string, tenantCode?: string): Promise<GsbSaveResponse> {
        const req = new GsbSaveRequest();
        if ('_entDefName' in entity) {
            req.entDefName = (entity as any)._entDefName;
        }
        req.entity = entity;
        return this.save(req, token, tenantCode);
    }

    async save(req: GsbSaveRequest, token?: string, tenantCode?: string): Promise<GsbSaveResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/save', token, tenantCode);
        return response as GsbSaveResponse;
    }

    async updateQuery(req: QueryParams<any>, token?: string, tenantCode?: string): Promise<GsbQueryOpResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/updateQuery', token, tenantCode);
        return response as GsbQueryOpResponse;
    }

    async saveMulti(req: GsbSaveMultiRequest, token?: string, tenantCode?: string): Promise<GsbSaveMultiResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/saveMulti', token, tenantCode);
        return response as GsbSaveMultiResponse;
    }

    async getCode(req: GsbGetCodeRequest, token?: string, tenantCode?: string): Promise<GsbGetCodeResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/getCode', token, tenantCode);
        return response as GsbGetCodeResponse;
    }

    async saveMappedItems(req: GsbSaveMappedRequest, token?: string, tenantCode?: string): Promise<GsbSaveResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/saveMappedItems', token, tenantCode);
        return response as GsbSaveResponse;
    }

    async removeMappedItems(req: GsbSaveMappedRequest, token?: string, tenantCode?: string): Promise<GsbQueryOpResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/removeMappedItems', token, tenantCode);
        return response as GsbQueryOpResponse;
    }

    async getDefinition(req: any, token?: string, tenantCode?: string): Promise<GsbDefinitionResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/getDefinition', token, tenantCode);
        return response as GsbDefinitionResponse;
    }

    async delete(req: GsbSaveRequest, token?: string, tenantCode?: string): Promise<GsbQueryOpResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/delete', token, tenantCode);
        return response as GsbQueryOpResponse;
    }

    async deleteQuery(req: QueryParams<any>, token?: string, tenantCode?: string): Promise<GsbQueryOpResponse> {
        const response = await this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/entity/deleteQuery', token, tenantCode);
        return response as GsbQueryOpResponse;
    }

    async runWorkflow(req: any, token?: string, tenantCode?: string): Promise<any> {
        return this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/workflow/run', token, tenantCode);
    }

    async startWorkflow(req: any, token?: string, tenantCode?: string): Promise<any> {
        return this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/workflow/start', token, tenantCode);
    }

    async runWfFunction(req: any, token?: string, tenantCode?: string): Promise<any> {
        return this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/workflow/function', token, tenantCode);
    }

    async iterateTask(req: any, token?: string, tenantCode?: string): Promise<any> {
        return this.apiService.callApi({
            method: 'POST',
            protocol: 'https',
            hostName: 'api',
            content: req
        }, '/api/workflow/iterate', token, tenantCode);
    }
}
