'use client';

import { ReactNode } from 'react';
import { GsbWfOperation } from '@/lib/gsb/models/gsb-function.model';

export interface BaseOperationEditorProps {
  operation: GsbWfOperation;
  onChange: (updatedOperation: GsbWfOperation) => void;
}

export interface OperationEditorComponentProps extends BaseOperationEditorProps {
  children?: ReactNode;
}

export function BaseOperationEditor({ 
  operation, 
  onChange, 
  children 
}: OperationEditorComponentProps) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
} 