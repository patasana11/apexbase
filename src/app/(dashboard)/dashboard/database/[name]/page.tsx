'use client';

import { useState, useEffect, use } from 'react';
import { GsbDataTable } from '@/components/gsb/gsb-data-table';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';

interface PageProps {
  params: Promise<{ name: string }>;
}

export default function EntityDataPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTitle, setEntityTitle] = useState('');
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Load entity definition for title
  useEffect(() => {
    const loadEntityDef = async () => {
      try {
        const cacheService = GsbCacheService.getInstance();
        const { entityDef } = await cacheService.getEntityDefWithPropertiesByName(resolvedParams.name);
        setEntityTitle(entityDef?.title || resolvedParams.name);
      } catch (error) {
        console.error('Error loading entity definition:', error);
        setEntityTitle(resolvedParams.name);
      }
    };

    loadEntityDef();
  }, [resolvedParams.name]);

  // Load data with pagination, search, sort and filter
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dataTableService = GsbDataTableService.getInstance();
        const result = await dataTableService.queryEntities(
          resolvedParams.name,
          {
            page,
            pageSize,
            searchQuery,
            sortField,
            sortDirection,
            filters  
          }
        );

        setData(result.data);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.name, page, pageSize, searchQuery, sortField, sortDirection, filters]);

  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  }, 300);

  // Handle sort changes
  const handleSortChange = (field: string, direction: 'ASC' | 'DESC') => {
    setSortField(field);
    setSortDirection(direction);
    setPage(1); // Reset to first page on sort
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{entityTitle}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 w-64"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-grow">
        <GsbDataTable
          entityDefName={resolvedParams.name}
          data={data}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
} 