'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Property } from '@/components/database/types';
import { RefType } from '@/lib/gsb/models/gsb-entity-def.model';
import { EntityDefUiService } from '@/lib/services/ui/entity-def-ui.service';

interface PropertyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  isEditing: boolean;
  onSave: (property: Property) => void;
}

export function PropertyModal({
  isOpen,
  onOpenChange,
  property,
  isEditing,
  onSave,
}: PropertyModalProps) {
  const { toast } = useToast();
  const entityDefUiService = new EntityDefUiService();
  
  // Property state
  const [propertyData, setPropertyData] = useState<Property>({
    name: '',
    type: 'String',
    required: false,
  });
  
  // Reference properties
  const [tables, setTables] = useState<any[]>([]);
  const [selectedRefType, setSelectedRefType] = useState<RefType>(RefType.OneToMany);
  const [selectedRefEntity, setSelectedRefEntity] = useState<string>('');
  const [refEntityPropName, setRefEntityPropName] = useState<string>('');
  
  // Validation
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameValidationMessage, setNameValidationMessage] = useState('');
  const [isRefPropNameValid, setIsRefPropNameValid] = useState(true);
  const [refPropNameValidationMessage, setRefPropNameValidationMessage] = useState('');
  
  // Loading states
  const [isCheckingRefPropName, setIsCheckingRefPropName] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  
  // Load entity definitions (tables) for reference selection
  useEffect(() => {
    const loadTables = async () => {
      try {
        setIsLoadingTables(true);
        const tables = await entityDefUiService.getEntityDefs();
        setTables(tables);
      } catch (error) {
        console.error('Error loading tables:', error);
        toast({
          title: 'Error',
          description: 'Failed to load entity definitions',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingTables(false);
      }
    };
    
    if (isOpen) {
      loadTables();
    }
  }, [isOpen, toast, entityDefUiService]);
  
  // Initialize modal data when property changes
  useEffect(() => {
    if (property) {
      setPropertyData(property);
      
      // Handle reference properties
      if (property.type === 'Reference' && property.reference) {
        setSelectedRefEntity(property.reference);
        setSelectedRefType(property.refType || RefType.OneToMany);
        setRefEntityPropName(property.refEntPropName || '');
      }
    } else {
      // Reset form for new property
      setPropertyData({
        name: '',
        type: 'String',
        required: false,
      });
      setSelectedRefEntity('');
      setSelectedRefType(RefType.OneToMany);
      setRefEntityPropName('');
    }
    
    // Reset validation
    setIsNameValid(true);
    setNameValidationMessage('');
    setIsRefPropNameValid(true);
    setRefPropNameValidationMessage('');
  }, [property, isOpen]);
  
  // Generate reference property name when entity selected
  useEffect(() => {
    if (selectedRefEntity && propertyData.type === 'Reference' && !isEditing) {
      // Find selected entity
      const entity = tables.find(t => t.id === selectedRefEntity);
      if (entity) {
        // Generate a default reference property name
        const refName = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
        setRefEntityPropName(refName);
        
        // Validate the generated name
        checkRefPropNameValidity(refName, selectedRefEntity);
      }
    }
  }, [selectedRefEntity, propertyData.type, tables, isEditing]);
  
  // Check reference property name validity
  const checkRefPropNameValidity = async (name: string, entityId: string) => {
    if (!name || !entityId) {
      setIsRefPropNameValid(true);
      setRefPropNameValidationMessage('');
      return;
    }
    
    setIsCheckingRefPropName(true);
    
    try {
      const result = await entityDefUiService.checkRefPropNameUniqueness(name, entityId);
      setIsRefPropNameValid(result.isValid);
      setRefPropNameValidationMessage(result.validationMessage);
    } catch (error) {
      console.error('Error checking reference property name:', error);
      // Default to valid if we can't check
      setIsRefPropNameValid(true);
      setRefPropNameValidationMessage('');
    } finally {
      setIsCheckingRefPropName(false);
    }
  };
  
  // Handle property name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Basic validation - alphanumeric and starts with letter
    const isValid = /^[a-zA-Z][a-zA-Z0-9]*$/.test(value);
    setIsNameValid(isValid);
    
    if (!isValid && value) {
      setNameValidationMessage('Property name must start with a letter and contain only letters and numbers');
    } else {
      setNameValidationMessage('');
    }
    
    setPropertyData({
      ...propertyData,
      name: value,
    });
  };
  
  // Handle property type change
  const handleTypeChange = (value: string) => {
    setPropertyData({
      ...propertyData,
      type: value,
    });
    
    // Reset reference fields if changing from Reference type
    if (value !== 'Reference') {
      setSelectedRefEntity('');
      setSelectedRefType(RefType.OneToMany);
      setRefEntityPropName('');
    }
  };
  
  // Handle reference entity property name change
  const handleRefPropNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRefEntityPropName(value);
    
    if (value && selectedRefEntity) {
      checkRefPropNameValidity(value, selectedRefEntity);
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    // Validate required fields
    if (!propertyData.name) {
      toast({
        title: 'Error',
        description: 'Property name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isNameValid) {
      toast({
        title: 'Error',
        description: nameValidationMessage || 'Property name is invalid',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate reference fields if type is Reference
    if (propertyData.type === 'Reference') {
      if (!selectedRefEntity) {
        toast({
          title: 'Error',
          description: 'You must select an entity to reference',
          variant: 'destructive',
        });
        return;
      }
      
      if (!isRefPropNameValid) {
        toast({
          title: 'Error',
          description: refPropNameValidationMessage || 'Reference property name is invalid',
          variant: 'destructive',
        });
        return;
      }
      
      // Add reference properties
      const updatedProperty = {
        ...propertyData,
        reference: selectedRefEntity,
        refType: selectedRefType,
        refEntPropName: refEntityPropName,
      };
      
      onSave(updatedProperty);
    } else {
      // For non-reference properties
      onSave(propertyData);
    }
    
    // Close the modal
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details for this property'
              : 'Add a new property to your data table'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Property Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                value={propertyData.name}
                onChange={handleNameChange}
                placeholder="e.g. firstName"
                className={!isNameValid ? 'border-red-500' : ''}
                disabled={isEditing && (propertyData.name === 'id' || propertyData.name === 'title')}
              />
              {nameValidationMessage && (
                <p className="text-xs text-red-500 mt-1">{nameValidationMessage}</p>
              )}
            </div>
          </div>
          
          {/* Property Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <div className="col-span-3">
              <Select
                value={propertyData.type}
                onValueChange={handleTypeChange}
                disabled={isEditing && (propertyData.name === 'id' || propertyData.name === 'title')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="String">String</SelectItem>
                  <SelectItem value="Number">Number</SelectItem>
                  <SelectItem value="Boolean">Boolean</SelectItem>
                  <SelectItem value="Date">Date</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                value={propertyData.description || ''}
                onChange={(e) =>
                  setPropertyData({
                    ...propertyData,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description"
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
          
          {/* Required */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="required" className="text-right">
              Required
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="required"
                checked={propertyData.required}
                onCheckedChange={(checked) =>
                  setPropertyData({
                    ...propertyData,
                    required: checked,
                  })
                }
                disabled={isEditing && (propertyData.name === 'id' || propertyData.name === 'title')}
              />
              <span className="text-sm text-muted-foreground">
                This property must have a value
              </span>
            </div>
          </div>
          
          {/* Unique */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unique" className="text-right">
              Unique
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="unique"
                checked={propertyData.isUnique || false}
                onCheckedChange={(checked) =>
                  setPropertyData({
                    ...propertyData,
                    isUnique: checked,
                  })
                }
                disabled={isEditing && (propertyData.name === 'id' || propertyData.name === 'title')}
              />
              <span className="text-sm text-muted-foreground">
                Values must be unique across all records
              </span>
            </div>
          </div>
          
          {/* Indexed */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="indexed" className="text-right">
              Indexed
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="indexed"
                checked={propertyData.isIndexed || false}
                onCheckedChange={(checked) =>
                  setPropertyData({
                    ...propertyData,
                    isIndexed: checked,
                  })
                }
                disabled={isEditing && (propertyData.name === 'id' || propertyData.name === 'title')}
              />
              <span className="text-sm text-muted-foreground">
                Create an index for faster queries
              </span>
            </div>
          </div>
          
          {/* Reference Configuration - Only show if type is Reference */}
          {propertyData.type === 'Reference' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refEntity" className="text-right">
                  Referenced Entity
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedRefEntity}
                    onValueChange={setSelectedRefEntity}
                    disabled={isLoadingTables}
                  >
                    <SelectTrigger id="refEntity">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refType" className="text-right">
                  Reference Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedRefType.toString()}
                    onValueChange={(value) => setSelectedRefType(Number(value) as RefType)}
                  >
                    <SelectTrigger id="refType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RefType.OneToOne.toString()}>One-to-One</SelectItem>
                      <SelectItem value={RefType.OneToMany.toString()}>One-to-Many</SelectItem>
                      <SelectItem value={RefType.ManyToOne.toString()}>Many-to-One</SelectItem>
                      <SelectItem value={RefType.ManyToMany.toString()}>Many-to-Many</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refPropName" className="text-right">
                  Reference Property
                </Label>
                <div className="col-span-3">
                  <Input
                    id="refPropName"
                    value={refEntityPropName}
                    onChange={handleRefPropNameChange}
                    placeholder="e.g. user"
                    className={!isRefPropNameValid ? 'border-red-500' : ''}
                  />
                  {refPropNameValidationMessage && (
                    <p className="text-xs text-red-500 mt-1">{refPropNameValidationMessage}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Property name in the referenced entity
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cascadeRef" className="text-right">
                  Cascade Reference
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="cascadeRef"
                    checked={propertyData.cascadeReference || false}
                    onCheckedChange={(checked) =>
                      setPropertyData({
                        ...propertyData,
                        cascadeReference: checked,
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Delete related records when this record is deleted
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !propertyData.name ||
              !isNameValid ||
              (propertyData.type === 'Reference' && (!selectedRefEntity || !isRefPropNameValid))
            }
          >
            {isEditing ? 'Update' : 'Add'} Property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 