'use client';

import { useState } from 'react';
import { Message } from './ai-agent-chat';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Download, AlertTriangle, Info } from "lucide-react";
import { CSVLink } from "react-csv";
import FileSaver from 'file-saver';

interface AIMessageProps {
  message: Message;
  className?: string;
}

export function AIMessage({ message, className }: AIMessageProps) {
  const [showFullTable, setShowFullTable] = useState(false);

  // Helper to determine if data is tabular
  const isTableData = (data: any) => {
    return data &&
           Array.isArray(data) &&
           data.length > 0 &&
           typeof data[0] === 'object' &&
           !Array.isArray(data[0]);
  };

  // Helper to render operation preview
  const renderOperationPreview = () => {
    if (!message.operation) return null;

    const { operation, table, fields, conditions } = message.operation;

    if (operation === 'create' && table && fields) {
      return (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Create Table Preview
            </CardTitle>
            <CardDescription>This will create a new table with the following structure:</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }

    if (operation === 'delete' && table) {
      return (
        <Card className="mt-4 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Delete Operation Warning
            </CardTitle>
            <CardDescription>This will permanently delete the following table:</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{table}</p>
            <p className="text-muted-foreground text-sm mt-2">
              This action cannot be undone. All data in this table will be lost.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (operation === 'query' && table) {
      return (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Query Preview
            </CardTitle>
            <CardDescription>Will query the <span className="font-medium">{table}</span> table with:</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {conditions && conditions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conditions.map((condition: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{condition.field}</TableCell>
                      <TableCell>{condition.operator}</TableCell>
                      <TableCell>{condition.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No conditions. Will return all rows.</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  // Export to JSON
  const handleExportJson = () => {
    if (!message.data) return;

    const blob = new Blob([JSON.stringify(message.data, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'export.json');
  };

  // Render table from data
  const renderTable = (data: any[]) => {
    if (!data || data.length === 0) return null;

    // Get column headers from the first item
    const columns = Object.keys(data[0]);

    // Limit rows for display unless expanded
    const displayData = showFullTable ? data : data.slice(0, 10);
    const hasMoreRows = data.length > 10;

    return (
      <div className="mt-4 overflow-x-auto">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={`${index}-${column}`}>
                        {typeof row[column] === 'object'
                          ? JSON.stringify(row[column])
                          : String(row[column] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {hasMoreRows && !showFullTable && (
          <Button
            variant="link"
            onClick={() => setShowFullTable(true)}
            className="mt-2"
          >
            Show all {data.length} rows
          </Button>
        )}

        {hasMoreRows && showFullTable && (
          <Button
            variant="link"
            onClick={() => setShowFullTable(false)}
            className="mt-2"
          >
            Show fewer rows
          </Button>
        )}

        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={handleExportJson}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>

          <CSVLink
            data={data}
            filename="export.csv"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </CSVLink>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="bg-primary-foreground text-primary">AI</AvatarFallback>
      </Avatar>
      <div className="grid gap-1 w-full">
        <div className="font-semibold text-sm">AI Assistant</div>

        {message.isLoading ? (
          <div className="flex items-center mt-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <p className="text-sm text-muted-foreground">Processing your request...</p>
          </div>
        ) : (
          <>
            <div className="prose-sm mt-1 text-slate-700 dark:text-slate-300">
              {message.content.split('\n').map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>

            {message.needsConfirmation && renderOperationPreview()}
            {message.data && isTableData(message.data) && renderTable(message.data)}
          </>
        )}
      </div>
    </div>
  );
}
