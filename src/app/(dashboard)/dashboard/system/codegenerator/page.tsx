"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiPlay, FiCode } from "react-icons/fi";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CodeGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [codeGenerators, setCodeGenerators] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Load code generators
  useEffect(() => {
    loadCodeGenerators();
  }, [currentPage, pageSize, searchQuery, selectedModule, selectedType]);

  const loadCodeGenerators = async () => {
    try {
      setIsLoading(true);
      const dataTableService = GsbDataTableService.getInstance();
      const response = await dataTableService.query({
        entityDefName: "GsbCodeGenerator",
        startIndex: (currentPage - 1) * pageSize,
        count: pageSize,
        search: searchQuery,
        sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
        query: [
          ...(selectedModule ? [{
            name: "module_id",
            isEqual: selectedModule,
          }] : []),
          ...(selectedType ? [{
            name: "type",
            isEqual: selectedType,
          }] : []),
        ],
      });
      setCodeGenerators(response.entities || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading code generators:", error);
      toast({
        title: "Error",
        description: "Failed to load code generators. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGenerator = () => {
    router.push("/dashboard/system/codegenerator/new");
  };

  const handleEditGenerator = (generator: any) => {
    router.push(`/dashboard/system/codegenerator/${generator.id}/edit`);
  };

  const handleDeleteGenerator = async (generator: any) => {
    try {
      const dataTableService = GsbDataTableService.getInstance();
      await dataTableService.delete("GsbCodeGenerator", generator.id);
      toast({
        title: "Success",
        description: "Code generator deleted successfully.",
      });
      loadCodeGenerators();
    } catch (error) {
      console.error("Error deleting code generator:", error);
      toast({
        title: "Error",
        description: "Failed to delete code generator. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCode = async (generator: any) => {
    try {
      // Implement code generation logic
      toast({
        title: "Success",
        description: "Code generation started.",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Code Generator</h1>
        <p className="text-muted-foreground">
          Generate and manage system code templates
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Generator Statistics
          </CardTitle>
          <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{codeGenerators.length}</span>
              <span className="text-xs text-muted-foreground">
                Total Generators
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(codeGenerators.map(gen => gen.type)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Generator Types
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(codeGenerators.map(gen => gen.module?.name)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Modules
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Generator Management
          </CardTitle>
          <Button onClick={handleCreateGenerator}>
            <FiPlus className="mr-2 h-4 w-4" />
            New Generator
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Module</label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Modules</SelectItem>
                    {Array.from(new Set(codeGenerators.map(gen => gen.module?.name))).map(moduleName => (
                      <SelectItem key={moduleName} value={moduleName}>
                        {moduleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {Array.from(new Set(codeGenerators.map(gen => gen.type))).map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <GsbDataTable
            entityDefName="GsbCodeGenerator"
            data={codeGenerators}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onDataChange={setCodeGenerators}
            view={{
              queryParams: {
                entityDefName: "GsbCodeGenerator",
                startIndex: (currentPage - 1) * pageSize,
                count: pageSize,
                search: searchQuery,
                sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
                query: [
                  ...(selectedModule ? [{
                    name: "module_id",
                    isEqual: selectedModule,
                  }] : []),
                  ...(selectedType ? [{
                    name: "type",
                    isEqual: selectedType,
                  }] : []),
                ],
              },
            }}
            onViewChange={() => {}}
            onSortChange={() => {}}
            onFilterChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
} 