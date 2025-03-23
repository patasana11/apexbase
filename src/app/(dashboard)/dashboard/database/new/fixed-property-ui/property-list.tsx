import React from "react";
import { FiEdit, FiTrash2, FiLoader } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefType } from "@/lib/gsb/models/gsb-entity-def.model";

interface Property {
  name: string;
  type: string;
  required: boolean;
  reference?: string;
  refType?: RefType;
  refEntPropName?: string;
  isDefault?: boolean;
  description?: string;
  // Additional property configuration options can be included here
}

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
  onEdit: (property: Property, index: number) => void;
  onRemove: (index: number) => void;
}

export function PropertyList({ properties, isLoading, onEdit, onRemove }: PropertyListProps) {
  return (
    <ScrollArea className="h-[300px] border rounded-md p-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <FiLoader className="mr-2 h-5 w-5 animate-spin" />
          <span>Loading properties...</span>
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
                {prop.type === "Reference" && prop.refType !== undefined && (
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
                onClick={() => onEdit(prop, index)}
              >
                <FiEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(index)}
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
  );
} 