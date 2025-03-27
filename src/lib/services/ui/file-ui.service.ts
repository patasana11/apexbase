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
   * Get files with pagination
   * @param folderId Optional parent folder ID
   * @param page Current page number (1-indexed)
   * @param pageSize Number of items per page
   * @returns Files, total count, current folder, and any error
   */
  async getFiles(
    folderId?: string,
    page: number = 1,
    pageSize: number = 24
  ): Promise<{
    files: GsbFile[];
    totalCount: number;
    currentFolder: GsbFile | null;
    error?: string;
  }> {
    try {
      console.log('Getting files from folder', folderId, 'page', page, 'size', pageSize);
      
      // Get files from the real service
      const result = await this.fileService.getFiles(folderId, page, pageSize);
      
      // If we have a folder ID, load the folder information
      let currentFolder: GsbFile | null = null;
      if (folderId) {
        try {
          currentFolder = await this.fileService.getFileById(folderId);
        } catch (error) {
          console.error('Error getting current folder:', error);
        }
      }
      
      return {
        files: result.files || [],
        totalCount: result.totalCount || 0,
        currentFolder
      };
    } catch (error) {
      console.error('Error getting files:', error);
      return {
        files: [],
        totalCount: 0,
        currentFolder: null,
        error: error instanceof Error ? error.message : 'Failed to load files'
      };
    }
  }
  
  /**
   * Search files
   * @param query Search query
   * @param page Current page number (1-indexed)
   * @param pageSize Number of items per page
   * @returns Matching files and total count
   */
  async searchFiles(
    query: string,
    page: number = 1,
    pageSize: number = 24
  ): Promise<{
    files: GsbFile[];
    totalCount: number;
    error?: string;
  }> {
    try {
      console.log('Searching files with query', query, 'page', page, 'size', pageSize);
      
      // Use the real service implementation
      const result = await this.fileService.searchFiles(query, page, pageSize);
      
      return {
        files: result.files || [],
        totalCount: result.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching files:', error);
      return {
        files: [],
        totalCount: 0,
        error: error instanceof Error ? error.message : 'Failed to search files'
      };
    }
  }
  
  /**
   * Get storage statistics
   * @returns Storage statistics including total size and file counts
   */
  async getStorageStatistics(): Promise<{
    totalSize: number;
    totalFiles: number;
    totalFolders: number;
    error?: string;
  }> {
    try {
      console.log('Getting storage statistics');
      
      // Calculate storage statistics by querying files and folders
      // Get total count of files
      const fileResult = await this.fileService.searchFiles('', 1, 1);
      const totalFiles = fileResult.totalCount;
      
      // Get total count of folders
      const folderQuery = new SingleQuery();
      folderQuery.col = new SelectCol('listingType');
      folderQuery.val = new SelectCol();
      folderQuery.val.value = ListingType.Folder;
      folderQuery.funcVal(QueryFunction.Equals, ListingType.Folder);
      
      const query = new QueryParams<GsbFile>(this.ENTITY_NAME);
      query.query = [folderQuery];
      query.count = 1;
      query.calcTotalCount = true;
      
      const folderResponse = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );
      
      const totalFolders = folderResponse.totalCount || 0;
      
      // Calculate total size by summing up file sizes
      // For performance reasons, we'll limit this to recent files or implement a server-side aggregate
      const fileTypeQuery = new SingleQuery();
      fileTypeQuery.col = new SelectCol('listingType');
      fileTypeQuery.val = new SelectCol();
      fileTypeQuery.val.value = ListingType.File;
      fileTypeQuery.funcVal(QueryFunction.Equals, ListingType.File);
      
      const sizeQuery = new QueryParams<GsbFile>(this.ENTITY_NAME);
      sizeQuery.query = [fileTypeQuery];
      sizeQuery.count = 1000; // Get a reasonable sample of files to calculate size
      
      const sizeResponse = await this.entityService.query(
        sizeQuery,
        getGsbToken(),
        getGsbTenantCode()
      );
      
      let totalSize = 0;
      if (sizeResponse.entities) {
        const files = sizeResponse.entities as GsbFile[];
        totalSize = files.reduce((total, file) => total + (file.size || 0), 0);
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
        error: error instanceof Error ? error.message : 'Failed to load storage statistics'
      };
    }
  }
  
  /**
   * Delete a file or folder
   * @param fileId File or folder ID
   * @returns Success status
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Mock implementation - replace with actual API call
      console.log('Deleting file', fileId);
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
  
  /**
   * Get the number of items inside a folder (for delete confirmation)
   * @param folderId Folder ID
   * @returns Count of items in folder
   */
  async getFolderContentsCount(folderId: string): Promise<number> {
    try {
      // Mock implementation - replace with actual API call
      console.log('Getting folder contents count', folderId);
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return 5; // Mock count
    } catch (error) {
      console.error('Error getting folder contents count:', error);
      return 0;
    }
  }
  
  /**
   * Build a complete path to a folder (for breadcrumb navigation)
   * @param folder Current folder
   * @returns Array of folders representing the path
   */
  async buildCompleteFolderPath(folder: GsbFile): Promise<GsbFile[]> {
    if (!folder || !folder.id) return [];
    
    try {
      // Mock implementation - replace with actual API call
      console.log('Building folder path for', folder.id);
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock path
      return [
        {
          id: 'root',
          name: 'Root',
          listingType: ListingType.Folder,
          createDate: new Date()
        },
        {
          id: 'parent',
          name: 'Parent Folder',
          listingType: ListingType.Folder,
          createDate: new Date(),
          parent_id: 'root'
        },
        folder
      ];
    } catch (error) {
      console.error('Error building folder path:', error);
      return [folder]; // Return at least the current folder
    }
  }
  
  /**
   * Upload files to a folder
   * @param files Files to upload
   * @param folderId Target folder ID
   * @param onProgress Progress callback
   * @returns Success status and any error
   */
  async uploadFiles(
    files: FileList,
    folderId?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const fileId = await this.fileService.uploadFile(file, file.name, folderId);
          if (fileId) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          errorCount++;
        }
        
        // Update progress if callback provided
        if (onProgress) {
          const progress = Math.round(((successCount + errorCount) / files.length) * 100);
          onProgress(progress);
        }
      }
      
      return {
        success: successCount > 0,
        error: errorCount > 0 
          ? `Failed to upload ${errorCount} of ${files.length} files` 
          : undefined
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload files'
      };
    }
  }
  
  /**
   * Create a new folder
   * @param name Folder name
   * @param parentId Parent folder ID
   * @returns New folder ID or null if failed
   */
  async createFolder(
    name: string,
    parentId?: string
  ): Promise<string | null> {
    try {
      const folderId = await this.fileService.createFolder(name, parentId);
      return folderId;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }
  
  /**
   * Download a file
   * @param fileId File ID
   * @returns Success status and any error
   */
  async downloadFile(fileId: string): Promise<boolean> {
    try {
      // Get the file content
      const fileBlob = await this.fileService.getFileContent(fileId);
      if (!fileBlob) {
        throw new Error('Unable to download file content');
      }
      
      // Get file metadata to determine the name
      const fileInfo = await this.fileService.getFileById(fileId);
      const fileName = fileInfo?.name || 'download';
      
      // Create a download link
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      return false;
    }
  }
  
  /**
   * Calculate the total storage used by a set of files
   * @param files Files to calculate size for
   * @returns Total size in bytes
   */
  calculateStorageUsed(files: GsbFile[]): number {
    return files.reduce((total, file) => {
      // Skip folders in calculation
      if (file.listingType === ListingType.Folder) return total;
      return total + (file.size || 0);
    }, 0);
  }
  
  /**
   * Format a file size in bytes to a human-readable string
   * @param bytes File size in bytes
   * @param decimals Number of decimal places
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  /**
   * Determine the icon type for a file based on its content type or extension
   * @param file File to get icon for
   * @returns Icon type string
   */
  getFileIconType(file: GsbFile): string {
    if (file.listingType === ListingType.Folder) {
      return 'folder';
    }
    
    // Get file extension
    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    const contentType = file.contentType || '';
    
    // Check if it's an image
    if (contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return 'image';
    }
    
    // Check if it's a text document
    if (contentType.startsWith('text/') || ['txt', 'md', 'rtf', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'file-text';
    }
    
    // Check if it's video
    if (contentType.startsWith('video/') || ['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(extension)) {
      return 'video';
    }
    
    // Check if it's audio
    if (contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return 'music';
    }
    
    // Check if it's code
    if (['js', 'ts', 'html', 'css', 'jsx', 'tsx', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb'].includes(extension)) {
      return 'code';
    }
    
    // Check if it's an archive
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
      return 'archive';
    }
    
    // Default to generic file
    return 'file';
  }
} 