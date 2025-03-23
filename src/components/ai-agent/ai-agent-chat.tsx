'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AIMessage } from './ai-message';
import { UserMessage } from './user-message';
import { Loader2, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for messages
export type MessageType = 'user' | 'ai';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  data?: any;
  needsConfirmation?: boolean;
  operation?: any;
}

export function AIAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{messageId: string, operation: any} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Add AI placeholder message for loading state
    const aiMessage: Message = {
      id: generateId(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Call AI Agent API
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.filter(m => !m.isLoading),
        }),
      });

      const result = await response.json();

      // Update AI message with response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessage.id
            ? {
                ...msg,
                content: result.message,
                data: result.data,
                isLoading: false,
                needsConfirmation: result.needsConfirmation,
                operation: result.operation
              }
            : msg
        )
      );

      // If operation needs confirmation, set pending confirmation
      if (result.needsConfirmation) {
        setPendingConfirmation({
          messageId: aiMessage.id,
          operation: result.operation
        });
      }
    } catch (error) {
      // Handle error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessage.id
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isLoading: false }
            : msg
        )
      );
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOperation = async (confirm: boolean) => {
    if (!pendingConfirmation) return;

    setIsProcessing(true);

    // Add user confirmation message
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: confirm ? "Yes, proceed with the operation." : "No, cancel the operation.",
      timestamp: new Date(),
    };

    // Add AI placeholder message for loading state
    const aiMessage: Message = {
      id: generateId(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);

    try {
      if (confirm) {
        // Get the original message that needed confirmation
        const originalMessage = messages.find(m => m.id === pendingConfirmation.messageId);

        // Call AI Agent API with confirmation
        const response = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: originalMessage?.content || "Execute operation",
            history: messages.filter(m => !m.isLoading),
            confirm: true
          }),
        });

        const result = await response.json();

        // Update AI message with response
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessage.id
              ? {
                  ...msg,
                  content: result.message,
                  data: result.data,
                  isLoading: false
                }
              : msg
          )
        );
      } else {
        // Operation was cancelled
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessage.id
              ? {
                  ...msg,
                  content: "Operation cancelled.",
                  isLoading: false
                }
              : msg
          )
        );
      }
    } catch (error) {
      // Handle error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessage.id
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isLoading: false }
            : msg
        )
      );
      console.error('Error processing confirmation:', error);
    } finally {
      setIsProcessing(false);
      setPendingConfirmation(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-230px)]">
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Welcome to the AI Agent</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me to create tables, query data, or perform operations on your database.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => setInput("Show me all tables in the database")}
                    className="justify-start text-left"
                  >
                    Show me all tables
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInput("Create a new customer table with name, email, and phone fields")}
                    className="justify-start text-left"
                  >
                    Create a new table
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInput("Query all products with price greater than 50")}
                    className="justify-start text-left"
                  >
                    Query data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInput("Show me the structure of the users table")}
                    className="justify-start text-left"
                  >
                    Explore table structure
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  <UserMessage message={message} />
                ) : (
                  <AIMessage message={message} />
                )}

                {/* Show confirmation UI if this message needs confirmation and is pending */}
                {message.needsConfirmation && pendingConfirmation?.messageId === message.id && (
                  <div className="ml-12 mt-3">
                    <Alert>
                      <AlertDescription>
                        This operation requires confirmation. Do you want to proceed?
                      </AlertDescription>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          onClick={() => handleConfirmOperation(true)}
                          variant="default"
                          size="sm"
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          onClick={() => handleConfirmOperation(false)}
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </Alert>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              placeholder="Ask me to query or create data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isProcessing || !!pendingConfirmation}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isProcessing || !!pendingConfirmation}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
          {pendingConfirmation && (
            <p className="text-xs text-muted-foreground mt-2">
              Please confirm or cancel the pending operation before sending a new message.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
