/**
 * Databricks Genie API endpoint constants
 */
export const GENIE_API_ENDPOINTS = {
  START_CONVERSATION: '/api/2.0/genie/spaces/{spaceId}/start-conversation',
  SEND_MESSAGE: '/api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}/messages',
  GET_MESSAGE: '/api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}/messages/{messageId}',
  LIST_CONVERSATIONS: '/api/2.0/genie/spaces/{spaceId}/conversations',
  GET_CONVERSATION: '/api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}',
  LIST_MESSAGES: '/api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}/messages',
  EXECUTE_QUERY: '/api/2.0/sql/statements/{statementId}',
  SEND_FEEDBACK: '/api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}/messages/{messageId}/feedback',
} as const;

/**
 * Polling configuration for message status checking
 */
export const POLLING_CONFIG = {
  INTERVAL_MS: 5000, // Poll every 5 seconds
  MAX_DURATION_MS: 600000, // Maximum 10 minutes
  INITIAL_BACKOFF_MS: 2000, // Start exponential backoff after 2 minutes
  BACKOFF_MULTIPLIER: 1.5,
} as const;

/**
 * Message status types
 */
export const MESSAGE_STATUS = {
  EXECUTING_QUERY: 'EXECUTING_QUERY',
  QUERY_RESULT_SUCCESS: 'QUERY_RESULT_SUCCESS',
  QUERY_RESULT_ERROR: 'QUERY_RESULT_ERROR',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

