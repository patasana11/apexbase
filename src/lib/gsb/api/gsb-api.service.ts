import { HttpCallRequest } from '../types/requests';
import { getGsbToken, GSB_CONFIG } from '../config/gsb-config';

// Store a singleton instance
let apiServiceInstance: GsbApiService | null = null;

// Path prefixes for determining which token to use
const COMMON_TOKEN_PATHS = [
  '/api/auth',
  '/api/registration'
];

export class GsbApiService {
    private baseUrls: { [key: string]: string } = {
        common: '',
        user: ''
    };
    private mockResponses: Map<string, any> = new Map();

    constructor() {
        this.baseUrls.common = GSB_CONFIG.AUTH_URL || 'https://common.gsbapps.net';
        this.baseUrls.user = GSB_CONFIG.API_URL || 'https://dev1.gsbapps.net';
        this.initMockResponses();
    }

    /**
     * Get the singleton instance of the service
     */
    public static getInstance(): GsbApiService {
        if (!apiServiceInstance) {
            apiServiceInstance = new GsbApiService();
        }
        return apiServiceInstance;
    }

    /**
     * Initialize mock responses for development mode
     */
    private initMockResponses() {
        // Mock responses for common endpoints
        this.mockResponses.set('/api/auth/login', {
            auth: {
                token: 'dev-common-token-' + Date.now(),
                tenantToken: 'dev-user-token-' + Date.now(),
                userId: 'dev-user',
                name: 'Development User',
                email: 'admin@apexbase.dev',
                roles: ['admin', 'developer'],
                groups: ['all'],
                expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                title: 'Developer'
            }
        });

        // Mock entity listing
        this.mockResponses.set('/api/entity/list', {
            items: [
                { id: 'entity1', name: 'Users', description: 'User accounts' },
                { id: 'entity2', name: 'Products', description: 'Product catalog' },
                { id: 'entity3', name: 'Orders', description: 'Customer orders' },
            ],
            count: 3,
            page: 1,
            pageSize: 10,
            totalPages: 1
        });

        // Mock entity query
        this.mockResponses.set('/api/entity/query', {
            items: [
                { id: 'item1', name: 'First Item', status: 'active' },
                { id: 'item2', name: 'Second Item', status: 'pending' },
                { id: 'item3', name: 'Third Item', status: 'inactive' },
            ],
            count: 3,
            page: 1,
            pageSize: 10,
            totalPages: 1
        });
    }

    /**
     * Set the base URL for a tenant type
     * @param tenantCode Tenant code to use
     * @param isCommonTenant Whether this is the common tenant
     */
    setBaseUrl(tenantCode: string, isCommonTenant: boolean = false) {
        if (isCommonTenant) {
            this.baseUrls.common = `https://${tenantCode}.gsbapps.net`;
            console.log(`Common base URL set to: ${this.baseUrls.common}`);
        } else {
            this.baseUrls.user = `https://${tenantCode}.gsbapps.net`;
            console.log(`User base URL set to: ${this.baseUrls.user}`);
        }
    }

    /**
     * Get the appropriate base URL for the endpoint
     * @param path API endpoint path
     * @returns The base URL to use
     */
    private getBaseUrl(path: string): string {
        // Use common tenant URL for auth endpoints
        if (this.shouldUseCommonTenant(path)) {
            return this.baseUrls.common;
        }
        // Use user tenant URL for all other endpoints
        return this.baseUrls.user;
    }

    /**
     * Check if we should use the common tenant for a given path
     * @param path API endpoint path
     * @returns True if common tenant should be used
     */
    private shouldUseCommonTenant(path: string): boolean {
        return COMMON_TOKEN_PATHS.some(prefix => path.startsWith(prefix));
    }

    private extractTenantCode(token: string): string | undefined {
        // For development tokens, return the default tenant code
        if (token.startsWith('dev-token') || token.startsWith('dev-common-token') || token.startsWith('dev-user-token')) {
            return process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase';
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.tc || undefined;
        } catch (error) {
            console.error('Error extracting tenant code from token:', error);
            return undefined;
        }
    }

    async httpCall(dto: any, callback?: (response: any) => void, errorCallback?: (error: any) => void) {
        try {
            console.log('Making HTTP call with path:', dto.path);
            const response = await this.httpCallAsync(dto);
            if (callback) {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('HTTP call failed:', error);
            if (errorCallback) {
                errorCallback(error);
            }
            throw error;
        }
    }

    async httpCallAsync(dto: any) {
        console.log('HTTP call async to path:', dto.path);

        // Check for development mode and mock responses
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
            // Find exact match first
            if (this.mockResponses.has(dto.path)) {
                console.log('Development mode: Using mock response for', dto.path);
                return this.mockResponses.get(dto.path);
            }

            // Check for partial matches
            for (const [key, value] of this.mockResponses.entries()) {
                if (dto.path.includes(key)) {
                    console.log('Development mode: Using partial mock response for', dto.path);
                    return value;
                }
            }

            // For unauthorized paths, return a default mock response
            console.log('Development mode: No mock response found for', dto.path);
            return {
                success: true,
                message: 'Development mode mock response',
                data: {
                    items: [],
                    count: 0
                }
            };
        }

        // Real API call for production or when not in development mode
        const requestData = this.convertToRequestData(dto);
        console.log('Request URL:', requestData.url);
        console.log('Request method:', requestData.init.method);
        console.log('Has bearer token:', !!dto.bearerToken);

        try {
            const response = await fetch(requestData.url, requestData.init);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No error details available');
                console.error(`HTTP error! status: ${response.status}, details:`, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response received successfully');
            return data;
        } catch (error) {
            console.error('Fetch operation failed:', error);
            throw error;
        }
    }

    convertToRequestData(requestParameters: any) {
        // Get the appropriate base URL based on the endpoint path
        const baseUrl = this.getBaseUrl(requestParameters.path || '');
        const url = new URL(requestParameters.path || '', baseUrl).toString();

        const init: RequestInit = {
            method: requestParameters.method,
            headers: {
                'Content-Type': requestParameters.contentType || 'application/json',
                ...(requestParameters.bearerToken ? { 'Authorization': `Bearer ${requestParameters.bearerToken}` } : {}),
                ...requestParameters.headers
            }
        };
        if (requestParameters.content) {
            init.body = JSON.stringify(requestParameters.content);
        }
        return { url, init };
    }

    async callApi(req: HttpCallRequest, endPoint: string, token?: string, tenantCode?: string) {
        console.log(`Calling API endpoint: ${endPoint}`);

        // If no token is provided, get the appropriate token based on the endpoint
        if (!token) {
            token = getGsbToken(endPoint);
            console.log(`Using token based on endpoint path: ${endPoint}`);
        }

        if (token && !tenantCode) {
            tenantCode = this.extractTenantCode(token);
            console.log(`Extracted tenant code from token: ${tenantCode}`);
        }

        // Determine if this is a common tenant endpoint
        const isCommonTenantEndpoint = this.shouldUseCommonTenant(endPoint);

        if (tenantCode) {
            this.setBaseUrl(tenantCode, isCommonTenantEndpoint);
        } else if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
            // In development mode, use the default tenant code
            tenantCode = process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase';
            const commonTenant = 'common';

            if (isCommonTenantEndpoint) {
                this.setBaseUrl(commonTenant, true);
            } else {
                this.setBaseUrl(tenantCode, false);
            }

            console.log(`Development mode: Using ${isCommonTenantEndpoint ? 'common' : 'user'} tenant: ${isCommonTenantEndpoint ? commonTenant : tenantCode}`);
        } else {
            console.warn('No tenant code provided for API call');
        }

        const request: HttpCallRequest = {
            ...req,
            path: endPoint,
            bearerToken: token,
            contentType: req.contentType || 'application/json',
            jsonResponse: req.jsonResponse !== undefined ? req.jsonResponse : true
        };

        return this.httpCall(request);
    }
}
