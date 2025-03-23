import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/services/rag.service';
import { Message } from '@/components/ai-agent/ai-agent-chat';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message, history, confirm } = body;

    // Validate the request
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize RAG service
    const ragService = RAGService.getInstance();

    // Process the message
    const result = await ragService.executeQuery(
      message,
      history as Message[],
      !!confirm
    );

    // Return the response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing AI agent request:', error);
    return NextResponse.json(
      {
        message: `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`,
        error: true
      },
      { status: 500 }
    );
  }
}
