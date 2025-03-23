"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  FiEye,
  FiShield,
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
import { GsbEntityDef, GsbProperty, RefType, ActivityLogLevel } from '@/lib/gsb/models/gsb-entity-def.model';
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
import debounce from "lodash/debounce";
import { LoaderCircle } from "lucide-react";

// Form schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(64)
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, "Name must start with a letter and contain only letters and numbers"),
  title: z.string().min(1, "Title is required").max(128),
  description: z.string().max(500),
  publicAccess: z.boolean().default(false),
  activityLogLevel: z.nativeEnum(ActivityLogLevel).default(ActivityLogLevel.None),
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
  refType?: RefType;
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
  
  // Updated to consistently use numeric RefType enum values
  const [selectedRefType, setSelectedRefType] = useState<RefType>(() => {
    // If property has a refType value already, use it
    if (propertyData.refType !== undefined) {
      // All refType values should now be of type RefType enum
      return propertyData.refType;
    }
    // Default to OneToMany if no refType is provided
    return RefType.OneToMany;
  });

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

  // Add state for reference property name validation
  const [isRefPropNameValid, setIsRefPropNameValid] = useState(true);
  const [refPropNameValidationMessage, setRefPropNameValidationMessage] = useState("");
  const [isCheckingRefPropName, setIsCheckingRefPropName] = useState(false);
  const refPropNameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if reference property name is already used in the referenced entity
  const checkRefPropNameUniqueness = useCallback((refPropName: string, refEntityId: string) => {
    if (!refPropName || !refEntityId) {
      setIsRefPropNameValid(true);
      setRefPropNameValidationMessage("");
      setIsCheckingRefPropName(false);
      return;
    }
    
    // Set loading state
    setIsCheckingRefPropName(true);
    
    // Cancel any previous timeout
    if (refPropNameCheckTimeoutRef.current) {
      clearTimeout(refPropNameCheckTimeoutRef.current);
      refPropNameCheckTimeoutRef.current = null;
    }
    
    // Set a new timeout
    refPropNameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const entityDefService = new EntityDefService();
        
        // Get the entity definition with properties
        const entityDef = await entityDefService.getEntityDefById(refEntityId);
        
        if (entityDef && entityDef.properties) {
          // Check if the property name already exists in the referenced entity
          const propExists = entityDef.properties.some(prop => 
            prop.name?.toLowerCase() === refPropName.toLowerCase()
          );
          
          setIsRefPropNameValid(!propExists);
          
          if (propExists) {
            setRefPropNameValidationMessage(`Property name "${refPropName}" already exists in the referenced entity.`);
          } else {
            setRefPropNameValidationMessage("");
          }
        }
      } catch (error) {
        console.error("Error checking reference property name:", error);
        // Default to valid if we can't check
        setIsRefPropNameValid(true);
        setRefPropNameValidationMessage("");
      } finally {
        setIsCheckingRefPropName(false);
      }
    }, 300); // 300ms debounce
  }, []);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refPropNameCheckTimeoutRef.current) {
        clearTimeout(refPropNameCheckTimeoutRef.current);
        refPropNameCheckTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Add handler for reference property name changes
  const handleRefPropNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRefEntityPropName(value);
    
    if (value && selectedRefEntity) {
      checkRefPropNameUniqueness(value, selectedRefEntity);
    }
  };

  // Validate on selectedRefEntity change
  useEffect(() => {
    if (refEntityPropName && selectedRefEntity) {
      checkRefPropNameUniqueness(refEntityPropName, selectedRefEntity);
    }
  }, [selectedRefEntity, checkRefPropNameUniqueness, refEntityPropName]);

  const handleSubmit = () => {
    // Prepare final property data with reference fields if needed
    let finalProperty = { ...propertyData };
    
    if (finalProperty.type === "Reference") {
      // Validate reference property name before saving
      if (!isRefPropNameValid) {
        // Show error toast instead of saving
        const toast = document.createEvent('CustomEvent');
        toast.initCustomEvent('toast', true, true, {
          title: "Invalid Reference Property Name",
          description: refPropNameValidationMessage,
          variant: "destructive",
        });
        document.dispatchEvent(toast);
        return;
      }
      
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
                  value={String(selectedRefType)}
                  onValueChange={(value) => 
                    setSelectedRefType(Number(value) as RefType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(RefType.OneToOne)}>
                      <div className="flex flex-col">
                        <span>OneToOne</span>
                        <span className="text-xs text-muted-foreground">Each record has exactly one match (1:1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={String(RefType.OneToMany)}>
                      <div className="flex flex-col">
                        <span>OneToMany</span>
                        <span className="text-xs text-muted-foreground">This entity has many related records (1:N)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={String(RefType.ManyToOne)}>
                      <div className="flex flex-col">
                        <span>ManyToOne</span>
                        <span className="text-xs text-muted-foreground">Many of this entity refer to one record (N:1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={String(RefType.ManyToMany)}>
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
                    onChange={handleRefPropNameChange}
                    placeholder="e.g., customerOrders"
                    className={!isRefPropNameValid ? "border-red-500" : ""}
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
                          checkRefPropNameUniqueness(refName, selectedRefEntity);
                        }
                      }
                    }}
                  >
                    Auto-generate
                  </Button>
                </div>
                {/* Show validation message or loading state */}
                {(refPropNameValidationMessage || isCheckingRefPropName) && (
                  <div className="flex items-center mt-1 text-sm">
                    {isCheckingRefPropName ? (
                      <>
                        <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                        <span className="text-muted-foreground">Checking property name availability...</span>
                      </>
                    ) : (
                      <span className={!isRefPropNameValid ? "text-red-500" : "text-muted-foreground"}>
                        {refPropNameValidationMessage}
                      </span>
                    )}
                  </div>
                )}
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
          <Button 
            onClick={handleSubmit} 
            disabled={!propertyData.name || (propertyData.type === "Reference" && (!selectedRefEntity || !isRefPropNameValid))}
          >
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
  const [dbTableName, setDbTableName] = useState("");
  const [isNameUnique, setIsNameUnique] = useState(true);
  const [isDbTableNameUnique, setIsDbTableNameUnique] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameValidationMessage, setNameValidationMessage] = useState("");
  const [isCheckingUniqueness, setIsCheckingUniqueness] = useState(false);
  const [selectedRefEntity, setSelectedRefEntity] = useState<string>("");
  const [refEntityPropName, setRefEntityPropName] = useState<string>("");
  const [selectedRefType, setSelectedRefType] = useState<RefType>(RefType.OneToMany);
  const [newProperty, setNewProperty] = useState<Property>({
    name: "",
    type: "String",
    required: false,
  });
  
  // Create a ref to store the timeout ID
  const nameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create state and ref for reference property name validation
  const [isRefPropNameValid, setIsRefPropNameValid] = useState(true);
  const [refPropNameValidationMessage, setRefPropNameValidationMessage] = useState("");
  const [isCheckingRefPropName, setIsCheckingRefPropName] = useState(false);
  const refPropNameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Property edit modal state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [propertyIndexToEdit, setPropertyIndexToEdit] = useState<number | null>(null);

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
          
        // Ensure refType is always a RefType enum value
        let refType: RefType | undefined = undefined;
        if (prop.refType !== undefined) {
          // The backend always sends numeric values, so we can safely cast it
          refType = prop.refType as unknown as RefType;
        }
          
        return {
          name: prop.name,
          type: prop.refType ? "Reference" : "String", // Simplified type mapping
          required: prop.isRequired || false,
          reference: prop.refEntDef_id,
          refType: refType,
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
      publicAccess: false,
      activityLogLevel: ActivityLogLevel.None,
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

  // Convert string to Pascal case and remove special characters
  const toPascalCase = (str: string): string => {
    if (!str) return "";
    
    // Remove special characters and spaces, keeping only alphanumeric
    return str
      .split(/[^a-zA-Z0-9]/) // Split by non-alphanumeric characters
      .filter(Boolean) // Remove empty strings
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Convert to Pascal case
      .join("");
  };

  // Validate if name follows the required pattern
  const validateName = (name: string): boolean => {
    // Must start with a letter and contain only letters and numbers
    const namePattern = /^[A-Za-z][A-Za-z0-9]*$/;
    return namePattern.test(name);
  };
  
  // Handle name uniqueness check with manual debounce implementation
  const checkNameUniqueness = useCallback((nameToCheck: string) => {
    if (!nameToCheck) {
      setIsNameUnique(true);
      setIsDbTableNameUnique(true);
      setIsCheckingUniqueness(false);
      return;
    }
    
    // Set loading state
    setIsCheckingUniqueness(true);
    
    // Cancel any previous timeout
    if (nameCheckTimeoutRef.current) {
      clearTimeout(nameCheckTimeoutRef.current);
      nameCheckTimeoutRef.current = null;
    }
    
    // Set a new timeout
    nameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const entityDefService = new EntityDefService();
        
        // Use the specialized method that only selects name and dbTableName fields
        const { entityDefs } = await entityDefService.checkNameUniqueness(nameToCheck);
        
        // Check name uniqueness
        const nameExists = entityDefs.some(def => 
          def.name?.toLowerCase() === nameToCheck.toLowerCase()
        );
        setIsNameUnique(!nameExists);
        
        // Check dbTableName uniqueness
        const dbTableNameToCheck = nameToCheck;
        const dbTableNameExists = entityDefs.some(def => 
          def.dbTableName?.toLowerCase() === dbTableNameToCheck.toLowerCase()
        );
        setIsDbTableNameUnique(!dbTableNameExists);
        
        // If dbTableName is not unique but name is, generate a unique dbTableName
        if (dbTableNameExists && !nameExists) {
          let suffix = 1;
          let uniqueDbTableName = `${dbTableNameToCheck}${suffix}`;
          
          // Find a unique dbTableName by adding a number suffix
          while (entityDefs.some(def => def.dbTableName?.toLowerCase() === uniqueDbTableName.toLowerCase())) {
            suffix++;
            uniqueDbTableName = `${dbTableNameToCheck}${suffix}`;
          }
          
          setDbTableName(uniqueDbTableName);
        } else if (!dbTableNameExists) {
          setDbTableName(nameToCheck);
        }
        
        // Update validation message
        if (nameExists) {
          setNameValidationMessage("This name is already taken.");
        } else if (!isNameValid) {
          setNameValidationMessage("Name must start with a letter and contain only letters and numbers.");
        } else {
          setNameValidationMessage("");
        }
      } catch (error) {
        console.error("Error checking name uniqueness:", error);
      } finally {
        setIsCheckingUniqueness(false);
      }
    }, 300); // 300ms debounce for better responsiveness
  }, [isNameValid]);

  // Reset check timeout on unmount
  useEffect(() => {
    return () => {
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current);
        nameCheckTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle name input losing focus
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Validate name format
    const isValid = validateName(value);
    setIsNameValid(isValid);
    
    if (isValid && value) {
      // Force immediate check by canceling any pending timeouts
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current);
        nameCheckTimeoutRef.current = null;
      }
      checkNameUniqueness(value);
    } else if (!isValid) {
      setNameValidationMessage("Name must start with a letter and contain only letters and numbers.");
    }
  };

  // Handle name input focus
  const handleNameFocus = () => {
    // Clear error messages when user starts editing
    if (!isNameValid || !isNameUnique) {
      setNameValidationMessage("");
    }
  };

  // Check if reference property name is already used in the referenced entity
  const checkRefPropNameUniqueness = useCallback((refPropName: string, refEntityId: string) => {
    if (!refPropName || !refEntityId) {
      setIsRefPropNameValid(true);
      setRefPropNameValidationMessage("");
      setIsCheckingRefPropName(false);
      return;
    }
    
    // Set loading state
    setIsCheckingRefPropName(true);
    
    // Cancel any previous timeout
    if (refPropNameCheckTimeoutRef.current) {
      clearTimeout(refPropNameCheckTimeoutRef.current);
      refPropNameCheckTimeoutRef.current = null;
    }
    
    // Set a new timeout
    refPropNameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const entityDefService = new EntityDefService();
        
        // Get the entity definition with properties
        const entityDef = await entityDefService.getEntityDefById(refEntityId);
        
        if (entityDef && entityDef.properties) {
          // Check if the property name already exists in the referenced entity
          const propExists = entityDef.properties.some(prop => 
            prop.name?.toLowerCase() === refPropName.toLowerCase()
          );
          
          setIsRefPropNameValid(!propExists);
          
          if (propExists) {
            setRefPropNameValidationMessage(`Property name "${refPropName}" already exists in the referenced entity.`);
          } else {
            setRefPropNameValidationMessage("");
          }
        }
      } catch (error) {
        console.error("Error checking reference property name:", error);
        // Default to valid if we can't check
        setIsRefPropNameValid(true);
        setRefPropNameValidationMessage("");
      } finally {
        setIsCheckingRefPropName(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Add a handler for reference property name input
  const handleRefPropNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRefEntityPropName(value);
    
    if (value && selectedRefEntity) {
      checkRefPropNameUniqueness(value, selectedRefEntity);
    }
  };
  
  // Add a blur handler for reference property name
  const handleRefPropNameBlur = () => {
    if (refEntityPropName && selectedRefEntity) {
      // Force immediate check
      if (refPropNameCheckTimeoutRef.current) {
        clearTimeout(refPropNameCheckTimeoutRef.current);
        refPropNameCheckTimeoutRef.current = null;
      }
      checkRefPropNameUniqueness(refEntityPropName, selectedRefEntity);
    }
  };
  
  // Check reference property name when selectedRefEntity changes
  useEffect(() => {
    if (refEntityPropName && selectedRefEntity) {
      checkRefPropNameUniqueness(refEntityPropName, selectedRefEntity);
    }
  }, [selectedRefEntity, checkRefPropNameUniqueness, refEntityPropName]);

  // Handle title input losing focus
  const handleTitleBlur = () => {
    if (title) {
      // Generate name from title on blur if name isn't manually set yet
      const pascalCaseName = toPascalCase(title);
      setName(pascalCaseName);
      
      // Validate the generated name immediately
      const isValid = validateName(pascalCaseName);
      setIsNameValid(isValid);
      
      if (isValid) {
        // Force immediate check by canceling any pending timeouts
        if (nameCheckTimeoutRef.current) {
          clearTimeout(nameCheckTimeoutRef.current);
          nameCheckTimeoutRef.current = null;
        }
        checkNameUniqueness(pascalCaseName);
      } else {
        setNameValidationMessage("Name must start with a letter and contain only letters and numbers.");
      }
    }
  };

  // Handle title input focus
  const handleTitleFocus = () => {
    // Reset any validation messages related to the title
    if (!isNameValid && !name) {
      setNameValidationMessage("");
    }
  };

  // Auto-generate Pascal case name from title when title changes
  useEffect(() => {
    // Only run this effect if title has value and name is empty
    if (title && !name) {
      const pascalCaseName = toPascalCase(title);
      setName(pascalCaseName);
      
      // Validate the generated name
      const isValid = validateName(pascalCaseName);
      setIsNameValid(isValid);
      
      if (isValid) {
        // Check uniqueness
        // Cancel any previous check first
        if (nameCheckTimeoutRef.current) {
          clearTimeout(nameCheckTimeoutRef.current);
          nameCheckTimeoutRef.current = null;
        }
        checkNameUniqueness(pascalCaseName);
      } else {
        setNameValidationMessage("Name must start with a letter and contain only letters and numbers.");
      }
    }
  }, [title, checkNameUniqueness, name]); // Include name in dependencies to prevent unwanted updates
  
  // When name changes, update dbTableName and check uniqueness
  useEffect(() => {
    if (name) {
      // Validate name format
      const isValid = validateName(name);
      setIsNameValid(isValid);
      
      if (isValid) {
        // Check uniqueness - our more robust implementation will handle this with debouncing
        // Cancel existing timeout first to prevent duplicate calls
        if (nameCheckTimeoutRef.current) {
          clearTimeout(nameCheckTimeoutRef.current);
          nameCheckTimeoutRef.current = null;
        }
        checkNameUniqueness(name);
      } else {
        setNameValidationMessage("Name must start with a letter and contain only letters and numbers.");
      }
    } else {
      setIsNameValid(true);
      setIsNameUnique(true);
      setIsDbTableNameUnique(true);
      setNameValidationMessage("");
    }
  }, [name, checkNameUniqueness]);

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

  // Open modal to add a new property
  const openAddPropertyModal = () => {
    setEditingProperty(null);
    setIsEditingExisting(false);
    setPropertyIndexToEdit(null);
    setIsPropertyModalOpen(true);
  };
  
  // Open modal to edit an existing property
  const openEditPropertyModal = (property: Property, index: number) => {
    setEditingProperty({...property});
    setIsEditingExisting(true);
    setPropertyIndexToEdit(index);
    setIsPropertyModalOpen(true);
  };
  
  // Handle property modal save
  const handlePropertySave = (property: Property) => {
    if (isEditingExisting && propertyIndexToEdit !== null) {
      // Update existing property
      const updatedProperties = [...properties];
      updatedProperties[propertyIndexToEdit] = property;
      setProperties(updatedProperties);
      toast({
        title: "Property Updated",
        description: `Property "${property.name}" updated successfully.`,
      });
    } else {
      // Add new property
      setProperties([...properties, property]);
      toast({
        title: "Property Added",
        description: `Property "${property.name}" added successfully.`,
      });
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

  const addProperty = () => {
    // Validate that we have the minimum required properties
    if (!newProperty.name || !newProperty.type) {
      toast({
        title: "Missing required fields",
        description: "Property name and type are required.",
        variant: "destructive",
      });
      return;
    }
    
    // Additional validation for Reference types
    if (newProperty.type === "Reference") {
      if (!selectedRefEntity) {
        toast({
          title: "Missing reference entity",
          description: "You must select a referenced entity.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate the reference property name if a referenced entity is selected
      if (selectedRefEntity && !isRefPropNameValid) {
        toast({
          title: "Invalid reference property name",
          description: refPropNameValidationMessage || "The reference property name is not valid.",
          variant: "destructive",
        });
        return;
      }
      
      // Add the reference entity and type to the property
      const propertyToAdd = {
        ...newProperty,
        reference: selectedRefEntity,
        refType: selectedRefType,
        refEntPropName: refEntityPropName,
      };
      
      setProperties([...properties, propertyToAdd]);
    } else {
      // For non-reference types, just add the property
      setProperties([...properties, newProperty]);
    }
    
    // Reset the form
    setNewProperty({
      name: "",
      type: "",
      description: "",
      required: false,
      cascadeReference: false,
    });
    setSelectedRefEntity("");
    setSelectedRefType(RefType.OneToMany);
    setRefEntityPropName("");
    setIsRefPropNameValid(true);
    setRefPropNameValidationMessage("");
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Check if name is valid and unique
      if (!isNameValid) {
        throw new Error('Name must start with a letter and contain only letters and numbers');
      }
      
      if (!isNameUnique) {
        throw new Error('Entity name is already taken');
      }
      
      if (!isDbTableNameUnique) {
        throw new Error('Database table name is already taken');
      }
      
      const entityDefService = new EntityDefService();
      
      // Check if we have id and title properties
      const hasId = properties.some(prop => prop.name === 'id');
      const hasTitle = properties.some(prop => prop.name === 'title');
      
      if (!hasId || !hasTitle) {
        throw new Error('Entity definition must have at least id and title properties');
      }
      
      // DEBUG: Log property refType values for Reference properties
      properties.forEach(prop => {
        if (prop.type === "Reference") {
          console.log(`DEBUG - Property: ${prop.name}, refType: ${prop.refType}, typeof refType: ${typeof prop.refType}`);
        }
      });
      
      // Map user-defined properties to GSB property format
      const mappedProperties: GsbProperty[] = properties.map((prop) => {
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
          orderNumber: properties.indexOf(prop),
        };
        
        // Add reference type settings only for reference properties
        if (prop.type === "Reference") {
          console.log(`DEBUG - Processing Reference property: ${prop.name}`);
          
          // Since refType is now always a RefType enum, we can simplify this logic
          const finalRefType = prop.refType !== undefined ? prop.refType : RefType.OneToMany;
          console.log(`DEBUG - Using refType: ${finalRefType}`);
          
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
      
      const entityDefinition = {
        title,
        name,
        description,
        dbTableName: dbTableName || name, // Use the dbTableName if set, otherwise use name
        properties: mappedProperties,
        publicAccess: basicInfoForm.getValues().publicAccess,
        activityLogLevel: basicInfoForm.getValues().activityLogLevel,
        // Note: Don't set lastUpdateDate or createDate as GSB will set these automatically
      };

      console.log("Creating new data table:", entityDefinition);
      
      // Create the entity definition
      const entityDefId = await entityDefService.createEntityDef(entityDefinition as GsbEntityDef);
      
      // If we get here, it means the operation was successful
      toast({
        title: "Success",
        description: `Data table "${title}" created successfully`,
      });
      router.push('/dashboard/database');
    } catch (error) {
      console.error("Error creating entity definition:", error);
      
      // Extract server error message if available
      let errorMessage = "Failed to create data table";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          errorMessage = (error as any).message;
        } else if ('data' in error && typeof (error as any).data === 'object' && (error as any).data !== null && 'message' in (error as any).data) {
          errorMessage = (error as any).data.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Property Edit Modal */}
      <PropertyEditModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={editingProperty}
        tables={tables}
        onSave={handlePropertySave}
        isEditing={isEditingExisting}
      />
      
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
              onFocus={handleTitleFocus}
              onBlur={handleTitleBlur}
              placeholder="e.g., Customer Profile"
            />
            <p className="text-sm text-muted-foreground">
              A human-readable title for this data table.
            </p>
          </div>
          
          <div className="space-y-2">
            <UILabel htmlFor="name" className="flex items-center justify-between">
              <span>Name (PascalCase)</span>
              {isCheckingUniqueness && (
                <span className="text-sm text-muted-foreground flex items-center">
                  <LoaderCircle className="animate-spin mr-1 h-3 w-3" />
                  Checking availability...
                </span>
              )}
            </UILabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
              }}
              onFocus={handleNameFocus}
              onBlur={handleNameBlur}
              placeholder="e.g., CustomerProfile"
              className={(!isNameValid || !isNameUnique) ? "border-red-500" : ""}
            />
            {/* Validation message display */}
            {(nameValidationMessage || isCheckingUniqueness) && (
              <div className="flex items-center mt-1 text-sm">
                {isCheckingUniqueness ? (
                  <>
                    <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                    <span className="text-muted-foreground">Checking name uniqueness...</span>
                  </>
                ) : (
                  <span className={!isNameValid || !isNameUnique ? "text-red-500" : "text-muted-foreground"}>
                    {nameValidationMessage}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              A unique identifier for this data table used in API calls.
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

          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="publicAccess"
                  checked={basicInfoForm.getValues().publicAccess}
                  onCheckedChange={(checked) => {
                    basicInfoForm.setValue('publicAccess', checked);
                  }}
                />
                <UILabel htmlFor="publicAccess" className="font-medium">Public Access</UILabel>
                <FiShield className="ml-1 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Allow unauthenticated access to this data table.
              </p>
            </div>
            
            <div className="space-y-2">
              <UILabel htmlFor="activityLogLevel" className="font-medium">Activity Logging</UILabel>
              <Select
                value={String(basicInfoForm.getValues().activityLogLevel)}
                onValueChange={(value) => {
                  basicInfoForm.setValue('activityLogLevel', Number(value) as ActivityLogLevel);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(ActivityLogLevel.None)}>
                    <div className="flex flex-col">
                      <span>No Logging</span>
                      <span className="text-xs text-muted-foreground">Activities are not logged</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={String(ActivityLogLevel.Read)}>
                    <div className="flex flex-col">
                      <span>Read Only</span>
                      <span className="text-xs text-muted-foreground">Log only read operations</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={String(ActivityLogLevel.Create | ActivityLogLevel.Update | ActivityLogLevel.Delete)}>
                    <div className="flex flex-col">
                      <span>Write Operations</span>
                      <span className="text-xs text-muted-foreground">Log create, update, and delete operations</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={String(ActivityLogLevel.Read | ActivityLogLevel.Create | ActivityLogLevel.Update | ActivityLogLevel.Delete)}>
                    <div className="flex flex-col">
                      <span>Read & Write</span>
                      <span className="text-xs text-muted-foreground">Log all read and write operations</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={String(ActivityLogLevel.Read | ActivityLogLevel.Create | ActivityLogLevel.Update | ActivityLogLevel.Delete | ActivityLogLevel.Execute | ActivityLogLevel.List)}>
                    <div className="flex flex-col">
                      <span>Full Logging</span>
                      <span className="text-xs text-muted-foreground">Log all operations</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Specify which activities should be logged for this entity.
              </p>
            </div>
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
                    value={String(selectedRefType)}
                    onValueChange={(value) => 
                      setSelectedRefType(Number(value) as RefType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(RefType.OneToOne)}>
                        <div className="flex flex-col">
                          <span>OneToOne</span>
                          <span className="text-xs text-muted-foreground">Each record has exactly one match (1:1)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={String(RefType.OneToMany)}>
                        <div className="flex flex-col">
                          <span>OneToMany</span>
                          <span className="text-xs text-muted-foreground">This entity has many related records (1:N)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={String(RefType.ManyToOne)}>
                        <div className="flex flex-col">
                          <span>ManyToOne</span>
                          <span className="text-xs text-muted-foreground">Many of this entity refer to one record (N:1)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={String(RefType.ManyToMany)}>
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
                      onChange={handleRefPropNameChange}
                      onBlur={handleRefPropNameBlur}
                      placeholder="e.g., customerOrders"
                      className={!isRefPropNameValid ? "border-red-500" : ""}
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
                            checkRefPropNameUniqueness(refName, selectedRefEntity);
                          }
                        }
                      }}
                    >
                      Auto-generate
                    </Button>
                  </div>
                  {/* Show validation message or loading state */}
                  {(refPropNameValidationMessage || isCheckingRefPropName) && (
                    <div className="flex items-center mt-1 text-sm">
                      {isCheckingRefPropName ? (
                        <>
                          <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                          <span className="text-muted-foreground">Checking property name availability...</span>
                        </>
                      ) : (
                        <span className={!isRefPropNameValid ? "text-red-500" : "text-muted-foreground"}>
                          {refPropNameValidationMessage}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    This is the property name used in the referenced entity. For example, if this is "customer" entity and you're referencing "orders", this might be "customerOrders".
                  </p>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newProperty.cascadeReference}
                      onCheckedChange={(checked: boolean) =>
                        setNewProperty({ ...newProperty, cascadeReference: checked })
                      }
                    />
                    <UILabel>Cascade Reference</UILabel>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, deleting a record will also delete or update referenced records.
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
                  <Button 
                    size="sm" 
                    onClick={openAddPropertyModal}
                  >
                    <FiPlus className="mr-2 h-3 w-3" />
                    Add Property
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
                              {prop.refType === RefType.OneToOne ? "OneToOne" : 
                               prop.refType === RefType.OneToMany ? "OneToMany" : 
                               prop.refType === RefType.ManyToOne ? "ManyToOne" : 
                               prop.refType === RefType.ManyToMany ? "ManyToMany" : 
                               "Reference"}
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
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditPropertyModal(prop, index)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeProperty(index)}
                          className={prop.isDefault && (prop.name === "id" || prop.name === "title") ? "opacity-50" : ""}
                          disabled={prop.isDefault && (prop.name === "id" || prop.name === "title")}
                        >
                          {prop.isDefault && (prop.name === "id" || prop.name === "title") ? 
                            "Required" : <FiTrash2 className="h-4 w-4" />}
                        </Button>
                      </div>
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