/**
 * API Route: Send a message to an existing conversation
 * POST /api/genie/message
 */
import { NextRequest, NextResponse } from 'next/server';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';
import { SendMessageRequest } from '@/src/types/api/databricks.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SendMessageRequest & { 
      conversationId: string 
    };
    
    if (!body.content || !body.conversationId) {
      return NextResponse.json(
        { error: 'Content and conversationId are required' },
        { status: 400 }
      );
    }

    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.sendMessage(body.conversationId, {
      content: body.content,
    });
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error sending message:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send message',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}

