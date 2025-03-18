# GSB Module

This folder contains all GSB (Genatica Software Backend) related code, organized in a structured manner.

## Directory Structure

```
src/lib/gsb/
├── api/
│   └── gsb-api.service.ts            # Core API service for GSB
├── config/
│   ├── gsb-config.ts                 # GSB configuration
│   └── tenant-config.ts              # Tenant configuration
├── models/
│   ├── gsb-entity-def.model.ts       # Entity definition model
│   ├── gsb-file.model.ts             # File model
│   ├── gsb-function.model.ts         # Function model
│   └── gsb-user.model.ts             # User model
├── services/
│   ├── auth/
│   │   ├── auth.service.ts           # Authentication service
│   │   └── social-auth.service.ts    # Social authentication
│   ├── entity/
│   │   ├── entity-def.service.ts     # Entity definition service
│   │   └── gsb-entity.service.ts     # Core entity service
│   ├── file/
│   │   └── file.service.ts           # File service
│   ├── function/
│   │   └── function.service.ts       # Function service
│   ├── subscription/
│   │   ├── paddle-client.service.ts  # Paddle client
│   │   ├── paddle.service.ts         # Paddle service
│   │   └── subscription.service.ts   # Subscription service
│   ├── workflow/
│   │   ├── gsb-workflow.service.ts   # GSB workflow service
│   │   ├── workflow-monitor.service.ts # Workflow monitoring
│   │   └── workflow.service.ts       # Workflow service
│   ├── app-initializer.service.ts    # App initialization
│   ├── permission.service.ts         # Permission management
│   ├── registration.service.ts       # Registration service
│   └── role.service.ts               # Role management
├── types/
│   ├── query-params.ts               # Query parameters
│   ├── query.ts                      # Query definitions
│   ├── requests.ts                   # Request types
│   └── responses.ts                  # Response types
├── utils/
│   └── gsb-utils.ts                  # GSB utilities
└── index.ts                          # Barrel file
```

## Usage

Import GSB components through the barrel files:

```typescript
// Import from the main barrel file
import { GsbEntityService } from '@/lib/gsb';

// Or import from specific modules
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
```

## Services

GSB services are organized by functionality:

- **Auth Services**: Authentication and social login
- **Entity Services**: Core data entity management
- **File Services**: File operations
- **Function Services**: Functions and operations
- **Subscription Services**: Paddle integration for subscriptions
- **Workflow Services**: Business process management

## Configuration

GSB configuration is centralized in the config folder:

- **gsb-config.ts**: Core GSB configuration
- **tenant-config.ts**: Multi-tenant configuration

## Models

Data models for the GSB system:

- **gsb-entity-def.model.ts**: Entity definitions
- **gsb-file.model.ts**: File entities
- **gsb-function.model.ts**: Function entities
- **gsb-user.model.ts**: User entities
