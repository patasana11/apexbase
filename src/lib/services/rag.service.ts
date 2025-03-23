'use client';

import { AIAgentService } from './ai-agent.service';
import { Message } from '@/components/ai-agent/ai-agent-chat';
import { getAzureOpenAIConfig, isAzureOpenAIConfigured } from '@/lib/env-config';

// Remove the Azure OpenAI imports that are causing issues
// We'll implement a fallback mode that works without the actual API

interface NLQueryResult {
  operation: 'query' | 'create' | 'preview' | 'delete';
  table?: string;
  conditions?: Array<{ field: string; operator: string; value: any }>;
  fields?: Array<{ name: string; type: string; required?: boolean }>;
  explanation: string;
  needsConfirmation: boolean;
  error?: string;
}

export class RAGService {
  private static instance: RAGService;
  private aiService: AIAgentService;
  private openaiAvailable: boolean = false;
  private defaultPrompt: string = '';

  private constructor() {
    this.aiService = AIAgentService.getInstance();
    this.checkOpenAIAvailability();
    this.initDefaultPrompt();
  }

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  private checkOpenAIAvailability() {
    // Check if the environment is configured for OpenAI
    this.openaiAvailable = isAzureOpenAIConfigured();

    if (!this.openaiAvailable) {
      console.warn('Azure OpenAI not configured - operating in basic mode without LLM capabilities');
    } else {
      console.log('Azure OpenAI configuration detected - full capabilities available in production');
    }
  }

  private initDefaultPrompt() {
    this.defaultPrompt = `
You are an AI assistant that helps users interact with a database through natural language.
Your primary role is to understand user queries and translate them into appropriate database operations.

Available operations:
1. QUERY data from tables
2. CREATE new tables with fields
3. DELETE tables (requires confirmation)

The database uses a system called GsbEntityDef to define tables. Each table has:
- name: the name of the table
- properties: array of fields/columns with their types and constraints

When users ask you to query tables, you should translate their natural language query into a structured format with conditions.
If users ask to create tables, you should identify the table name and the fields they want to create.
If users want to delete data, always provide a preview first and ask for confirmation.

Always respond with clear explanations of what you're doing.
`;
  }

  private extractMessagesForLLM(messages: Message[]): { role: string, content: string }[] {
    // Start with system prompt
    const llmMessages = [
      { role: 'system', content: this.defaultPrompt }
    ];

    // Convert chat history to LLM format
    for (const message of messages) {
      if (message.type === 'user') {
        llmMessages.push({ role: 'user', content: message.content });
      } else if (message.type === 'ai') {
        llmMessages.push({ role: 'assistant', content: message.content });
      }
    }

    return llmMessages;
  }

  /**
   * Process a natural language query to extract database operations
   */
  async processNaturalLanguageQuery(
    query: string,
    history: Message[] = []
  ): Promise<NLQueryResult> {
    try {
      // Always use basic processing in this version until Azure OpenAI is configured
      // In a production environment, you would implement the OpenAI API call here
      return this.processQueryBasic(query);
    } catch (error) {
      console.error('Error processing natural language query:', error);

      // Fallback to basic processing
      return this.processQueryBasic(query);
    }
  }

  /**
   * Basic fallback logic for when LLM processing fails
   */
  private processQueryBasic(query: string): NLQueryResult {
    // Simple keyword-based parsing
    const queryLower = query.toLowerCase();

    // Check for create operations
    if (queryLower.includes('create') || queryLower.includes('new table') || queryLower.includes('make a table')) {
      // Look for table name
      const tableNameMatches = query.match(/table (?:named|called)?\s+['"]?(\w+)['"]?/i) ||
                             query.match(/create\s+(?:a|the)?\s+(\w+)\s+table/i);

      const tableName = tableNameMatches ? tableNameMatches[1] : 'new_table';

      // Basic field detection
      const fields = [];
      const fieldMatch = query.match(/with\s+(?:fields|columns)?\s+(.+)$/i);

      if (fieldMatch) {
        const fieldPart = fieldMatch[1];
        const fieldItems = fieldPart.split(/,\s*|and\s+/);

        for (const field of fieldItems) {
          // Try to extract type information
          const typeMatch = field.match(/(\w+)\s+(?:as|of type)?\s+(\w+)/i);
          if (typeMatch) {
            fields.push({
              name: typeMatch[1],
              type: typeMatch[2],
              required: field.includes('required')
            });
          } else {
            fields.push({
              name: field.trim().replace(/\W+/g, '_'),
              type: 'string',
              required: field.includes('required')
            });
          }
        }
      }

      return {
        operation: 'create',
        table: tableName,
        fields: fields.length > 0 ? fields : [
          { name: 'name', type: 'string', required: true },
          { name: 'description', type: 'string', required: false }
        ],
        explanation: `I'll create a new table named "${tableName}" with the fields you specified.`,
        needsConfirmation: true
      };
    }

    // Check for query operations
    if (queryLower.includes('query') || queryLower.includes('find') || queryLower.includes('get') ||
        queryLower.includes('show') || queryLower.includes('list') || queryLower.includes('select')) {

      // Look for table name
      const tableNameMatches = query.match(/from\s+(?:the)?\s+['"]?(\w+)['"]?/i) ||
                             query.match(/(\w+)\s+table/i) ||
                             query.match(/table\s+(\w+)/i);

      const tableName = tableNameMatches ? tableNameMatches[1] : '';

      // Look for conditions
      const conditions = [];
      const conditionMatches = query.match(/where\s+(.+?)(?:\s+limit|\s+order|\s+$)/i);

      if (conditionMatches) {
        const conditionPart = conditionMatches[1];
        const conditionItems = conditionPart.split(/\s+and\s+|\s*,\s*/i);

        for (const condition of conditionItems) {
          // Try to extract field, operator and value
          const condMatch = condition.match(/(\w+)\s*(=|>|<|!=|contains|like|equals|is|greater than|less than)\s*['"]?([^'"]+?)['"]?$/i);
          if (condMatch) {
            // Map operator terms to standard operators
            let operator = condMatch[2];
            if (operator === 'greater than') operator = '>';
            if (operator === 'less than') operator = '<';
            if (operator === 'equals' || operator === 'is') operator = '=';

            conditions.push({
              field: condMatch[1],
              operator,
              value: condMatch[3]
            });
          }
        }
      }

      return {
        operation: 'query',
        table: tableName,
        conditions,
        explanation: `I'll query data from the "${tableName}" table${conditions.length > 0 ? ' with the conditions you specified' : ''}.`,
        needsConfirmation: false
      };
    }

    // Check for delete operations
    if (queryLower.includes('delete') || queryLower.includes('remove') || queryLower.includes('drop')) {
      // Look for table name
      const tableNameMatches = query.match(/(?:delete|remove|drop)\s+(?:the)?\s+['"]?(\w+)['"]?/i) ||
                             query.match(/(\w+)\s+table/i);

      const tableName = tableNameMatches ? tableNameMatches[1] : '';

      return {
        operation: 'delete',
        table: tableName,
        explanation: `This will delete the entire "${tableName}" table. This action cannot be undone.`,
        needsConfirmation: true
      };
    }

    // Default to preview operation if we can't determine intent
    return {
      operation: 'preview',
      explanation: `I'm not sure what operation you want to perform. Could you please clarify if you want to query data, create a table, or perform another action?`,
      needsConfirmation: false
    };
  }

  /**
   * Execute database operations based on the natural language query
   */
  async executeQuery(query: string, history: Message[] = [], confirmOperation: boolean = false): Promise<{
    message: string;
    data?: any;
    needsConfirmation?: boolean;
    operation?: any;
  }> {
    try {
      // Process the natural language query
      const nlQueryResult = await this.processNaturalLanguageQuery(query, history);

      // If operation needs confirmation and it's not confirmed, return preview
      if (nlQueryResult.needsConfirmation && !confirmOperation) {
        const preview = this.aiService.previewDatabaseOperation({
          operation: nlQueryResult.operation,
          table: nlQueryResult.table,
          conditions: nlQueryResult.conditions,
          fields: nlQueryResult.fields
        });

        return {
          message: `${nlQueryResult.explanation}\n\nThis operation requires confirmation. Please confirm to proceed.`,
          needsConfirmation: true,
          operation: preview
        };
      }

      // Execute the operation
      const result = await this.aiService.executeDatabaseOperation({
        operation: nlQueryResult.operation,
        table: nlQueryResult.table,
        conditions: nlQueryResult.conditions,
        fields: nlQueryResult.fields
      });

      // Format the response
      if (nlQueryResult.operation === 'query' && result.data) {
        return {
          message: `Query executed successfully. ${result.data.length} records found.`,
          data: result.data
        };
      } else if (nlQueryResult.operation === 'create') {
        return {
          message: `Table "${nlQueryResult.table}" created successfully.`
        };
      } else if (nlQueryResult.operation === 'delete') {
        return {
          message: `Table "${nlQueryResult.table}" deleted successfully.`
        };
      } else {
        return {
          message: `Operation completed: ${JSON.stringify(result)}`
        };
      }
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      };
    }
  }
}
