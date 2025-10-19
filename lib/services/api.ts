/**
 * Centralized API service for frontend API calls
 * Provides a clean interface for all API operations with proper error handling and retry logic
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Import API types
import {
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
  GenieMessage,
} from '@/src/types/api/databricks.types';

// Import domain types
import {
  Conversation,
} from '@/src/types/domain/chat.types';

// Import UI types
import {
  PollMessageRequest,
  PollMessageResponse,
  SendMessageRequestWithConversationId,
  SendFeedbackRequestWithIds,
  ConversationsResponse,
  MessagesResponse,
  ExecuteQueryResponse,
} from '@/src/types/ui/component.types';

// Re-export UI types for convenience
export type {
  PollMessageRequest,
  PollMessageResponse,
  SendMessageRequestWithConversationId,
  SendFeedbackRequestWithIds,
  ConversationsResponse,
  MessagesResponse,
  ExecuteQueryResponse,
} from '@/src/types/ui/component.types';

// Re-export API types for convenience
export type {
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
  GenieMessage,
} from '@/src/types/api/databricks.types';

// Re-export domain types
export type { Conversation } from '@/src/types/domain/chat.types';

/**
 * Centralized API service class
 */
export class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<AxiosResponse<T>> {
    let lastError: AxiosError;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as AxiosError;
        
        // Don't retry on the last attempt
        if (attempt === retryConfig.maxRetries) {
          break;
        }
        
        // Check if we should retry this error
        if (!retryConfig.retryCondition || !retryConfig.retryCondition(lastError)) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt),
          retryConfig.maxDelay
        );
        
        console.log(`API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Handle API errors and convert to standardized format
   */
  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.error || data?.message || 'Server error occurred',
        status: error.response.status,
        details: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Start a new conversation
   */
  async startConversation(request: StartConversationRequest): Promise<StartConversationResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.post<StartConversationResponse>('/genie/start', request)
    );
    return response.data;
  }

  /**
   * Send a message to an existing conversation
   */
  async sendMessage(request: SendMessageRequestWithConversationId): Promise<SendMessageResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.post<SendMessageResponse>('/genie/message', request)
    );
    return response.data;
  }

  /**
   * Poll for message status and result
   */
  async pollMessage(request: PollMessageRequest): Promise<PollMessageResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.post<PollMessageResponse>('/genie/poll', request)
    );
    return response.data;
  }

  /**
   * Send feedback for a message
   */
  async sendFeedback(request: SendFeedbackRequestWithIds): Promise<SendFeedbackResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.post<SendFeedbackResponse>('/genie/feedback', request)
    );
    return response.data;
  }

  /**
   * Get list of conversations
   */
  async getConversations(): Promise<ConversationsResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.get<ListConversationsResponse>('/genie/conversations')
    );
    return response.data;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<MessagesResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.get<ListMessagesResponse>(`/genie/messages?conversationId=${conversationId}`)
    );
    return response.data;
  }

  /**
   * Execute a query using statement ID
   */
  async executeQuery(statementId: string): Promise<ExecuteQueryResponse> {
    const response = await this.executeWithRetry(() => 
      this.client.get<ExecuteSqlStatementResponse>(`/genie/execute?statementId=${statementId}`)
    );
    return response.data;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing purposes
export default ApiService;
