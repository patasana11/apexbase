'use client';

import { useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiCode,
  FiMail,
  FiPhone,
  FiDatabase,
  FiServer,
  FiFileText,
  FiAlertCircle,
  FiSave,
  FiMoreHorizontal,
  FiSettings
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Editor } from '@monaco-editor/react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { FunctionUiService } from '@/lib/services/ui/function-ui.service';
import { GsbWfFunction, GsbWfOperation, OperationType } from '@/lib/gsb/models/gsb-function.model';
import { 
  CodeOperationEditor, 
  EmailOperationEditor, 
  NotificationOperationEditor, 
  DocumentOperationEditor 
} from './operation-editors';

interface OperationEditorProps {
  function: GsbWfFunction;
  onChange: (func: GsbWfFunction) => void;
}

export function OperationEditor({ function: func, onChange }: OperationEditorProps) {
  const { toast } = useToast();
  const functionUiService = FunctionUiService.getInstance();
  
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null);
  const [showOperationDialog, setShowOperationDialog] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<GsbWfOperation | null>(null);
  const [isEditingOperation, setIsEditingOperation] = useState(false);
  const [operationTitle, setOperationTitle] = useState('');
  const [operationScript, setOperationScript] = useState('');
  const [operationType, setOperationType] = useState<OperationType>(OperationType.RunScriptCode);

  // Get selected operation
  const selectedOperation = selectedOperationId
    ? func.operationsObj?.find(op => op.id === selectedOperationId) || null
    : null;

  // Handle adding a new operation
  const handleAddOperation = () => {
    setIsEditingOperation(false);
    const newOp = functionUiService.createEmptyOperation(OperationType.RunScriptCode);
    setCurrentOperation(newOp);
    setOperationTitle(newOp.title);
    setOperationScript(newOp.scriptCode || '');
    setOperationType(OperationType.RunScriptCode);
    setShowOperationDialog(true);
  };

  // Handle editing an operation
  const handleEditOperation = (id: string) => {
    const operation = func.operationsObj?.find(op => op.id === id);
    if (operation) {
      setIsEditingOperation(true);
      setCurrentOperation(operation);
      setOperationTitle(operation.title);
      setOperationScript(operation.scriptCode || '');
      setOperationType(operation.operationType || OperationType.RunScriptCode);
      setShowOperationDialog(true);
    }
  };

  // Handle saving an operation
  const handleSaveOperation = () => {
    if (!operationTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Operation title is required',
        variant: 'destructive',
      });
      return;
    }

    const updatedOperations = [...(func.operationsObj || [])];
    
    if (isEditingOperation && currentOperation) {
      // Update existing operation
      const index = updatedOperations.findIndex(op => op.id === currentOperation.id);
      if (index !== -1) {
        updatedOperations[index] = {
          ...currentOperation,
          title: operationTitle,
        };
      }
    } else {
      // Add new operation
      const newOperation: GsbWfOperation = {
        id: currentOperation?.id || crypto.randomUUID(),
        title: operationTitle,
        operationType: operationType,
      };
      updatedOperations.push(newOperation);
    }

    const updatedFunc: GsbWfFunction = {
      ...func,
      operationsObj: updatedOperations
    };

    onChange(updatedFunc);
    setShowOperationDialog(false);
  };

  // Handle deleting an operation
  const handleDeleteOperation = (id: string) => {
    const updatedOperations = (func.operationsObj || []).filter(op => op.id !== id);
    
    const updatedFunc: GsbWfFunction = {
      ...func,
      operationsObj: updatedOperations
    };

    onChange(updatedFunc);
    
    if (selectedOperationId === id) {
      setSelectedOperationId(null);
    }
  };

  // Handle moving an operation up or down
  const handleMoveOperation = (id: string, direction: 'up' | 'down') => {
    const operations = [...(func.operationsObj || [])];
    const index = operations.findIndex(op => op.id === id);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      // Move up
      [operations[index - 1], operations[index]] = [operations[index], operations[index - 1]];
    } else if (direction === 'down' && index < operations.length - 1) {
      // Move down
      [operations[index], operations[index + 1]] = [operations[index + 1], operations[index]];
    } else {
      return; // Nothing to do
    }

    const updatedFunc: GsbWfFunction = {
      ...func,
      operationsObj: operations
    };

    onChange(updatedFunc);
  };

  // Handle operation data change
  const handleOperationChange = (updatedOperation: GsbWfOperation) => {
    setCurrentOperation(updatedOperation);
    setOperationTitle(updatedOperation.title);
    
    if (updatedOperation.operationType) {
      setOperationType(updatedOperation.operationType);
    }
  };

  // Render the appropriate editor based on operation type
  const renderOperationEditor = () => {
    if (!currentOperation) return null;

    switch (operationType) {
      case OperationType.RunScriptCode:
        return (
          <CodeOperationEditor 
            operation={currentOperation}
            onChange={handleOperationChange}
          />
        );
      case OperationType.SendEmail:
      case OperationType.SendEmailAdvanced:
        return (
          <EmailOperationEditor 
            operation={currentOperation}
            onChange={handleOperationChange}
          />
        );
      case OperationType.SendNotification:
        return (
          <NotificationOperationEditor 
            operation={currentOperation}
            onChange={handleOperationChange}
          />
        );
      case OperationType.CreatePDFDocument:
        return (
          <DocumentOperationEditor 
            operation={currentOperation}
            onChange={handleOperationChange}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground border rounded-md">
            <p>Configuration for {functionUiService.getOperationTypeLabel(operationType)} will be implemented soon.</p>
          </div>
        );
    }
  };

  // Get icon for operation type
  const getOperationIcon = (type?: OperationType) => {
    switch (type) {
      case OperationType.RunScriptCode:
        return <FiCode className="mr-2 h-4 w-4" />;
      case OperationType.SendEmail:
      case OperationType.SendEmailAdvanced:
        return <FiMail className="mr-2 h-4 w-4" />;
      case OperationType.SendSms:
        return <FiPhone className="mr-2 h-4 w-4" />;
      case OperationType.GetEntity:
      case OperationType.SetEntity:
      case OperationType.DeleteEntity:
      case OperationType.SaveEntity:
        return <FiDatabase className="mr-2 h-4 w-4" />;
      case OperationType.CallGSBAPI:
      case OperationType.CallExternalAPI:
        return <FiServer className="mr-2 h-4 w-4" />;
      case OperationType.CreatePDFDocument:
        return <FiFileText className="mr-2 h-4 w-4" />;
      case OperationType.SendNotification:
        return <FiAlertCircle className="mr-2 h-4 w-4" />;
      default:
        return <FiSettings className="mr-2 h-4 w-4" />;
    }
  };

  // Get badge for operation type
  const getOperationTypeBadge = (type?: OperationType) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>;

    switch (type) {
      case OperationType.RunScriptCode:
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          Code
        </Badge>;
      case OperationType.SendEmail:
      case OperationType.SendEmailAdvanced:
      case OperationType.SendSms:
      case OperationType.SendNotification:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Messaging
        </Badge>;
      case OperationType.GetEntity:
      case OperationType.SetEntity:
      case OperationType.DeleteEntity:
      case OperationType.SaveEntity:
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Data
        </Badge>;
      case OperationType.CallGSBAPI:
      case OperationType.CallExternalAPI:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          API
        </Badge>;
      case OperationType.CreatePDFDocument:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Document
        </Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Operations Flow</h3>
        <Button size="sm" onClick={handleAddOperation}>
          <FiPlus className="mr-2 h-4 w-4" />
          Add Operation
        </Button>
      </div>

      {(!func.operationsObj || func.operationsObj.length === 0) ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
          <FiSettings className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No operations defined</p>
            <p className="text-sm text-muted-foreground">
              Add operations to create a workflow for this function.
            </p>
          </div>
          <Button variant="outline" onClick={handleAddOperation}>
            <FiPlus className="mr-2 h-4 w-4" />
            Add First Operation
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {func.operationsObj.map((operation, index) => (
            <Card 
              key={operation.id} 
              className={`border ${selectedOperationId === operation.id ? 'border-primary' : ''}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getOperationIcon(operation.operationType)}
                    <CardTitle className="text-base">{operation.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {getOperationTypeBadge(operation.operationType)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditOperation(operation.id || '')}
                    >
                      <FiEdit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeleteOperation(operation.id || '')}
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-muted-foreground">
                  {functionUiService.getOperationTypeLabel(operation.operationType || OperationType.RunScriptCode)}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Step {index + 1}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    disabled={index === 0}
                    onClick={() => handleMoveOperation(operation.id || '', 'up')}
                  >
                    <FiArrowUp className="h-4 w-4" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    disabled={index === (func.operationsObj?.length || 1) - 1}
                    onClick={() => handleMoveOperation(operation.id || '', 'down')}
                  >
                    <FiArrowDown className="h-4 w-4" />
                    <span className="sr-only">Move down</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Operation Edit Dialog */}
      <Dialog open={showOperationDialog} onOpenChange={setShowOperationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingOperation ? 'Edit Operation' : 'Add New Operation'}
            </DialogTitle>
            <DialogDescription>
              Configure the operation settings and properties.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operationTitle">Title</Label>
                <Input
                  id="operationTitle"
                  value={operationTitle}
                  onChange={(e) => setOperationTitle(e.target.value)}
                  placeholder="Enter operation title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operationType">Operation Type</Label>
                <Select 
                  value={operationType.toString()} 
                  onValueChange={(value) => setOperationType(parseInt(value) as OperationType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OperationType.RunScriptCode.toString()}>Run Script Code</SelectItem>
                    <SelectItem value={OperationType.SendEmail.toString()}>Send Email</SelectItem>
                    <SelectItem value={OperationType.SendSms.toString()}>Send SMS</SelectItem>
                    <SelectItem value={OperationType.GetEntity.toString()}>Get Entity</SelectItem>
                    <SelectItem value={OperationType.SetEntity.toString()}>Set Entity</SelectItem>
                    <SelectItem value={OperationType.SaveEntity.toString()}>Save Entity</SelectItem>
                    <SelectItem value={OperationType.DeleteEntity.toString()}>Delete Entity</SelectItem>
                    <SelectItem value={OperationType.CallGSBAPI.toString()}>Call GSB API</SelectItem>
                    <SelectItem value={OperationType.CallExternalAPI.toString()}>Call External API</SelectItem>
                    <SelectItem value={OperationType.CreatePDFDocument.toString()}>Create PDF Document</SelectItem>
                    <SelectItem value={OperationType.SendNotification.toString()}>Send Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Operation-specific configuration */}
            {renderOperationEditor()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOperationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOperation}>
              <FiSave className="mr-2 h-4 w-4" />
              Save Operation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 