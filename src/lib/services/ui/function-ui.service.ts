'use client';

import { FunctionService } from '@/lib/gsb/services/function/function.service';
import { GsbWfFunction, GsbWfOperation, OperationType, isGsbFunctionEmpty } from '@/lib/gsb/models/gsb-function.model';

/**
 * Service for managing function UI components and interactions
 */
export class FunctionUiService {
  private functionService: FunctionService;
  private static instance: FunctionUiService;

  constructor() {
    this.functionService = new FunctionService();
  }

  /**
   * Get the singleton instance of FunctionUiService
   * @returns The singleton instance
   */
  public static getInstance(): FunctionUiService {
    if (!FunctionUiService.instance) {
      FunctionUiService.instance = new FunctionUiService();
    }
    return FunctionUiService.instance;
  }

  /**
   * Get a list of functions with pagination
   * @param page Current page number (1-based)
   * @param pageSize Number of items per page
   * @returns List of functions and total count
   */
  async getFunctions(page: number = 1, pageSize: number = 10): Promise<{ functions: GsbWfFunction[]; totalCount: number }> {
    const result = await this.functionService.getFunctions(page, pageSize);
    // Parse operations JSON if present
    result.functions = result.functions.map(func => this.parseOperations(func));
    return result;
  }

  /**
   * Search for functions based on a search term
   * @param searchTerm The search term
   * @param page Current page number (1-based)
   * @param pageSize Number of items per page
   * @returns Matching functions and total count
   */
  async searchFunctions(searchTerm: string, page: number = 1, pageSize: number = 10): Promise<{ functions: GsbWfFunction[]; totalCount: number }> {
    const result = await this.functionService.searchFunctions(searchTerm, page, pageSize);
    // Parse operations JSON if present
    result.functions = result.functions.map(func => this.parseOperations(func));
    return result;
  }

  /**
   * Get function by ID
   * @param id Function ID
   * @returns The function or null if not found
   */
  async getFunction(id: string): Promise<GsbWfFunction | null> {
    const func = await this.functionService.getFunctionById(id);
    if (func) {
      return this.parseOperations(func);
    }
    return null;
  }

  /**
   * Create a new function
   * @param func Function data
   * @returns ID of the created function or null if creation failed
   */
  async createFunction(func: GsbWfFunction): Promise<string | null> {
    // Serialize operations before saving
    const funcToSave = this.serializeOperations(func);
    return this.functionService.createFunction(funcToSave);
  }

  /**
   * Update an existing function
   * @param func Updated function data
   * @returns Success status
   */
  async updateFunction(func: GsbWfFunction): Promise<boolean> {
    // Serialize operations before saving
    const funcToSave = this.serializeOperations(func);
    return this.functionService.updateFunction(funcToSave);
  }

  /**
   * Delete a function
   * @param id Function ID to delete
   * @returns Success status
   */
  async deleteFunction(id: string): Promise<boolean> {
    return this.functionService.deleteFunction(id);
  }

  /**
   * Execute a function
   * @param id Function ID to execute
   * @param params Parameters to pass to the function
   * @returns Function execution result
   */
  async executeFunction(id: string, params: any = {}): Promise<any> {
    return this.functionService.executeFunction(id, params);
  }

  /**
   * Get default Monaco editor options for code editing
   * @returns Monaco editor options
   */
  getMonacoEditorOptions() {
    return {
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on' as const,
      theme: 'vs-dark',
    };
  }

  /**
   * Create a new empty function template
   * @param name Function name
   * @returns New function template
   */
  createEmptyFunction(name: string): GsbWfFunction {
    return {
      id: '',
      name: name,
      title: name,
      code: this.getDefaultFunctionCode(),
      standalone: true,
      operationsObj: []
    };
  }

  /**
   * Get default function code template
   * @returns Default function code
   */
  getDefaultFunctionCode(): string {
    return `/**
 * Sample function template
 * @param {object} context - The execution context
 * @param {object} input - The input data
 * @returns {object} - The function result
 */
async function execute(context, input) {
  // Your code here
  
  return {
    success: true,
    message: "Function executed successfully",
    data: input
  };
}`;
  }

  /**
   * Create a new empty operation for a function
   * @param type The operation type
   * @returns A new operation object
   */
  createEmptyOperation(type: OperationType): GsbWfOperation {
    const title = this.getOperationTypeLabel(type);
    
    const operation: GsbWfOperation = {
      id: crypto.randomUUID(),
      title: title,
      operationType: type
    };

    // Set default properties based on type
    switch (type) {
      case OperationType.RunScriptCode:
        operation.scriptCode = this.getDefaultScriptCode();
        break;
      case OperationType.SendEmail:
        operation.notification = {
          title: 'Email Notification',
          message: 'This is a sample email notification',
          recipients: {
            contacts: [],
            users: [],
            roles: [],
            groups: [],
            excludeUsers: []
          }
        };
        break;
    }

    return operation;
  }

  /**
   * Get a human-readable label for an operation type
   * @param type The operation type enum value
   * @returns A human-readable label
   */
  getOperationTypeLabel(type: OperationType): string {
    switch (type) {
      case OperationType.SetProperties: return 'Set Properties';
      case OperationType.SendSms: return 'Send SMS';
      case OperationType.CallGSBAPI: return 'Call GSB API';
      case OperationType.CallExternalAPI: return 'Call External API';
      case OperationType.SendEmail: return 'Send Email';
      case OperationType.SendEmailAdvanced: return 'Send Advanced Email';
      case OperationType.RunScriptCode: return 'Run Script Code';
      case OperationType.CommitChanges: return 'Commit Changes';
      case OperationType.GetEntity: return 'Get Entity';
      case OperationType.SetEntity: return 'Set Entity';
      case OperationType.DeleteEntity: return 'Delete Entity';
      case OperationType.CreatePDFDocument: return 'Create PDF Document';
      case OperationType.SendNotification: return 'Send Notification';
      case OperationType.SaveEntity: return 'Save Entity';
      default: return 'Unknown Operation';
    }
  }

  /**
   * Get a default script code template for script operations
   * @returns Default script code
   */
  getDefaultScriptCode(): string {
    return `// Sample script code for operation
function process(input, context) {
  console.log('Processing input:', input);
  return {
    success: true,
    output: input
  };
}`;
  }

  /**
   * Parse operations JSON string into operation objects
   * @param func The function with operations
   * @returns The function with parsed operation objects
   */
  private parseOperations(func: GsbWfFunction): GsbWfFunction {
    if (func.operations && !func.operationsObj) {
      try {
        func.operationsObj = JSON.parse(func.operations);
      } catch (e) {
        console.error('Error parsing operations JSON:', e);
        func.operationsObj = [];
      }
    } else if (!func.operationsObj) {
      func.operationsObj = [];
    }
    return func;
  }

  /**
   * Serialize operation objects into JSON string
   * @param func The function with operation objects
   * @returns The function with serialized operations
   */
  private serializeOperations(func: GsbWfFunction): GsbWfFunction {
    if (func.operationsObj?.length) {
      func.operations = JSON.stringify(func.operationsObj);
    } else {
      func.operations = '[]';
    }
    return func;
  }

  /**
   * Check if a function is using operations workflow
   * @param func The function to check
   * @returns True if operations are used, false if code is used
   */
  isUsingOperations(func: GsbWfFunction): boolean {
    if (!func) return false;
    
    // If we have operations but no code, it's operations-based
    if ((func.operationsObj?.length || 0) > 0 && (!func.code || func.code.trim() === '')) {
      return true;
    }
    
    // If we have code but no operations, it's code-based
    if ((func.code && func.code.trim() !== '') && (!func.operationsObj?.length)) {
      return false;
    }
    
    // If we have both or neither, default to code-based
    return false;
  }
} 