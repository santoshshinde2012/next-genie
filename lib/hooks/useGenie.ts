/**
 * Custom React hook for interacting with Databricks Genie API
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  ChatMessage, 
  MessageStatus,
  UseGenieReturn,
  ExecuteQueryResponse
} from '@/src/types';
import { generateTitleFromMessages } from '@/lib/utils/conversation-title';
import { apiService } from '@/lib/services/api';

// UseGenieReturn is now imported from frontend types

export function useGenie(): UseGenieReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);

  const addUserMessage = (content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addAssistantMessage = (
    id: string,
    content: string,
    status?: MessageStatus,
    queryResult?: any,
    query?: string
  ): ChatMessage => {
    const assistantMessage: ChatMessage = {
      id,
      role: 'assistant',
      content,
      timestamp: Date.now(),
      status,
      queryResult,
      query,
    };
    setMessages(prev => [...prev, assistantMessage]);
    return assistantMessage;
  };

  const updateAssistantMessage = (
    id: string,
    updates: Partial<ChatMessage>
  ) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  };

  const pollForResult = async (
    conversationId: string,
    messageId: string
  ): Promise<void> => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;
    
    try {
      while (attempts < maxAttempts) {
        attempts++;
        
        // Poll for the specific message status
        const response = await apiService.pollMessage({
          conversationId,
          messageId,
        });
        
        const { message } = response;
        
        if (!message || !message.status) {
          throw new Error('Invalid message response');
        }

        const status = message.status as MessageStatus;

        // Extract query and result from attachments
        let query = '';
        let queryResult = null;
        let content = message.content || 'Processing your request...';
        let statementId = '';
        let suggestedQuestions: string[] = [];

        if (message.attachments && message.attachments.length > 0) {
          for (const attachment of message.attachments) {
            if (attachment.query) {
              query = attachment.query.query;
              statementId = attachment.query.statement_id || '';
              if (attachment.query.suggested_follow_up_questions) {
                suggestedQuestions = attachment.query.suggested_follow_up_questions;
              }
            }
            if (attachment.query_result) {
              queryResult = attachment.query_result;
            }
            if (attachment.text) {
              content = attachment.text.content;
            }
          }
        }

        // Check if message is in a conclusive state
        if (
          status === 'COMPLETED' ||
          status === 'QUERY_RESULT_SUCCESS' ||
          status === 'QUERY_RESULT_ERROR' ||
          status === 'FAILED'
        ) {
          // If we have a statement ID but no query result, execute the query
          if (statementId && !queryResult && status === 'COMPLETED') {
            try {
              const executeResponse = await apiService.executeQuery(statementId);
              if (executeResponse.result && executeResponse.manifest) {
                // Transform Databricks SQL API response to our format
                queryResult = {
                  row_count: executeResponse.manifest.total_row_count,
                  data_array: executeResponse.result.data_array,
                  column_info: executeResponse.manifest.schema.columns.map((col: any) => ({
                    name: col.name,
                    type: col.type_text
                  }))
                };
              }
            } catch (err) {
              console.error('Error executing query:', err);
            }
          }

          // Update the assistant message with final result
          updateAssistantMessage(messageId, {
            content,
            status,
            query,
            queryResult,
            suggestedQuestions,
            error: message.error?.error_message,
          });
          
          return; // Done polling
        }

        // Update the assistant message with current status
        updateAssistantMessage(messageId, {
          content,
          status,
          query,
        });

        // Wait before next poll (5 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Timeout - max attempts reached
      throw new Error('Polling timeout - message is taking too long to complete');
    } catch (err: any) {
      console.error('Error polling for result:', err);
      
      let errorMessage = 'Unknown error occurred';
      let userFriendlyMessage = 'Error retrieving response';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide user-friendly messages for common errors
        if (errorMessage.includes('Permission denied')) {
          userFriendlyMessage = 'Access denied. You may not have permission to access this conversation.';
        } else if (errorMessage.includes('not found')) {
          userFriendlyMessage = 'Conversation not found. It may have been deleted or you may not have access.';
        } else if (errorMessage.includes('Missing Databricks configuration')) {
          userFriendlyMessage = 'Configuration error. Please check your Databricks settings.';
        } else if (errorMessage.includes('timeout')) {
          userFriendlyMessage = 'Request is taking too long. Please try again.';
        } else {
          userFriendlyMessage = errorMessage;
        }
      }
      
      updateAssistantMessage(messageId, {
        content: userFriendlyMessage,
        error: errorMessage,
        status: 'FAILED',
        suggestedQuestions: [],
      });
    }
  };

  const startConversation = useCallback(
    async (content: string) => {
      setIsLoading(true);
      setError(null);

      // Add user message immediately to UI
      addUserMessage(content);

      try {
        // Start conversation
        const response = await apiService.startConversation({ content });
        
        const { conversation_id, message_id } = response;
        
        if (!conversation_id || !message_id) {
          throw new Error('Invalid response: missing conversation_id or message_id');
        }

        setConversationId(conversation_id);
        // Generate a better title from the content
        setConversationTitle(generateTitleFromMessages([{ role: 'user', content }]));

        // Add placeholder assistant message
        addAssistantMessage(
          message_id,
          'Processing your question...',
          'EXECUTING_QUERY'
        );

        // Poll for result
        await pollForResult(conversation_id, message_id);
      } catch (err: any) {
        console.error('Error starting conversation:', err);
        
        let errorMessage = 'Failed to start conversation';
        let userFriendlyMessage = 'Failed to start conversation';
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          if (errorMessage.includes('Missing Databricks configuration')) {
            userFriendlyMessage = 'Configuration error. Please check your Databricks settings.';
          } else if (errorMessage.includes('Permission denied')) {
            userFriendlyMessage = 'Access denied. Please check your Databricks permissions.';
          } else if (errorMessage.includes('Space not found')) {
            userFriendlyMessage = 'Genie Space not found. Please check your Space ID.';
          } else {
            userFriendlyMessage = errorMessage;
          }
        }
        
        setError(userFriendlyMessage);
        
        addAssistantMessage(
          Date.now().toString(),
          userFriendlyMessage,
          'FAILED'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addUserMessage, addAssistantMessage, pollForResult]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) {
        setError('No active conversation');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message immediately to UI
      addUserMessage(content);

      try {
        // Send message
        const response = await apiService.sendMessage({
          conversationId,
          content,
        });
        const { message_id } = response;

        // Add placeholder assistant message
        addAssistantMessage(
          message_id,
          'Processing your question...',
          'EXECUTING_QUERY'
        );

        // Poll for result
        await pollForResult(conversationId, message_id);
      } catch (err: any) {
        console.error('Error sending message:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        
        addAssistantMessage(
          Date.now().toString(),
          errorMessage,
          'FAILED'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, addUserMessage, addAssistantMessage, pollForResult]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setConversationTitle(null);
    setError(null);
  }, []);

  // Update conversation title when messages change
  useEffect(() => {
    if (messages.length > 0 && !conversationTitle) {
      const newTitle = generateTitleFromMessages(messages);
      setConversationTitle(newTitle);
    }
  }, [messages, conversationTitle]);

  const sendFeedback = useCallback(async (
    messageId: string,
    rating: 'POSITIVE' | 'NEGATIVE',
    comment?: string
  ) => {
    if (!conversationId) {
      throw new Error('No active conversation');
    }

    try {
      const response = await apiService.sendFeedback({
        conversationId,
        messageId,
        rating,
        comment,
      });

      return response;
    } catch (err: any) {
      console.error('Error sending feedback:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to send feedback');
    }
  }, [conversationId]);

  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch conversation messages from the API
      const response = await apiService.getMessages(conversationId);
      const { messages: apiMessages } = response;
      
      // Convert API messages to our ChatMessage format
      // Each API message contains BOTH user query (content) and assistant response (attachments)
      const chatMessages: ChatMessage[] = [];
      
      for (const msg of apiMessages) {
        // 1. Add user message from 'content' field
        chatMessages.push({
          id: `${msg.message_id}-user`,
          role: 'user',
          content: msg.content,
          timestamp: msg.created_timestamp,
          status: msg.status,
        });
        
        // 2. Process attachments as assistant responses
        if (msg.attachments && msg.attachments.length > 0) {
          for (const attachment of msg.attachments) {
            let queryResult = attachment.query_result;
            let query = '';
            let content = '';
            let suggestedQuestions: string[] = [];
            
            // Handle query attachment
            if (attachment.query) {
              query = attachment.query.query;
              const statementId = attachment.query.statement_id;
              suggestedQuestions = attachment.query.suggested_follow_up_questions || [];
              
              // If we have a statement ID but no query result, execute the query
              if (statementId && !queryResult && msg.status === 'COMPLETED') {
                try {
                  const executeResponse = await apiService.executeQuery(statementId);
                  if (executeResponse.result && executeResponse.manifest) {
                    // Transform Databricks SQL API response to our format
                    queryResult = {
                      row_count: executeResponse.manifest.total_row_count,
                      data_array: executeResponse.result.data_array,
                      column_info: executeResponse.manifest.schema.columns.map((col: any) => ({
                        name: col.name,
                        type: col.type_text
                      }))
                    };
                  }
                } catch (err) {
                  console.error('Error executing query:', err);
                }
              }
              
              // Use description or generate content from query
              content = attachment.query.description || `Query executed with ${queryResult?.row_count || 0} results`;
            }
            
            // Handle text attachment
            if (attachment.text) {
              content = attachment.text.content;
            }
            
            // Add assistant message for this attachment
            if (content || query || queryResult) {
              chatMessages.push({
                id: `${msg.message_id}-assistant-${attachment.attachment_id}`,
                role: 'assistant',
                content: content || 'Processing...',
                timestamp: msg.last_updated_timestamp,
                status: msg.status,
                query,
                queryResult,
                error: msg.error?.error_message,
                suggestedQuestions,
              });
            }
          }
        }
      }
      
      setConversationId(conversationId);
      setMessages(chatMessages);
      // Generate title from the loaded messages
      setConversationTitle(generateTitleFromMessages(chatMessages));
    } catch (err: any) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      setConversationId(conversationId);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    conversationTitle,
    startConversation,
    sendMessage,
    clearConversation,
    loadConversation,
    sendFeedback,
  };
}

