"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiPlus, FiTrash2, FiEdit, FiLoader } from "react-icons/fi";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Label as UILabel } from "@/components/ui/label";
import { PropertyEditModal } from "./property-edit-modal";

// Simplified for demo
interface Property {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  isPrimaryKey?: boolean;
  isDefault?: boolean;
}

export default function SimplifiedNewTable() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
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
    setProperties(properties.filter((_, i) => i !== index));
    
    toast({
      title: "Property Removed",
      description: `Property "${propertyToRemove.name}" removed successfully.`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Data Table</h1>
        <Button>
          <FiSave className="mr-2 h-4 w-4" />
          Create Table
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
          </div>
          
          <div className="space-y-2">
            <UILabel htmlFor="name">Name (PascalCase)</UILabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CustomerProfile"
            />
          </div>
          
          <div className="space-y-2">
            <UILabel htmlFor="description">Description</UILabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this data table"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            Define the columns and their types for your data table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Property Edit Modal */}
            <PropertyEditModal
              isOpen={isPropertyModalOpen}
              onClose={() => setIsPropertyModalOpen(false)}
              property={editingProperty}
              tables={[]}
              onSave={handlePropertySave}
              isEditing={isEditingExisting}
            />
            
            {/* Add Property Button */}
            <div className="flex justify-end">
              <Button 
                onClick={openAddPropertyModal}
                className="mb-4"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Table Properties</h4>
                <Badge variant="outline" className="px-2 py-1">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                </Badge>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                {isPropertiesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <FiLoader className="mr-2 h-5 w-5 animate-spin" />
                    <span>Loading properties...</span>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No properties defined yet. Click "Add New Property" to get started.
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
                          {prop.isPrimaryKey && <Badge variant="secondary">Primary Key</Badge>}
                          {prop.isDefault && <Badge variant="outline">Default</Badge>}
                        </div>
                        {prop.description && (
                          <span className="text-xs text-muted-foreground">{prop.description}</span>
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
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 