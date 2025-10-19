/**
 * Databricks Genie API Types
 * 
 * These types represent the raw API responses from Databricks Genie API
 * Based on: https://docs.databricks.com/api/workspace/genie
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Message status types as defined in the Genie API
 */
export type GenieMessageStatus = 
  | 'SUBMITTED'
  | 'EXECUTING_QUERY'
  | 'QUERY_RESULT_SUCCESS'
  | 'QUERY_RESULT_ERROR'
  | 'COMPLETED'
  | 'FAILED';

/**
 * Feedback rating types
 */
export type FeedbackRating = 'POSITIVE' | 'NEGATIVE' | 'NONE';

/**
 * Query execution status
 */
export type QueryExecutionStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'CANCELLED'
  | 'FINISHED'
  | 'ERROR';

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

/**
 * Genie Conversation object
 * GET /api/2.0/genie/spaces/{space_id}/conversations
 */
export interface GenieConversation {
  conversation_id: string;
  created_timestamp: number;
  last_updated_timestamp: number;
  space_id: string;
  title: string;
  user_id: number;
}

/**
 * Request to start a new conversation
 * POST /api/2.0/genie/spaces/{space_id}/start-conversation
 */
export interface StartConversationRequest {
  content: string;
}

/**
 * Response from starting a new conversation
 * POST /api/2.0/genie/spaces/{space_id}/start-conversation
 */
export interface StartConversationResponse {
  conversation_id: string;
  conversation: GenieConversation;
  message_id: string;
  message: GenieMessage;
}

/**
 * List conversations response
 * GET /api/2.0/genie/spaces/{space_id}/conversations
 */
export interface ListConversationsResponse {
  conversations: GenieConversation[];
  next_page_token?: string;
}

/**
 * Get conversation response
 * GET /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}
 */
export interface GetConversationResponse {
  conversation: GenieConversation;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

/**
 * Query attachment details
 */
export interface QueryAttachment {
  query: string;
  description?: string;
  statement_id?: string;
  query_result_metadata?: {
    row_count: number;
  };
  suggested_follow_up_questions?: string[];
}

/**
 * Text attachment details
 */
export interface TextAttachment {
  content: string;
}

/**
 * Query result attachment details
 */
export interface QueryResultAttachment {
  statement_id: string;
  row_count: number;
}

/**
 * Genie message attachment
 */
export interface GenieAttachment {
  attachment_id: string;
  query?: QueryAttachment;
  text?: TextAttachment;
  query_result?: QueryResultAttachment;
}

/**
 * Genie message error details
 */
export interface GenieMessageError {
  error_message: string;
}

/**
 * Genie Message object
 * GET /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages/{message_id}
 */
export interface GenieMessage {
  message_id: string;
  conversation_id: string;
  space_id: string;
  user_id: number;
  content: string;
  created_timestamp: number;
  last_updated_timestamp: number;
  status: GenieMessageStatus;
  attachments?: GenieAttachment[];
  error?: GenieMessageError;
  auto_regenerate_count?: number;
  role?: 'user' | 'assistant';
}

/**
 * Request to send a message
 * POST /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages
 */
export interface SendMessageRequest {
  content: string;
}

/**
 * Response from sending a message
 * POST /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages
 */
export interface SendMessageResponse {
  message_id: string;
  message: GenieMessage;
}

/**
 * Get message response
 * GET /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages/{message_id}
 */
export interface GetMessageResponse {
  message: GenieMessage;
}

/**
 * List messages response
 * GET /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages
 */
export interface ListMessagesResponse {
  messages: GenieMessage[];
  next_page_token?: string;
}

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

/**
 * Request to send feedback
 * POST /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages/{message_id}/feedback
 */
export interface SendFeedbackRequest {
  rating: FeedbackRating;
  comment?: string;
}

/**
 * Response from sending feedback
 * POST /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages/{message_id}/feedback
 */
export interface SendFeedbackResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// SQL EXECUTION TYPES
// ============================================================================

/**
 * SQL statement execution status
 */
export interface SqlExecutionStatus {
  state: QueryExecutionStatus;
  error?: {
    error_code: string;
    error_message: string;
  };
}

/**
 * SQL column information
 */
export interface SqlColumn {
  name: string;
  type_text: string;
  type_name: string;
  position: number;
}

/**
 * SQL schema information
 */
export interface SqlSchema {
  column_count: number;
  columns: SqlColumn[];
}

/**
 * SQL chunk information
 */
export interface SqlChunk {
  chunk_index: number;
  row_offset: number;
  row_count: number;
}

/**
 * SQL manifest information
 */
export interface SqlManifest {
  format: string;
  schema: SqlSchema;
  total_chunk_count: number;
  chunks: SqlChunk[];
  total_row_count: number;
  truncated: boolean;
}

/**
 * SQL result data
 */
export interface SqlResult {
  chunk_index: number;
  row_offset: number;
  row_count: number;
  data_array: any[][];
}

/**
 * Execute SQL statement response
 * GET /api/2.0/sql/statements/{statement_id}
 */
export interface ExecuteSqlStatementResponse {
  statement_id: string;
  status: SqlExecutionStatus;
  manifest?: SqlManifest;
  result?: SqlResult;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Standard Databricks API error response
 */
export interface DatabricksApiError {
  error_code: string;
  message: string;
  details?: any;
}

/**
 * HTTP error response wrapper
 */
export interface ApiErrorResponse {
  error: string;
  details?: any;
  status?: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Databricks configuration
 */
export interface DatabricksConfig {
  host: string;
  token: string;
  spaceId: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract attachment type from GenieAttachment
 */
export type AttachmentType = 'query' | 'text' | 'query_result';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page_size?: number;
  page_token?: string;
}

/**
 * List conversations with pagination
 */
export interface ListConversationsParams extends PaginationParams {
  // Additional filters can be added here
}

/**
 * List messages with pagination
 */
export interface ListMessagesParams extends PaginationParams {
  // Additional filters can be added here
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a message has query attachments
 */
export function hasQueryAttachment(message: GenieMessage): boolean {
  return message.attachments?.some(attachment => attachment.query !== undefined) ?? false;
}

/**
 * Type guard to check if a message has text attachments
 */
export function hasTextAttachment(message: GenieMessage): boolean {
  return message.attachments?.some(attachment => attachment.text !== undefined) ?? false;
}

/**
 * Type guard to check if a message has query result attachments
 */
export function hasQueryResultAttachment(message: GenieMessage): boolean {
  return message.attachments?.some(attachment => attachment.query_result !== undefined) ?? false;
}

/**
 * Type guard to check if a message is completed
 */
export function isMessageCompleted(message: GenieMessage): boolean {
  return message.status === 'COMPLETED' || message.status === 'QUERY_RESULT_SUCCESS';
}

/**
 * Type guard to check if a message has failed
 */
export function isMessageFailed(message: GenieMessage): boolean {
  return message.status === 'FAILED' || message.status === 'QUERY_RESULT_ERROR';
}

/**
 * Type guard to check if a message is still processing
 */
export function isMessageProcessing(message: GenieMessage): boolean {
  return message.status === 'SUBMITTED' || message.status === 'EXECUTING_QUERY';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract query attachment from message
 */
export function getQueryAttachment(message: GenieMessage): QueryAttachment | undefined {
  return message.attachments?.find(attachment => attachment.query)?.query;
}

/**
 * Extract text attachment from message
 */
export function getTextAttachment(message: GenieMessage): TextAttachment | undefined {
  return message.attachments?.find(attachment => attachment.text)?.text;
}

/**
 * Extract query result attachment from message
 */
export function getQueryResultAttachment(message: GenieMessage): QueryResultAttachment | undefined {
  return message.attachments?.find(attachment => attachment.query_result)?.query_result;
}

/**
 * Extract suggested questions from message
 */
export function getSuggestedQuestions(message: GenieMessage): string[] {
  const queryAttachment = getQueryAttachment(message);
  return queryAttachment?.suggested_follow_up_questions ?? [];
}

/**
 * Extract statement ID from message
 */
export function getStatementId(message: GenieMessage): string | undefined {
  const queryAttachment = getQueryAttachment(message);
  return queryAttachment?.statement_id;
}

/**
 * Extract query text from message
 */
export function getQueryText(message: GenieMessage): string | undefined {
  const queryAttachment = getQueryAttachment(message);
  return queryAttachment?.query;
}
