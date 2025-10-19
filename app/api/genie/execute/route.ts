/**
 * API Route: Execute query using statement ID
 * GET /api/genie/execute?statementId={id}
 */
import { NextRequest, NextResponse } from 'next/server';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statementId = searchParams.get('statementId');
    
    if (!statementId) {
      return NextResponse.json(
        { error: 'statementId is required' },
        { status: 400 }
      );
    }

    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.executeQuery(statementId);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error executing query:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to execute query',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}
