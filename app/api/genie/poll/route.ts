/**
 * API Route: Poll for message status
 * POST /api/genie/poll
 */
import { NextRequest, NextResponse } from 'next/server';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { 
      conversationId: string;
      messageId: string;
    };
    
    if (!body.conversationId || !body.messageId) {
      return NextResponse.json(
        { error: 'conversationId and messageId are required' },
        { status: 400 }
      );
    }

    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.pollMessageStatus(
      body.conversationId,
      body.messageId
    );
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error polling message:', error);
    
    // Handle specific Databricks API errors
    if (error.response?.status === 403) {
      return NextResponse.json(
        { 
          error: 'Permission denied. You may not have access to this conversation or it may not exist.',
          details: error.response?.data 
        },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { 
          error: 'Conversation or message not found.',
          details: error.response?.data 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to poll message status',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}

