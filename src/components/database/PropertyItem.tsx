'use client';

import { Property } from '@/components/database/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Trash2, Lock, InfoIcon } from 'lucide-react';

interface PropertyItemProps {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
  isDefault?: boolean;
}

/**
 * Component to display a single property in the property list
 */
export function PropertyItem({ property, onEdit, onDelete, isDefault = false }: PropertyItemProps) {
  const { name, type, required, description } = property;

  // Get badge color based on property type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'String':
        return 'default';
      case 'Number':
        return 'outline';
      case 'Boolean':
        return 'secondary';
      case 'Date':
        return 'destructive';
      case 'Reference':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get additional property badges
  const getPropertyBadges = () => {
    const badges = [];

    if (required) {
      badges.push(
        <Badge key="required" variant="destructive" className="ml-2">
          Required
        </Badge>
      );
    }

    if (property.isPrimaryKey) {
      badges.push(
        <Badge key="primary" variant="outline" className="ml-2 border-yellow-500 text-yellow-700">
          Primary Key
        </Badge>
      );
    }

    if (property.isUnique) {
      badges.push(
        <Badge key="unique" variant="outline" className="ml-2">
          Unique
        </Badge>
      );
    }

    if (property.isIndexed) {
      badges.push(
        <Badge key="indexed" variant="outline" className="ml-2">
          Indexed
        </Badge>
      );
    }

    return badges;
  };

  return (
    <Card className={`border ${isDefault ? 'border-gray-200 bg-gray-50' : ''}`}>
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-medium">{name}</span>
              <Badge variant={getBadgeVariant(type)} className="ml-2">
                {type}
              </Badge>
              {getPropertyBadges()}
              
              {isDefault && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2">
                        <Lock className="h-3.5 w-3.5 text-gray-500" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Default system property</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            
            {property.type === 'Reference' && property.reference && (
              <div className="text-xs text-muted-foreground mt-1">
                References: {property.refEntPropName || property.reference}{' '}
                ({property.refType || 'One-to-Many'})
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
            aria-label="Edit property"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          {!isDefault && property.name !== 'id' && property.name !== 'title' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label="Delete property"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {(property.name === 'id' || property.name === 'title') && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2">
                    <InfoIcon className="h-4 w-4 text-gray-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Required system property - cannot be deleted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 