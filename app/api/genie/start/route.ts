/**
 * API Route: Start a new Genie conversation
 * POST /api/genie/start
 */
import { NextRequest, NextResponse } from 'next/server';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';
import { StartConversationRequest } from '@/src/types/api/databricks.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as StartConversationRequest;
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.startConversation(body);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to start conversation',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}

