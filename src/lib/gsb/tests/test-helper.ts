/**
 * GSB Test Helper
 *
 * Provides utility functions and mock data for testing GSB services
 */

import { GsbEntityService } from '../services/entity/gsb-entity.service';
import { GsbSaveRequest } from '../types/requests';
import { logger } from '../utils/logger';

// Test credentials (replace with environment variables in a real configuration)
export const TEST_CONFIG = {
  TENANT_CODE: 'apexbase',
  EMAIL: 'ali@gsbtech.com.tr',
  PASSWORD: '!2Gsb2024', // Should be loaded from env vars in real tests
  API_URL: process.env.NEXT_PUBLIC_GSB_API_URL || 'https://api.gsbtech.com.tr/api'
};

/**
 * Authenticates with GSB and returns a token for testing
 */
export async function getTestToken(): Promise<string> {
  const entityService = new GsbEntityService();

  const authRequest = {
    email: TEST_CONFIG.EMAIL,
    password: TEST_CONFIG.PASSWORD,
    remember: true,
    includeUserInfo: true,
    variation: {
      tenantCode: TEST_CONFIG.TENANT_CODE
    }
  };

  try {
    const response = await entityService.getToken(authRequest);
    logger.info('Test authentication successful');
    return response.auth.token;
  } catch (error) {
    logger.error('Failed to get test token:', error);
    throw new Error('Authentication failed for tests');
  }
}

/**
 * Creates a test entity and returns its ID
 */
export async function createTestEntity<T>(
  entityService: GsbEntityService,
  entityName: string,
  entityData: T,
  token: string
): Promise<string> {
  const saveRequest: Partial<GsbSaveRequest> = {
    entDefName: entityName,
    entity: entityData
  };

  try {
    const response = await entityService.save(
      saveRequest as GsbSaveRequest,
      token,
      TEST_CONFIG.TENANT_CODE
    );

    logger.info(`Test entity created with ID: ${response.id}`);
    return response.id as string;
  } catch (error) {
    logger.error('Failed to create test entity:', error);
    throw new Error(`Failed to create test entity: ${(error as Error).message}`);
  }
}

/**
 * Deletes a test entity
 */
export async function deleteTestEntity(
  entityService: GsbEntityService,
  entityName: string,
  entityId: string,
  token: string
): Promise<void> {
  const deleteRequest: Partial<GsbSaveRequest> = {
    entDefName: entityName,
    entityId: entityId
  };

  try {
    await entityService.delete(
      deleteRequest as GsbSaveRequest,
      token,
      TEST_CONFIG.TENANT_CODE
    );
    logger.info(`Test entity ${entityId} deleted`);
  } catch (error) {
    logger.error(`Failed to delete test entity ${entityId}:`, error);
    // Don't throw here - just log the error, as this is cleanup
  }
}

/**
 * Clean up function to remove test data after tests
 */
export async function cleanupTestEntities(
  entityService: GsbEntityService,
  entityName: string,
  pattern: string,
  token: string
): Promise<void> {
  // Query for test entities matching the pattern
  const query: any = {
    entDefName: entityName,
    query: [
      {
        propVal: {
          name: 'title', // Assuming entities have a title field
          value: pattern
        },
        function: 'Like'
      }
    ]
  };

  try {
    const response = await entityService.query(query, token, TEST_CONFIG.TENANT_CODE);

    if (response.entities && response.entities.length > 0) {
      logger.info(`Found ${response.entities.length} test entities to clean up`);

      // Delete each found entity
      for (const entity of response.entities) {
        if (entity.id) {
          await deleteTestEntity(entityService, entityName, entity.id, token);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to clean up test entities:', error);
  }
}
