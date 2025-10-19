/**
 * Databricks Genie API client utilities
 */
import axios, { AxiosInstance } from 'axios';
import { GENIE_API_ENDPOINTS } from '@/lib/constants/genie';
import {
  DatabricksConfig,
  StartConversationRequest,
  StartConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetMessageResponse,
  ListConversationsResponse,
  ListMessagesResponse,
  ExecuteSqlStatementResponse,
  SendFeedbackRequest,
  SendFeedbackResponse,
} from '@/src/types/api/databricks.types';

export class GenieClient {
  private client: AxiosInstance;
  private spaceId: string;

  constructor(config: DatabricksConfig) {
    this.spaceId = config.spaceId;
    this.client = axios.create({
      baseURL: config.host,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Start a new conversation with Genie
   */
  async startConversation(
    request: StartConversationRequest
  ): Promise<StartConversationResponse> {
    const url = GENIE_API_ENDPOINTS.START_CONVERSATION.replace(
      '{spaceId}',
      this.spaceId
    );
    
    const response = await this.client.post<StartConversationResponse>(
      url,
      request
    );
    
    return response.data;
  }

  /**
   * Send a message to an existing conversation
   */
  async sendMessage(
    conversationId: string,
    request: SendMessageRequest
  ): Promise<SendMessageResponse> {
    const url = GENIE_API_ENDPOINTS.SEND_MESSAGE
      .replace('{spaceId}', this.spaceId)
      .replace('{conversationId}', conversationId);
    
    const response = await this.client.post<SendMessageResponse>(
      url,
      request
    );
    
    return response.data;
  }

  /**
   * Get a specific message from a conversation
   */
  async getMessage(
    conversationId: string,
    messageId: string
  ): Promise<GetMessageResponse> {
    const url = GENIE_API_ENDPOINTS.GET_MESSAGE
      .replace('{spaceId}', this.spaceId)
      .replace('{conversationId}', conversationId)
      .replace('{messageId}', messageId);
    
    const response = await this.client.get<any>(url);
    
    // Handle different response structures
    if (response.data.message) {
      // Standard response with message wrapper
      return response.data;
    } else if (response.data.message_id) {
      // Direct message object
      return { message: response.data };
    } else {
      throw new Error('Unexpected response structure from getMessage API');
    }
  }

  /**
   * List all conversations in the space
   */
  async listConversations(): Promise<ListConversationsResponse> {
    const url = GENIE_API_ENDPOINTS.LIST_CONVERSATIONS.replace(
      '{spaceId}',
      this.spaceId
    );
    
    const response = await this.client.get<ListConversationsResponse>(url);
    
    return response.data;
  }

  /**
   * List all messages in a conversation
   */
  async listMessages(conversationId: string): Promise<ListMessagesResponse> {
    const url = GENIE_API_ENDPOINTS.LIST_MESSAGES
      .replace('{spaceId}', this.spaceId)
      .replace('{conversationId}', conversationId);
    
    const response = await this.client.get<ListMessagesResponse>(url);
    
    return response.data;
  }

  /**
   * Execute a query using statement ID
   */
  async executeQuery(statementId: string): Promise<ExecuteSqlStatementResponse> {
    const url = GENIE_API_ENDPOINTS.EXECUTE_QUERY.replace('{statementId}', statementId);
    
    const response = await this.client.get<ExecuteSqlStatementResponse>(url);
    
    return response.data;
  }

  /**
   * Send feedback for a message
   */
  async sendFeedback(
    conversationId: string,
    messageId: string,
    feedback: SendFeedbackRequest
  ): Promise<SendFeedbackResponse> {
    const url = GENIE_API_ENDPOINTS.SEND_FEEDBACK
      .replace('{spaceId}', this.spaceId)
      .replace('{conversationId}', conversationId)
      .replace('{messageId}', messageId);
    
    const response = await this.client.post<SendFeedbackResponse>(url, feedback);
    
    return response.data;
  }

  /**
   * Poll for message completion with exponential backoff
   */
  async pollMessageStatus(
    conversationId: string,
    messageId: string,
    onProgress?: (status: string) => void
  ): Promise<GetMessageResponse> {
    const startTime = Date.now();
    let pollInterval = 5000; // Start with 5 seconds
    const maxDuration = 600000; // 10 minutes max
    
    while (Date.now() - startTime < maxDuration) {
      try {
        const response = await this.getMessage(conversationId, messageId);
        
        // Check if response has the expected structure
        if (!response || !response.message) {
          throw new Error('Invalid response structure: missing message data');
        }
        
        if (!response.message.status) {
          throw new Error('Invalid response structure: missing message status');
        }
        
        const status = response.message.status;
        
        if (onProgress) {
          onProgress(status);
        }
        
        // Check if message is in a conclusive state
        if (
          status === 'COMPLETED' ||
          status === 'QUERY_RESULT_SUCCESS' ||
          status === 'QUERY_RESULT_ERROR' ||
          status === 'FAILED'
        ) {
          return response;
        }
        
        // Implement exponential backoff after 2 minutes
        if (Date.now() - startTime > 120000) {
          pollInterval = Math.min(pollInterval * 1.5, 30000); // Max 30 seconds
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        // If it's a structure error, throw immediately
        if (error.message.includes('Invalid response structure')) {
          throw error;
        }
        
        // For other errors, log and continue polling
        console.error('Error during polling, retrying:', error.message);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error('Message polling timeout after 10 minutes');
  }
}

