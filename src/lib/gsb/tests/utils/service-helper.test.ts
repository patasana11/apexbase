import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ServiceHelper } from '../../utils/service-helper';
import * as config from '../../config/gsb-config';
import { QueryFunction } from '../../types/query';

// Mock the GSB config functions
vi.mock('../../config/gsb-config', () => ({
  getGsbToken: vi.fn(() => 'mock-token'),
  getGsbTenantCode: vi.fn(() => 'mock-tenant'),
}));

describe('ServiceHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('prepareQuery', () => {
    it('should create a basic query with default parameters', () => {
      const query = ServiceHelper.prepareQuery('testEntity');

      expect(query).toBeDefined();
      expect(query.entity).toBe('testEntity');
      expect(query.startIndex).toBe(0); // (page 1 - 1) * 10
      expect(query.count).toBe(10);
      expect(query.calcTotalCount).toBe(true);
      expect(query.sortCols).toBeDefined();
      expect(query.sortCols?.length).toBeGreaterThan(0);
      expect(query.whereClauses).toEqual([]);
    });

    it('should handle pagination parameters', () => {
      const query = ServiceHelper.prepareQuery('testEntity', 3, 20);

      expect(query.startIndex).toBe(40); // (3 - 1) * 20
      expect(query.count).toBe(20);
    });

    it('should accept where clauses', () => {
      const whereClauses = [
        {
          propVal: { name: 'title', value: 'Test' },
          function: QueryFunction.Like
        }
      ];

      const query = ServiceHelper.prepareQuery('testEntity', 1, 10, whereClauses);

      expect(query.whereClauses).toBe(whereClauses);
    });

    it('should accept custom sort columns', () => {
      const sortCols = [
        { col: { name: 'name' }, sortType: 'ASC' }
      ];

      const query = ServiceHelper.prepareQuery('testEntity', 1, 10, [], sortCols);

      expect(query.sortCols).toBe(sortCols);
    });

    it('should accept select columns', () => {
      const selectCols = ['id', 'name', 'createdDate'];

      const query = ServiceHelper.prepareQuery('testEntity', 1, 10, [], undefined, selectCols);

      expect(query.selectCols).toBe(selectCols);
    });
  });

  describe('prepareSaveRequest', () => {
    it('should create a basic save request', () => {
      const entityData = { title: 'Test Entity' };
      const saveRequest = ServiceHelper.prepareSaveRequest('testEntity', entityData);

      expect(saveRequest).toBeDefined();
      expect(saveRequest.entity).toBe('testEntity');
      expect(saveRequest.data).toBe(entityData);
      expect(saveRequest.token).toBe('mock-token');
      expect(saveRequest.tenantCode).toBe('mock-tenant');
    });

    it('should be called with correct parameters', () => {
      const entityData = { id: '123', title: 'Updated Entity' };
      ServiceHelper.prepareSaveRequest('testEntity', entityData, false);

      expect(config.getGsbToken).toHaveBeenCalledTimes(1);
      expect(config.getGsbTenantCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthHeader', () => {
    it('should return authorization header with token', () => {
      const authHeader = ServiceHelper.getAuthHeader();

      expect(authHeader).toEqual({ Authorization: 'Bearer mock-token' });
      expect(config.getGsbToken).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when no token is available', () => {
      vi.mocked(config.getGsbToken).mockReturnValueOnce(undefined);

      const authHeader = ServiceHelper.getAuthHeader();

      expect(authHeader).toBeUndefined();
    });
  });

  describe('hasPermission', () => {
    it('should return true when permission exists', () => {
      const userPermissions = ['read:entity', 'write:entity', 'delete:entity'];

      const result = ServiceHelper.hasPermission('write:entity', userPermissions);

      expect(result).toBe(true);
    });

    it('should return false when permission does not exist', () => {
      const userPermissions = ['read:entity', 'write:entity'];

      const result = ServiceHelper.hasPermission('delete:entity', userPermissions);

      expect(result).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      const result = ServiceHelper.hasPermission('read:entity', []);

      expect(result).toBe(false);
    });

    it('should return false for undefined permissions', () => {
      const result = ServiceHelper.hasPermission('read:entity', undefined as any);

      expect(result).toBe(false);
    });
  });

  describe('prepareFunctionQuery', () => {
    it('should create a function query with default parameters', () => {
      const functionQuery = ServiceHelper.prepareFunctionQuery('testFunction');

      expect(functionQuery).toBeDefined();
      expect(functionQuery.name).toBe('testFunction');
      expect(functionQuery.params).toEqual({});
      expect(functionQuery.token).toBe('mock-token');
      expect(functionQuery.tenantCode).toBe('mock-tenant');
    });

    it('should accept function parameters', () => {
      const params = { id: '123', action: 'update' };

      const functionQuery = ServiceHelper.prepareFunctionQuery('testFunction', params);

      expect(functionQuery.params).toBe(params);
    });

    it('should be called with correct parameters', () => {
      ServiceHelper.prepareFunctionQuery('testFunction');

      expect(config.getGsbToken).toHaveBeenCalledTimes(1);
      expect(config.getGsbTenantCode).toHaveBeenCalledTimes(1);
    });
  });
});
