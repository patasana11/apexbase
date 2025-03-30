import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import { GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import Link from 'next/link';

export default async function EntityListPage() {
  const cacheService = GsbCacheService.getInstance();
  const entityDefs = await cacheService.getEntityDefinitions();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Entity List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entityDefs.map((entityDef: GsbEntityDef) => (
          <Link
            key={entityDef.name}
            href={`/gsb/entity-data/${entityDef.name}`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-semibold">{entityDef.title || entityDef.name}</h2>
            <p className="text-gray-600">{entityDef.description || 'No description available'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 