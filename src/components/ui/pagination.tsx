import { Button } from "@/components/ui/button";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight
} from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  // Handle edge cases
  if (totalPages <= 0 || currentPage <= 0) {
    return null;
  }

  // Function to get page numbers to show with ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalNumbers = siblingCount * 2 + 3; // Total numbers to display including first, last, and current
    const totalBlocks = totalNumbers + 2; // Total blocks including ellipsis
    
    // Case 1: If totalPages is less than totalBlocks, show all pages
    if (totalPages <= totalBlocks) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } 
    // Case 2: If ellipsis is needed
    else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
      
      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
      
      // Always add first page
      pageNumbers.push(1);
      
      // Case 2a: Dots on right side only
      if (!shouldShowLeftDots && shouldShowRightDots) {
        for (let i = 2; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis-right");
        pageNumbers.push(totalPages);
      }
      // Case 2b: Dots on left side only
      else if (shouldShowLeftDots && !shouldShowRightDots) {
        pageNumbers.push("ellipsis-left");
        for (let i = leftSiblingIndex; i <= totalPages - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(totalPages);
      }
      // Case 2c: Dots on both sides
      else if (shouldShowLeftDots && shouldShowRightDots) {
        pageNumbers.push("ellipsis-left");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis-right");
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Get all page numbers to display
  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center space-x-1">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className="hidden sm:flex"
      >
        <FiChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First Page</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <FiChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-left" || page === "ellipsis-right") {
            return (
              <div key={`${page}-${index}`} className="px-3 py-2 text-sm">
                &hellip;
              </div>
            );
          }
          
          return (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className="h-8 w-8"
            >
              {page}
              <span className="sr-only">Page {page}</span>
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <FiChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(totalPages)}
        className="hidden sm:flex"
      >
        <FiChevronsRight className="h-4 w-4" />
        <span className="sr-only">Last Page</span>
      </Button>
    </nav>
  );
} 