'use client';

import { BaseOperationEditor, BaseOperationEditorProps } from './base-operation-editor';
import { Editor } from '@monaco-editor/react';
import { Label } from '@/components/ui/label';
import { FunctionUiService } from '@/lib/services/ui/function-ui.service';

export function CodeOperationEditor({ operation, onChange }: BaseOperationEditorProps) {
  const functionUiService = FunctionUiService.getInstance();
  
  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    onChange({
      ...operation,
      scriptCode: value || '',
      scriptCodeStr: value || ''
    });
  };

  return (
    <BaseOperationEditor operation={operation} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="operationScript">Script Code</Label>
        <div className="border rounded-md overflow-hidden h-[300px]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={operation.scriptCode || operation.scriptCodeStr || functionUiService.getDefaultScriptCode()}
            onChange={handleCodeChange}
            options={functionUiService.getMonacoEditorOptions()}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Write JavaScript code to process inputs and perform actions. Your code will have access to input and context objects.
        </p>
      </div>
    </BaseOperationEditor>
  );
} 