'use client';

import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { EntityItem } from '@/components/gsb';
import {
  GsbContact,
  GsbGroup,
  GsbRole
} from '@/lib/gsb/models/gsb-organization.model';
import { GsbUser } from '@/lib/gsb/models/gsb-user.model';
import { GsbDocTemplate } from '@/lib/gsb/models/gsb-doc-template.model';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { QueryFunction } from '@/lib/gsb/types/query';

/**
 * Service for managing entity data for UI components
 * 
 * This service uses GsbEntityService from the GSB module to retrieve entity data
 * for use in UI components, particularly autocomplete components.
 */
export class EntityUiService {
  private entityService: GsbEntityService;
  private static instance: EntityUiService;

  constructor() {
    // Get the singleton instance of GsbEntityService
    this.entityService = GsbEntityService.getInstance();
  }

  /**
   * Get the singleton instance of EntityUiService
   * @returns The singleton instance
   */
  public static getInstance(): EntityUiService {
    if (!EntityUiService.instance) {
      EntityUiService.instance = new EntityUiService();
    }
    return EntityUiService.instance;
  }

  /**
   * Get entities for autocomplete by entity type
   * @param entityType The entity definition name
   * @param searchTerm Optional search term
   * @param additionalFilters Optional additional filters to apply
   * @returns List of entity items for autocomplete
   */
  async getEntities(
    entityType: string, 
    searchTerm?: string, 
    additionalFilters?: Record<string, any>
  ): Promise<EntityItem[]> {
    try {
      const query = new QueryParams(entityType);
      
      // Apply search term as filter
      query.filter = searchTerm;
      
      // Apply additional filters if provided - currently not using templateType filter
      // We may add specific filter handling here in the future if needed
      
      // Limit results
      query.startIndex = 0;
      query.count = 10;
      
      // Use the query method on GsbEntityService
      const result = await this.entityService.query(query);
      
      // Map the results based on entity type
      const entities = result.entities || [];
      return entities.map((entity: any) => this.mapEntityToItem(entity, entityType));
    } catch (error) {
      console.error(`Error fetching entities of type ${entityType}:`, error);
      return [];
    }
  }

  /**
   * Maps an entity to an EntityItem based on its type
   * @param entity The entity to map
   * @param entityType The entity type
   * @returns Mapped EntityItem
   */
  private mapEntityToItem(entity: any, entityType: string): EntityItem {
    // Common fields all entities should have
    const baseItem: EntityItem = {
      id: entity.id,
      name: 'Unknown Entity'
    };
    
    // Add additional fields based on entity type
    switch (entityType) {
      case 'GsbUser':
        return {
          ...baseItem,
          name: entity.name || entity.email || 'Unknown User',
          email: entity.email
        };
        
      case 'GsbContact':
        return {
          ...baseItem,
          name: entity.name || 'Unknown Contact',
          email: entity.email
        };
        
      case 'GsbRole':
        return {
          ...baseItem,
          name: entity.name || 'Unknown Role',
          description: entity.description
        };
        
      case 'GsbGroup':
        return {
          ...baseItem,
          name: entity.name || 'Unknown Group',
          description: entity.description
        };
        
      case 'GsbDocTemplate':
        return {
          ...baseItem,
          name: entity.name || entity.title || entity.fileName || 'Unknown Template',
          title: entity.title,
          fileName: entity.fileName,
          templateType: entity.templateType,
          createDate: entity.createDate,
          html: entity.html
        };
        
      default:
        // For generic entities
        return {
          ...baseItem,
          name: entity.name || entity.title || 'Unknown Entity',
          title: entity.title,
          ...entity // Include all fields
        };
    }
  }
  
  // Legacy methods for backward compatibility
  
  /**
   * Get users for autocomplete
   * @deprecated Use getEntities('GsbUser', searchTerm) instead
   * @param searchTerm Optional search term
   * @returns List of users
   */
  async getUsers(searchTerm?: string): Promise<EntityItem[]> {
    return this.getEntities('GsbUser', searchTerm);
  }

  /**
   * Get contacts for autocomplete
   * @deprecated Use getEntities('GsbContact', searchTerm) instead
   * @param searchTerm Optional search term
   * @returns List of contacts
   */
  async getContacts(searchTerm?: string): Promise<EntityItem[]> {
    return this.getEntities('GsbContact', searchTerm);
  }

  /**
   * Get roles for autocomplete
   * @deprecated Use getEntities('GsbRole', searchTerm) instead
   * @param searchTerm Optional search term
   * @returns List of roles
   */
  async getRoles(searchTerm?: string): Promise<EntityItem[]> {
    return this.getEntities('GsbRole', searchTerm);
  }

  /**
   * Get groups for autocomplete
   * @deprecated Use getEntities('GsbGroup', searchTerm) instead
   * @param searchTerm Optional search term
   * @returns List of groups
   */
  async getGroups(searchTerm?: string): Promise<EntityItem[]> {
    return this.getEntities('GsbGroup', searchTerm);
  }

  /**
   * Get document templates for autocomplete
   * @deprecated Use getEntities('GsbDocTemplate', searchTerm) instead
   * @param searchTerm Optional search term
   * @returns List of document templates
   */
  async getDocTemplates(searchTerm?: string): Promise<EntityItem[]> {
    return this.getEntities('GsbDocTemplate', searchTerm);
  }
} 