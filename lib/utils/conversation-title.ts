/**
 * Utility functions for generating conversation titles
 */

/**
 * Generate a meaningful conversation title from the first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return 'New Conversation';
  }

  const content = firstMessage.trim();
  
  // Clean up the content for better title display
  let title = content;
  
  // Remove common question words at the beginning for cleaner titles
  const questionWords = ['what', 'how', 'show', 'tell', 'can', 'could', 'would', 'please'];
  const words = title.toLowerCase().split(' ');
  if (questionWords.includes(words[0])) {
    title = words.slice(1).join(' ');
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // If the message is too long, truncate it intelligently
  if (title.length > 50) {
    // Try to truncate at a word boundary
    const truncated = title.substring(0, 47);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 30) {
      title = truncated.substring(0, lastSpace) + '...';
    } else {
      title = truncated + '...';
    }
  }
  
  return title || 'New Conversation';
}

/**
 * Generate a conversation title from a list of messages
 */
export function generateTitleFromMessages(messages: Array<{ role: string; content: string }>): string {
  if (!messages || messages.length === 0) {
    return 'New Conversation';
  }

  // Find the first user message
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (!firstUserMessage) {
    return 'New Conversation';
  }

  return generateConversationTitle(firstUserMessage.content);
}

/**
 * Get a fallback title based on conversation state
 */
export function getFallbackTitle(messagesCount: number, hasError: boolean): string {
  if (hasError) {
    return 'Conversation with Error';
  }
  
  if (messagesCount === 0) {
    return 'New Conversation';
  }
  
  return 'Active Conversation';
}
