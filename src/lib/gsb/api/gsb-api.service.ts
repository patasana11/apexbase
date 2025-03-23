import { HttpCallRequest } from '../types/requests';
import { getGsbToken, getGsbTenantCode, GSB_CONFIG } from '../config/gsb-config';

// Store a singleton instance
let apiServiceInstance: GsbApiService | null = null;

// Path prefixes for determining which token to use - should align with gsb-config.ts
const COMMON_TOKEN_PATHS = [
  '/api/auth',
  '/api/registration',
  '/login',
  '/register',
  '/forgot-password',
  '/registration',
  '/account'
];

export class GsbApiService {
    // We'll use a simpler structure with only one base URL that changes based on tenant
    private baseUrl: string = '';

    constructor() {
        // Initialize with default tenant URL
        this.baseUrl = GSB_CONFIG.API_URL;
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
     * Set the base URL for a specific tenant
     * @param tenantCode Tenant code to use
     * @param isCommonTenant Whether this is a common tenant endpoint
     */
    setBaseUrl(tenantCode: string, isCommonTenant: boolean = false) {
        // If this is a common tenant endpoint and we're not explicitly using a common tenant code,
        // we should ensure we're using the AUTH_URL
        if (isCommonTenant && tenantCode !== GSB_CONFIG.COMMON_TENANT) {
            this.baseUrl = GSB_CONFIG.AUTH_URL;
            console.log(`Set common tenant base URL: ${this.baseUrl}`);
        } else {
            this.baseUrl = GSB_CONFIG.getTenantUrl(tenantCode);
            console.log(`Set base URL: ${this.baseUrl} for tenant: ${tenantCode}`);
        }
    }

    /**
     * Check if the path is for a common tenant endpoint
     */
    private isCommonTenantEndpoint(path: string): boolean {
        return COMMON_TOKEN_PATHS.some(prefix => path.startsWith(prefix));
    }

    /**
     * Extract tenant code from a JWT token
     * @param token The JWT token
     * @returns The tenant code or undefined
     */
    private extractTenantCode(token: string): string | undefined {
        return GSB_CONFIG.extractTenantCode(token);
    }

    /**
     * Make an HTTP call
     */
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

    /**
     * Execute HTTP call asynchronously
     */
    async httpCallAsync(dto: any) {
        console.log('HTTP call async to path:', dto.path);

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

    /**
     * Convert request parameters to fetch request data
     */
    convertToRequestData(requestParameters: any) {
        const url = new URL(requestParameters.path || '', this.baseUrl).toString();

        const init: RequestInit = {
            method: requestParameters.method,
            headers: {
                'Content-Type': requestParameters.contentType || 'application/json',
                // Only add Authorization header if noAuth is not true and we have a bearerToken
                ...(!requestParameters.noAuth && requestParameters.bearerToken ? { 'Authorization': `Bearer ${requestParameters.bearerToken}` } : {}),
                ...requestParameters.headers
            }
        };
        if (requestParameters.content) {
            init.body = JSON.stringify(requestParameters.content);
        }
        return { url, init };
    }

    /**
     * Call the API with the appropriate token and tenant code
     */
    async callApi(req: HttpCallRequest, endPoint: string, token?: string, tenantCode?: string) {
        console.log(`Calling API endpoint: ${endPoint}`);

        // Check if this is a common tenant endpoint
        const isCommonTenant = this.isCommonTenantEndpoint(endPoint);
        console.log(`Endpoint ${endPoint} is ${isCommonTenant ? 'a common' : 'a user'} tenant endpoint`);

        // Skip token logic if noAuth is true
        let bearerToken: string | undefined = undefined;
        if (!req.noAuth) {
            // If no token is provided, get the appropriate token based on the endpoint
            if (!token) {
                token = getGsbToken(endPoint); 
                console.log(`Using token based on endpoint path: ${endPoint}`);
            }
            
            bearerToken = token;
        } else {
            console.log('noAuth flag is set, skipping authentication token');
        }

        // If no tenant code is provided and we have a token, extract it from the token
        if (!tenantCode && token) {
            tenantCode = this.extractTenantCode(token);
            console.log(`Extracted tenant code from token: ${tenantCode}`);
        }

        // If still no tenant code, get it from config
        if (!tenantCode) {
            tenantCode = getGsbTenantCode(endPoint);
            console.log(`Using tenant code from config: ${tenantCode}`);
        }

        // Set the base URL for this request, considering if it's a common tenant endpoint
        this.setBaseUrl(tenantCode, isCommonTenant);

        // Prepare the request
        const request: HttpCallRequest = {
            ...req,
            path: endPoint,
            bearerToken: bearerToken,
            contentType: req.contentType || 'application/json',
            jsonResponse: req.jsonResponse !== undefined ? req.jsonResponse : true
        };

        return this.httpCall(request);
    }
}
