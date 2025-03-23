import { useState } from "react";
import { FiPlus, FiLoader, FiMoreVertical } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { PropertyList } from "./property-list";
import { PropertyEditModal } from "../property-edit-modal";
import { RefType } from "@/lib/gsb/models/gsb-entity-def.model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Property {
  name: string;
  type: string;
  required: boolean;
  reference?: string;
  refType?: RefType;
  refEntPropName?: string;
  isDefault?: boolean;
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

interface PropertyEditorProps {
  properties: Property[];
  isLoading: boolean;
  tables: any[];
  entityName: string;
  onPropertiesChange: (properties: Property[]) => void;
  onResetDefaultProperties: () => void;
}

export function PropertyEditor({
  properties,
  isLoading,
  tables,
  entityName,
  onPropertiesChange,
  onResetDefaultProperties
}: PropertyEditorProps) {
  const { toast } = useToast();
  
  // Property edit modal state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [propertyIndexToEdit, setPropertyIndexToEdit] = useState<number | null>(null);
  
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
      onPropertiesChange(updatedProperties);
      toast({
        title: "Property Updated",
        description: `Property "${property.name}" updated successfully.`,
      });
    } else {
      // Add new property
      onPropertiesChange([...properties, property]);
      toast({
        title: "Property Added",
        description: `Property "${property.name}" added successfully.`,
      });
    }
  };
  
  // Remove property
  const removeProperty = (index: number) => {
    const propertyToRemove = properties[index];
    
    // Prevent removing id or title properties
    if (propertyToRemove.isDefault && (propertyToRemove.name === "id" || propertyToRemove.name === "title")) {
      toast({
        title: "Cannot Remove Property",
        description: "The 'id' and 'title' properties are required and cannot be removed.",
        variant: "destructive",
      });
      return;
    }
    
    const newProperties = properties.filter((_, i) => i !== index);
    onPropertiesChange(newProperties);
    
    toast({
      title: "Property Removed",
      description: `Property "${propertyToRemove.name}" removed successfully.`,
    });
  };
  
  return (
    <div className="space-y-4">
      <PropertyEditModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={editingProperty}
        tables={tables}
        onSave={handlePropertySave}
        isEditing={isEditingExisting}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Table Properties</h4>
          <Badge variant="outline" className="px-2 py-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetDefaultProperties}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FiLoader className="mr-2 h-3 w-3 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Reset Default Properties
              </>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FiMoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Property Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openAddPropertyModal}>
                <FiPlus className="mr-2 h-4 w-4" />
                Add New Property
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onResetDefaultProperties}>
                Reset Default Properties
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" onClick={openAddPropertyModal}>
            <FiPlus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>
      
      <PropertyList
        properties={properties}
        isLoading={isLoading}
        onEdit={openEditPropertyModal}
        onRemove={removeProperty}
      />
    </div>
  );
} 