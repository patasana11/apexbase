'use client';

import { getGsbToken, getGsbTenantCode } from '../gsb/config/gsb-config';
import { EntityDefService } from '../gsb/services/entity/entity-def.service';
import { GsbEntityService } from '../gsb/services/entity/gsb-entity.service';
import { GsbEntityDef, GsbProperty, ActivityLogLevel } from '../gsb/models/gsb-entity-def.model';
import { QueryParams } from '../gsb/types/query-params';
import { SingleQuery } from '../gsb/types/query';
import { GsbSaveRequest } from '../gsb/types/requests';

interface DatabaseOperation {
  operation: 'query' | 'create' | 'preview' | 'delete';
  table?: string;
  conditions?: Array<{ field: string; operator: string; value: any }>;
  fields?: Array<{ name: string; type: string; required?: boolean }>;
  limit?: number;
  sort?: { field: string; direction: 'ASC' | 'DESC' };
  data?: any[];
}

export class AIAgentService {
  private static instance: AIAgentService;
  private entityDefService: EntityDefService;
  private entityService: GsbEntityService;

  private constructor() {
    this.entityDefService = new EntityDefService();
    this.entityService = new GsbEntityService();
  }

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  /**
   * Get all entity definitions (tables) in the database
   */
  async getAllTables(): Promise<GsbEntityDef[]> {
    try {
      const { entityDefs } = await this.entityDefService.getEntityDefs(1, 100);
      return entityDefs;
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  }

  /**
   * Get a specific entity definition by name
   */
  async getTableByName(tableName: string): Promise<GsbEntityDef | null> {
    try {
      const { entityDefs } = await this.entityDefService.searchEntityDefs(tableName);
      return entityDefs.find(def => def.name.toLowerCase() === tableName.toLowerCase()) || null;
    } catch (error) {
      console.error(`Error getting table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Query data from a table
   */
  async queryTable(
    tableName: string,
    conditions: Array<{ field: string; operator: string; value: any }> = [],
    page: number = 1,
    pageSize: number = 50,
    sort?: { field: string; direction: 'ASC' | 'DESC' }
  ): Promise<{ data: any[]; totalCount: number }> {
    try {
      // First, verify table exists
      const tableDef = await this.getTableByName(tableName);
      if (!tableDef) {
        throw new Error(`Table '${tableName}' not found`);
      }

      // Create query
      const query = new QueryParams<any>(tableName);
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      // Add conditions
      if (conditions && conditions.length > 0) {
        query.query = conditions.map(({ field, operator, value }) => {
          const singleQuery = new SingleQuery();
          singleQuery.propVal = { name: field, value };

          // Map operators
          switch (operator.toLowerCase()) {
            case 'equals':
            case '=':
            case 'is':
              singleQuery.isEqual(value);
              break;
            case 'contains':
            case 'like':
              singleQuery.isLike(value);
              break;
            case 'greater':
            case '>':
              singleQuery.isGreater(value);
              break;
            case 'less':
            case '<':
              singleQuery.isSmaller(value);
              break;
            default:
              singleQuery.isEqual(value);
          }
          return singleQuery;
        });
      }

      // Add sorting
      if (sort) {
        query.sortBy((item: any) => item[sort.field], sort.direction);
      }

      // Execute query
      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        data: response.entities || [],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error(`Error querying table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get type mapping from GSB to standard types
   */
  private getTypeMapping(gsbType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'date': 'date',
      'datetime': 'datetime',
      'object': 'object',
      'array': 'array',
      'int': 'integer',
      'float': 'float',
      'double': 'double',
      'decimal': 'decimal',
      'text': 'text',
      'blob': 'binary',
      'json': 'json'
    };

    return typeMap[gsbType.toLowerCase()] || 'string';
  }

  /**
   * Create a new table
   */
  async createTable(
    tableName: string,
    fields: Array<{ name: string; type: string; required?: boolean }>
  ): Promise<{ id: string; message: string }> {
    try {
      // Check if table already exists
      const existingTable = await this.getTableByName(tableName);
      if (existingTable) {
        throw new Error(`Table '${tableName}' already exists`);
      }

      // Create properties array
      const properties: GsbProperty[] = fields.map(field => ({
        name: field.name,
        definition_id: '', // Will be set after table creation
        isRequired: field.required || false,
        isIndexed: field.name === 'id',
        isPrimaryKey: field.name === 'id',
        isSearchable: true,
        type: this.getTypeMapping(field.type)
      }));

      // Make sure we have an ID field
      if (!properties.some(p => p.name === 'id')) {
        properties.unshift({
          name: 'id',
          definition_id: '',
          isRequired: true,
          isIndexed: true,
          isPrimaryKey: true,
          isSearchable: true
        });
      }

      // Create the entity definition
      const entityDef: GsbEntityDef = {
        id: '',
        name: tableName,
        title: tableName,
        description: `Auto-generated table for ${tableName}`,
        properties,
        publicAccess: false,
        activityLogLevel: ActivityLogLevel.None,
        isActive: true,
        isDeleted: false
      };

      // Save the entity definition
      const id = await this.entityDefService.createEntityDef(entityDef);
      if (!id) {
        throw new Error('Failed to create table');
      }

      return {
        id,
        message: `Table '${tableName}' created successfully`
      };
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a table (entity definition)
   */
  async deleteTable(tableName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get table ID
      const table = await this.getTableByName(tableName);
      if (!table) {
        throw new Error(`Table '${tableName}' not found`);
      }

      // Delete table
      const success = await this.entityDefService.deleteEntityDef(table.id);
      return {
        success,
        message: success
          ? `Table '${tableName}' deleted successfully`
          : `Failed to delete table '${tableName}'`
      };
    } catch (error) {
      console.error(`Error deleting table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Preview database operation without executing it
   */
  previewDatabaseOperation(operation: DatabaseOperation): any {
    // Create a preview of what would happen
    switch (operation.operation) {
      case 'query':
        return {
          operation: 'query',
          table: operation.table,
          conditions: operation.conditions || [],
          limit: operation.limit || 50,
          sort: operation.sort,
          message: `This will query data from the ${operation.table} table with ${operation.conditions?.length || 0} conditions`
        };

      case 'create':
        return {
          operation: 'create',
          table: operation.table,
          fields: operation.fields || [],
          message: `This will create a new table named ${operation.table} with ${operation.fields?.length || 0} fields`
        };

      case 'delete':
        return {
          operation: 'delete',
          table: operation.table,
          message: `This will delete the table named ${operation.table}`
        };

      default:
        return {
          message: 'Unknown operation'
        };
    }
  }

  /**
   * Execute a database operation
   */
  async executeDatabaseOperation(operation: DatabaseOperation): Promise<any> {
    try {
      switch (operation.operation) {
        case 'query':
          if (!operation.table) {
            throw new Error('Table name is required for query operation');
          }
          return await this.queryTable(
            operation.table,
            operation.conditions,
            1,
            operation.limit || 50,
            operation.sort
          );

        case 'create':
          if (!operation.table || !operation.fields) {
            throw new Error('Table name and fields are required for create operation');
          }
          return await this.createTable(operation.table, operation.fields);

        case 'delete':
          if (!operation.table) {
            throw new Error('Table name is required for delete operation');
          }
          return await this.deleteTable(operation.table);

        case 'preview':
          return this.previewDatabaseOperation({
            ...operation,
            operation: operation.operation === 'preview'
              ? (operation.table ? 'query' : 'create')
              : operation.operation
          });

        default:
          throw new Error(`Unsupported operation: ${operation.operation}`);
      }
    } catch (error) {
      console.error('Error executing database operation:', error);
      throw error;
    }
  }
}
