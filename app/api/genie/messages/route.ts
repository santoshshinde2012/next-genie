/**
 * API Route: List messages in a conversation
 * GET /api/genie/messages?conversationId={id}
 */
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.listMessages(conversationId);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error listing messages:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to list messages',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}
