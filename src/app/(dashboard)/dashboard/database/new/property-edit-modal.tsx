"use client";

import { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiMoreVertical,
  FiSettings
} from "react-icons/fi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label as UILabel } from "@/components/ui/label";
import { RefType, ViewMode, ScreenType } from "@/lib/gsb/models/gsb-entity-def.model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define interfaces
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

interface PropertyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  tables: any[];
  onSave: (property: Property) => void;
  isEditing: boolean;
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

export function PropertyEditModal({
  isOpen,
  onClose,
  property,
  tables,
  onSave,
  isEditing
}: PropertyEditModalProps) {
  // Initialize state with property data or defaults
  const [propertyData, setPropertyData] = useState<Property>(() => {
    if (property) {
      return { ...property };
    }
    return {
      name: "",
      type: "String",
      required: false,
      description: "",
      isIndexed: false,
      isPrimaryKey: false,
      isPartialPrimaryKey: false,
      isUnique: false,
      isEncrypted: false,
      isSearchable: false,
      isListed: false,
      isMultiLingual: false,
      maxLength: 0,
      scale: 0,
      defaultValue: "",
      cascadeReference: false,
      formModes: 0,
      updateFormMode: ViewMode.Editable,
      viewFormMode: ViewMode.Editable,
      createFormMode: ViewMode.Editable,
      listScreens: ScreenType.PC
    };
  });
  
  // Track which section is expanded
  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false);
  
  // Reset form when modal opens with new property
  useEffect(() => {
    if (property) {
      setPropertyData(property);
    } else {
      setPropertyData({
        name: "",
        type: "String",
        required: false,
        description: "",
        isIndexed: false,
        isPrimaryKey: false,
        isPartialPrimaryKey: false,
        isUnique: false,
        isEncrypted: false,
        isSearchable: false,
        isListed: false,
        isMultiLingual: false,
        maxLength: 0,
        scale: 0,
        defaultValue: "",
        cascadeReference: false,
        formModes: 0,
        updateFormMode: ViewMode.Editable,
        viewFormMode: ViewMode.Editable,
        createFormMode: ViewMode.Editable,
        listScreens: ScreenType.PC
      });
    }
    // Reset expanded sections
    setAdvancedSectionOpen(false);
  }, [property, isOpen]);

  // Handle reference specific settings
  const [selectedRefEntity, setSelectedRefEntity] = useState<string>(propertyData.reference || "");
  const [refEntityPropName, setRefEntityPropName] = useState<string>(propertyData.refEntPropName || "");
  const [selectedRefType, setSelectedRefType] = useState<RefType>(() => {
    // If property has a refType value already, use it
    if (propertyData.refType !== undefined) {
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

  // Open all sections for quick access
  const expandAllSections = () => {
    setAdvancedSectionOpen(true);
  };

  // Handle bitwise enum selection
  const handleBitwiseEnumChange = (value: number, currentValue: number, field: keyof Property) => {
    const newValue = currentValue & value ? currentValue & ~value : currentValue | value;
    setPropertyData(prev => ({ ...prev, [field]: newValue }));
  };

  // Helper to check if a bit is set
  const isBitSet = (value: number, bit: number) => (value & bit) === bit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{isEditing ? "Edit Property" : "Add New Property"}</DialogTitle>
            <DialogDescription>
              Configure all aspects of this property to define how it works in your data model.
            </DialogDescription>
          </div>
          
          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <FiMoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={expandAllSections}>
                <FiSettings className="mr-2 h-4 w-4" />
                <span>Show All Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPropertyData({
                ...propertyData,
                isPrimaryKey: true, 
                isIndexed: true,
                isUnique: true
              })}>
                <span>Make Primary Key</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPropertyData({
                ...propertyData,
                isSearchable: true,
                isListed: true
              })}>
                <span>Make Searchable & Listed</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <Collapsible className="mt-4" open={advancedSectionOpen} onOpenChange={setAdvancedSectionOpen}>
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
                <ScrollArea className="h-[100px] border rounded-md p-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createFormMode-editable"
                        checked={isBitSet(propertyData.createFormMode || 0, ViewMode.Editable)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.Editable, propertyData.createFormMode || 0, 'createFormMode')}
                      />
                      <UILabel htmlFor="createFormMode-editable">Editable</UILabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createFormMode-readonly"
                        checked={isBitSet(propertyData.createFormMode || 0, ViewMode.ReadOnly)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.ReadOnly, propertyData.createFormMode || 0, 'createFormMode')}
                      />
                      <UILabel htmlFor="createFormMode-readonly">Read-only</UILabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createFormMode-hidden"
                        checked={isBitSet(propertyData.createFormMode || 0, ViewMode.Hidden)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.Hidden, propertyData.createFormMode || 0, 'createFormMode')}
                      />
                      <UILabel htmlFor="createFormMode-hidden">Hidden</UILabel>
                    </div>
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <UILabel htmlFor="updateFormMode">Update Form Mode</UILabel>
                <ScrollArea className="h-[100px] border rounded-md p-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="updateFormMode-editable"
                        checked={isBitSet(propertyData.updateFormMode || 0, ViewMode.Editable)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.Editable, propertyData.updateFormMode || 0, 'updateFormMode')}
                      />
                      <UILabel htmlFor="updateFormMode-editable">Editable</UILabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="updateFormMode-readonly"
                        checked={isBitSet(propertyData.updateFormMode || 0, ViewMode.ReadOnly)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.ReadOnly, propertyData.updateFormMode || 0, 'updateFormMode')}
                      />
                      <UILabel htmlFor="updateFormMode-readonly">Read-only</UILabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="updateFormMode-hidden"
                        checked={isBitSet(propertyData.updateFormMode || 0, ViewMode.Hidden)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.Hidden, propertyData.updateFormMode || 0, 'updateFormMode')}
                      />
                      <UILabel htmlFor="updateFormMode-hidden">Hidden</UILabel>
                    </div>
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <UILabel htmlFor="viewFormMode">View Form Mode</UILabel>
                <ScrollArea className="h-[100px] border rounded-md p-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="viewFormMode-editable"
                        checked={isBitSet(propertyData.viewFormMode || 0, ViewMode.Editable)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.Editable, propertyData.viewFormMode || 0, 'viewFormMode')}
                      />
                      <UILabel htmlFor="viewFormMode-editable">Editable</UILabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="viewFormMode-readonly"
                        checked={isBitSet(propertyData.viewFormMode || 0, ViewMode.ReadOnly)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.ReadOnly, propertyData.viewFormMode || 0, 'viewFormMode')}
                      />
                      <UILabel htmlFor="viewFormMode-readonly">Read-only</UILabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="viewFormMode-hidden"
                        checked={isBitSet(propertyData.viewFormMode || 0, ViewMode.Hidden)}
                        onCheckedChange={() => handleBitwiseEnumChange(ViewMode.Hidden, propertyData.viewFormMode || 0, 'viewFormMode')}
                      />
                      <UILabel htmlFor="viewFormMode-hidden">Hidden</UILabel>
                    </div>
                  </div>
                </ScrollArea>
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