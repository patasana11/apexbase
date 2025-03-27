import { EntityDefService } from '@/lib/gsb/services/entity/entity-def.service';
import { GsbEntityDef, GsbProperty, RefType, ActivityLogLevel } from '@/lib/gsb/models/gsb-entity-def.model';
import { Property } from '@/components/database/types';

/**
 * UI Service for Entity Definition management
 * Handles UI-specific business logic that doesn't belong in the core GSB entity service
 */
export class EntityDefUiService {
  private entityDefService: EntityDefService;

  constructor() {
    this.entityDefService = new EntityDefService();
  }

  /**
   * Convert string to Pascal case and remove special characters
   * @param str String to convert to Pascal case
   * @returns Pascal case string
   */
  toPascalCase(str: string): string {
    if (!str) return "";
    
    // Remove special characters and spaces, keeping only alphanumeric
    return str
      .split(/[^a-zA-Z0-9]/) // Split by non-alphanumeric characters
      .filter(Boolean) // Remove empty strings
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Convert to Pascal case
      .join("");
  }

  /**
   * Validate if name follows the required pattern (starts with letter, alphanumeric only)
   * @param name The name to validate
   * @returns Boolean indicating if name is valid
   */
  validateEntityName(name: string): boolean {
    // Must start with a letter and contain only letters and numbers
    const namePattern = /^[A-Za-z][A-Za-z0-9]*$/;
    return namePattern.test(name);
  }

  /**
   * Check if a name is unique among existing entity definitions
   * @param nameToCheck Name to check for uniqueness
   * @returns Promise with result containing uniqueness status and suggested dbTableName
   */
  async checkNameUniqueness(nameToCheck: string): Promise<{
    isNameUnique: boolean;
    isDbTableNameUnique: boolean;
    suggestedDbTableName: string;
    nameValidationMessage: string;
  }> {
    if (!nameToCheck) {
      return {
        isNameUnique: true,
        isDbTableNameUnique: true,
        suggestedDbTableName: "",
        nameValidationMessage: ""
      };
    }

    try {
      // Use the specialized method that only selects name and dbTableName fields
      const { entityDefs } = await this.entityDefService.checkNameUniqueness(nameToCheck);
      
      // Check name uniqueness
      const nameExists = entityDefs.some(def => 
        def.name?.toLowerCase() === nameToCheck.toLowerCase()
      );
      
      // Check dbTableName uniqueness
      const dbTableNameToCheck = nameToCheck;
      const dbTableNameExists = entityDefs.some(def => 
        def.dbTableName?.toLowerCase() === dbTableNameToCheck.toLowerCase()
      );
      
      // If dbTableName is not unique but name is, generate a unique dbTableName
      let suggestedDbTableName = nameToCheck;
      if (dbTableNameExists && !nameExists) {
        let suffix = 1;
        let uniqueDbTableName = `${dbTableNameToCheck}${suffix}`;
        
        // Find a unique dbTableName by adding a number suffix
        while (entityDefs.some(def => def.dbTableName?.toLowerCase() === uniqueDbTableName.toLowerCase())) {
          suffix++;
          uniqueDbTableName = `${dbTableNameToCheck}${suffix}`;
        }
        
        suggestedDbTableName = uniqueDbTableName;
      }
      
      // Update validation message
      let nameValidationMessage = "";
      if (nameExists) {
        nameValidationMessage = "This name is already taken.";
      }
      
      return {
        isNameUnique: !nameExists,
        isDbTableNameUnique: !dbTableNameExists,
        suggestedDbTableName,
        nameValidationMessage
      };
    } catch (error) {
      console.error("Error checking name uniqueness:", error);
      throw error;
    }
  }

  /**
   * Check if reference property name is already used in the referenced entity
   * @param refPropName Reference property name to check
   * @param refEntityId ID of the referenced entity
   * @returns Promise with validation result
   */
  async checkRefPropNameUniqueness(refPropName: string, refEntityId: string): Promise<{
    isValid: boolean;
    validationMessage: string;
  }> {
    if (!refPropName || !refEntityId) {
      return {
        isValid: true,
        validationMessage: ""
      };
    }
    
    try {
      // Get the entity definition with properties
      const entityDef = await this.entityDefService.getEntityDefById(refEntityId);
      
      if (entityDef && entityDef.properties) {
        // Check if the property name already exists in the referenced entity
        const propExists = entityDef.properties.some(prop => 
          prop.name?.toLowerCase() === refPropName.toLowerCase()
        );
        
        if (propExists) {
          return {
            isValid: false,
            validationMessage: `Property name "${refPropName}" already exists in the referenced entity.`
          };
        }
      }
      
      return {
        isValid: true,
        validationMessage: ""
      };
    } catch (error) {
      console.error("Error checking reference property name:", error);
      // Default to valid if we can't check
      return {
        isValid: true,
        validationMessage: ""
      };
    }
  }

  /**
   * Get default properties for an entity
   * @param defName Optional entity name to use for property generation
   * @returns Array of default properties
   */
  getDefaultProperties(defName?: string): Property[] {
    const defaultName = defName || "DefaultEntity"; // Use a default name if none provided
    const defaultProps = this.entityDefService.getDefaultProperties(defaultName);
    
    // Map to our simplified Property interface
    return defaultProps.map(prop => {
      // Handle references with specific property name using the current entity name
      const refEntPropName = prop.refEntPropName?.includes("created") || prop.refEntPropName?.includes("updated")
        ? prop.refEntPropName.replace("DefaultEntity", defName || "")
        : prop.refEntPropName;
        
      // Ensure refType is always a RefType enum value
      let refType: RefType | undefined = undefined;
      if (prop.refType !== undefined) {
        // The backend always sends numeric values, so we can safely cast it
        refType = prop.refType as unknown as RefType;
      }
        
      return {
        name: prop.name,
        type: prop.refType ? "Reference" : prop.type || "String",
        required: prop.isRequired || false,
        reference: prop.refEntDef_id,
        refType: refType,
        refEntPropName: refEntPropName,
        isDefault: true,
        description: prop.title
      };
    });
  }

  /**
   * Convert UI property format to GSB property format for API submission
   * @param properties Array of UI properties 
   * @returns Array of GSB properties ready for API
   */
  mapPropertiesToGsbFormat(properties: Property[]): GsbProperty[] {
    return properties.map((prop, index) => {
      // Base property structure with required fields explicitly set
      const baseProperty = {
        name: prop.name,
        title: prop.description || prop.name,
        isRequired: prop.required || false,
        isSearchable: prop.type === "String",
        // Preserve the definition_id from default properties or use proper UUIDs
        definition_id: prop.isDefault ? 
          // For default properties, use a standard definition ID based on name
          prop.name === "id" ? "5C0AA76F-9C32-4E7E-A4BC-B56E93877883" :
          prop.name === "title" ? "C6C34BF3-F51B-4E69-A689-B09847BE74B9" :
          prop.name === "createdBy" || prop.name === "lastUpdatedBy" ? "924ACBA8-58C5-4881-940D-472EC01EBA5F" :
          prop.name === "createDate" || prop.name === "lastUpdateDate" ? "12E647E0-EBD2-4EC2-A4E3-82C1DFE07DA2" :
          "00000000-0000-0000-0000-000000000000" : 
          "00000000-0000-0000-0000-000000000000", // Non-empty placeholder UUID for custom properties
        orderNumber: index,
        // Don't add type directly as it's not a field in GsbProperty
      };
      
      // Add reference type settings only for reference properties
      if (prop.type === "Reference") {
        // Since refType is now always a RefType enum, we can simplify this logic
        const finalRefType = prop.refType !== undefined ? prop.refType : RefType.OneToMany;
        
        return {
          ...baseProperty,
          refType: finalRefType,
          refEntDef_id: prop.reference,
          refEntPropName: prop.refEntPropName
        } as GsbProperty;
      }
      
      // For non-reference types, return just the base property
      return baseProperty as GsbProperty;
    });
  }

  /**
   * Create a new entity definition
   * @param entityData Entity data from the UI form
   * @returns Promise with the created entity ID
   */
  async createEntityDef(entityData: {
    title: string;
    name: string;
    description: string;
    dbTableName: string;
    properties: Property[];
    publicAccess: boolean;
    activityLogLevel: ActivityLogLevel;
  }): Promise<string> {
    const { title, name, description, dbTableName, properties, publicAccess, activityLogLevel } = entityData;
    
    // Validate that name is valid and unique
    const isNameValid = this.validateEntityName(name);
    if (!isNameValid) {
      throw new Error('Name must start with a letter and contain only letters and numbers');
    }
    
    const uniquenessCheck = await this.checkNameUniqueness(name);
    if (!uniquenessCheck.isNameUnique) {
      throw new Error('Entity name is already taken');
    }
    
    if (!uniquenessCheck.isDbTableNameUnique && dbTableName === name) {
      throw new Error('Database table name is already taken');
    }
    
    // Check if we have id and title properties
    const hasId = properties.some(prop => prop.name === 'id');
    const hasTitle = properties.some(prop => prop.name === 'title');
    
    if (!hasId || !hasTitle) {
      throw new Error('Entity definition must have at least id and title properties');
    }
    
    // Map properties to GSB format
    const mappedProperties = this.mapPropertiesToGsbFormat(properties);
    
    const entityDefinition = {
      title,
      name,
      description,
      dbTableName: dbTableName || name, // Use the dbTableName if set, otherwise use name
      properties: mappedProperties,
      publicAccess,
      activityLogLevel,
      // Note: Don't set lastUpdateDate or createDate as GSB will set these automatically
    };

    console.log("Creating new data table:", entityDefinition);
    
    // Create the entity definition
    return await this.entityDefService.createEntityDef(entityDefinition as GsbEntityDef);
  }

  /**
   * Get all available entity definitions for reference selection
   * @returns Promise with array of entity definitions
   */
  async getEntityDefs() {
    try {
      const result = await this.entityDefService.getEntityDefs(1, 100);
      return result.entityDefs;
    } catch (error) {
      console.error("Error loading tables:", error);
      throw error;
    }
  }
} 