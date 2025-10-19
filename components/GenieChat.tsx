/**
 * Main Genie Chat Component
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { useGenie } from '@/lib/hooks/useGenie';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RefreshCw, MessageSquare } from 'lucide-react';

export const GenieChat: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    conversationId,
    startConversation,
    sendMessage,
    clearConversation,
  } = useGenie();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (conversationId) {
      sendMessage(content);
    } else {
      startConversation(content);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <CardTitle>Databricks Genie Chat</CardTitle>
          </div>
          {conversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>
        {conversationId && (
          <div className="text-xs text-gray-500 mt-2">
            Conversation ID: {conversationId}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation with Genie
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Ask questions about your data using natural language. Genie will
                generate SQL queries and return insights from your Databricks
                workspace.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Example questions:
                </p>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleSendMessage(
                        'Show me the top 10 customers by revenue'
                      )
                    }
                    className="w-full justify-start text-left"
                  >
                    Show me the top 10 customers by revenue
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleSendMessage(
                        'What was our total sales last month?'
                      )
                    }
                    className="w-full justify-start text-left"
                  >
                    What was our total sales last month?
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleSendMessage(
                        'Which products have the highest return rate?'
                      )
                    }
                    className="w-full justify-start text-left"
                  >
                    Which products have the highest return rate?
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <ChatInput
            onSubmit={handleSendMessage}
            disabled={isLoading}
            isLoading={isLoading}
            placeholder={
              conversationId
                ? 'Ask a follow-up question...'
                : 'Ask a question about your data...'
            }
          />
          {isLoading && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
              Genie is thinking...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

