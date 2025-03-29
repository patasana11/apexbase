import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Pagination } from './pagination';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, Trash2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  className?: string;
  editable?: boolean;
  editor?: (value: any, onChange: (value: any) => void) => React.ReactNode;
}

export interface DataTableProps<T> {
  /**
   * The data items to display
   */
  data: T[];
  
  /**
   * Column definitions for the table
   */
  columns: Column<T>[];
  
  /**
   * Total number of items (for pagination)
   */
  totalItems: number;
  
  /**
   * Current page (1-indexed)
   */
  currentPage: number;
  
  /**
   * Items per page
   */
  pageSize: number;
  
  /**
   * Called when page changes
   */
  onPageChange: (page: number) => void;
  
  /**
   * Called when page size changes
   */
  onPageSizeChange?: (size: number) => void;
  
  /**
   * Called when search query changes
   */
  onSearch?: (query: string) => void;
  
  /**
   * Current search query
   */
  searchQuery?: string;
  
  /**
   * Called when export button is clicked
   */
  onExport?: () => void;
  
  /**
   * Called when filter button is clicked
   */
  onFilter?: () => void;
  
  /**
   * Loading state for the table
   */
  isLoading?: boolean;
  
  /**
   * Error state for the table
   */
  error?: string | null;
  
  /**
   * Optional custom class name
   */
  className?: string;
  
  /**
   * Label for search placeholder
   */
  searchPlaceholder?: string;
  
  /**
   * Whether to show the search input
   */
  showSearch?: boolean;
  
  /**
   * Whether to show export button
   */
  showExport?: boolean;
  
  /**
   * Whether to show filter button
   */
  showFilter?: boolean;

  /**
   * Called when a cell is edited
   */
  onCellEdit?: (rowIndex: number, columnKey: string, value: any) => void;

  /**
   * Called when a row is deleted
   */
  onDeleteRow?: (rowIndex: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchQuery = '',
  onExport,
  onFilter,
  isLoading = false,
  error = null,
  className,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showExport = true,
  showFilter = true,
  onCellEdit,
  onDeleteRow,
}: DataTableProps<T>) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchQuery);
    }
  };
  
  // Update local search query when prop changes
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle cell edit start
  const handleCellEditStart = (rowIndex: number, columnKey: string, value: any) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(value);
  };

  // Handle cell edit save
  const handleCellEditSave = () => {
    if (editingCell && onCellEdit) {
      onCellEdit(editingCell.rowIndex, editingCell.columnKey, editValue);
      setEditingCell(null);
      setEditValue(null);
    }
  };

  // Handle cell edit cancel
  const handleCellEditCancel = () => {
    setEditingCell(null);
    setEditValue(null);
  };

  // Handle cell edit value change
  const handleCellEditChange = (value: any) => {
    setEditValue(value);
  };

  // Get cell value safely
  const getCellValue = (item: T, key: string): any => {
    return (item as any)[key];
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Table controls */}
      {(showSearch || showExport || showFilter) && (
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-8"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          )}
          
          <div className="flex gap-2 ml-auto">
            {showFilter && (
              <Button
                variant="outline"
                size="icon"
                onClick={onFilter}
                disabled={!onFilter}
                aria-label="Filter"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            
            {showExport && (
              <Button
                variant="outline"
                size="icon"
                onClick={onExport}
                disabled={!onExport}
                aria-label="Export"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {onDeleteRow && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={`loading-${index}`} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`loading-${index}-${colIndex}`}>
                      <div className="h-4 bg-muted rounded w-full" />
                    </TableCell>
                  ))}
                  {onDeleteRow && <TableCell />}
                </TableRow>
              ))
            ) : error ? (
              // Error state
              <TableRow>
                <TableCell colSpan={columns.length + (onDeleteRow ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length + (onDeleteRow ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={`${index}-${colIndex}`} 
                      className={cn(
                        column.className,
                        column.editable && 'cursor-pointer hover:bg-muted/50'
                      )}
                      onClick={() => column.editable && handleCellEditStart(index, column.key, getCellValue(item, column.key))}
                    >
                      {editingCell?.rowIndex === index && editingCell?.columnKey === column.key ? (
                        <div className="flex items-center gap-2">
                          {column.editor ? (
                            column.editor(editValue, handleCellEditChange)
                          ) : (
                            <Input
                              value={editValue || ''}
                              onChange={(e) => handleCellEditChange(e.target.value)}
                              className="h-8"
                            />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellEditSave();
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellEditCancel();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        column.cell(item, index)
                      )}
                    </TableCell>
                  ))}
                  {onDeleteRow && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteRow(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
} 