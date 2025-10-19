/**
 * Chat Input Component
 */
'use client';

import React, { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = 'Ask a question about your data...',
  isLoading = false,
}) => {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts or when not loading
  useEffect(() => {
    if (!isLoading && !disabled) {
      inputRef.current?.focus();
    }
  }, [isLoading, disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (input.trim() && !disabled && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key submission (but not when composing IME)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const isSubmitDisabled = disabled || isLoading || !input.trim();

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1 min-w-0 pr-12"
          maxLength={2000}
        />
        {input.length > 1500 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {input.length}/2000
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="px-4 py-2 min-w-[44px] h-11 shadow-sm transition-all duration-200"
        title={isLoading ? "Processing..." : "Send message (Enter)"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

