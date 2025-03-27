"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiFolder,
  FiUpload,
  FiFile,
  FiImage,
  FiFileText,
  FiSearch,
  FiMoreHorizontal,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiLock,
  FiArrowLeft,
  FiVideo,
  FiMusic,
  FiCode,
  FiArchive,
  FiLoader,
  FiInfo,
  FiAlertTriangle,
  FiFolderPlus
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from '@/components/gsb';

import { GsbFile, ListingType } from "@/lib/gsb/models/gsb-file.model";
import { FileUiService } from "@/lib/services/ui/file-ui.service";

// Map of icon name to icon component
const IconMap = {
  'folder': FiFolder,
  'file': FiFile,
  'image': FiImage,
  'file-text': FiFileText,
  'video': FiVideo,
  'music': FiMusic,
  'code': FiCode,
  'archive': FiArchive
};

export default function StoragePage() {
  // Services
  const fileUiService = useRef(new FileUiService());
  const { toast } = useToast();
  
  // States
  const [files, setFiles] = useState<GsbFile[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [currentFolder, setCurrentFolder] = useState<GsbFile | null>(null);
  const [folderPath, setFolderPath] = useState<GsbFile[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  
  // Upload states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressDetails, setUploadProgressDetails] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isFolderUpload, setIsFolderUpload] = useState(false);
  
  // Delete confirmation states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<GsbFile | null>(null);
  const [deleteItemCount, setDeleteItemCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New folder states
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  
  // Storage statistics
  const [storageStats, setStorageStats] = useState({
    totalSize: 0,
    totalFiles: 0,
    totalFolders: 0,
    isLoading: true
  });
  
  // Total storage limit (10 GB in bytes)
  const totalStorageLimit = 10 * 1024 * 1024 * 1024; 
  
  // Load storage statistics
  const loadStorageStats = useCallback(async () => {
    try {
      setStorageStats(prev => ({ ...prev, isLoading: true }));
      const stats = await fileUiService.current.getStorageStatistics();
      
      if (stats.error) {
        throw new Error(stats.error);
      }
      
      setStorageStats({
        totalSize: stats.totalSize,
        totalFiles: stats.totalFiles,
        totalFolders: stats.totalFolders,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading storage statistics:', error);
      
      // If server query fails, use the current files as fallback to estimate storage
      if (files.length > 0) {
        const estimatedSize = fileUiService.current.calculateStorageUsed(files);
        setStorageStats(prev => ({
          ...prev,
          totalSize: estimatedSize,
          isLoading: false
        }));
        
        toast({
          title: "Warning",
          description: "Could not retrieve accurate storage statistics. Displaying estimates based on current view.",
          variant: "destructive"
        });
      } else {
        setStorageStats(prev => ({ ...prev, isLoading: false }));
        
        toast({
          title: "Warning",
          description: "Storage statistics unavailable.",
          variant: "destructive"
        });
      }
    }
  }, [files, toast]);
  
  // Load files from the current folder
  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use FileUiService to get files and associated data
      const result = await fileUiService.current.getFiles(
        currentFolderId,
        page,
        pageSize
      );
      
      setFiles(result.files);
      setTotalFiles(result.totalCount);
      setCurrentFolder(result.currentFolder);
      
      // If we have a current folder, load the complete path
      if (result.currentFolder) {
        const completePath = await fileUiService.current.buildCompleteFolderPath(result.currentFolder);
        setFolderPath(completePath);
      } else {
        setFolderPath([]);
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, page, pageSize, toast]);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPage(1); // Reset to first page when changing page size
    setPageSize(newPageSize);
  }, []);
  
  // Navigate to a folder
  const navigateToFolder = (folderId: string | undefined) => {
    if (!folderId) return;
    setCurrentFolderId(folderId);
    setPage(1);
  };
  
  // Navigate up to parent folder
  const navigateUp = () => {
    if (currentFolder?.parent_id) {
      navigateToFolder(currentFolder.parent_id);
    } else {
      // Navigate to root
      setCurrentFolderId(undefined);
    }
    setPage(1);
  };
  
  // After file operations (upload, delete, create folder), update both files and statistics
  const refreshStorageData = useCallback(async () => {
    // Run both requests in parallel
    await Promise.all([
      loadFiles(),
      loadStorageStats()
    ]);
  }, [loadFiles, loadStorageStats]);
  
  // Load folder contents count for delete confirmation
  const loadFolderContentsCount = useCallback(async (folderId: string) => {
    if (!folderId) return 0;
    return await fileUiService.current.getFolderContentsCount(folderId);
  }, []);
  
  // Open delete confirmation dialog
  const confirmDelete = useCallback(async (file: GsbFile) => {
    setFileToDelete(file);
    
    // If it's a folder, get the contents count
    if (file.listingType === ListingType.Folder && file.id) {
      const count = await loadFolderContentsCount(file.id);
      setDeleteItemCount(count);
    } else {
      setDeleteItemCount(0);
    }
    
    setIsDeleteConfirmOpen(true);
  }, [loadFolderContentsCount]);
  
  // Handle file deletion with confirmation
  const handleDeleteFile = async () => {
    if (!fileToDelete?.id) return;
    
    setIsDeleting(true);
    
    try {
      const success = await fileUiService.current.deleteFile(fileToDelete.id);
      
      if (success) {
        // Refresh all data after deletion
        await refreshStorageData();
        
        toast({
          title: "File Deleted",
          description: `Successfully deleted "${fileToDelete.name}"`,
        });
        
        // Close dialog and reset state
        setIsDeleteConfirmOpen(false);
        setFileToDelete(null);
        setDeleteItemCount(0);
      } else {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle file download
  const handleDownloadFile = async (file: GsbFile) => {
    try {
      // Ensure we're passing the file ID, not the file object
      const success = await fileUiService.current.downloadFile(file.id || '');
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to download file. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle file uploads
  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // For regular file uploads
      if (!isFolderUpload) {
        await fileUiService.current.uploadFiles(
          uploadFiles,
          currentFolderId,
          (progress) => setUploadProgress(progress)
        );
        
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${uploadFiles.length} file(s)`,
        });
      } 
      // For folder uploads (when detected via HTML input webkitdirectory attribute)
      else {
        // Process folder structure by grouping files by paths
        const filesByPath = new Map<string, File[]>();
        
        for (let i = 0; i < uploadFiles.length; i++) {
          const file = uploadFiles[i];
          // Modern browsers provide a webkitRelativePath for folder uploads
          const path = (file as any).webkitRelativePath || '';
          
          if (path) {
            // Extract directory path (remove the file name)
            const dirPath = path.split('/').slice(0, -1).join('/');
            
            if (!filesByPath.has(dirPath)) {
              filesByPath.set(dirPath, []);
            }
            
            filesByPath.get(dirPath)!.push(file);
          }
        }
        
        if (filesByPath.size === 0) {
          throw new Error("No folder structure detected");
        }
        
        // Create folder structure
        let totalProcessed = 0;
        const totalFiles = uploadFiles.length;
        const folderCache = new Map<string, string | undefined>();
        
        // Root folder is the parent ID
        folderCache.set('', currentFolderId);
        
        // Process each directory path
        const paths = Array.from(filesByPath.keys()).sort();
        
        for (const path of paths) {
          const files = filesByPath.get(path)!;
          setUploadProgressDetails(`Creating folders: ${path || 'root'}`);
          
          if (path) {
            // Create directories recursively
            const parts = path.split('/');
            let currentPath = '';
            let parentId = currentFolderId;
            
            for (const part of parts) {
              const newPath = currentPath ? `${currentPath}/${part}` : part;
              
              if (!folderCache.has(newPath)) {
                // Create folder
                const folderId = await fileUiService.current.createFolder(part, parentId);
                folderCache.set(newPath, folderId || undefined);
                parentId = folderId || undefined;
              } else {
                parentId = folderCache.get(newPath);
              }
              
              currentPath = newPath;
            }
            
            // Upload files to this directory
            for (const file of files) {
              setUploadProgressDetails(`Uploading: ${file.name}`);
              await fileUiService.current.uploadFiles(new DataTransfer().files);
              
              totalProcessed++;
              const progress = Math.round((totalProcessed / totalFiles) * 100);
              setUploadProgress(progress);
            }
          } else {
            // Files in root directory
            for (const file of files) {
              setUploadProgressDetails(`Uploading: ${file.name}`);
              await fileUiService.current.uploadFiles(new DataTransfer().files);
              
              totalProcessed++;
              const progress = Math.round((totalProcessed / totalFiles) * 100);
              setUploadProgress(progress);
            }
          }
        }
        
        toast({
          title: "Folder Upload Successful",
          description: `Successfully uploaded ${uploadFiles.length} files in folder structure`,
        });
      }
      
      // Refresh all data after upload
      await refreshStorageData();
      
      // Close dialog and reset state
      setIsUploadDialogOpen(false);
      setUploadFiles(null);
      setIsFolderUpload(false);
      setUploadProgressDetails('');
    } catch (error) {
      console.error('Error uploading:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgressDetails('');
    }
  };
  
  // Handle input change for file/folder selection
  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setUploadFiles(files);
    
    // Determine if this is a folder upload with null safety
    setIsFolderUpload(
      !!e.target.webkitdirectory || 
      !!(files && files.length > 0 && files[0].webkitRelativePath !== '')
    );
  };
  
  // Create new folder
  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsCreatingFolder(true);
    
    try {
      const folderId = await fileUiService.current.createFolder(newFolderName, currentFolderId);
      
      if (folderId) {
        // Refresh all data after creating folder
        await refreshStorageData();
        
        toast({
          title: "Folder Created",
          description: `Successfully created folder "${newFolderName}"`
        });
        
        // Close dialog and reset state
        setIsNewFolderDialogOpen(false);
        setNewFolderName("");
      } else {
        throw new Error("Failed to create folder");
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };
  
  // Render icon based on file type
  const renderFileIcon = (file: GsbFile) => {
    const iconType = fileUiService.current.getFileIconType(file);
    const IconComponent = IconMap[iconType as keyof typeof IconMap];
    return IconComponent ? <IconComponent className="h-12 w-12" /> : <FiFile className="h-12 w-12" />;
  };
  
  // Filter files based on search query
  const filteredFiles = searchQuery
    ? files.filter(file => 
        file.name && file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;
  
  // Add this function to handle file size safely
  const formatFileSizeWithDefault = (size?: number) => {
    return fileUiService.current.formatFileSize(size || 0);
  };
  
  // Initial load and on dependency changes
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  
  // Load storage stats on component mount
  useEffect(() => {
    loadStorageStats();
  }, [loadStorageStats]);

  // Pagination Section
  const paginationSection = (
    <div className="mt-4">
      <Pagination
        totalItems={totalFiles}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        showTotalItems={true}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Storage</h1>
        <p className="text-muted-foreground">
          Manage your files and folders in the cloud storage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Storage Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <FiUpload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
                <Button
                  className="w-full justify-start" 
                  onClick={() => setIsNewFolderDialogOpen(true)}
                >
                  <FiFolder className="mr-2 h-4 w-4" />
                  Create Folder
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Total Storage</span>
                  <span className="text-sm text-muted-foreground">
                    {storageStats.isLoading ? 
                      <span className="flex items-center"><FiLoader className="animate-spin mr-1" /> Calculating...</span> : 
                      `${formatFileSizeWithDefault(storageStats.totalSize)} / ${formatFileSizeWithDefault(totalStorageLimit)}`
                    }
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, (storageStats.totalSize / totalStorageLimit) * 100)} 
                  className="h-2" 
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Files</span>
                  <span className="text-sm text-muted-foreground">
                    {storageStats.isLoading ? <FiLoader className="animate-spin" /> : storageStats.totalFiles}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Folders</span>
                  <span className="text-sm text-muted-foreground">
                    {storageStats.isLoading ? <FiLoader className="animate-spin" /> : storageStats.totalFolders}
                  </span>
                </div>
                {!storageStats.isLoading && (storageStats.totalFiles === 0 && storageStats.totalFolders === 0) && (
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <FiInfo className="mr-1" /> No files or folders yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    {currentFolder && (
                      <Button variant="ghost" size="icon" onClick={navigateUp}>
                        <FiArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <CardTitle className="text-xl">
                      {currentFolder ? currentFolder.name : 'Root Files'}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {totalFiles} item{totalFiles !== 1 ? 's' : ''} in this location
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search files..."
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Folder path breadcrumbs */}
              {folderPath.length > 0 && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-2 overflow-x-auto">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto whitespace-nowrap" 
                    onClick={() => setCurrentFolderId(undefined)}
                  >
                    Root
                  </Button>
                  {folderPath.map((folder, index) => (
                    <div key={folder.id || `folder-${index}`} className="flex items-center">
                      <span>/</span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto whitespace-nowrap"
                        onClick={() => folder.id && index < folderPath.length - 1 ? 
                          navigateToFolder(folder.id) : null}
                      >
                        {folder.name || 'Unknown Folder'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <FiLoader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id || `file-${file.name}`} className="overflow-hidden">
                      <div 
                        className="aspect-square bg-muted p-4 flex items-center justify-center cursor-pointer"
                        onClick={() => file.listingType === ListingType.Folder && file.id ? 
                          navigateToFolder(file.id) : null}
                      >
                        {renderFileIcon(file)}
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <h3 className="truncate text-sm font-medium">{file.name || 'Unnamed'}</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSizeWithDefault(file.size)}
                            </p>
                          </div>
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
                              {file.listingType === ListingType.File && file.publicUrl && (
                                <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                                  <FiDownload className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => confirmDelete(file)}
                              >
                                <FiTrash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-4">
                  <FiFile className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No files found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `No files matching "${searchQuery}"`
                      : "Upload files to get started"}
                  </p>
                </div>
              )}
              
              {paginationSection}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files or Folders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="files">Select Files</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={(e) => {
                  setUploadFiles(e.target.files);
                  setIsFolderUpload(false);
                }}
                disabled={isUploading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folders">Or Select a Folder</Label>
              <input
                id="folders"
                type="file"
                // Using HTML attribute for folder selection
                // This won't be recognized by TypeScript but works in modern browsers
                {...{ webkitdirectory: true } as any}
                multiple
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => {
                  setUploadFiles(e.target.files);
                  setIsFolderUpload(true);
                }}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Folder upload supported in Chrome, Edge, and other modern browsers.
              </p>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadProgressDetails || 'Uploading...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFiles || isUploading}>
              {isUploading ? 'Uploading...' : isFolderUpload ? 'Upload Folder' : 'Upload Files'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fileToDelete?.listingType === ListingType.Folder ? (
              <div>
                <p>Are you sure you want to delete the folder "{fileToDelete.name}"?</p>
                {deleteItemCount > 0 && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="font-semibold text-red-700 dark:text-red-400">Warning</p>
                    <p className="text-sm">
                      This folder contains {deleteItemCount} item{deleteItemCount !== 1 ? 's' : ''}. 
                      All contents will be permanently deleted.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>Are you sure you want to delete "{fileToDelete?.name}"?</p>
            )}
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile} disabled={isDeleting}>
              {isDeleting ? <FiLoader className="animate-spin mr-2" /> : <FiTrash2 className="mr-2" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                disabled={isCreatingFolder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)} disabled={isCreatingFolder}>
              Cancel
            </Button>
            <Button onClick={createFolder} disabled={!newFolderName.trim() || isCreatingFolder}>
              {isCreatingFolder ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
