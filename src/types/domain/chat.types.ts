/**
 * Chat Domain Types
 * 
 * These types represent the business domain models for chat functionality
 * They are transformed from API types for better domain modeling
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

/**
 * Message status for domain operations
 */
export type MessageStatus = 
  | 'EXECUTING_QUERY'
  | 'QUERY_RESULT_SUCCESS'
  | 'QUERY_RESULT_ERROR'
  | 'COMPLETED'
  | 'FAILED'
  | 'SUBMITTED';

/**
 * User role in conversation
 */
export type UserRole = 'user' | 'assistant';

/**
 * Feedback rating for domain operations
 */
export type FeedbackRating = 'POSITIVE' | 'NEGATIVE';

// ============================================================================
// CHAT MESSAGE DOMAIN
// ============================================================================

/**
 * Query result for display in chat
 */
export interface QueryResult {
  row_count?: number;
  data_array?: any[][];
  column_info?: {
    name: string;
    type: string;
  }[];
  statement_id?: string;
}

/**
 * Chat message domain model
 * Represents a message in the chat interface
 */
export interface ChatMessage {
  id: string;
  role: UserRole;
  content: string;
  timestamp: number;
  status?: MessageStatus;
  queryResult?: QueryResult;
  query?: string;
  error?: string;
  suggestedQuestions?: string[];
}

// ============================================================================
// CONVERSATION DOMAIN
// ============================================================================

/**
 * Conversation domain model
 * Represents a conversation in the chat interface
 */
export interface Conversation {
  conversation_id: string;
  title: string;
  created_timestamp: number;
  last_updated_timestamp: number;
}

// ============================================================================
// FEEDBACK DOMAIN
// ============================================================================

/**
 * Feedback request for domain operations
 */
export interface FeedbackRequest {
  messageId: string;
  rating: FeedbackRating;
  comment?: string;
}

/**
 * Feedback response from domain operations
 */
export interface FeedbackResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// DOMAIN SERVICES
// ============================================================================

/**
 * Chat service interface
 */
export interface ChatService {
  startConversation(content: string): Promise<void>;
  sendMessage(content: string): Promise<void>;
  clearConversation(): void;
  loadConversation(conversationId: string): Promise<void>;
  sendFeedback(request: FeedbackRequest): Promise<FeedbackResponse>;
}

/**
 * Conversation service interface
 */
export interface ConversationService {
  loadConversations(): Promise<void>;
  selectConversation(conversationId: string): Promise<void>;
  createNewConversation(): void;
}

// ============================================================================
// DOMAIN EVENTS
// ============================================================================

/**
 * Base domain event
 */
export interface DomainEvent {
  id: string;
  timestamp: number;
  type: string;
}

/**
 * Message sent event
 */
export interface MessageSentEvent extends DomainEvent {
  type: 'MESSAGE_SENT';
  messageId: string;
  conversationId: string;
  content: string;
}

/**
 * Message received event
 */
export interface MessageReceivedEvent extends DomainEvent {
  type: 'MESSAGE_RECEIVED';
  messageId: string;
  conversationId: string;
  content: string;
  status: MessageStatus;
}

/**
 * Feedback submitted event
 */
export interface FeedbackSubmittedEvent extends DomainEvent {
  type: 'FEEDBACK_SUBMITTED';
  messageId: string;
  conversationId: string;
  rating: FeedbackRating;
  comment?: string;
}

/**
 * Conversation started event
 */
export interface ConversationStartedEvent extends DomainEvent {
  type: 'CONVERSATION_STARTED';
  conversationId: string;
  title: string;
}

/**
 * Union type for all domain events
 */
export type ChatDomainEvent = 
  | MessageSentEvent
  | MessageReceivedEvent
  | FeedbackSubmittedEvent
  | ConversationStartedEvent;

// ============================================================================
// DOMAIN VALUE OBJECTS
// ============================================================================

/**
 * Message ID value object
 */
export class MessageId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Message ID cannot be empty');
    }
  }

  equals(other: MessageId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Conversation ID value object
 */
export class ConversationId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Conversation ID cannot be empty');
    }
  }

  equals(other: ConversationId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * User content value object
 */
export class UserContent {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User content cannot be empty');
    }
    if (value.length > 10000) {
      throw new Error('User content cannot exceed 10000 characters');
    }
  }

  equals(other: UserContent): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// ============================================================================
// DOMAIN AGGREGATES
// ============================================================================

/**
 * Conversation aggregate
 * Represents a conversation with its messages and state
 */
export class ConversationAggregate {
  private _messages: ChatMessage[] = [];
  private _events: ChatDomainEvent[] = [];

  constructor(
    public readonly id: ConversationId,
    public readonly title: string,
    public readonly createdAt: number,
    public updatedAt: number = Date.now()
  ) {}

  get messages(): readonly ChatMessage[] {
    return [...this._messages];
  }

  get events(): readonly ChatDomainEvent[] {
    return [...this._events];
  }

  addMessage(message: ChatMessage): void {
    this._messages.push(message);
    this.updatedAt = Date.now();
    
    const event: MessageReceivedEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'MESSAGE_RECEIVED',
      messageId: message.id,
      conversationId: this.id.value,
      content: message.content,
      status: message.status || 'SUBMITTED'
    };
    
    this._events.push(event);
  }

  updateMessage(messageId: string, updates: Partial<ChatMessage>): void {
    const messageIndex = this._messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      this._messages[messageIndex] = { ...this._messages[messageIndex], ...updates };
      this.updatedAt = Date.now();
    }
  }

  submitFeedback(messageId: string, rating: FeedbackRating, comment?: string): void {
    const event: FeedbackSubmittedEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'FEEDBACK_SUBMITTED',
      messageId,
      conversationId: this.id.value,
      rating,
      comment
    };
    
    this._events.push(event);
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
