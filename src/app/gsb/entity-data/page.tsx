import { GsbDataTable } from '@/components/gsb/gsb-data-table';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';

interface EntityDataPageProps {
  params: {
    entityDefName: string;
  };
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}

export default async function EntityDataPage({ params, searchParams }: EntityDataPageProps) {
  const { entityDefName } = params;
  const page = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.pageSize || '10');
  
  const dataTableService = GsbDataTableService.getInstance();
  const cacheService = GsbCacheService.getInstance();

  // Get entity definition for title
  const { entityDef } = await cacheService.getEntityDefWithPropertiesByName(entityDefName);

  // Get data with pagination
  const { data, totalCount } = await dataTableService.queryEntities(entityDefName, {
    page,
    pageSize
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{entityDef?.title || entityDefName}</h1>
      <GsbDataTable
        entityDefName={entityDefName}
        data={data}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => {
          // Handle page change
          window.location.href = `/gsb/entity-data/${entityDefName}?page=${newPage}&pageSize=${pageSize}`;
        }}
        onPageSizeChange={(newPageSize) => {
          // Handle page size change
          window.location.href = `/gsb/entity-data/${entityDefName}?page=1&pageSize=${newPageSize}`;
        }}
      />
    </div>
  );
} 