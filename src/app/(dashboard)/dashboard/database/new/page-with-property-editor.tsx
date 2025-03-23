"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiSave,
  FiLoader,
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { EntityDefService } from '@/lib/gsb/services/entity/entity-def.service';
import { GsbEntityDef, GsbProperty, RefType, ActivityLogLevel } from '@/lib/gsb/models/gsb-entity-def.model';
import { Label as UILabel } from "@/components/ui/label";
import { PropertyEditor } from "./fixed-property-ui/property-editor";

interface Property {
  name: string;
  type: string;
  required: boolean;
  reference?: string;
  refType?: RefType;
  refEntPropName?: string;
  isDefault?: boolean;
  description?: string;
  isIndexed?: boolean;
  isPrimaryKey?: boolean;
  isPartialPrimaryKey?: boolean;
  isUnique?: boolean;
  isEncrypted?: boolean;
  isSearchable?: boolean;
  isListed?: boolean;
  isMultiLingual?: boolean;
  maxLength?: number;
  scale?: number;
  defaultValue?: any;
  cascadeReference?: boolean;
  formModes?: number;
  updateFormMode?: number;
  viewFormMode?: number;
  createFormMode?: number;
  listScreens?: number;
}

export default function NewDataTablePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Load default properties on mount and when name changes
  useEffect(() => {
    // Load initial default properties when component mounts
    loadDefaultProperties();
    
    // Then update if name changes
    if (name) {
      loadDefaultProperties(name);
    }
  }, [name]);
  
  // Update reference property names when entity name changes
  useEffect(() => {
    if (name && properties.length > 0) {
      const updatedProperties = properties.map(prop => {
        if (prop.isDefault && prop.type === "Reference" && prop.refEntPropName) {
          // Only update the built-in "created" and "updated" reference properties
          if (prop.refEntPropName.includes("created") || prop.refEntPropName.includes("updated")) {
            const basePattern = prop.refEntPropName.includes("created") ? "created" : "updated";
            return {
              ...prop,
              refEntPropName: basePattern + name
            };
          }
        }
        return prop;
      });
      
      // Check if anything actually changed
      const hasChanges = updatedProperties.some((prop, index) => 
        prop.refEntPropName !== properties[index].refEntPropName
      );
      
      if (hasChanges) {
        setProperties(updatedProperties);
      }
    }
  }, [name, properties]);

  // Load default properties
  const loadDefaultProperties = (defName?: string, forceReset: boolean = false) => {
    setIsPropertiesLoading(true);
    
    try {
      const entityDefService = new EntityDefService();
      const defaultName = defName || "DefaultEntity"; // Use a default name if none provided
      const defaultProps = entityDefService.getDefaultProperties(defaultName);
      
      // Map to our simplified Property interface
      const mappedDefaultProps: Property[] = defaultProps.map(prop => {
        // Handle references with specific property name using the current entity name
        const refEntPropName = prop.refEntPropName?.includes("created") || prop.refEntPropName?.includes("updated")
          ? prop.refEntPropName.replace("DefaultEntity", defName || "")
          : prop.refEntPropName;
          
        return {
          name: prop.name,
          type: prop.refType ? "Reference" : "String", // Simplified type mapping
          required: prop.isRequired || false,
          reference: prop.refEntDef_id,
          refType: prop.refType,
          refEntPropName: refEntPropName,
          isDefault: true,
          description: prop.title
        };
      });
      
      // Check if we already have the same default properties
      const existingDefaultProps = properties.filter(p => p.isDefault);
      const defaultPropsChanged = existingDefaultProps.length !== mappedDefaultProps.length ||
        mappedDefaultProps.some(newProp => 
          !existingDefaultProps.find(p => p.name === newProp.name)
        );
      
      if (forceReset) {
        // If forcing reset, replace all default properties and keep user properties
        const userProps = properties.filter(p => !p.isDefault);
        setProperties([...mappedDefaultProps, ...userProps]);
        
        toast({
          title: "Default Properties Reset",
          description: "Default properties have been restored.",
        });
      } else if (defName && defaultPropsChanged) {
        // If name changed, replace only the default properties while keeping user-added ones
        const userProps = properties.filter(p => !p.isDefault);
        setProperties([...mappedDefaultProps, ...userProps]);
      } else if (properties.length === 0) {
        // If no properties yet, set the defaults
        setProperties(mappedDefaultProps);
      }
    } catch (error) {
      console.error("Error loading default properties:", error);
      toast({
        title: "Error",
        description: "Failed to load default properties.",
        variant: "destructive",
      });
    } finally {
      setIsPropertiesLoading(false);
    }
  };

  // Load existing tables for reference fields
  useEffect(() => {
    const loadTables = async () => {
      try {
        const entityDefService = new EntityDefService();
        const result = await entityDefService.getEntityDefs(1, 100);
        setTables(result.entityDefs);
      } catch (error) {
        console.error("Error loading tables:", error);
      }
    };
    loadTables();
  }, []);

  // Auto-generate Pascal case name from title
  useEffect(() => {
    if (title && !name) {
      const pascalCase = title
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
      setName(pascalCase);
    }
  }, [title]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const entityDefService = new EntityDefService();
      
      // Check if we have id and title properties
      const hasId = properties.some(prop => prop.name === 'id');
      const hasTitle = properties.some(prop => prop.name === 'title');
      
      if (!hasId || !hasTitle) {
        throw new Error('Entity definition must have at least id and title properties');
      }
      
      // Map user-defined properties to GSB property format
      const mappedProperties: GsbProperty[] = properties.map((prop) => ({
        name: prop.name,
        title: prop.description || prop.name,
        isRequired: prop.required,
        isSearchable: prop.type === "String",
        definition_id: "", // This will be filled by the backend
        orderNumber: properties.indexOf(prop),
        // Map specific property types to appropriate settings
        ...(prop.type === "Reference" && { 
          refType: prop.refType,
          refEntDef_id: prop.reference,
          refEntPropName: prop.refEntPropName
        }),
      }));
      
      const entityDefinition = {
        title,
        name,
        description,
        properties: mappedProperties,
        publicAccess: false,
        activityLogLevel: ActivityLogLevel.None
      };

      console.log("Creating new data table:", entityDefinition);
      
      // Create the entity definition
      const entityDefId = await entityDefService.createEntityDef(entityDefinition as GsbEntityDef);
      
      if (entityDefId) {
        toast({
          title: "Success",
          description: `Data table "${title}" created successfully`,
        });
        router.push('/dashboard/database');
      } else {
        throw new Error("Failed to create entity definition");
      }
    } catch (error) {
      console.error("Error creating entity definition:", error);
      toast({
        title: "Error",
        description: `Failed to create data table: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Data Table</h1>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !title || !name} 
        >
          {isLoading ? (
            <>
              <FiLoader className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <FiSave className="mr-2 h-4 w-4" />
              Create Table
            </>
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Define the basic information for your data table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <UILabel htmlFor="title">Title</UILabel>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Customer Profile"
            />
            <p className="text-sm text-muted-foreground">
              A human-readable title for this data table.
            </p>
          </div>
          
          <div className="space-y-2">
            <UILabel htmlFor="name">Name (PascalCase)</UILabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CustomerProfile"
            />
            <p className="text-sm text-muted-foreground">
              The internal name for this data table. Should be in PascalCase without spaces.
            </p>
          </div>
          
          <div className="space-y-2">
            <UILabel htmlFor="description">Description</UILabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this data table"
            />
            <p className="text-sm text-muted-foreground">
              A detailed description of this data table's purpose and contents.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            Define the columns and their types for your data table. All tables automatically include system fields like ID, creation date, and update timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyEditor
            properties={properties}
            isLoading={isPropertiesLoading}
            tables={tables}
            entityName={name}
            onPropertiesChange={setProperties}
            onResetDefaultProperties={() => loadDefaultProperties(name, true)}
          />
        </CardContent>
        <CardFooter className="border-t bg-slate-50 dark:bg-slate-900">
          <div className="w-full text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Note:</strong> The 'id' and 'title' properties are required for all data tables and cannot be removed.
            </p>
            <p>
              Default properties provide standard functionality like tracking when records were created and updated, and by whom.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 