'use client';

import { useState, useEffect } from 'react';
import { BaseOperationEditor, BaseOperationEditorProps } from './base-operation-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FileText, File } from 'lucide-react';
import { EntityAutocomplete, EntityItem } from '@/components/gsb';
import { GsbDocumentGenerateOp } from '@/lib/gsb/models/gsb-function.model';

export function DocumentOperationEditor({ operation, onChange }: BaseOperationEditorProps) {
  // Selected template information
  const [selectedTemplate, setSelectedTemplate] = useState<EntityItem | null>(null);

  // Get document generation configuration from operation or initialize
  const [docConfig, setDocConfig] = useState<GsbDocumentGenerateOp>(() => {
    const defaultConfig: GsbDocumentGenerateOp = {
      docTemplate: { id: '', name: '' },
      propertyName: '',
      urlParam: '',
      htmlWfParam: '',
      htmlEntityParam: '',
      template: '',
      byteArrParam: '',
      fileNameProp: '',
      usePuppeteer: false
    };
    
    // Initialize with data from operation if available
    if (operation.docTemplate) {
      return {
        ...defaultConfig,
        ...operation.docTemplate
      };
    }
    
    return defaultConfig;
  });

  // Update operation when config changes
  useEffect(() => {
    const updatedOperation = {
      ...operation,
      docTemplate: docConfig
    };
    
    onChange(updatedOperation);
  }, [docConfig]);

  // Handle template selection
  const handleTemplateChange = (templateId: string, item?: EntityItem) => {
    // Store the selected template for display
    setSelectedTemplate(item || null);
    
    setDocConfig(prev => ({
      ...prev,
      docTemplate: { 
        id: templateId, 
        name: item?.name || '' 
      },
      template: templateId, // Also set the template ID in legacy field
      // If the file name property is empty, use the template's fileName if available
      fileNameProp: prev.fileNameProp || (item?.fileName ? 'fileName' : '')
    }));
  };

  // Handle property name change
  const handlePropertyNameChange = (value: string) => {
    setDocConfig(prev => ({
      ...prev,
      propertyName: value
    }));
  };

  // Handle file name property change
  const handleFileNamePropChange = (value: string) => {
    setDocConfig(prev => ({
      ...prev,
      fileNameProp: value
    }));
  };

  // Handle url param change
  const handleUrlParamChange = (value: string) => {
    setDocConfig(prev => ({
      ...prev,
      urlParam: value
    }));
  };

  // Handle use puppeteer change
  const handleUsePuppeteerChange = (checked: boolean) => {
    setDocConfig(prev => ({
      ...prev,
      usePuppeteer: checked
    }));
  };

  return (
    <BaseOperationEditor operation={operation} onChange={onChange}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Document Template</Label>
          <EntityAutocomplete
            entityType="GsbDocTemplate"
            value={docConfig.docTemplate?.id || docConfig.template}
            onValueChange={handleTemplateChange}
            placeholder="Select document template"
            emptyMessage="No templates found."
            displayField="name"
          />
          {selectedTemplate && (
            <div className="mt-2 p-2 border rounded bg-muted/30 flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-xs">
                <p className="font-medium">{selectedTemplate.name}</p>
                {selectedTemplate.fileName && (
                  <p className="text-muted-foreground">
                    File: {selectedTemplate.fileName}
                  </p>
                )}
                {selectedTemplate.title && selectedTemplate.title !== selectedTemplate.name && (
                  <p className="text-muted-foreground">
                    Title: {selectedTemplate.title}
                  </p>
                )}
                {selectedTemplate.createDate && (
                  <p className="text-muted-foreground">
                    Created: {new Date(selectedTemplate.createDate as any).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Select a template to generate the document from.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyName">Property Name</Label>
            <Input
              id="propertyName"
              value={docConfig.propertyName}
              onChange={(e) => handlePropertyNameChange(e.target.value)}
              placeholder="Result property name"
            />
            <p className="text-xs text-muted-foreground">
              The property to store the document in.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileNameProp">Filename Property</Label>
            <Input
              id="fileNameProp"
              value={docConfig.fileNameProp}
              onChange={(e) => handleFileNamePropChange(e.target.value)}
              placeholder="Filename property"
            />
            <p className="text-xs text-muted-foreground">
              The property to get the filename from.
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="urlParam">URL Parameter</Label>
          <Input
            id="urlParam"
            value={docConfig.urlParam}
            onChange={(e) => handleUrlParamChange(e.target.value)}
            placeholder="URL parameter name"
          />
          <p className="text-xs text-muted-foreground">
            Parameter name for URL to access the document.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="usePuppeteer"
            checked={docConfig.usePuppeteer}
            onCheckedChange={handleUsePuppeteerChange}
          />
          <Label htmlFor="usePuppeteer" className="font-normal">
            Use Puppeteer for HTML to PDF conversion
          </Label>
        </div>
        
        <div className="rounded-md border p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium">Document Generation Settings</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            This operation will generate a document using the selected template. The document will be stored in the specified property and can be downloaded or attached to emails.
          </p>
          
          {docConfig.docTemplate?.id && selectedTemplate && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span>Using template: {selectedTemplate.name}</span>
            </div>
          )}
        </div>
      </div>
    </BaseOperationEditor>
  );
} 