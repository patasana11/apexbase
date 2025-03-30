# GSB CRUD Operations Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Types](#core-types)
3. [Entity Service Implementation](#entity-service-implementation)
4. [CRUD Operations](#crud-operations)
5. [Best Practices](#best-practices)

## Overview

GSB (Generic Service Backend) provides a framework for implementing CRUD (Create, Read, Update, Delete) operations for entities. This guide covers the implementation details and best practices for working with GSB.

## Core Types

### Request Types

```typescript
// Save Request
interface GsbSaveRequest {
    entDefName: string;      // Entity definition name
    entDefId?: string;       // Entity definition ID (alternative to entDefName)
    entityDef?: {           // Entity definition object (alternative to entDefName/entDefId)
        id?: string;
        name?: string;
    };
    entity: any;            // The entity data to save
}

// Query Parameters
interface QueryParams<T> {
    entDefName?: string;     // Entity definition name
    entDefId?: string;       // Entity definition ID
    entityDef?: {           // Entity definition object
        id?: string;
        name?: string;
    };
    propertyName?: string;
    entity?: T | null;
    id?: string;
    query?: SingleQuery[];
    startIndex?: number;
    count?: number;
    sortCols?: { col: SelectCol; sortType: 'ASC' | 'DESC' }[];
    calcTotalCount?: boolean;
    // ... additional query parameters as needed
}

interface SingleQuery {
    propVal: PropertyValue;
    function: QueryFunction;
    relationLevel?: number;
    children?: SingleQuery[];
    relation?: string;
    name?: string;
    negate?: boolean;
}

interface PropertyValue {
    name: string;
    value: any;
    type?: string;
    valueScript?: string;
    label?: string;
}
```

### Response Types

```typescript
interface GsbQueryResponse {
    message?: string;
    status?: number;
    entities?: any[];
}

interface GsbSaveResponse {
    message?: string;
    status?: number;
    id?: string;
}

interface GsbQueryOpResponse {
    message?: string;
    status?: number;
    affectedRowCount?: number;
}
```

## Entity Service Implementation

### Basic Entity Service

```typescript
class GsbEntityService {
    // Create or Update an entity
    async save(request: GsbSaveRequest, token: string, tenant: string): Promise<GsbSaveResponse> {
        // Implementation
    }

    // Query entities
    async query(params: QueryParams<any>, token: string, tenant: string): Promise<GsbQueryResponse> {
        // Implementation
    }

    // Delete an entity
    async delete(request: GsbSaveRequest, token: string, tenant: string): Promise<GsbQueryOpResponse> {
        // Implementation
    }

    // Get entity by ID
    async getById<T>(entDefName: string, id: string, token: string, tenant: string): Promise<T | null> {
        // Implementation
    }
}
```

## CRUD Operations

### Create

```typescript
// Example: Creating a new entity
const saveRequest: GsbSaveRequest = {
    entDefName: 'test',  // Only one of entDefName, entDefId, or entityDef is required
    entity: {
        title: 'New Entity'
    }
};

const response = await entityService.save(saveRequest, token, tenant);
// Response will contain:
// - message: string (optional)
// - status: number (optional)
// - id: string (optional) - The ID of the created entity
```

### Read

```typescript
// Example: Querying entities
const queryParams: QueryParams<any> = {
    entDefName: 'test',
    query: [
        {
            propVal: {
                name: 'title',
                value: 'Test',
                type: 'string'
            },
            function: 'like'
        }
    ],
    startIndex: 0,
    count: 10
};

const response = await entityService.query(queryParams, token, tenant);
// Response will contain:
// - message: string (optional)
// - status: number (optional)
// - entities: any[] (optional) - Array of matching entities

// Getting entity by ID
const entity = await entityService.getById('test', 'entity-id', token, tenant);
```

### Update

```typescript
// Example: Updating an existing entity
const updateRequest: GsbSaveRequest = {
    entDefName: 'test',
    entity: {
        id: 'existing-id',
        title: 'Updated Title'
    }
};

const response = await entityService.save(updateRequest, token, tenant);
// Response will contain:
// - message: string (optional)
// - status: number (optional)
// - id: string (optional) - The ID of the updated entity
```

### Delete

```typescript
// Example: Deleting an entity
const deleteRequest: GsbSaveRequest = {
    entDefName: 'test',
    entity: {
        id: 'entity-to-delete'
    }
};

const response = await entityService.delete(deleteRequest, token, tenant);
// Response will contain:
// - message: string (optional)
// - status: number (optional)
// - affectedRowCount: number (optional) - Number of deleted records
```

### Query Operations
   - Always specify pagination parameters (`startIndex` and `count`) for large datasets
   - Use appropriate query functions for filtering
   - Include only necessary fields in the response using `selectCols`
   - For search operations, simply use the `filter` parameter - GSB will automatically:
     - Search across all searchable fields

### Search Implementation
```typescript
// Example: Simple search implementation
const queryParams: QueryParams<any> = {
    entDefName: 'test',
    filter: 'search term',  // GSB handles the search automatically
    startIndex: 0,
    count: 10
};

const response = await entityService.query(queryParams, token, tenant);
```

GSB provides automatic search capabilities that:
1. Search across all searchable fields defined in the entity
2. Apply appropriate search algorithms based on field types
3. Handle text normalization and matching
4. Optimize search performance
5. Support partial matches and fuzzy searching
6. Handle special characters and case sensitivity appropriately

No additional configuration is needed - just provide the search term in the `filter` parameter.

## Best Practices

1. **Entity Definition Identification**
   - Use `entDefName` when you know the entity definition name
   - Use `entDefId` when you have the entity definition ID
   - Use `entityDef` object only when you need to provide additional entity definition details

2. **Query Operations**
   - Always specify pagination parameters (`startIndex` and `count`) for large datasets
   - Use appropriate query functions for filtering
   - Include only necessary fields in the response using `selectCols`

3. **Save Operations**
   - Always include the entity ID when updating existing entities
   - Validate required fields before sending the request
   - Handle save response errors appropriately

4. **Delete Operations**
   - Verify entity existence before deletion
   - Handle cascade deletion scenarios appropriately
   - Check `affectedRowCount` to confirm deletion

5. **Error Handling**
   - Always check response status
   - Handle error messages appropriately
   - Implement proper error recovery mechanisms

6. **Security**
   - Always include valid authentication token
   - Always include tenant information
   - Implement proper access control

7. **Performance**
   - Use pagination for large datasets
   - Implement caching when appropriate
   - Optimize query parameters for better performance

8. **Testing**
   - Test all CRUD operations
   - Verify response structures
   - Implement proper error scenario testing 