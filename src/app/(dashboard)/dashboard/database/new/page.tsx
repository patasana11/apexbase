"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FiDatabase,
  FiArrowLeft,
  FiArrowRight,
  FiSave,
  FiPlus,
  FiTrash2,
  FiLock,
  FiLink,
  FiKey,
  FiList,
  FiCalendar,
  FiHash,
  FiType,
  FiToggleLeft,
  FiImage,
  FiFileText,
  FiCode,
  FiLoader,
  FiChevronDown,
  FiEdit,
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { EntityDefService } from '@/lib/gsb/services/entity/entity-def.service';
import { GsbEntityDef, GsbProperty } from '@/lib/gsb/models/gsb-entity-def.model';
import { Label as UILabel } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Form schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(64),
  title: z.string().min(1, "Title is required").max(128),
  description: z.string().max(500),
  securityLevel: z.enum(["Public", "Authorized", "SuperSafe"]),
});

const propertySchema = z.object({
  name: z.string().min(1, "Name is required").max(64),
  type: z.enum([
    "string",
    "number",
    "boolean",
    "date",
    "datetime",
    "json",
    "array",
    "reference",
    "image",
    "file",
    "richtext",
    "code",
  ]),
  isRequired: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
  defaultValue: z.string().optional(),
  referenceTable: z.string().optional(),
  description: z.string().max(500).optional(),
});

const permissionsSchema = z.object({
});

// Icons for different property types
const propertyTypeIcons: Record<string, React.ReactNode> = {
  string: <FiType className="h-4 w-4" />,
  number: <FiHash className="h-4 w-4" />,
  boolean: <FiToggleLeft className="h-4 w-4" />,
  date: <FiCalendar className="h-4 w-4" />,
  datetime: <FiCalendar className="h-4 w-4" />,
  json: <FiCode className="h-4 w-4" />,
  array: <FiList className="h-4 w-4" />,
  reference: <FiLink className="h-4 w-4" />,
  image: <FiImage className="h-4 w-4" />,
  file: <FiFileText className="h-4 w-4" />,
  richtext: <FiFileText className="h-4 w-4" />,
  code: <FiCode className="h-4 w-4" />,
};

interface Property {
  name: string;
  type: string;
  required: boolean;
  reference?: string;
  refType?: "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany";
  refEntPropName?: string;
  isDefault?: boolean; // Indicates if this is a default property
  description?: string;
  // Additional property configuration options
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

const DATA_TYPES = [
  "String",
  "Number",
  "Boolean",
  "Date",
  "Reference",
  "Array",
  "Object",
  "Enum",
] as const;

const REF_TYPES = [
  "OneToOne",
  "OneToMany",
  "ManyToOne",
  "ManyToMany",
] as const;

// Property Edit Modal Component
interface PropertyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  tables: any[];
  onSave: (property: Property) => void;
  isEditing: boolean;
}

function PropertyEditModal({
  isOpen,
  onClose,
  property,
  tables,
  onSave,
  isEditing
}: PropertyEditModalProps) {
  // Initialize state with property data or defaults
  const [propertyData, setPropertyData] = useState<Property>(
    property || {
      name: "",
      type: "String",
      required: false,
    }
  );
  
  // Reset form when modal opens with new property
  useEffect(() => {
    if (property) {
      setPropertyData(property);
    } else {
      setPropertyData({
        name: "",
        type: "String",
        required: false,
      });
    }
  }, [property, isOpen]);

  // Handle reference specific settings
  const [selectedRefEntity, setSelectedRefEntity] = useState<string>(propertyData.reference || "");
  const [refEntityPropName, setRefEntityPropName] = useState<string>(propertyData.refEntPropName || "");
  const [selectedRefType, setSelectedRefType] = useState<"OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany">(
    propertyData.refType || "OneToMany"
  );

  // Update reference fields when entity is selected
  useEffect(() => {
    if (selectedRefEntity && propertyData.type === "Reference") {
      // Find selected entity
      const entity = tables.find(t => t.id === selectedRefEntity);
      if (entity && !refEntityPropName) {
        // Generate a default reference property name
        const refName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
        setRefEntityPropName(refName);
      }
    }
  }, [selectedRefEntity, propertyData.type, tables, refEntityPropName]);

  const handleSubmit = () => {
    // Prepare final property data with reference fields if needed
    let finalProperty = { ...propertyData };
    
    if (finalProperty.type === "Reference") {
      finalProperty.reference = selectedRefEntity;
      finalProperty.refType = selectedRefType;
      finalProperty.refEntPropName = refEntityPropName;
    } else {
      // Clear reference fields if type is not Reference
      delete finalProperty.reference;
      delete finalProperty.refType;
      delete finalProperty.refEntPropName;
    }
    
    // Call parent save handler
    onSave(finalProperty);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Property" : "Add New Property"}</DialogTitle>
          <DialogDescription>
            Configure all aspects of this property to define how it works in your data model.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Basic Information - Left Column */}
          <div className="space-y-4">
            <div>
              <UILabel htmlFor="name">Property Name</UILabel>
              <Input
                id="name"
                value={propertyData.name}
                onChange={(e) => setPropertyData({ ...propertyData, name: e.target.value })}
                placeholder="e.g. firstName"
                disabled={propertyData.isDefault && (propertyData.name === "id" || propertyData.name === "title")}
              />
            </div>
            
            <div>
              <UILabel htmlFor="description">Display Name/Title</UILabel>
              <Input
                id="description"
                value={propertyData.description || ""}
                onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                placeholder="e.g. First Name"
              />
              <p className="text-xs text-muted-foreground mt-1">How this field appears in the UI</p>
            </div>
            
            <div>
              <UILabel htmlFor="type">Data Type</UILabel>
              <Select
                value={propertyData.type}
                onValueChange={(value) => setPropertyData({ ...propertyData, type: value })}
                disabled={propertyData.isDefault}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <UILabel htmlFor="defaultValue">Default Value</UILabel>
              <Input
                id="defaultValue"
                value={propertyData.defaultValue || ""}
                onChange={(e) => setPropertyData({ ...propertyData, defaultValue: e.target.value })}
                placeholder="Default value when creating records"
              />
            </div>
          </div>
          
          {/* Configuration Options - Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={propertyData.required}
                  onCheckedChange={(checked: boolean) =>
                    setPropertyData({ ...propertyData, required: checked })
                  }
                  disabled={propertyData.isDefault && propertyData.name === "id"}
                />
                <UILabel>Required</UILabel>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={propertyData.isPrimaryKey}
                  onCheckedChange={(checked: boolean) =>
                    setPropertyData({ ...propertyData, isPrimaryKey: checked })
                  }
                  disabled={propertyData.isDefault && propertyData.name === "id"}
                />
                <UILabel>Primary Key</UILabel>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={propertyData.isUnique}
                  onCheckedChange={(checked: boolean) =>
                    setPropertyData({ ...propertyData, isUnique: checked })
                  }
                />
                <UILabel>Unique</UILabel>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={propertyData.isIndexed}
                  onCheckedChange={(checked: boolean) =>
                    setPropertyData({ ...propertyData, isIndexed: checked })
                  }
                />
                <UILabel>Indexed</UILabel>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={propertyData.isSearchable}
                  onCheckedChange={(checked: boolean) =>
                    setPropertyData({ ...propertyData, isSearchable: checked })
                  }
                />
                <UILabel>Searchable</UILabel>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={propertyData.isListed}
                  onCheckedChange={(checked: boolean) =>
                    setPropertyData({ ...propertyData, isListed: checked })
                  }
                />
                <UILabel>Show in Lists</UILabel>
              </div>
              
              {propertyData.type === "String" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={propertyData.isMultiLingual}
                    onCheckedChange={(checked: boolean) =>
                      setPropertyData({ ...propertyData, isMultiLingual: checked })
                    }
                  />
                  <UILabel>Multi-lingual</UILabel>
                </div>
              )}
              
              {propertyData.type === "String" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={propertyData.isEncrypted}
                    onCheckedChange={(checked: boolean) =>
                      setPropertyData({ ...propertyData, isEncrypted: checked })
                    }
                  />
                  <UILabel>Encrypted</UILabel>
                </div>
              )}
            </div>
            
            {propertyData.type === "String" && (
              <div>
                <UILabel htmlFor="maxLength">Max Length</UILabel>
                <Input
                  id="maxLength"
                  type="number"
                  value={propertyData.maxLength || ""}
                  onChange={(e) => setPropertyData({ 
                    ...propertyData, 
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Maximum string length"
                />
              </div>
            )}
            
            {propertyData.type === "Number" && (
              <div>
                <UILabel htmlFor="scale">Decimal Places</UILabel>
                <Input
                  id="scale"
                  type="number"
                  value={propertyData.scale || ""}
                  onChange={(e) => setPropertyData({ 
                    ...propertyData, 
                    scale: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Number of decimal places"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Reference Type specific fields */}
        {propertyData.type === "Reference" && (
          <div className="mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
            <h3 className="font-medium mb-3">Reference Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <UILabel htmlFor="refEntity">Referenced Entity</UILabel>
                <Select
                  value={selectedRefEntity}
                  onValueChange={setSelectedRefEntity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.title || table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <UILabel htmlFor="refType">Reference Type</UILabel>
                <Select
                  value={selectedRefType}
                  onValueChange={(value: "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany") => 
                    setSelectedRefType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OneToOne">
                      <div className="flex flex-col">
                        <span>OneToOne</span>
                        <span className="text-xs text-muted-foreground">Each record has exactly one match (1:1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OneToMany">
                      <div className="flex flex-col">
                        <span>OneToMany</span>
                        <span className="text-xs text-muted-foreground">This entity has many related records (1:N)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ManyToOne">
                      <div className="flex flex-col">
                        <span>ManyToOne</span>
                        <span className="text-xs text-muted-foreground">Many of this entity refer to one record (N:1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ManyToMany">
                      <div className="flex flex-col">
                        <span>ManyToMany</span>
                        <span className="text-xs text-muted-foreground">Many-to-many relationship (N:N)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <UILabel htmlFor="refPropName">Reference Property Name</UILabel>
                <div className="flex gap-2">
                  <Input
                    id="refPropName"
                    value={refEntityPropName}
                    onChange={(e) => setRefEntityPropName(e.target.value)}
                    placeholder="e.g., customerOrders"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (selectedRefEntity) {
                        const entity = tables.find(t => t.id === selectedRefEntity);
                        if (entity) {
                          const refName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
                          setRefEntityPropName(refName);
                        }
                      }
                    }}
                  >
                    Auto-generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the property name used in the referenced entity.
                </p>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={propertyData.cascadeReference}
                    onCheckedChange={(checked: boolean) =>
                      setPropertyData({ ...propertyData, cascadeReference: checked })
                    }
                  />
                  <UILabel>Cascade Reference</UILabel>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, deleting a record will also delete or update referenced records.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Advanced UI Settings Section */}
        <Collapsible className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-2">
              <span>Advanced UI Settings</span>
              <FiChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border rounded-md mt-2 bg-slate-50 dark:bg-slate-900">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <UILabel htmlFor="formModes">Form Modes</UILabel>
                <Input
                  id="formModes"
                  type="number"
                  value={propertyData.formModes || ""}
                  onChange={(e) => setPropertyData({ 
                    ...propertyData, 
                    formModes: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Form mode flags"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bitmask value controlling form behavior
                </p>
              </div>
              
              <div>
                <UILabel htmlFor="listScreens">List Screens</UILabel>
                <Input
                  id="listScreens"
                  type="number"
                  value={propertyData.listScreens || ""}
                  onChange={(e) => setPropertyData({ 
                    ...propertyData, 
                    listScreens: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="List screen flags"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Controls display in different list views
                </p>
              </div>
              
              <div>
                <UILabel htmlFor="createFormMode">Create Form Mode</UILabel>
                <Select
                  value={String(propertyData.createFormMode || "")}
                  onValueChange={(value) => setPropertyData({ 
                    ...propertyData, 
                    createFormMode: value ? parseInt(value) : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Editable (1)</SelectItem>
                    <SelectItem value="2">View-only (2)</SelectItem>
                    <SelectItem value="4">Hidden (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <UILabel htmlFor="updateFormMode">Update Form Mode</UILabel>
                <Select
                  value={String(propertyData.updateFormMode || "")}
                  onValueChange={(value) => setPropertyData({ 
                    ...propertyData, 
                    updateFormMode: value ? parseInt(value) : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Editable (1)</SelectItem>
                    <SelectItem value="2">View-only (2)</SelectItem>
                    <SelectItem value="4">Hidden (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <UILabel htmlFor="viewFormMode">View Form Mode</UILabel>
                <Select
                  value={String(propertyData.viewFormMode || "")}
                  onValueChange={(value) => setPropertyData({ 
                    ...propertyData, 
                    viewFormMode: value ? parseInt(value) : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Editable (1)</SelectItem>
                    <SelectItem value="2">View-only (2)</SelectItem>
                    <SelectItem value="4">Hidden (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!propertyData.name || (propertyData.type === "Reference" && !selectedRefEntity)}>
            {isEditing ? "Update Property" : "Add Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NewDataTablePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRefEntity, setSelectedRefEntity] = useState<string>("");
  const [refEntityPropName, setRefEntityPropName] = useState<string>("");
  const [selectedRefType, setSelectedRefType] = useState<"OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany">("OneToMany");
  const [newProperty, setNewProperty] = useState<Property>({
    name: "",
    type: "String",
    required: false,
  });

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

  // Forms for each step
  const basicInfoForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      securityLevel: "Authorized",
    },
  });

  const propertyForm = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      type: "string",
      isRequired: false,
      isUnique: false,
      isSearchable: false,
    },
  });

  const permissionsForm = useForm<z.infer<typeof permissionsSchema>>({
    resolver: zodResolver(permissionsSchema),
    defaultValues: {
    },
  });

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

  // Handle reference prop name generation
  useEffect(() => {
    if (selectedRefEntity && newProperty.type === "Reference") {
      // Find selected entity
      const entity = tables.find(t => t.id === selectedRefEntity);
      if (entity) {
        // Generate a default reference property name
        const refName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
        setRefEntityPropName(refName);
      }
    }
  }, [selectedRefEntity, newProperty.type, tables]);

  const addProperty = () => {
    if (newProperty.name && newProperty.type) {
      const propToAdd = {...newProperty};
      
      // If it's a reference type, add the reference fields
      if (propToAdd.type === "Reference" && selectedRefEntity) {
        propToAdd.reference = selectedRefEntity;
        propToAdd.refType = selectedRefType;
        propToAdd.refEntPropName = refEntityPropName;
      }
      
      setProperties([...properties, propToAdd]);
      
      // Reset form
      setNewProperty({
        name: "",
        type: "String",
        required: false,
      });
      setSelectedRefEntity("");
      setRefEntityPropName("");
      setSelectedRefType("OneToMany");
    }
  };

  const removeProperty = (index: number) => {
    const propertyToRemove = properties[index];
    
    // Prevent removing id or title properties
    if (propertyToRemove.name === "id" || propertyToRemove.name === "title") {
      toast({
        title: "Cannot Remove Property",
        description: "The 'id' and 'title' properties are required and cannot be removed.",
        variant: "destructive",
      });
      return;
    }
    
    setProperties(properties.filter((_, i) => i !== index));
  };

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
        id: "temp-id", // This will be replaced by the backend
        title,
        name,
        description,
        properties: mappedProperties,
        securityLevel: basicInfoForm.getValues().securityLevel as "Authorized" | "SuperSafe" | "Public",
        permissions: {
        },
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
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Input
                placeholder="Property Name"
                value={newProperty.name}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, name: e.target.value })
                }
              />
              <Select
                value={newProperty.type}
                onValueChange={(value) =>
                  setNewProperty({ ...newProperty, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newProperty.required}
                  onCheckedChange={(checked: boolean) =>
                    setNewProperty({ ...newProperty, required: checked })
                  }
                />
                <UILabel>Required</UILabel>
              </div>
              <Button 
                onClick={addProperty}
                disabled={
                  !newProperty.name || 
                  (newProperty.type === "Reference" && !selectedRefEntity)
                }
              >
                Add Property
              </Button>
            </div>

            <div>
              <UILabel htmlFor="propDescription">Property Description</UILabel>
              <Input
                id="propDescription"
                value={newProperty.description || ""}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, description: e.target.value })
                }
                placeholder="Human-readable description of this property"
              />
            </div>

            {newProperty.type === "Reference" && (
              <div className="grid grid-cols-2 gap-4 mt-2 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                <div className="col-span-2">
                  <h4 className="font-medium mb-2">Reference Configuration</h4>
                </div>
                <div>
                  <UILabel htmlFor="refEntity">Referenced Entity</UILabel>
                  <Select
                    value={selectedRefEntity}
                    onValueChange={setSelectedRefEntity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.title || table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <UILabel htmlFor="refType">Reference Type</UILabel>
                  <Select
                    value={selectedRefType}
                    onValueChange={(value: "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany") => 
                      setSelectedRefType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OneToOne">
                        <div className="flex flex-col">
                          <span>OneToOne</span>
                          <span className="text-xs text-muted-foreground">Each record has exactly one match (1:1)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="OneToMany">
                        <div className="flex flex-col">
                          <span>OneToMany</span>
                          <span className="text-xs text-muted-foreground">This entity has many related records (1:N)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ManyToOne">
                        <div className="flex flex-col">
                          <span>ManyToOne</span>
                          <span className="text-xs text-muted-foreground">Many of this entity refer to one record (N:1)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ManyToMany">
                        <div className="flex flex-col">
                          <span>ManyToMany</span>
                          <span className="text-xs text-muted-foreground">Many-to-many relationship (N:N)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Defines how records in this entity relate to records in the referenced entity.
                  </p>
                </div>
                
                <div className="col-span-2">
                  <UILabel htmlFor="refPropName">Reference Property Name</UILabel>
                  <div className="flex gap-2">
                    <Input
                      id="refPropName"
                      value={refEntityPropName}
                      onChange={(e) => setRefEntityPropName(e.target.value)}
                      placeholder="e.g., customerOrders"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (selectedRefEntity) {
                          const entity = tables.find(t => t.id === selectedRefEntity);
                          if (entity) {
                            const refName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
                            setRefEntityPropName(refName);
                          }
                        }
                      }}
                    >
                      Auto-generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is the property name used in the referenced entity. For example, if this is "customer" entity and you're referencing "orders", this might be "customerOrders".
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Table Properties</h4>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadDefaultProperties(name, true)}
                    disabled={isPropertiesLoading}
                  >
                    {isPropertiesLoading ? (
                      <>
                        <FiLoader className="mr-2 h-3 w-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-2 h-3 w-3" />
                        Reset Default Properties
                      </>
                    )}
                  </Button>
                  <Badge variant="outline" className="px-2 py-1">
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                {isPropertiesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <FiLoader className="mr-2 h-5 w-5 animate-spin" />
                    <span>Loading default properties...</span>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No properties defined yet. Add properties using the form above.
                  </div>
                ) : (
                  properties.map((prop, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between py-2 border-b ${
                        prop.isDefault ? "bg-slate-50 dark:bg-slate-900" : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{prop.name}</span>
                          <Badge>{prop.type}</Badge>
                          {prop.required && <Badge variant="secondary">Required</Badge>}
                          {prop.isDefault && <Badge variant="outline">Default</Badge>}
                          {prop.type === "Reference" && prop.refType && (
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900">
                              {prop.refType}
                            </Badge>
                          )}
                        </div>
                        {prop.description && (
                          <span className="text-xs text-muted-foreground">{prop.description}</span>
                        )}
                        {prop.type === "Reference" && prop.refEntPropName && (
                          <span className="text-xs text-muted-foreground">
                            Referenced as: {prop.refEntPropName}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProperty(index)}
                        className={prop.isDefault && (prop.name === "id" || prop.name === "title") ? "opacity-50" : ""}
                        disabled={prop.isDefault && (prop.name === "id" || prop.name === "title")}
                      >
                        {prop.isDefault && (prop.name === "id" || prop.name === "title") ? "Required" : "Remove"}
                      </Button>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </div>
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