/**
 * Chat Message Component
 */
'use client';

import React, { useState } from 'react';
import { ChatMessageProps } from '@/src/types';
import { User, Bot, CheckCircle, XCircle, Loader2, Code, MessageCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

// ChatMessageProps is now imported from frontend types

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  conversationId, 
  onFeedback,
  onSuggestedQuestion
}) => {
  const isUser = message.role === 'user';
  const [feedbackState, setFeedbackState] = useState<'none' | 'positive' | 'negative'>('none');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedRating, setSelectedRating] = useState<'POSITIVE' | 'NEGATIVE' | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  

  const renderQueryResult = () => {
    if (!message.queryResult) return null;

    const { column_info, data_array, row_count } = message.queryResult;

    if (!data_array || data_array.length === 0) {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-200">
          No results returned (0 rows)
        </div>
      );
    }

    return (
      <div className="mt-2">
        <div className="mb-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-between">
          <span>Query Results</span>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {row_count || data_array.length} rows
            </span>
            <button
              onClick={() => copyToClipboard(
                JSON.stringify(message.queryResult, null, 2), 
                `result-${message.id}`
              )}
              className={cn(
                "p-1 rounded transition-colors",
                copiedItems.has(`result-${message.id}`)
                  ? "bg-green-100 text-green-600"
                  : "hover:bg-gray-200 text-gray-500"
              )}
              title="Copy Results"
            >
              {copiedItems.has(`result-${message.id}`) ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-xs lg:text-sm">
            <thead className="bg-gray-100">
              <tr>
                {column_info?.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data_array.slice(0, 10).map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {cell !== null && cell !== undefined ? String(cell) : <span className="text-gray-400">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data_array.length > 10 && (
          <div className="mt-2 text-xs text-gray-500 text-center py-2 bg-gray-50 rounded-lg">
            Showing 10 of {data_array.length} rows
          </div>
        )}
      </div>
    );
  };


  const handleFeedback = async (rating: 'POSITIVE' | 'NEGATIVE', comment?: string) => {
    if (!onFeedback || !conversationId || isSubmittingFeedback) return;
    
    setIsSubmittingFeedback(true);
    try {
      await onFeedback(message.id, rating, comment);
      setFeedbackState(rating === 'POSITIVE' ? 'positive' : 'negative');
      setShowFeedbackModal(false);
      setFeedbackComment('');
      setSelectedRating(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleFeedbackClick = (rating: 'POSITIVE' | 'NEGATIVE') => {
    if (rating === 'NEGATIVE') {
      setShowFeedbackModal(true);
      setSelectedRating(rating);
    } else {
      handleFeedback(rating);
    }
  };

  const handleSubmitFeedback = () => {
    if (selectedRating) {
      handleFeedback(selectedRating, feedbackComment.trim() || undefined);
    }
  };

  const handleModalClose = () => {
    setShowFeedbackModal(false);
    setFeedbackComment('');
    setSelectedRating(null);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleModalClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitFeedback();
    }
  };

  return (
    <>
      <div className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}>
        <div className={cn(
          'flex gap-3 max-w-[80%]',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          {/* Avatar */}
          <div
            className={cn(
              'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
              isUser 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            )}
          >
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>

          {/* Message Content */}
          <div className={cn(
            'flex flex-col',
            isUser ? 'items-end' : 'items-start'
          )}>
            {/* Message Bubble */}
            <div
              className={cn(
                'px-4 py-3 rounded-2xl shadow-sm max-w-full group relative',
                isUser 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md border-0' 
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
              )}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              
              {/* Copy Button */}
              <button
                onClick={copyMessage}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100",
                  isUser 
                    ? "bg-white/20 hover:bg-white/30 text-white" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600",
                  copiedMessage && "opacity-100"
                )}
                title="Copy message"
              >
                {copiedMessage ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>

          {/* Error Message */}
          {message.error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <strong>Error:</strong> {message.error}
            </div>
          )}

          {/* SQL Query */}
          {message.query && (
            <div className="mt-2">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 bg-gray-50 rounded-lg">
                  <Code className="h-4 w-4" />
                  <span>View Generated SQL</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(message.query!, `sql-${message.id}`);
                      }}
                      className={cn(
                        "p-1 rounded transition-colors",
                        copiedItems.has(`sql-${message.id}`)
                          ? "bg-green-100 text-green-600"
                          : "hover:bg-gray-200 text-gray-500"
                      )}
                      title="Copy SQL"
                    >
                      {copiedItems.has(`sql-${message.id}`) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-xl text-xs overflow-x-auto border border-gray-700 shadow-inner">
                  {message.query}
                </pre>
              </details>
            </div>
          )}

          {/* Query Results */}
          {renderQueryResult()}

          {/* Suggested Follow-up Questions - Only show for assistant messages */}
          {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">💡 Suggested follow-up questions:</div>
              <div className="flex flex-wrap gap-2">
                {message.suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (onSuggestedQuestion) {
                        onSuggestedQuestion(question);
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section - Show for all completed assistant messages except processing */}
          {!isUser && onFeedback && conversationId && 
           message.status !== 'EXECUTING_QUERY' && 
           message.status !== 'SUBMITTED' && 
           !message.content.includes('Processing your question') && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500">Was this helpful?</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFeedbackClick('POSITIVE')}
                    disabled={isSubmittingFeedback}
                    className={cn(
                      'p-1.5 rounded-lg transition-all duration-200',
                      feedbackState === 'positive'
                        ? 'bg-green-100 text-green-600 ring-2 ring-green-500'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50',
                      isSubmittingFeedback && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Yes, this was helpful"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleFeedbackClick('NEGATIVE')}
                    disabled={isSubmittingFeedback}
                    className={cn(
                      'p-1.5 rounded-lg transition-all duration-200',
                      feedbackState === 'negative'
                        ? 'bg-red-100 text-red-600 ring-2 ring-red-500'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50',
                      isSubmittingFeedback && 'opacity-50 cursor-not-allowed'
                    )}
                    title="No, this was not helpful"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    disabled={isSubmittingFeedback}
                    className={cn(
                      'p-1.5 rounded-lg transition-all duration-200',
                      'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
                      isSubmittingFeedback && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Add a comment"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {feedbackState !== 'none' && (
                <span className="text-xs text-green-600 mt-1 block font-medium">
                  {feedbackState === 'positive' ? '✓ Thank you for your feedback!' : '✓ Thanks for the feedback'}
                </span>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-1 text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleModalClose}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Was this helpful?
              </h3>
              <button
                onClick={handleModalClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmittingFeedback}
              >
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedRating('POSITIVE')}
                disabled={isSubmittingFeedback}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium flex-1',
                  selectedRating === 'POSITIVE'
                    ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                    : 'border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300',
                  isSubmittingFeedback && 'opacity-50 cursor-not-allowed'
                )}
              >
                <CheckCircle className="h-4 w-4" />
                Yes
              </button>
              <button
                onClick={() => setSelectedRating('NEGATIVE')}
                disabled={isSubmittingFeedback}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium flex-1',
                  selectedRating === 'NEGATIVE'
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                    : 'border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300',
                  isSubmittingFeedback && 'opacity-50 cursor-not-allowed'
                )}
              >
                <XCircle className="h-4 w-4" />
                No
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add a comment (optional)
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                className="w-full p-3 border-2 border-gray-300 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                rows={3}
                disabled={isSubmittingFeedback}
              />
              <div className="text-xs text-gray-500 mt-1">
                Press Ctrl+Enter to submit
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleModalClose}
                disabled={isSubmittingFeedback}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback || !selectedRating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-sm px-6"
              >
                {isSubmittingFeedback ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send feedback'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

