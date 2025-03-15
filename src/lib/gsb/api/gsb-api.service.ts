import { HttpCallRequest } from '../types/requests';

export class GsbApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '';
    }

    setBaseUrl(tenantCode: string) {
        this.baseUrl = `https://${tenantCode}.gsbapps.net`;
        console.log(`Base URL set to: ${this.baseUrl}`);
    }

    private extractTenantCode(token: string): string | undefined {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.error('Token payload:', payload);
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
        const url = new URL(requestParameters.path || '', this.baseUrl).toString();
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

        if (token && !tenantCode) {
            tenantCode = this.extractTenantCode(token);
            console.log(`Extracted tenant code from token: ${tenantCode}`);
        }

        if (tenantCode) {
            this.setBaseUrl(tenantCode);
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
