/**
 * Chat Window Component
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Button } from '@/components/ui/Button';
import { 
  MessageSquare, 
  RefreshCw, 
  Sparkles,
  Copy,
  Check,
  XCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { generateTitleFromMessages } from '@/lib/utils/conversation-title';
import { useApp } from '@/src/contexts/AppContext';

export const ChatWindow: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    conversationId,
    conversationTitle,
    handleSendMessage,
    handleNewConversation,
    sendFeedback,
    handleSuggestedQuestion,
    getSelectedConversation,
  } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedConversation, setCopiedConversation] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWelcomeMessage = () => {
    if (conversationId) {
      return {
        title: 'Continue your conversation',
        subtitle: 'Ask follow-up questions to explore your data further. Genie will suggest relevant questions based on your previous queries.'
      };
    }
    
    return {
      title: 'Start a conversation with Genie',
      subtitle: 'Ask questions about your data using natural language. Genie will generate SQL queries and return insights from your Databricks workspace.'
    };
  };

  const welcome = getWelcomeMessage();

  // Get the display title from selected conversation or generate from messages
  const selectedConversation = getSelectedConversation();
  const displayTitle = selectedConversation?.title || 
                      conversationTitle || 
                      generateTitleFromMessages(messages) || 
                      (conversationId ? 'Loading...' : 'New Conversation');

  const copyConversationId = async () => {
    if (conversationId) {
      try {
        await navigator.clipboard.writeText(conversationId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } catch (err) {
        console.error('Failed to copy conversation ID:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = conversationId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
    }
  };


  const copyWholeConversation = async () => {
    try {
      const conversationText = messages.map(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
      }).join('\n\n');
      
      await navigator.clipboard.writeText(conversationText);
      setCopiedConversation(true);
      setTimeout(() => setCopiedConversation(false), 3000);
    } catch (err) {
      console.error('Failed to copy conversation:', err);
    }
  };

  const exportToPDF = async () => {
    if (!messages.length) return;
    
    setIsExporting(true);
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Conversation Export - ${displayTitle}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .meta {
              color: #6b7280;
              font-size: 14px;
            }
            .message {
              margin-bottom: 20px;
              padding: 15px;
              border-radius: 8px;
            }
            .user-message {
              background-color: #f3f4f6;
              border-left: 4px solid #8b5cf6;
            }
            .assistant-message {
              background-color: #f9fafb;
              border-left: 4px solid #3b82f6;
            }
            .message-header {
              font-weight: bold;
              margin-bottom: 8px;
              color: #374151;
            }
            .message-content {
              white-space: pre-wrap;
            }
            .query-result {
              margin-top: 10px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 4px;
            }
            .query-result-header {
              padding: 8px 10px;
              background-color: #f1f5f9;
              border-bottom: 1px solid #e2e8f0;
              font-weight: bold;
              font-size: 12px;
              color: #374151;
            }
            .query-result table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            .query-result th {
              background-color: #f1f5f9;
              padding: 8px 10px;
              text-align: left;
              font-weight: bold;
              color: #374151;
              border-bottom: 2px solid #e2e8f0;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .query-result td {
              padding: 8px 10px;
              border-bottom: 1px solid #e2e8f0;
              color: #1f2937;
            }
            .query-result tr:last-child td {
              border-bottom: none;
            }
            .query-result tr:hover {
              background-color: #f9fafb;
            }
            .row-count {
              padding: 6px 10px;
              background-color: #f9f5ff;
              color: #7c3aed;
              font-size: 11px;
              border-top: 1px solid #e2e8f0;
              text-align: right;
            }
            .sql-query {
              margin-top: 10px;
              padding: 10px;
              background-color: #1f2937;
              color: #f9fafb;
              border-radius: 4px;
              font-family: monospace;
              font-size: 12px;
              overflow-x: auto;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .message { 
                break-inside: avoid; 
                page-break-inside: avoid;
              }
              .query-result { 
                break-inside: avoid; 
                page-break-inside: avoid;
              }
              .query-result table { 
                break-inside: auto;
              }
              .query-result tr { 
                break-inside: avoid; 
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${displayTitle}</div>
            <div class="meta">
              Conversation ID: ${conversationId}<br>
              Exported on: ${new Date().toLocaleString()}<br>
              Messages: ${messages.length}
            </div>
          </div>
          
          ${messages.map(msg => {
            let queryResultHtml = '';
            if (msg.queryResult) {
              const { column_info, data_array, row_count } = msg.queryResult;
              
              if (data_array && data_array.length > 0) {
                queryResultHtml = `
                  <div class="query-result">
                    <div class="query-result-header">Query Results</div>
                    <table>
                      <thead>
                        <tr>
                          ${column_info?.map((col: any) => `<th>${col.name}</th>`).join('') || ''}
                        </tr>
                      </thead>
                      <tbody>
                        ${data_array.map((row: any) => `
                          <tr>
                            ${row.map((cell: any) => `
                              <td>${cell !== null && cell !== undefined ? String(cell) : '-'}</td>
                            `).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <div class="row-count">
                      ${row_count || data_array.length} rows total
                    </div>
                  </div>
                `;
              } else {
                queryResultHtml = `
                  <div class="query-result">
                    <div class="query-result-header">Query Results</div>
                    <div style="padding: 10px; color: #6b7280; font-size: 12px;">
                      No results returned (0 rows)
                    </div>
                  </div>
                `;
              }
            }
            
            return `
              <div class="message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}">
                <div class="message-header">
                  ${msg.role === 'user' ? 'User' : 'Assistant'} 
                  <span style="font-weight: normal; color: #6b7280; font-size: 12px;">
                    (${new Date(msg.timestamp).toLocaleString()})
                  </span>
                </div>
                <div class="message-content">${msg.content}</div>
                ${msg.query ? `<div class="sql-query">${msg.query}</div>` : ''}
                ${queryResultHtml}
              </div>
            `;
          }).join('')}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export conversation to PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Conversation Header */}
      {conversationId && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 py-2">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-medium text-gray-900 truncate">
                      {displayTitle}
                    </h1>
                    {isLoading && (
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-pulse" />
                        <span className="text-xs text-purple-600 font-medium">Genie is thinking...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {conversationId && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-600 font-medium">
                          ID: {conversationId}
                        </span>
                        <button
                          onClick={copyConversationId}
                          className={cn(
                            "p-0.5 rounded transition-all duration-200",
                            copiedId 
                              ? "text-green-600" 
                              : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          )}
                          title={copiedId ? "Copied!" : "Copy conversation ID"}
                        >
                          {copiedId ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                    {messages.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={exportToPDF}
                      disabled={isExporting}
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg transition-all duration-200 flex items-center justify-center",
                        isExporting
                          ? "bg-blue-100 text-blue-600 cursor-not-allowed"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                      )}
                      title={isExporting ? "Exporting..." : "Export to PDF"}
                    >
                      {isExporting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={copyWholeConversation}
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg transition-all duration-200 flex items-center justify-center",
                        copiedConversation
                          ? "bg-green-100 text-green-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                      )}
                      title={copiedConversation ? "Copied!" : "Copy conversation"}
                    >
                      {copiedConversation ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  title="New Chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto px-4">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30"></div>
                <Sparkles className="relative h-16 w-16 text-purple-600 mx-auto" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {welcome.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {welcome.subtitle}
              </p>
            </div>
            
            <div className="w-full max-w-md p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
              <p className="text-sm text-purple-800 font-medium">
                💡 Type your question in the input below to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto px-2 lg:px-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                conversationId={conversationId}
                onFeedback={sendFeedback}
                onSuggestedQuestion={handleSuggestedQuestion}
              />
            ))}
            
            {/* Processing indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                  <div className="h-3 w-3 bg-purple-600 rounded-full animate-pulse" />
                  <span className="text-sm text-purple-700 font-medium">Genie is processing your request...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="max-w-5xl mx-auto p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        <div className="max-w-5xl mx-auto">
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
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse" />
              Genie is thinking...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
