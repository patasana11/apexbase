'use client';

import { GsbEntityService } from '../../services/entity/gsb-entity.service';
import { GsbSaveRequest } from '../../types/requests';
import { QueryParams } from '../../types/query-params';
import { QueryFunction } from '../../types/query';
import { getGsbToken, getGsbTenantCode } from '../../../gsb/config/gsb-config';
import { GsbFile, FileType, ListingType } from '../../models/gsb-file.model';
import { setGsbCreateFields, setGsbUpdateFields, getGsbDateSortCols } from '../../utils/gsb-utils';

/**
 * Service for managing Files and Storage in the application
 */
export class FileService {
  private entityService: GsbEntityService;
  private ENTITY_NAME = 'GsbFile';

  constructor() {
    this.entityService = new GsbEntityService();
  }

  /**
   * Get file by ID
   * @param id The file ID
   * @returns The file or null if not found
   */
  async getFileById(id: string): Promise<GsbFile | null> {
    try {
      const file = await this.entityService.getById<GsbFile>(
        this.ENTITY_NAME,
        id,
        getGsbToken(),
        getGsbTenantCode()
      );
      return file;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      return null;
    }
  }

  /**
   * Get files in a folder
   * @param folderId The parent folder ID (null or undefined for root)
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of files and the total count
   */
  async getFiles(
    folderId?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ files: GsbFile[]; totalCount: number }> {
    try {
      const query :any = new QueryParams<GsbFile>(this.ENTITY_NAME);

      // Filter by parent folder
      if (folderId) {
        query.query = [
          {
            propVal: {
              name: 'parent_id',
              value: folderId
            },
            function: QueryFunction.Equals
          }
        ];
      } else {
        // For root, parent_id should be null or undefined
        query.query = [
          {
            propVal: {
              name: 'parent_id',
              value: null
            },
            function: QueryFunction.Is
          }
        ];
      }

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      // Sort by creation date
      query.sortCols = getGsbDateSortCols();

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        files: (response.entities || []) as GsbFile[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error getting files:', error);
      return { files: [], totalCount: 0 };
    }
  }

  /**
   * Search for files
   * @param searchTerm The search term
   * @param page The page number (starting from 1)
   * @param pageSize The number of items per page
   * @returns An array of files and the total count
   */
  async searchFiles(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ files: GsbFile[]; totalCount: number }> {
    try {
      const query = new QueryParams<GsbFile>(this.ENTITY_NAME);

      // Set search filter
      if (searchTerm) {
        query.filter = searchTerm;
      }

      // Set pagination
      query.startIndex = (page - 1) * pageSize;
      query.count = pageSize;
      query.calcTotalCount = true;

      const response = await this.entityService.query(
        query,
        getGsbToken(),
        getGsbTenantCode()
      );

      return {
        files: (response.entities || []) as GsbFile[],
        totalCount: response.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching files:', error);
      return { files: [], totalCount: 0 };
    }
  }

  /**
   * Create a new folder
   * @param name The folder name
   * @param parentId The parent folder ID (optional)
   * @returns The created folder ID or null if failed
   */
  async createFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      // Set defaults
      const newFolder: GsbFile = {
        id: '',
        name,
        fileType: FileType.FileSystem,
        listingType: ListingType.Folder,
        parent_id: parentId || '',
        path: this.generatePath(name, parentId)
      };

      // Set create date fields
      const folderWithDates = setGsbCreateFields(newFolder);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: folderWithDates,
        entityDef: {},
        entityId: '',
        entDefId: '',
        query: []
      };

      const response = await this.entityService.save(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      if (!response.id) {
        return null;
      }

      return response.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  /**
   * Upload a file
   * @param file The file to upload
   * @param name The file name (optional, defaults to file.name)
   * @param parentId The parent folder ID (optional)
   * @returns The uploaded file ID or null if failed
   */
  async uploadFile(file: File, name?: string, parentId?: string): Promise<string | null> {
    try {
      // Create file metadata
      const newFile: GsbFile = {
        id: '',
        name: name || file.name,
        fileType: FileType.Cloud_GSB,
        listingType: ListingType.File,
        parent_id: parentId || '',
        size: file.size,
        contentType: file.type,
        path: this.generatePath(name || file.name, parentId),
        fileToUpload: file
      };

      // Set create date fields
      const fileWithDates = setGsbCreateFields(newFile);

      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entity: fileWithDates,
        entityDef: {},
        entityId: '',
        entDefId: '',
        query: []
      };

      const response = await this.entityService.save(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      if (!response.id) {
        return null;
      }

      return response.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  /**
   * Delete a file or folder
   * @param id The file or folder ID to delete
   * @returns True if deleted successfully, false otherwise
   */
  async deleteFile(id: string): Promise<boolean> {
    try {
      const request: GsbSaveRequest = {
        entDefName: this.ENTITY_NAME,
        entityId: id,
        entity: {},
        entityDef: {},
        entDefId: '',
        query: []
      };

      const response = await this.entityService.delete(
        request,
        getGsbToken(),
        getGsbTenantCode()
      );

      return response.deleteCount === 1;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file content
   * @param id The file ID
   * @returns The file content or null if failed
   */
  async getFileContent(id: string): Promise<Blob | null> {
    try {
      const file = await this.getFileById(id);
      if (!file) {
        throw new Error('File not found');
      }

      if (file.listingType !== ListingType.File) {
        throw new Error('Not a file');
      }

      if (!file.publicUrl) {
        throw new Error('File has no public URL');
      }

      // Fetch the file content from the public URL
      const response = await fetch(file.publicUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  /**
   * Generate a path for a file or folder
   * @param name The file or folder name
   * @param parentId The parent folder ID
   * @returns The generated path
   */
  private generatePath(name: string, parentId?: string): string {
    // This is a simplified version
    // In a real implementation, we would need to get the parent's path
    return parentId ? `${parentId}/${name}` : `/${name}`;
  }
}
