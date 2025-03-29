"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GsbEntityDef } from "@/lib/gsb/models/gsb-entity-def.model";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";

export default function EntityDataPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [entityDef, setEntityDef] = useState<GsbEntityDef | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntityDef = async () => {
      try {
        const entityDefId = params.entityDefId as string;
        if (!entityDefId) {
          throw new Error("Entity definition ID is required");
        }

        const cacheService = GsbCacheService.getInstance();
        const { entityDef, propertyDefs } = await cacheService.getEntityDefWithProperties(entityDefId);
        if (!entityDef) {
          throw new Error("Entity definition not found");
        }

        setEntityDef(entityDef);

        // Load data for the entity
        const dataTableService = new GsbDataTableService();
        const result = await dataTableService.queryEntities(entityDef, {
          page: 1,
          pageSize: 100,
          sortField: undefined,
          sortDirection: undefined,
          filters: {}
        });
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entity definition");
        toast({
          title: "Error",
          description: "Failed to load entity definition",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEntityDef();
  }, [params.entityDefId]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !entityDef) {
    return (
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-red-500">
            {error || "Entity definition not found"}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <FiArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {entityDef.title || entityDef.name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          <GsbDataTable
            entityDefId={entityDef.id}
            data={data}
            className="w-full"
          />
        </CardContent>
      </Card>
    </div>
  );
} 