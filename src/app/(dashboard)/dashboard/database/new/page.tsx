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
import { EntityDefService } from "@/lib/services/entity-def.service";
import { Label as UILabel } from "@/components/ui/label";

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
  allowCreate: z.boolean().default(true),
  allowRead: z.boolean().default(true),
  allowUpdate: z.boolean().default(true),
  allowDelete: z.boolean().default(true),
  readRoles: z.array(z.string()).default([]),
  writeRoles: z.array(z.string()).default([]),
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
  description?: string;
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

export default function NewDataTablePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newProperty, setNewProperty] = useState<Property>({
    name: "",
    type: "String",
    required: false,
  });

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
      allowCreate: true,
      allowRead: true,
      allowUpdate: true,
      allowDelete: true,
      readRoles: [],
      writeRoles: [],
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

  const addProperty = () => {
    if (newProperty.name && newProperty.type) {
      setProperties([...properties, newProperty]);
      setNewProperty({
        name: "",
        type: "String",
        required: false,
      });
    }
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const entityDefinition = {
      title,
      name,
      description,
      properties: properties.map((prop) => ({
        ...prop,
        gsbPropertyType: prop.type === "Reference" ? "EntityReference" : prop.type,
      })),
    };

    // Here you would integrate with your GSB system
    console.log("Creating new data table:", entityDefinition);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Data Table</h1>
        <Button onClick={handleSubmit}>Create Table</Button>
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
            <UILabel htmlFor="name">Name (Pascal Case)</UILabel>
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
            Define the columns and their types for your data table
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
              <Button onClick={addProperty}>Add Property</Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              {properties.map((prop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{prop.name}</span>
                    <Badge>{prop.type}</Badge>
                    {prop.required && <Badge variant="secondary">Required</Badge>}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProperty(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 