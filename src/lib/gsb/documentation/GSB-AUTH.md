# GSB Authentication Guide

## Overview

GSB provides a robust authentication system through its `/api/auth/getToken` endpoint. This guide covers how to authenticate with GSB and manage authentication tokens.

## Authentication Flow

### Getting a Token

To authenticate and receive a token, make a POST request to `/api/auth/getToken` with the following structure:

```typescript
interface GetTokenRequest {
    email: string;
    password: string;
    remember?: boolean;
    includeUserInfo?: boolean;
    variation?: {
        tenantCode: string;
    };
}
```

### Response Structure

The authentication response includes the token and user information:

```typescript
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
```

### Example Usage

```typescript
// Example of authentication request
const authRequest = {
    email: "user@example.com",
    password: "userPassword",
    remember: true,
    includeUserInfo: true,
    variation: {
        tenantCode: "apexbase"
    }
};

// Making the authentication request
const response = await fetch('/api/auth/getToken', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(authRequest)
});

const authData = await response.json();
// Store the token for subsequent requests
const token = authData.auth.token;
```

## Using the Token

Once you have obtained a token:

1. Include it in the `Authorization` header of subsequent requests:
   ```typescript
   headers: {
       'Authorization': `Bearer ${token}`
   }
   ```

2. The token contains encoded information about:
   - User ID (`uid`)
   - Tenant Code (`tc`)
   - Instance ID (`i`)
   - Expiration Time (`exp`)
   - Issuer (`iss`)

## Best Practices

1. **Token Storage**
   - Store tokens securely
   - Never store in plain localStorage
   - Consider using secure HTTP-only cookies

2. **Token Renewal**
   - Monitor token expiration
   - Implement refresh token logic if needed
   - Handle expired token scenarios gracefully

3. **Security Considerations**
   - Always use HTTPS
   - Implement proper token validation
   - Handle token revocation
   - Implement proper error handling

4. **Multi-Tenant Support**
   - Always include the correct tenant code
   - Handle tenant-specific configurations
   - Validate tenant access rights

## Error Handling

Common authentication errors and how to handle them:

1. Invalid Credentials
   ```json
   {
       "status": 401,
       "message": "Invalid credentials"
   }
   ```

2. Missing Tenant Code
   ```json
   {
       "status": 400,
       "message": "Tenant code is required"
   }
   ```

3. Expired Token
   ```json
   {
       "status": 401,
       "message": "Token has expired"
   }
   ```

## Integration with GsbEntityService

The GsbEntityService automatically handles authentication tokens for all CRUD operations. Simply provide the token when making requests:

```typescript
const entityService = new GsbEntityService();

// The token is required for all operations
const response = await entityService.query(queryParams, token, tenantCode);
``` 