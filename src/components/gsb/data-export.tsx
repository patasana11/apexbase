import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { GsbDataTableService } from '@/lib/gsb/services/entity/gsb-data-table.service';
import { QueryParams } from '@/lib/gsb/types/query-params';

interface DataExportProps {
  entityDefId: string;
  queryParams: QueryParams<any>;
  currentPageData: any[];
  totalCount: number;
}

type ExportFormat = 'json' | 'csv';
type ExportScope = 'current' | 'all';

export function DataExport({
  entityDefId,
  queryParams,
  currentPageData,
  totalCount,
}: DataExportProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportScope, setExportScope] = useState<ExportScope>('current');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataTableService = GsbDataTableService.getInstance();
      let data: any[] = [];

      if (exportScope === 'current') {
        data = currentPageData;
      } else {
        // For all data, we need to fetch with pagination
        const pageSize = 1000; // Adjust based on your needs
        const totalPages = Math.ceil(totalCount / pageSize);
        
        for (let page = 0; page < totalPages; page++) {
          const query = new QueryParams(queryParams.entDefName ?? '');
          Object.assign(query, queryParams);
          query.startIndex = page * pageSize;
          query.count = pageSize;
          
          const result = await dataTableService.getData(query);
          data = [...data, ...(result.entities || [])];
        }
      }

      // Convert data to the selected format
      let content: string;
      let filename: string;
      let type: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `${entityDefId}_export.json`;
        type = 'application/json';
      } else {
        // Convert to CSV
        const headers = Object.keys(data[0] || {});
        const csvRows = [
          headers.join(','),
          ...data.map(row => 
            headers.map(header => {
              const value = row[header];
              return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            }).join(',')
          )
        ];
        content = csvRows.join('\n');
        filename = `${entityDefId}_export.csv`;
        type = 'text/csv';
      }

      // Create and trigger download
      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show an error toast here
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  return (
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Export Format</Label>
            <RadioGroup
              value={exportFormat}
              onValueChange={(value: ExportFormat) => setExportFormat(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Export Scope</Label>
            <RadioGroup
              value={exportScope}
              onValueChange={(value: ExportScope) => setExportScope(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Current Page</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Data ({totalCount} records)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 