/**
 * Enum for file type
 */
export enum FileType {
  FileSystem = 0,
  Cloud_GSB = 1,
  Cloud_Azure = 2,
  Cloud_AWS = 3,
  Cloud_Google = 4
}

/**
 * Enum for listing type
 */
export enum ListingType {
  Folder = 1,
  File = 2
}

/**
 * Represents a chunk info for file
 */
export interface ChunkInfo {
  files: GsbFile[];
  totalSize: number; // Total size in bytes
}

/**
 * Represents a split files result
 */
export interface SplitFilesResult {
  totalSize: number; // Total size of all files in bytes
  chunks: ChunkInfo[];
}

/**
 * Represents a GSB File entity
 */
export interface GsbFile {
  id?: string;
  name?: string;
  path?: string;
  properties?: string;
  fileType?: FileType;
  listingType?: ListingType;
  versionMajor?: number;
  versionMinor?: number;
  buildNumber?: number;
  contentType?: string;
  icon?: string;
  parent?: GsbFile;
  parent_id?: string;
  children?: GsbFile[];
  publicUrl?: string;
  size?: number;
  fileToUpload?: File;
  editPermission_id?: string;
  readPermission_id?: string;
  deletePermission_id?: string;
  createDate?: Date;
  lastUpdateDate?: Date;
  createdBy_id?: string;
  lastUpdatedBy_id?: string;
}
