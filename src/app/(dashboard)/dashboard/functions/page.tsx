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
        // Update existing function with all properties
        const updated = {
          ...currentFunction,
          name: functionName,
          title: functionName,
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
        // Create new function with all properties
        let newFunc = currentFunction;
        
        if (!newFunc) {
          newFunc = functionUiService.createEmptyFunction(functionName);
        }
        
        // Update the name in case it was changed
        newFunc.name = functionName;
        newFunc.title = functionName;
        
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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadFunctions();
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    loadFunctions();
  };

  // Loading skeleton component
  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-5 w-[70px]" /></TableCell>
        <TableCell><Skeleton className="h-5 w-[70px]" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[60px]" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[60px]" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[60px]" /></TableCell>
        <TableCell align="right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
      </TableRow>
    ));
  };

  // Get runtime badge colors
  const getRuntimeBadge = (runtime: string) => {
    switch (runtime) {
      case "node.js":
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Node.js</Badge>;
      case "python":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Python</Badge>;
      default:
        return <Badge variant="outline">{runtime}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Serverless Functions</h1>
        <p className="text-muted-foreground">
          Deploy and manage your serverless cloud functions.
        </p>
      </div>

      <Tabs defaultValue="functions" className="space-y-4" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <form className="relative flex-1" onSubmit={handleSearch}>
              <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search functions..."
                className="pl-8 sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  className="absolute right-0 top-0 h-9 w-9 p-0"
                  onClick={handleClearSearch}
                >
                  <FiX className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </form>
            <Button onClick={handleNewFunction}>
              <FiPlus className="mr-2 h-4 w-4" />
              New Function
            </Button>
          </div>
        </div>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Function Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={loadFunctions}>
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
              <CardDescription>
                Deploy, configure, and monitor your serverless functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Created By</TableHead>
                    <TableHead className="hidden md:table-cell">Created Date</TableHead>
                    <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    renderSkeletonRows()
                  ) : functions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FiCode className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchQuery ? "No matching functions found" : "No functions available"}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleNewFunction} 
                            className="mt-2"
                          >
                            <FiPlus className="mr-2 h-4 w-4" />
                            Create Your First Function
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    functions.map((func) => (
                      <TableRow key={func.id}>
                        <TableCell>
                          <div className="font-medium">{func.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {func.id}
                            {func.operationsObj && func.operationsObj.length > 0 && (
                              <span className="ml-2">
                                ({func.operationsObj.length} operations)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-green-500"
                          >
                            active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {func.standalone ? "Standalone" : "Module"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {func.createdBy?.name || "System"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {func.createDate ? new Date(func.createDate).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {func.lastUpdateDate ? new Date(func.lastUpdateDate).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
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
                              <DropdownMenuItem onClick={() => handleOpenExecuteDialog(func.id)}>
                                <FiPlay className="mr-2 h-4 w-4" />
                                Run Now
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditFunction(func.id)}>
                                <FiEdit2 className="mr-2 h-4 w-4" />
                                Edit Code
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FiServer className="mr-2 h-4 w-4" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConfirmDelete(func.id)}>
                                <FiTrash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {!isLoading && functions.length > 0 && (
              <CardFooter className="flex items-center justify-between p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {functions.length} of {totalCount} functions
                </div>
              </CardFooter>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Function Metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Functions
                  </div>
                  <div className="text-2xl font-bold">
                    {totalCount}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Executions (Last 24h)
                  </div>
                  <div className="text-2xl font-bold">
                    4,218
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg. Execution Time
                  </div>
                  <div className="text-2xl font-bold">
                    245 ms
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Runtime Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Node.js</span>
                    </div>
                    <span className="text-sm font-medium">
                      {functions.filter(f => f.module?.name === "node.js").length || 0} functions
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Python</span>
                    </div>
                    <span className="text-sm font-medium">
                      {functions.filter(f => f.module?.name === "python").length || 0} functions
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="justify-start" onClick={handleNewFunction}>
                    <FiPlus className="mr-2 h-4 w-4" />
                    Create Function
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiDownload className="mr-2 h-4 w-4" />
                    Download Templates
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiClock className="mr-2 h-4 w-4" />
                    Schedule Function
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiCpu className="mr-2 h-4 w-4" />
                    Resource Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Function Execution Logs</CardTitle>
              <CardDescription>
                View execution logs and debugging information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4 text-center text-muted-foreground">
                <FiClock className="mx-auto h-8 w-8 mb-2" />
                <p>Function logs will appear here when available.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Function Settings</CardTitle>
              <CardDescription>
                Configure global settings for serverless functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-timeout">Default Timeout (seconds)</Label>
                  <Input id="default-timeout" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-memory">Default Memory (MB)</Label>
                  <Input id="default-memory" type="number" defaultValue="128" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Function Edit/Create Dialog */}
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

      {/* Test Function Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
