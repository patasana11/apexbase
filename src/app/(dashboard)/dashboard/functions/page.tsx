"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiCode,
  FiPlus,
  FiPlay,
  FiPause,
  FiClock,
  FiCpu,
  FiSearch,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiServer,
  FiRefreshCw,
  FiFilter,
  FiSettings,
  FiSave,
  FiX,
  FiArrowLeft
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Editor } from '@monaco-editor/react';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, Column } from '@/components/gsb';
import { formatDate } from '@/lib/utils';
import { FunctionUiService } from "@/lib/services/ui/function-ui.service";
import { GsbWfFunction } from "@/lib/gsb/models/gsb-function.model";
import { FunctionEditor } from '@/components/function/function-editor';

export default function FunctionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const functionUiService = FunctionUiService.getInstance();
  
  // State for functions list
  const [isLoading, setIsLoading] = useState(true);
  const [functions, setFunctions] = useState<GsbWfFunction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("functions");
  
  // State for function edit/create
  const [showFunctionDialog, setShowFunctionDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFunction, setCurrentFunction] = useState<GsbWfFunction | null>(null);
  const [functionName, setFunctionName] = useState("");
  const [functionCode, setFunctionCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // State for function execution
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testData, setTestData] = useState("{}");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  
  // State for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [functionToDelete, setFunctionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load functions when page or search changes
  useEffect(() => {
    loadFunctions();
  }, [currentPage, searchQuery]);

  // Load functions from API
  const loadFunctions = async () => {
    setIsLoading(true);
    try {
      let result;
      if (searchQuery.trim()) {
        result = await functionUiService.searchFunctions(searchQuery, currentPage, pageSize);
      } else {
        result = await functionUiService.getFunctions(currentPage, pageSize);
      }
      
      setFunctions(result.functions);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error loading functions:", error);
      toast({
        title: "Error",
        description: "Failed to load functions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open function create dialog
  const handleNewFunction = () => {
    setIsEditing(false);
    setCurrentFunction(null);
    setFunctionName("");
    setFunctionCode(functionUiService.getDefaultFunctionCode());
    setShowFunctionDialog(true);
  };

  // Open function edit dialog
  const handleEditFunction = async (id: string) => {
    setIsLoading(true);
    try {
      const func = await functionUiService.getFunction(id);
      if (func) {
        setCurrentFunction(func);
        setFunctionName(func.name || "");
        setFunctionCode(func.code || functionUiService.getDefaultFunctionCode());
        setIsEditing(true);
        setShowFunctionDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Function not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading function:", error);
      toast({
        title: "Error",
        description: "Failed to load function. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save function
  const handleSaveFunction = async () => {
    if (!functionName.trim()) {
      toast({
        title: "Error",
        description: "Function name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && currentFunction) {
        // Update existing function
        const updated = {
          ...currentFunction,
          name: functionName,
          title: functionName,
          code: functionCode,
        };
        
        const success = await functionUiService.updateFunction(updated);
        if (success) {
          toast({
            title: "Success",
            description: "Function updated successfully",
          });
          setShowFunctionDialog(false);
          loadFunctions();
        } else {
          throw new Error("Failed to update function");
        }
      } else {
        // Create new function
        const newFunc = functionUiService.createEmptyFunction(functionName);
        newFunc.code = functionCode;
        
        const id = await functionUiService.createFunction(newFunc);
        if (id) {
          toast({
            title: "Success",
            description: "Function created successfully",
          });
          setShowFunctionDialog(false);
          loadFunctions();
        } else {
          throw new Error("Failed to create function");
        }
      }
    } catch (error) {
      console.error("Error saving function:", error);
      toast({
        title: "Error",
        description: "Failed to save function. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open delete confirmation dialog
  const handleConfirmDelete = (id: string) => {
    setFunctionToDelete(id);
    setShowDeleteDialog(true);
  };

  // Delete function
  const handleDeleteFunction = async () => {
    if (!functionToDelete) return;

    setIsDeleting(true);
    try {
      const success = await functionUiService.deleteFunction(functionToDelete);
      if (success) {
        toast({
          title: "Success",
          description: "Function deleted successfully",
        });
        setShowDeleteDialog(false);
        loadFunctions();
      } else {
        throw new Error("Failed to delete function");
      }
    } catch (error) {
      console.error("Error deleting function:", error);
      toast({
        title: "Error",
        description: "Failed to delete function. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setFunctionToDelete(null);
    }
  };

  // Open execute function dialog
  const handleOpenExecuteDialog = async (id: string) => {
    setIsLoading(true);
    try {
      const func = await functionUiService.getFunction(id);
      if (func) {
        setCurrentFunction(func);
        setTestData("{}");
        setExecutionResult(null);
        setShowTestDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Function not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading function:", error);
      toast({
        title: "Error",
        description: "Failed to load function. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute function
  const handleExecuteFunction = async () => {
    if (!currentFunction?.id) return;

    setIsExecuting(true);
    try {
      let params;
      try {
        params = JSON.parse(testData);
      } catch (e) {
        toast({
          title: "Error",
          description: "Invalid JSON data",
          variant: "destructive",
        });
        return;
      }

      const result = await functionUiService.executeFunction(currentFunction.id, params);
      setExecutionResult(result);
      toast({
        title: "Success",
        description: "Function executed successfully",
      });
    } catch (error) {
      console.error("Error executing function:", error);
      toast({
        title: "Error",
        description: "Failed to execute function. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Replace the handleSearch function with a more direct one
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Add handler for page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };
  
  // Add new function for exporting functions
  const handleExport = async () => {
    try {
      toast({
        title: "Info",
        description: "Export functionality will be implemented soon.",
      });
    } catch (error) {
      console.error("Error exporting functions:", error);
      toast({
        title: "Error",
        description: "Failed to export functions. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Add new function for opening filter options
  const handleFilter = () => {
    // Implement filter dialog or options
    toast({
      title: "Info",
      description: "Filter functionality will be implemented soon.",
    });
  };
  
  // Define columns for the functions data table
  const columns: Column<GsbWfFunction>[] = [
    {
      key: "name",
      header: "Function Name",
      cell: (func) => (
        <div className="font-medium">
          {func.name}
        </div>
      ),
    },
    {
      key: "runtime",
      header: "Runtime",
      cell: (func) => getRuntimeBadge(func.module?.name || "node"),
      className: "hidden md:table-cell",
    },
    {
      key: "status",
      header: "Status",
      cell: (func) => (
        <Badge 
          variant={func.standalone !== false ? "default" : "secondary"}
        >
          {func.standalone !== false ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "lastUpdate",
      header: "Last Updated",
      cell: (func) => formatDate(func.lastUpdateDate),
      className: "hidden md:table-cell",
    },
    {
      key: "actions",
      header: "",
      cell: (func) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <FiMoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleOpenExecuteDialog(func.id || "")}
              >
                <FiPlay className="mr-2 h-4 w-4" />
                Execute
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEditFunction(func.id || "")}
              >
                <FiEdit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  toast({ title: "Cloning function", description: "This functionality will be implemented soon." });
                }}
              >
                <FiCopy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={() => handleConfirmDelete(func.id || "")}
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Get runtime badge colors
  const getRuntimeBadge = (runtime: string) => {
    switch (runtime) {
      case "node.js":
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Node.js</Badge>;
      case "python":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Python</Badge>;
      default:
        return <Badge variant="outline">{runtime || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Functions</h1>
        <p className="text-muted-foreground">
          Create, manage, and execute serverless functions.
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          </TabsList>
          <Button onClick={handleNewFunction}>
            <FiPlus className="mr-2 h-4 w-4" />
            New Function
          </Button>
        </div>

        <TabsContent value="functions" className="space-y-4">
          <DataTable
            data={functions}
            columns={columns}
            totalItems={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onExport={handleExport}
            onFilter={handleFilter}
            isLoading={isLoading}
            searchPlaceholder="Search functions..."
          />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Function Execution Logs</CardTitle>
              <CardDescription>
                View logs from your function executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center py-8">
                Function logs will be implemented soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Function Dialog - Keep unchanged */}
      <Dialog open={showFunctionDialog} onOpenChange={setShowFunctionDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Function" : "Create Function"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Edit your existing function code and settings."
                : "Create a new serverless function with your custom code or operations flow."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="functionName">Function Name</Label>
              <Input
                id="functionName"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="Enter function name"
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="code">Function Implementation</Label>
              <FunctionEditor 
                function={currentFunction || functionUiService.createEmptyFunction(functionName)}
                onChange={(updatedFunc) => {
                  setCurrentFunction(updatedFunc);
                  setFunctionCode(updatedFunc.code || '');
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFunctionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFunction} disabled={isSaving}>
              {isSaving ? (
                <>
                  <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Function
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Dialog - Keep unchanged */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Test Function: {currentFunction?.name}</DialogTitle>
            <DialogDescription>
              Enter test data in JSON format to execute the function.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="testData">Input Data (JSON)</Label>
              <div className="h-[200px] border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={testData}
                  onChange={(value) => setTestData(value || "{}")}
                  options={{
                    ...functionUiService.getMonacoEditorOptions(),
                    minimap: { enabled: false },
                  }}
                />
              </div>
            </div>

            {executionResult && (
              <div className="space-y-2">
                <Label>Execution Result</Label>
                <div className="h-[200px] border rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={JSON.stringify(executionResult, null, 2)}
                    options={{
                      ...functionUiService.getMonacoEditorOptions(),
                      readOnly: true,
                      minimap: { enabled: false },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Close
            </Button>
            <Button onClick={handleExecuteFunction} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <FiPlay className="mr-2 h-4 w-4" />
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog - Keep unchanged */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Function</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this function? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFunction} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
