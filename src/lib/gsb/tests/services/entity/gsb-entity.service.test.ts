import { GsbEntityService } from '../../../services/entity/gsb-entity.service';
import { GsbSaveRequest } from '../../../types/requests';
import { GsbQueryResponse, GsbSaveResponse, GsbQueryOpResponse } from '../../../types/responses';
import { describe, beforeEach, it, expect, beforeAll, afterAll } from 'vitest';
import { QueryParams } from '../../../types/query-params';
import { QueryFunction, SingleQuery, AggregateFunction } from '../../../types/query';
import { getTestToken, TEST_CONFIG, cleanupTestEntities } from '../../test-helper';
import { ServiceHelper } from '../../../utils/service-helper';
import { logger } from '../../../utils/logger';

interface TestEntity {
    id?: string;
    title: string;
}

describe('GsbEntityService', () => {
    let entityService: GsbEntityService;
    let testToken: string;
    const TEST_ENTITY_PREFIX = 'TEST_ENTITY_';

    // Set up test suite - get authentication token once for all tests
    beforeAll(async () => {
        try {
            testToken = await getTestToken();
            logger.info('Test token acquired for entity service tests');
        } catch (error) {
            logger.error('Failed to get test token for entity tests:', error);
            throw error;
        }
    });

    // Clean up after all tests
    afterAll(async () => {
        try {
            await cleanupTestEntities(entityService, 'test', TEST_ENTITY_PREFIX, testToken);
            logger.info('Test entities cleanup completed');
        } catch (error) {
            logger.error('Error during test cleanup:', error);
        }
    });

    beforeEach(() => {
        entityService = new GsbEntityService();
    });

    describe('Authentication', () => {
        it('should get authentication token', async () => {
            const authRequest = {
                email: TEST_CONFIG.EMAIL,
                password: TEST_CONFIG.PASSWORD,
                remember: true,
                includeUserInfo: true,
                variation: {
                    tenantCode: TEST_CONFIG.TENANT_CODE
                }
            };

            const response = await entityService.getToken(authRequest);

            expect(response).toBeDefined();
            expect(response.auth).toBeDefined();
            expect(response.auth.token).toBeDefined();
            expect(response.auth.userId).toBeDefined();
            expect(response.auth.roles).toBeDefined();
            expect(Array.isArray(response.auth.roles)).toBe(true);
            expect(response.status).toBe(0);
        });

        it('should fail with invalid credentials', async () => {
            const authRequest = {
                email: 'invalid@example.com',
                password: 'wrongpassword',
                remember: true,
                includeUserInfo: true,
                variation: {
                    tenantCode: TEST_CONFIG.TENANT_CODE
                }
            };

            await expect(entityService.getToken(authRequest)).rejects.toThrow();
        });
    });

    describe('CRUD Operations', () => {
        let createdEntityId: string;

        it('should create a new test entity', async () => {
            const testEntity: TestEntity = {
                title: `${TEST_ENTITY_PREFIX}Create Test`
            };

            // Use ServiceHelper to prepare the save request
            const saveRequest = ServiceHelper.prepareSaveRequest('test', testEntity, true);

            const response = await entityService.save(
                saveRequest,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbSaveResponse;

            expect(response).toBeDefined();
            expect(response.id).toBeDefined();

            createdEntityId = response.id as string;
        });

        it('should get the created test entity', async () => {
            const entity = await entityService.getById<TestEntity>(
                'test',
                createdEntityId,
                testToken,
                TEST_CONFIG.TENANT_CODE
            );

            expect(entity).toBeDefined();
            expect(entity?.id).toBe(createdEntityId);
            expect(entity?.title).toBe(`${TEST_ENTITY_PREFIX}Create Test`);
        });

        it('should update the test entity title', async () => {
            const updatedEntity: TestEntity = {
                id: createdEntityId,
                title: `${TEST_ENTITY_PREFIX}Updated Test`
            };

            // Use ServiceHelper to prepare the save request for update
            const saveRequest = ServiceHelper.prepareSaveRequest('test', updatedEntity);

            const response = await entityService.save(
                saveRequest,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbSaveResponse;

            expect(response).toBeDefined();
            expect(response.id).toBeDefined();
        });

        it('should query and verify the updated title', async () => {
            // Use updated SingleQuery structure with col and val
            const query = ServiceHelper.prepareQuery(
                'test',
                1,
                10,
                [new SingleQuery('id', createdEntityId).isEqual(createdEntityId)]
            );

            const response = await entityService.query(
                query,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(response.entities).toBeDefined();
            expect(response.entities?.length).toBe(1);
            expect((response.entities?.[0] as TestEntity).title).toBe(`${TEST_ENTITY_PREFIX}Updated Test`);
        });

        it('should delete the test entity', async () => {
            const deleteRequest: Partial<GsbSaveRequest> = {
                entDefName: 'test',
                entityId:  createdEntityId
            };

            const response = await entityService.delete(
                deleteRequest as GsbSaveRequest,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbQueryOpResponse;

            expect(response).toBeDefined();
            expect(response.deleteCount).toBe(1);
        });

        it('should verify the entity is deleted', async () => {
            const entity = await entityService.getById<TestEntity>(
                'test',
                createdEntityId,
                testToken,
                TEST_CONFIG.TENANT_CODE
            );

            expect(Object.keys({...entity})?.length).toBe(0);
        });
    });

    describe('Query Operations', () => {
        it('should handle pagination', async () => {
            // Use ServiceHelper to prepare the query with pagination
            const query = ServiceHelper.prepareQuery('test', 1, 10);

            const response = await entityService.query(
                query,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(Array.isArray(response.entities)).toBe(true);
        });

        it('should handle sorting', async () => {
            // Use ServiceHelper to prepare the query with custom sorting
            const query = ServiceHelper.prepareQuery(
                'test',
                1,
                10,
                [],
                [{
                    col: { name: 'title' },
                    sortType: 'ASC'
                }]
            );

            const response = await entityService.query(
                query,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(Array.isArray(response.entities)).toBe(true);
        });

        it('should handle complex queries', async () => {
            // Use updated SingleQuery structure with col and val
            const query = ServiceHelper.prepareQuery(
                'test',
                1,
                10,
                [new SingleQuery('title').isLike(TEST_ENTITY_PREFIX)],
                [{
                    col: { name: 'title' },
                    sortType: 'ASC'
                }]
            );

            const response = await entityService.query(
                query,
                testToken,
                TEST_CONFIG.TENANT_CODE
            ) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(Array.isArray(response.entities)).toBe(true);
        });

        it('should handle aggregate functions', async () => {
            // Test using aggregate function
            const query = ServiceHelper.prepareQuery(
                'test',
                1,
                10,
                [new SingleQuery('someNumericField')
                    .aggregate(AggregateFunction.Sum)
                    .groupBy()
                    .isGreater(0)]
            );

            // Just testing query structure, not actual results
            expect(query.query?.[0].col?.name).toBe('someNumericField');
            expect(query.query?.[0].col?.aggregateFunction).toBe(AggregateFunction.Sum);
            expect(query.query?.[0].col?.groupBy).toBe(true);
            expect(query.query?.[0].val?.value).toBe(0);
        });
    });
});
