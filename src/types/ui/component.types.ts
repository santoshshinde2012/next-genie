/**
 * UI Component Types
 * 
 * These types represent the UI layer components and their props
 * They are optimized for React component usage
 */

import { 
  ChatMessage, 
  Conversation, 
  FeedbackRating 
} from '../domain/chat.types';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * ChatMessage component props
 */
export interface ChatMessageProps {
  message: ChatMessage;
  conversationId?: string | null;
  onFeedback?: (messageId: string, rating: FeedbackRating, comment?: string) => void;
  onSuggestedQuestion?: (question: string) => void;
}


/**
 * ConversationSidebar component props
 */
export interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * ChatInput component props
 */
export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES (UI Layer)
// ============================================================================

/**
 * Poll message request for UI
 */
export interface PollMessageRequest {
  conversationId: string;
  messageId: string;
}

/**
 * Poll message response for UI
 */
export interface PollMessageResponse {
  message: {
    id: string;
    status: string;
    content: string;
    attachments?: any[];
    error?: {
      error_message: string;
    };
  };
}

/**
 * Send message request with conversation ID for UI
 */
export interface SendMessageRequestWithConversationId {
  conversationId: string;
  content: string;
}

/**
 * Send feedback request with IDs for UI
 */
export interface SendFeedbackRequestWithIds {
  conversationId: string;
  messageId: string;
  rating: 'POSITIVE' | 'NEGATIVE';
  comment?: string;
}

/**
 * Conversations response for UI
 */
export interface ConversationsResponse {
  conversations: Conversation[];
}

/**
 * Messages response for UI
 */
export interface MessagesResponse {
  messages: any[];
}

// ============================================================================
// API RESPONSE TYPES (UI Layer)
// ============================================================================

/**
 * Execute query response for UI
 */
export interface ExecuteQueryResponse {
  statement_id: string;
  status: {
    state: string;
  };
  manifest?: {
    format: string;
    schema: {
      column_count: number;
      columns: {
        name: string;
        type_text: string;
        type_name: string;
        position: number;
      }[];
    };
    total_chunk_count: number;
    chunks: {
      chunk_index: number;
      row_offset: number;
      row_count: number;
    }[];
    total_row_count: number;
    truncated: boolean;
  };
  result?: {
    chunk_index: number;
    row_offset: number;
    row_count: number;
    data_array: any[][];
  };
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * useGenie hook return type
 */
export interface UseGenieReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  conversationTitle: string | null;
  startConversation: (content: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  sendFeedback: (messageId: string, rating: FeedbackRating, comment?: string) => Promise<any>;
}

/**
 * useConversations hook return type
 */
export interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Feedback form data
 */
export interface FeedbackFormData {
  rating: FeedbackRating;
  comment?: string;
}

/**
 * Message form data
 */
export interface MessageFormData {
  content: string;
}

/**
 * Conversation form data
 */
export interface ConversationFormData {
  title?: string;
  initialMessage?: string;
}

// ============================================================================
// MODAL TYPES
// ============================================================================

/**
 * Feedback modal state
 */
export interface FeedbackModalState {
  isOpen: boolean;
  messageId: string | null;
  rating: FeedbackRating | null;
  comment: string;
}

/**
 * Modal component props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Feedback modal props
 */
export interface FeedbackModalProps extends ModalProps {
  messageId: string;
  onSubmit: (rating: FeedbackRating, comment?: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// TABLE TYPES
// ============================================================================

/**
 * Table column definition
 */
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * Table props
 */
export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

/**
 * Query result table props
 */
export interface QueryResultTableProps {
  data: any[][];
  columns: Array<{ name: string; type: string }>;
  rowCount?: number;
  loading?: boolean;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

/**
 * Navigation item
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

/**
 * Sidebar props
 */
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  activeItemId?: string;
}

// ============================================================================
// LOADING TYPES
// ============================================================================

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Loading component props
 */
export interface LoadingProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error state
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
  code?: string;
}

/**
 * Error component props
 */
export interface ErrorProps {
  error: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Theme configuration
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

/**
 * Theme context type
 */
export interface ThemeContextType {
  theme: ThemeConfig;
  isDark: boolean;
  toggleTheme: () => void;
}

// ============================================================================
// RESPONSIVE TYPES
// ============================================================================

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/**
 * Responsive props
 */
export interface ResponsiveProps {
  xs?: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Transition props
 */
export interface TransitionProps {
  in: boolean;
  timeout?: number;
  onEnter?: () => void;
  onExit?: () => void;
  children: React.ReactNode;
}
