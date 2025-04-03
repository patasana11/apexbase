"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function SelectListsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectLists, setSelectLists] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Load select lists
  useEffect(() => {
    loadSelectLists();
  }, [currentPage, pageSize, searchQuery]);

  const loadSelectLists = async () => {
    try {
      setIsLoading(true);
      const dataTableService = GsbDataTableService.getInstance();
      const response = await dataTableService.query({
        entityDefName: "GsbEnum",
        startIndex: (currentPage - 1) * pageSize,
        count: pageSize,
        search: searchQuery,
        sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
      });
      setSelectLists(response.entities || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading select lists:", error);
      toast({
        title: "Error",
        description: "Failed to load select lists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSelectList = () => {
    router.push("/dashboard/system/selectlists/new");
  };

  const handleEditSelectList = (selectList: any) => {
    router.push(`/dashboard/system/selectlists/${selectList.id}/edit`);
  };

  const handleDeleteSelectList = async (selectList: any) => {
    try {
      const dataTableService = GsbDataTableService.getInstance();
      await dataTableService.delete("GsbEnum", selectList.id);
      toast({
        title: "Success",
        description: "Select list deleted successfully.",
      });
      loadSelectLists();
    } catch (error) {
      console.error("Error deleting select list:", error);
      toast({
        title: "Error",
        description: "Failed to delete select list. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Select Lists</h1>
        <p className="text-muted-foreground">
          Manage your system select lists and enumerations
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Select List Status
          </CardTitle>
          <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{selectLists.length}</span>
              <span className="text-xs text-muted-foreground">
                Total Lists
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {selectLists.reduce((acc, list) => acc + (list.values?.length || 0), 0)}
              </span>
              <span className="text-xs text-muted-foreground">
                Total Values
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {selectLists.filter(list => list.module).length}
              </span>
              <span className="text-xs text-muted-foreground">
                Module Lists
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Select List Management
          </CardTitle>
          <Button onClick={handleCreateSelectList}>
            <FiPlus className="mr-2 h-4 w-4" />
            New Select List
          </Button>
        </CardHeader>
        <CardContent>
          <GsbDataTable
            entityDefName="GsbEnum"
            data={selectLists}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onDataChange={setSelectLists}
            view={{
              queryParams: {
                entityDefName: "GsbEnum",
                startIndex: (currentPage - 1) * pageSize,
                count: pageSize,
                search: searchQuery,
                sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
              },
            }}
            onViewChange={() => {}}
            onSortChange={() => {}}
            onFilterChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
} 