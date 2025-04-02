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

  return (
        <GsbDataTable
          entityDefName={resolvedParams.name}
        />
  );
} 