import { useState, useCallback, useEffect } from 'react';

export interface UsePaginationOptions {
  /**
   * Initial page number (1-indexed)
   */
  initialPage?: number;
  
  /**
   * Initial page size
   */
  initialPageSize?: number;
  
  /**
   * Total number of items (optional, can be set later)
   */
  totalItems?: number;
  
  /**
   * Function to call when page or page size changes
   */
  onChange?: (page: number, pageSize: number) => void;
}

export interface UsePaginationResult {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;
  
  /**
   * Set current page number
   */
  setCurrentPage: (page: number) => void;
  
  /**
   * Number of items per page
   */
  pageSize: number;
  
  /**
   * Set number of items per page
   */
  setPageSize: (size: number) => void;
  
  /**
   * Total number of items
   */
  totalItems: number;
  
  /**
   * Set total number of items
   */
  setTotalItems: (total: number) => void;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Go to next page if available
   */
  nextPage: () => void;
  
  /**
   * Go to previous page if available
   */
  prevPage: () => void;
  
  /**
   * Reset to first page
   */
  resetPage: () => void;
  
  /**
   * Calculate the start index (0-indexed) for current page
   */
  startIndex: number;
  
  /**
   * Calculate the end index (0-indexed) for current page
   */
  endIndex: number;
  
  /**
   * Whether there is a next page available
   */
  hasNextPage: boolean;
  
  /**
   * Whether there is a previous page available
   */
  hasPrevPage: boolean;
}

/**
 * Custom hook for managing pagination state
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
  onChange
}: UsePaginationOptions = {}): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotalItems] = useState(totalItems);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  // Ensure current page is valid when dependencies change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Call onChange when page or pageSize changes
  useEffect(() => {
    onChange?.(currentPage, pageSize);
  }, [currentPage, pageSize, onChange]);
  
  // Calculate start and end indices
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, total - 1);
  
  // Check if there are next/prev pages
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // Go to next page if available
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);
  
  // Go to previous page if available
  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);
  
  // Reset to first page
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  // Change page size with adjusting current page
  const handleSetPageSize = useCallback((newSize: number) => {
    const currentFirstItemIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(currentFirstItemIndex / newSize) + 1;
    
    setPageSize(newSize);
    setCurrentPage(newPage);
  }, [currentPage, pageSize]);
  
  // Make sure page is valid when manually setting
  const handleSetCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);
  
  return {
    currentPage,
    setCurrentPage: handleSetCurrentPage,
    pageSize,
    setPageSize: handleSetPageSize,
    totalItems: total,
    setTotalItems,
    totalPages,
    nextPage,
    prevPage,
    resetPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage
  };
} 