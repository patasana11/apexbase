'use client';

import { useState, useEffect } from 'react';
import { GsbDataTable } from '@/components/gsb/gsb-data-table';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: {
    name: string;
  };
}

export default function EntityDataPage({ params }: PageProps) {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTitle, setEntityTitle] = useState('');

  // Load entity definition for title
  useEffect(() => {
    const loadEntityDef = async () => {
      try {
        const cacheService = GsbCacheService.getInstance();
        const { entityDef } = await cacheService.getEntityDefWithPropertiesByName(params.name);
        if (entityDef) {
          setEntityTitle(entityDef.title || entityDef.name);
        } else {
          // If entity not found, redirect to database page
          router.push('/dashboard/database');
        }
      } catch (error) {
        console.error('Error loading entity definition:', error);
        setError('Failed to load entity definition');
      }
    };

    if (params.name) {
      loadEntityDef();
    }
  }, [params.name, router]);

  // Load data with pagination and search
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dataTableService = GsbDataTableService.getInstance();
        
        const response = await dataTableService.queryEntities(params.name, {
          page,
          pageSize,
          searchQuery,
          // Add sorting and filtering options as needed
        });
        
        setData(response.data);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (params.name) {
      // Add debounce to search
      const timeoutId = setTimeout(() => {
        loadData();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [params.name, page, pageSize, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{entityTitle || params.name}</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <GsbDataTable 
          entityDefName={params.name}
          data={data}
          onDataChange={setData}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
} 