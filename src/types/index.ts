/**
 * Types Index
 * 
 * Central export point for all application types
 * Organized by layer: API, Domain, UI
 */

// ============================================================================
// API TYPES
// ============================================================================

// Databricks API types
export * from './api/databricks.types';

// ============================================================================
// DOMAIN TYPES
// ============================================================================

// Chat domain types
export * from './domain/chat.types';

// ============================================================================
// UI TYPES
// ============================================================================

// Component types
export * from './ui/component.types';

// ============================================================================
// CONFIG TYPES
// ============================================================================

// Application configuration types
export * from './config/app.types';

// ============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

// Re-export commonly used types with shorter names
export type {
  GenieMessageStatus as MessageStatus,
  GenieConversation,
  GenieMessage,
  GenieAttachment,
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
  DatabricksConfig,
} from './api/databricks.types';

export type {
  ChatMessage,
  Conversation,
  FeedbackRating,
  QueryResult,
} from './domain/chat.types';

export type {
  ChatMessageProps,
  ConversationSidebarProps,
  UseGenieReturn,
  UseConversationsReturn,
} from './ui/component.types';
