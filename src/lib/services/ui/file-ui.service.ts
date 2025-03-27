'use client';

import { FileService } from '@/lib/gsb/services/file/file.service';
import { GsbFile, FileType, ListingType, ChunkInfo } from '@/lib/gsb/models/gsb-file.model';
import { GsbEntityService } from '@/lib/gsb/services/entity/gsb-entity.service';
import { QueryParams } from '@/lib/gsb/types/query-params';
import { QueryFunction, AggregateFunction, SingleQuery, SelectCol } from '@/lib/gsb/types/query';
import { getGsbToken, getGsbTenantCode } from '@/lib/gsb/config/gsb-config';
import React from 'react';
import type { ReactNode } from 'react';
import {
  FiFolder,
  FiFile,
  FiImage,
  FiFileText,
  FiVideo,
  FiMusic,
  FiCode,
  FiArchive
} from 'react-icons/fi';

/**
 * UI Service for file management operations
 * Handles UI-specific business logic related to files
 */
export class FileUiService {
  private fileService: FileService;
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbFile';

  constructor() {
    this.fileService = new FileService();
    this.entityService = new GsbEntityService();
  }

  /**
   * Get files in a folder with error handling
   * @param folderId The parent folder ID (null or undefined for root)
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns Promise with files, count, and any error message
   */
  async getFiles(
    folderId?: string,
    page: number = 1,
    pageSize: number = 24
  ): Promise<{
    files: GsbFile[];
    totalCount: number;
    currentFolder: GsbFile | null;
    folderPath: GsbFile[];
    error?: string;
  }> {
    try {
      // Get files in the folder
      const result = await this.fileService.getFiles(folderId, page, pageSize);
      
      // If we're in a subfolder, get current folder details
      let currentFolder: GsbFile | null = null;
      let folderPath: GsbFile[] = [];
      
      if (folderId) {
        currentFolder = await this.fileService.getFileById(folderId);
        if (currentFolder?.path) {
          folderPath = await this.buildFolderPath(currentFolder);
        }
      }
      
      return {
        files: result.files,
        totalCount: result.totalCount,
        currentFolder,
        folderPath
      };
    } catch (error) {
      console.error('Error getting files:', error);
      return {
        files: [],
        totalCount: 0,
        currentFolder: null,
        folderPath: [],
        error: 'Failed to load files. Please try again.'
      };
    }
  }

  /**
   * Get storage statistics - total size, count, etc.
   * @returns Promise with storage statistics
   */
  async getStorageStatistics(): Promise<{
    totalSize: number;
    totalFiles: number;
    totalFolders: number;
    error?: string;
  }> {
    try {
      // Create query for files statistics
      const fileStatsQuery = new QueryParams<GsbFile>(this.ENTITY_NAME);
      
      // Create file query using proper SingleQuery syntax
      const fileQuery = new SingleQuery('listingType', ListingType.File, QueryFunction.Equals);
      fileStatsQuery.query = [fileQuery];
      
      // Set up size sum and file count
      const sizeCol = new SelectCol('size');
      sizeCol.aggregateFunction = AggregateFunction.Sum;
      sizeCol.selectAsTitle = 'totalSize';
      
      const fileCountCol = new SelectCol('id');
      fileCountCol.aggregateFunction = AggregateFunction.Count;
      fileCountCol.selectAsTitle = 'totalFileCount';
      
      fileStatsQuery.selectCols = [sizeCol, fileCountCol];
      
      // Create query for folder count
      const folderCountQuery = new QueryParams<GsbFile>(this.ENTITY_NAME);
      
      // Create folder query using proper SingleQuery syntax
      const folderQuery = new SingleQuery('listingType', ListingType.Folder, QueryFunction.Equals);
      folderCountQuery.query = [folderQuery];
      
      // Set up folder count
      const folderCountCol = new SelectCol('id');
      folderCountCol.aggregateFunction = AggregateFunction.Count;
      folderCountCol.selectAsTitle = 'totalFolderCount';
      
      folderCountQuery.selectCols = [folderCountCol];
      
      // Execute both queries
      const [filesResponse, foldersResponse] = await Promise.all([
        this.entityService.query(fileStatsQuery, getGsbToken(), getGsbTenantCode()),
        this.entityService.query(folderCountQuery, getGsbToken(), getGsbTenantCode())
      ]);
      
      // Extract values from the response - the first entity should contain our aggregates
      let totalSize = 0;
      let totalFiles = 0;
      let totalFolders = 0;
      
      if (filesResponse.entities && filesResponse.entities.length > 0) {
        // The aggregate results are in the first entity with the specified titles
        const fileStats = filesResponse.entities[0] as any;
        totalSize = fileStats.totalSize || 0;
        totalFiles = fileStats.totalFileCount || 0;
      }
      
      if (foldersResponse.entities && foldersResponse.entities.length > 0) {
        const folderStats = foldersResponse.entities[0] as any;
        totalFolders = folderStats.totalFolderCount || 0;
      }
      
      return {
        totalSize,
        totalFiles,
        totalFolders
      };
    } catch (error) {
      console.error('Error getting storage statistics:', error);
      return {
        totalSize: 0,
        totalFiles: 0,
        totalFolders: 0,
        error: 'Failed to retrieve storage statistics'
      };
    }
  }
  
  /**
   * Build folder path from a file's path
   * @param file The file or folder to build path for
   * @returns Array of folder objects representing the path
   */
  async buildFolderPath(file: GsbFile): Promise<GsbFile[]> {
    if (!file.path) return [];
    
    const pathParts = file.path.split('/').filter(Boolean);
    const pathFolders: GsbFile[] = [];
    
    // Skip loading path if it's just the root
    if (pathParts.length === 0) {
      return [];
    }
    
    // For now, we'll just include the current folder in the path
    // In a real implementation, you'd load each folder in the path
    pathFolders.push(file);
    
    return pathFolders;
  }
  
  /**
   * Format file size for display
   * @param sizeInBytes File size in bytes
   * @returns Formatted string (e.g. "2.5 MB")
   */
  formatFileSize(sizeInBytes: number | undefined): string {
    if (sizeInBytes === undefined) return "Unknown";
    
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;
    
    if (sizeInBytes < KB) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < MB) {
      return `${(sizeInBytes / KB).toFixed(1)} KB`;
    } else if (sizeInBytes < GB) {
      return `${(sizeInBytes / MB).toFixed(1)} MB`;
    } else {
      return `${(sizeInBytes / GB).toFixed(1)} GB`;
    }
  }
  
  /**
   * Calculate total storage used by files
   * This is a fallback method when the server query fails
   * @param files Array of files
   * @returns Total size in bytes
   */
  calculateStorageUsed(files: GsbFile[]): number {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  }
  
  /**
   * Get appropriate icon type string based on file type
   * @param file The file object
   * @returns String identifier for the file type icon
   */
  getFileIconType(file: GsbFile): {
    name: string; 
    color: string;
  } {
    // Handle folder case first
    if (file.listingType === ListingType.Folder) {
      return { name: 'folder', color: 'text-blue-500' };
    }
    
    // Safe access to contentType and extension
    const contentType = file.contentType ? file.contentType.toLowerCase() : '';
    const fileName = file.name || '';
    const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : '';
    
    // Match by content type first, then by extension
    if (contentType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return { name: 'image', color: 'text-green-500' };
    } 
    
    if (contentType.startsWith("video/") || ["mp4", "mov", "avi", "webm", "mkv"].includes(extension)) {
      return { name: 'video', color: 'text-purple-500' };
    } 
    
    if (contentType.startsWith("audio/") || ["mp3", "wav", "ogg", "flac"].includes(extension)) {
      return { name: 'music', color: 'text-pink-500' };
    } 
    
    if (contentType.includes("pdf") || extension === "pdf") {
      return { name: 'file-text', color: 'text-red-500' };
    } 
    
    if (["doc", "docx", "txt", "rtf", "odt"].includes(extension)) {
      return { name: 'file-text', color: 'text-blue-400' };
    } 
    
    if (["xls", "xlsx", "csv"].includes(extension)) {
      return { name: 'file-text', color: 'text-green-400' };
    } 
    
    if (["ppt", "pptx"].includes(extension)) {
      return { name: 'file-text', color: 'text-orange-500' };
    } 
    
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return { name: 'archive', color: 'text-yellow-500' };
    } 
    
    if (["js", "ts", "html", "css", "json", "php", "py", "java", "c", "cpp", "cs", "go", "rb"].includes(extension)) {
      return { name: 'code', color: 'text-gray-500' };
    }
    
    // Default file icon
    return { name: 'file', color: 'text-gray-500' };
  }
  
  /**
   * Upload a single file
   * @param file The file to upload
   * @param parentId Parent folder ID
   * @returns Uploaded file ID or null
   */
  async uploadFile(file: File, parentId?: string): Promise<string | null> {
    try {
      return await this.fileService.uploadFile(file, file.name, parentId);
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }
  
  /**
   * Upload multiple files with progress tracking
   * @param files The files to upload
   * @param parentId Parent folder ID
   * @param progressCallback Callback for progress updates (0-100)
   * @returns Array of successful upload IDs
   */
  async uploadFiles(
    files: FileList, 
    parentId?: string,
    progressCallback?: (progress: number) => void
  ): Promise<string[]> {
    const uploadedIds: string[] = [];
    const totalFiles = files.length;
    
    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileId = await this.fileService.uploadFile(file, file.name, parentId);
        
        if (fileId) {
          uploadedIds.push(fileId);
        }
        
        // Update progress
        if (progressCallback) {
          const progress = Math.round(((i + 1) / totalFiles) * 100);
          progressCallback(progress);
        }
      }
      
      return uploadedIds;
    } catch (error) {
      console.error('Error uploading files:', error);
      return uploadedIds; // Return any successfully uploaded files
    }
  }
  
  /**
   * Create a new folder
   * @param name Folder name
   * @param parentId Parent folder ID
   * @returns New folder ID or null
   */
  async createFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      return await this.fileService.createFolder(name, parentId);
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }
  
  /**
   * Delete a file or folder
   * @param id File or folder ID
   * @returns Whether deletion was successful
   */
  async deleteFile(id: string): Promise<boolean> {
    try {
      return await this.fileService.deleteFile(id);
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
  
  /**
   * Download a file using its public URL
   * @param file The file to download
   * @returns Whether download was initiated successfully
   */
  downloadFile(file: GsbFile): boolean {
    if (!file.id || !file.publicUrl) {
      return false;
    }
    
    try {
      // Create a temporary anchor element for download
      const a = document.createElement('a');
      a.href = file.publicUrl;
      a.download = file.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      return false;
    }
  }

  /**
   * Build complete folder path from a file's path
   * @param file The file or folder to build path for
   * @returns Promise with array of folder objects representing the path
   */
  async buildCompleteFolderPath(file: GsbFile): Promise<GsbFile[]> {
    if (!file.path) return [];
    
    const pathParts = file.path.split('/').filter(Boolean);
    if (pathParts.length === 0) return [];
    
    try {
      // Query all folders that are part of this path
      const queryParams = new QueryParams<GsbFile>(this.ENTITY_NAME);
      queryParams.query = pathParts.map(folderName => 
        new SingleQuery('name', folderName, QueryFunction.Equals)
      );
      queryParams.where('listingType', ListingType.Folder);
      
      const result = await this.entityService.query(
        queryParams, 
        getGsbToken(), 
        getGsbTenantCode()
      );
      
      // Map folder names to their respective folder objects
      const folderMap = new Map<string, GsbFile>();
      result.entities?.forEach(folder => {
        if (folder.name) {
          folderMap.set(folder.name, folder);
        }
      });
      
      // Create path array
      const pathFolders: GsbFile[] = [];
      
      // If we didn't get all folders in the path, at least include the current folder
      if (folderMap.size < pathParts.length) {
        pathFolders.push(file);
        return pathFolders;
      }
      
      // Build the path in order
      for (const part of pathParts) {
        const folder = folderMap.get(part);
        if (folder) {
          pathFolders.push(folder);
        }
      }
      
      return pathFolders;
    } catch (error) {
      console.error('Error building folder path:', error);
      // Fallback to just including the current folder
      return [file];
    }
  }
  
  /**
   * Upload a folder structure with files
   * @param folderEntry The root folder entry from DataTransferItemList
   * @param parentId Parent folder ID
   * @param progressCallback Callback for progress updates (0-100)
   * @returns Information about the upload results
   */
  async uploadFolderStructure(
    folderEntry: FileSystemDirectoryEntry,
    parentId?: string,
    progressCallback?: (progress: number, details?: string) => void
  ): Promise<{
    foldersCreated: number;
    filesUploaded: number;
    errors: string[];
  }> {
    const result = {
      foldersCreated: 0,
      filesUploaded: 0,
      errors: [] as string[]
    };
    
    const totalItems = { count: 0, processed: 0 };
    const folderCache = new Map<string, string>(); // path -> id
    
    if (parentId) {
      folderCache.set('', parentId); // Root folder is the parent
    }
    
    // First pass: count total items for progress reporting
    await this.countItemsInFolder(folderEntry, totalItems);
    
    // Update initial progress
    if (progressCallback) {
      progressCallback(0, 'Analyzing folder structure...');
    }
    
    // Process the folder recursively
    await this.processFolder(
      folderEntry, 
      '', 
      folderCache, 
      result, 
      totalItems, 
      progressCallback
    );
    
    return result;
  }
  
  /**
   * Count all items in a folder structure
   * @param folderEntry The folder entry to count
   * @param totalItems Object to track total items
   */
  private async countItemsInFolder(
    folderEntry: FileSystemDirectoryEntry,
    totalItems: { count: number; processed: number }
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const reader = folderEntry.createReader();
      
      reader.readEntries(async (entries) => {
        totalItems.count += entries.length;
        
        // Process sub-folders recursively
        const subFolderPromises: Promise<void>[] = [];
        
        for (const entry of entries) {
          if (entry.isDirectory) {
            subFolderPromises.push(
              this.countItemsInFolder(entry as FileSystemDirectoryEntry, totalItems)
            );
          }
        }
        
        await Promise.all(subFolderPromises);
        resolve();
      });
    });
  }
  
  /**
   * Process a folder recursively for upload
   * @param folderEntry The folder entry to process
   * @param parentPath The parent path (for nested folders)
   * @param folderCache Cache of folder paths to IDs
   * @param result Upload result statistics
   * @param totalItems Object to track total items for progress
   * @param progressCallback Callback for progress updates
   */
  private async processFolder(
    folderEntry: FileSystemDirectoryEntry,
    parentPath: string,
    folderCache: Map<string, string>,
    result: { foldersCreated: number; filesUploaded: number; errors: string[] },
    totalItems: { count: number; processed: number },
    progressCallback?: (progress: number, details?: string) => void
  ): Promise<void> {
    const folderName = folderEntry.name;
    const currentPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    
    try {
      // Create this folder if doesn't exist in cache
      if (!folderCache.has(currentPath)) {
        const parentId = folderCache.get(parentPath);
        const folderId = await this.createFolder(folderName, parentId);
        
        if (folderId) {
          folderCache.set(currentPath, folderId);
          result.foldersCreated++;
        } else {
          throw new Error(`Failed to create folder: ${folderName}`);
        }
      }
      
      const folderId = folderCache.get(currentPath);
      
      // Get all entries in this folder
      const entries = await this.readFolderEntries(folderEntry);
      
      // Process all entries
      for (const entry of entries) {
        totalItems.processed++;
        const progress = Math.round((totalItems.processed / totalItems.count) * 100);
        
        if (entry.isDirectory) {
          // Process sub-folder
          await this.processFolder(
            entry as FileSystemDirectoryEntry,
            currentPath,
            folderCache,
            result,
            totalItems,
            progressCallback
          );
        } else if (entry.isFile) {
          // Upload file
          const fileEntry = entry as FileSystemFileEntry;
          
          if (progressCallback) {
            progressCallback(progress, `Uploading: ${fileEntry.name}`);
          }
          
          const file = await this.getFileFromEntry(fileEntry);
          const fileId = await this.uploadFile(file, folderId);
          
          if (fileId) {
            result.filesUploaded++;
          } else {
            result.errors.push(`Failed to upload file: ${fileEntry.name}`);
          }
        }
        
        // Update progress after each item
        if (progressCallback) {
          progressCallback(progress);
        }
      }
    } catch (error) {
      console.error(`Error processing folder ${folderName}:`, error);
      result.errors.push(`Error processing folder ${folderName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Read all entries from a directory
   * @param folderEntry The folder entry to read
   * @returns Promise with all entries
   */
  private readFolderEntries(folderEntry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    return new Promise((resolve) => {
      const reader = folderEntry.createReader();
      const entries: FileSystemEntry[] = [];
      
      // Read in chunks until no more entries
      const readNextBatch = () => {
        reader.readEntries((results) => {
          if (results.length) {
            entries.push(...results);
            readNextBatch();
          } else {
            resolve(entries);
          }
        });
      };
      
      readNextBatch();
    });
  }
  
  /**
   * Get File object from FileSystemFileEntry
   * @param fileEntry The file entry
   * @returns Promise with the File object
   */
  private getFileFromEntry(fileEntry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        file => resolve(file),
        error => reject(error)
      );
    });
  }
  
  /**
   * Check if a folder contains subfolders or files
   * @param folderId The folder ID to check
   * @returns Promise with count of contained items
   */
  async getFolderContentsCount(folderId: string): Promise<number> {
    try {
      const query = new QueryParams<GsbFile>(this.ENTITY_NAME);
      query.where('parent_id', folderId);
      query.calcTotalCount = true;
      query.count = 1; // We only need the count
      
      const result = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );
      
      return result.totalCount || 0;
    } catch (error) {
      console.error('Error checking folder contents:', error);
      return 0;
    }
  }
} 