import { GsbEntityService } from './gsb-entity.service';
import { GsbSaveRequest } from '../types/requests';
import { GsbQueryResponse, GsbSaveResponse, GsbQueryOpResponse } from '../types/responses';
import { describe, beforeEach, it, expect } from 'vitest';
import { QueryParams } from '../types/query-params';
import { QueryFunction, SingleQuery } from '../types/query';

interface TestEntity {
    id?: string;
    title: string;
}

describe('GsbEntityService', () => {
    let entityService: GsbEntityService;
    let TEST_TOKEN: string;
    const TEST_TENANT = 'apexbase';
    const TEST_EMAIL = 'ali@gsbtech.com.tr';
    const TEST_PASSWORD = '!2Gsb2024'; // Replace with actual test password

    beforeEach(() => {
        entityService = new GsbEntityService();
    });

    describe('Authentication', () => {
        it('should get authentication token', async () => {
            const authRequest = {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                remember: true,
                includeUserInfo: true,
                variation: {
                    tenantCode: TEST_TENANT
                }
            };

            const response = await entityService.getToken(authRequest);
            console.log(response);
            expect(response).toBeDefined();
            expect(response.auth).toBeDefined();
            expect(response.auth.token).toBeDefined();
            expect(response.auth.userId).toBeDefined();
            expect(response.auth.roles).toBeDefined();
            expect(Array.isArray(response.auth.roles)).toBe(true);
            expect(response.status).toBe(0);

            // Store token for other tests
            TEST_TOKEN = response.auth.token;
        });

        it('should fail with invalid credentials', async () => {
            const authRequest = {
                email: 'invalid@example.com',
                password: 'wrongpassword',
                remember: true,
                includeUserInfo: true,
                variation: {
                    tenantCode: TEST_TENANT
                }
            };

            await expect(entityService.getToken(authRequest)).rejects.toThrow();
        });
    });

    describe('CRUD Operations', () => {
        let createdEntityId: string;

        it('should create a new test entity', async () => {
            const testEntity: TestEntity = {
                title: 'Test Entity'
            };

            const saveRequest: Partial<GsbSaveRequest> = {
                entDefName: 'test',
                entity: testEntity
            };

            const response = await entityService.save(saveRequest as GsbSaveRequest, TEST_TOKEN, TEST_TENANT) as GsbSaveResponse;

            expect(response).toBeDefined();
            expect(response.id).toBeDefined();

            createdEntityId = response.id as string;
        });

        it('should get the created test entity', async () => {
            const entity = await entityService.getById<TestEntity>('test', createdEntityId, TEST_TOKEN, TEST_TENANT);

            expect(entity).toBeDefined();
            expect(entity?.id).toBe(createdEntityId);
            expect(entity?.title).toBe('Test Entity');
        });

        it('should update the test entity title', async () => {
            const updatedEntity: TestEntity = {
                id: createdEntityId,
                title: 'Updated Test Entity'
            };

            const saveRequest: Partial<GsbSaveRequest> = {
                entDefName: 'test',
                entity: updatedEntity
            };

            const response = await entityService.save(saveRequest as GsbSaveRequest, TEST_TOKEN, TEST_TENANT) as GsbSaveResponse;

            expect(response).toBeDefined();
            expect(response.id).toBeDefined();
        });

        it('should query and verify the updated title', async () => {
            const query: any = {
                entDefName: 'test',
                query: [
                    {
                        propVal: {
                            name: 'id',
                            value: createdEntityId
                        },
                        function: QueryFunction.Equals
                    }
                ]
            };

            const response = await entityService.query(query, TEST_TOKEN, TEST_TENANT) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(response.entities).toBeDefined();
            expect(response.entities?.length).toBe(1);
            expect((response.entities?.[0] as TestEntity).title).toBe('Updated Test Entity');
        });

        it('should delete the test entity', async () => {
            const deleteRequest: Partial<GsbSaveRequest> = {
                entDefName: 'test',
                entityId:  createdEntityId
            };

            const response = await entityService.delete(deleteRequest as GsbSaveRequest, TEST_TOKEN, TEST_TENANT) as GsbQueryOpResponse;

            expect(response).toBeDefined();
            expect(response.deleteCount).toBe(1);
        });

        it('should verify the entity is deleted', async () => {
            const entity :any = await entityService.getById<TestEntity>('test', createdEntityId, TEST_TOKEN, TEST_TENANT);
            expect(Object.keys(entity)?.length).toBe(0);
        });
    });

    describe('Query Operations', () => {
        it('should handle pagination', async () => {
            const query: any = {
                entDefName: 'test',
                startIndex: 0,
                count: 10,
                calcTotalCount: true
            };

            const response = await entityService.query(query, TEST_TOKEN, TEST_TENANT) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(Array.isArray(response.entities)).toBe(true);
        });

        it('should handle sorting', async () => {
            const query: any = {
                entDefName: 'test',
                sortCols: [
                    {
                        col: { name: 'title' },
                        sortType: 'ASC'
                    }
                ]
            };

            const response = await entityService.query(query, TEST_TOKEN, TEST_TENANT) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(Array.isArray(response.entities)).toBe(true);
        });

        it('should handle complex queries', async () => {
            const query : any = {
                entDefName: 'test',
                query: [
                    {
                        propVal: {
                            name: 'title',
                            value: 'Test'
                        },
                        function: QueryFunction.Like
                    }
                ],
                sortCols: [
                    {
                        col: { name: 'title' },
                        sortType: 'ASC'
                    }
                ],
                startIndex: 0,
                count: 10,
                calcTotalCount: true
            };

            const response = await entityService.query(query, TEST_TOKEN, TEST_TENANT) as GsbQueryResponse;

            expect(response).toBeDefined();
            expect(Array.isArray(response.entities)).toBe(true);
        });
    });
});
