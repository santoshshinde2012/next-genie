/**
 * API Route: List all conversations
 * GET /api/genie/conversations
 */
import { NextResponse } from 'next/server';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';

export async function GET() {
  try {
    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.listConversations();
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error listing conversations:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to list conversations',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}

