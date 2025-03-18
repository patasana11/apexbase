import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { EntityDefService } from '../../../services/entity/entity-def.service';
import { GsbEntityDef, GsbProperty } from '../../../models/gsb-entity-def.model';
import { getTestToken, TEST_CONFIG, cleanupTestEntities } from '../../test-helper';
import { ServiceHelper } from '../../../utils/service-helper';
import { logger } from '../../../utils/logger';
import { GsbEntityService } from '../../../services/entity/gsb-entity.service';

describe('EntityDefService', () => {
  let entityDefService: EntityDefService;
  let entityService: GsbEntityService;
  let testToken: string;
  const TEST_DEF_PREFIX = 'TEST_DEF_';

  // Set up test suite - get authentication token once for all tests
  beforeAll(async () => {
    try {
      testToken = await getTestToken();
      logger.info('Test token acquired for entity def service tests');
    } catch (error) {
      logger.error('Failed to get test token for entity def tests:', error);
      throw error;
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
      if (entityService) {
        await cleanupTestEntities(entityService, 'EntityDef', TEST_DEF_PREFIX, testToken);
        logger.info('Test entity defs cleanup completed');
      }
    } catch (error) {
      logger.error('Error during test cleanup:', error);
    }
  });

  beforeEach(() => {
    entityDefService = new EntityDefService();
    entityService = new GsbEntityService();
  });

  describe('CRUD Operations', () => {
    let createdEntityDefId: string;

    it('should create a new entity definition', async () => {
      const newEntityDef: any = {
        name: `${TEST_DEF_PREFIX}TestEntity`,
        displayName: 'Test Entity',
        description: 'A test entity definition',
        properties: [
          {
            name: 'title',
            displayName: 'Title',
            dataType: 'String',
            required: true,
            searchable: true
          } as GsbProperty,
          {
            name: 'description',
            displayName: 'Description',
            dataType: 'String',
            required: false,
            searchable: true
          } as GsbProperty,
          {
            name: 'isActive',
            displayName: 'Active',
            dataType: 'Boolean',
            required: false,
            defaultValue: 'true'
          } as GsbProperty
        ]
      };

      const savedDef = await entityDefService.save(newEntityDef, testToken, TEST_CONFIG.TENANT_CODE);

      expect(savedDef).toBeDefined();
      expect(savedDef.id).toBeDefined();

      createdEntityDefId = savedDef.id!;
      logger.info(`Created test entity def with ID: ${createdEntityDefId}`);
    });

    it('should get the created entity definition', async () => {
      const entityDef = await entityDefService.getById(createdEntityDefId, testToken, TEST_CONFIG.TENANT_CODE);

      expect(entityDef).toBeDefined();
      expect(entityDef.id).toBe(createdEntityDefId);
      expect(entityDef.name).toBe(`${TEST_DEF_PREFIX}TestEntity`);
      expect(entityDef.displayName).toBe('Test Entity');
      expect(Array.isArray(entityDef.properties)).toBe(true);
      expect(entityDef.properties.length).toBe(3);

      // Check properties
      const titleProp = entityDef.properties.find(p => p.name === 'title');
      expect(titleProp).toBeDefined();
      expect(titleProp?.dataType).toBe('String');
      expect(titleProp?.required).toBe(true);
    });

    it('should update the entity definition', async () => {
      // First, get the current definition
      const currentDef = await entityDefService.getById(createdEntityDefId, testToken, TEST_CONFIG.TENANT_CODE);

      // Update the definition
      const updatedDef: GsbEntityDef = {
        ...currentDef,
        displayName: 'Updated Test Entity',
        description: 'An updated test entity definition',
      };

      // Add a new property
      updatedDef.properties.push({
        name: 'createdDate',
        displayName: 'Created Date',
        dataType: 'DateTime',
        required: false,
        defaultCurrentDate: true
      } as GsbProperty);

      const savedDef = await entityDefService.save(updatedDef, testToken, TEST_CONFIG.TENANT_CODE);

      expect(savedDef).toBeDefined();
      expect(savedDef.id).toBe(createdEntityDefId);
    });

    it('should query entity definitions', async () => {
      const query = ServiceHelper.prepareQuery(
        'EntityDef',
        1,
        10,
        [{
          propVal: {
            name: 'name',
            value: TEST_DEF_PREFIX
          },
          function: 'Like'
        }]
      );

      const result = await entityDefService.query(query, testToken, TEST_CONFIG.TENANT_CODE);

      expect(result).toBeDefined();
      expect(Array.isArray(result.entityDefs)).toBe(true);
      expect(result.entityDefs.length).toBeGreaterThan(0);

      // Find our test entity definition
      const foundDef = result.entityDefs.find(def => def.id === createdEntityDefId);
      expect(foundDef).toBeDefined();
      expect(foundDef?.displayName).toBe('Updated Test Entity');
    });

    it('should delete the entity definition', async () => {
      await entityDefService.delete(createdEntityDefId, testToken, TEST_CONFIG.TENANT_CODE);

      // Try to get the deleted entity def - should be empty
      const deletedDef = await entityDefService.getById(createdEntityDefId, testToken, TEST_CONFIG.TENANT_CODE);
      expect(deletedDef.id).toBeUndefined();
    });
  });

  describe('Helper Functions', () => {
    it('should get all entity definitions', async () => {
      const entityDefs = await entityDefService.getAll(testToken, TEST_CONFIG.TENANT_CODE);

      expect(entityDefs).toBeDefined();
      expect(Array.isArray(entityDefs)).toBe(true);
    });

    it('should get entity definition by name', async () => {
      // First create a test entity def
      const newEntityDef: GsbEntityDef = {
        name: `${TEST_DEF_PREFIX}NameLookup`,
        displayName: 'Name Lookup Test',
        description: 'Testing lookup by name',
        properties: [
          {
            name: 'title',
            displayName: 'Title',
            dataType: 'String',
            required: true
          } as GsbProperty
        ]
      };

      const savedDef = await entityDefService.save(newEntityDef, testToken, TEST_CONFIG.TENANT_CODE);
      expect(savedDef.id).toBeDefined();

      // Now lookup by name
      const foundDef = await entityDefService.getByName(`${TEST_DEF_PREFIX}NameLookup`, testToken, TEST_CONFIG.TENANT_CODE);

      expect(foundDef).toBeDefined();
      expect(foundDef.name).toBe(`${TEST_DEF_PREFIX}NameLookup`);
      expect(foundDef.id).toBe(savedDef.id);

      // Clean up
      await entityDefService.delete(savedDef.id!, testToken, TEST_CONFIG.TENANT_CODE);
    });
  });
});
