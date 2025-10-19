/**
 * API Route: Send feedback for a message
 * POST /api/genie/feedback
 */
import { NextRequest, NextResponse } from 'next/server';
import { GenieClient } from '@/lib/utils/genie-client';
import { getDatabricksConfig } from '@/lib/config/databricks';
import { SendFeedbackRequest } from '@/src/types/api/databricks.types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SendFeedbackRequest & {
      conversationId: string;
      messageId: string;
    };
    
    if (!body.conversationId || !body.messageId || !body.rating) {
      return NextResponse.json(
        { error: 'conversationId, messageId, and rating are required' },
        { status: 400 }
      );
    }

    const config = getDatabricksConfig();
    const client = new GenieClient(config);
    
    const response = await client.sendFeedback(
      body.conversationId,
      body.messageId,
      {
        rating: body.rating,
        comment: body.comment,
      }
    );
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error sending feedback:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send feedback',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}
