'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Editor } from '@monaco-editor/react';
import { FunctionUiService } from '@/lib/services/ui/function-ui.service';
import { GsbWfFunction } from '@/lib/gsb/models/gsb-function.model';
import { OperationEditor } from './operation-editor';
import { FiCode, FiSettings } from 'react-icons/fi';

interface FunctionEditorProps {
  function: GsbWfFunction;
  onChange: (func: GsbWfFunction) => void;
}

export function FunctionEditor({ function: func, onChange }: FunctionEditorProps) {
  const functionUiService = FunctionUiService.getInstance();
  const [activeTab, setActiveTab] = useState<'code' | 'operations'>('code');
  const [code, setCode] = useState(func.code || functionUiService.getDefaultFunctionCode());

  // Determine if we should default to operations tab
  useEffect(() => {
    if (functionUiService.isUsingOperations(func)) {
      setActiveTab('operations');
    } else {
      setActiveTab('code');
    }
  }, [func]);

  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    onChange({
      ...func,
      code: value || ''
    });
  };

  // Handle operations changes
  const handleOperationsChange = (updatedFunc: GsbWfFunction) => {
    onChange(updatedFunc);
  };

  return (
    <div className="space-y-4">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'code' | 'operations')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code" className="flex items-center">
            <FiCode className="mr-2 h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center">
            <FiSettings className="mr-2 h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="border rounded-md p-0 overflow-hidden mt-2">
          <div className="h-[500px]">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={handleCodeChange}
              options={functionUiService.getMonacoEditorOptions()}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="operations" className="mt-2">
          <OperationEditor 
            function={func} 
            onChange={handleOperationsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 