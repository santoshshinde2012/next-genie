# Databricks Genie Next.js - Technical Guide

A comprehensive end-to-end integration of Databricks Genie Conversation APIs with Next.js, TypeScript, and modern React patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Technical Stack](#technical-stack)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)

---

## Architecture Overview

### Three-Tier Architecture

The application follows a clean three-tier architecture with clear separation of concerns:

**1. Client Layer (Browser)**
- React components handle UI rendering and user interactions
- Custom React hooks manage state and business logic
- HTTP client communicates with Next.js API routes
- No direct access to Databricks credentials (secure by design)

**2. Server Layer (Next.js)**
- API routes act as a secure proxy between client and Databricks
- Centralized API service handles all HTTP communications
- Request validation and error transformation
- Retry logic with exponential backoff for resilience
- Environment-based configuration management

**3. External API Layer (Databricks)**
- Genie Conversation API for natural language queries
- SQL Execution API for query results
- Unity Catalog integration for data access
- Secure authentication via Bearer tokens

### Component Hierarchy

The UI follows a hierarchical component structure:

- **Main Page** - Entry point and layout container
  - **Genie Chat Component** - Primary chat interface
    - **useGenie Hook** - State management and API interactions
    - **Card Components** - UI containers
    - **Chat Message Components** - Individual message display
      - **Icon Components** - User and bot avatars
      - **Query Results Table** - Tabular data display
    - **Chat Input Component** - User input handling
      - **Input Component** - Text input field
      - **Button Component** - Send action button

---

## System Components

### Frontend Components

**Main Page**
- Purpose: Application entry point and layout
- Responsibilities: Component orchestration, routing, global layout

**Genie Chat Component**
- Purpose: Main chat interface and conversation management
- Responsibilities: Message display, conversation flow, user interactions

**Chat Message Component**
- Purpose: Display individual messages and query results
- Responsibilities: Message formatting, result tables, feedback UI, suggested questions

**Chat Input Component**
- Purpose: User input handling
- Responsibilities: Input validation, send actions, loading states

**Chat Window Component**
- Purpose: Message container and scrolling
- Responsibilities: Auto-scroll, message grouping, loading indicators

**Conversation Sidebar Component**
- Purpose: Conversation list and navigation
- Responsibilities: History display, conversation switching, new chat actions

### Backend Components

**API Routes**
- **Start Route**: Initiates new conversations
- **Message Route**: Sends follow-up messages
- **Poll Route**: Checks message status and retrieves results
- **Execute Route**: Fetches SQL query results
- **Feedback Route**: Submits user feedback
- **Messages Route**: Retrieves conversation messages
- **Conversations Route**: Lists all conversations

**API Service Layer**
- Centralized HTTP client with Axios
- Request and response interceptors for logging
- Automatic retry with exponential backoff
- Consistent error handling and transformation
- Type-safe interfaces for all API calls

**Genie Client**
- Wrapper for Databricks Genie API
- Handles authentication and request formatting
- Provides polling mechanism with backoff
- Transforms API responses to application types

### Custom React Hooks

**useGenie Hook**
- Manages chat state (messages, loading, errors)
- Handles conversation lifecycle
- Provides methods for sending messages
- Implements polling for query completion
- Manages feedback submission

**useConversations Hook**
- Manages conversation list state
- Fetches and caches conversations
- Provides conversation selection logic
- Handles conversation switching

**useAppState Hook**
- Application-wide side effects
- Session management
- Global error handling

---

## Technical Stack

### Core Technologies

**Next.js 14.2.5**
- Modern React framework with App Router
- Server-side rendering for optimal performance
- API routes for backend integration
- File-based routing system
- Built-in optimization and code splitting

**React 18.3.1**
- Component-based UI library
- Hooks for state management
- Context API for global state
- Concurrent rendering features

**TypeScript 5**
- Static type checking
- Enhanced IDE support
- Type-safe API contracts
- Reduced runtime errors

**Tailwind CSS 4.0**
- Next-generation utility-first CSS framework
- CSS-based configuration with @theme
- Built-in autoprefixing
- Optimized bundle size
- Modern CSS features

**Axios 1.7.2**
- Promise-based HTTP client
- Request/response interceptors
- Automatic retry capabilities
- Connection pooling
- Timeout management

### UI Libraries

**Lucide React 0.400.0**
- Modern icon components
- Tree-shakeable for optimal bundle size
- Consistent design language

**class-variance-authority 0.7.0**
- Component variant management
- Type-safe variant props
- Composition patterns

### Development Tools

**ESLint**
- Code quality enforcement
- Next.js specific rules
- TypeScript integration

**PostCSS**
- CSS processing pipeline
- Tailwind CSS integration

---

## Data Flow

### Starting a Conversation Flow

1. **User Input**: User types a natural language query
2. **Hook Action**: useGenie.startConversation() is called
3. **API Request**: POST to /api/genie/start with query content
4. **GenieClient**: Formats and sends request to Databricks
5. **Databricks API**: POST to Genie start-conversation endpoint
6. **Response**: Returns conversation_id and message_id
7. **Polling Initiation**: Automatically starts polling for results
8. **Status Checks**: Repeated GET requests to check message status
9. **Completion**: When status is COMPLETED, results are displayed
10. **UI Update**: Chat interface shows the response and results

### Follow-up Message Flow

1. **User Input**: User asks a follow-up question
2. **Hook Action**: useGenie.sendMessage() with existing conversation_id
3. **API Request**: POST to /api/genie/message
4. **GenieClient**: Sends message to existing conversation
5. **Databricks API**: POST to conversations/messages endpoint
6. **Response**: Returns message_id for the new message
7. **Polling**: Same polling flow as initial conversation
8. **Context Awareness**: Genie uses conversation context for response
9. **UI Update**: New message and response added to chat

### Query Execution Flow

1. **Poll Completion**: Message status becomes COMPLETED
2. **Attachment Check**: Response contains query attachment
3. **Statement ID**: Extract statement_id from attachment
4. **Execute Request**: GET to /api/genie/execute with statement_id
5. **SQL API**: Fetch results from Databricks SQL API
6. **Result Parsing**: Transform data_array into table format
7. **Schema Extraction**: Column names and types from manifest
8. **UI Display**: Render results in interactive table

### Message Status Lifecycle

**Status Progression:**

1. **SUBMITTED** - Initial state when message is first sent
2. **EXECUTING_QUERY** - Genie is processing and generating SQL
3. **QUERY_RESULT_SUCCESS** - Query executed successfully
4. **QUERY_RESULT_ERROR** - Query execution failed
5. **COMPLETED** - Final success state with results
6. **FAILED** - Final failure state

### Polling Mechanism

**Intelligent Polling Strategy:**

- **Initial Interval**: 5 seconds between polls
- **Duration**: Up to 10 minutes maximum
- **Backoff Trigger**: After 2 minutes of polling
- **Backoff Multiplier**: 1.5x interval increase
- **Max Interval**: 30 seconds between polls
- **Error Handling**: Continues polling on transient errors
- **Timeout**: Fails after 10 minutes with timeout error

**Benefits:**
- Reduces unnecessary API calls
- Adapts to long-running queries
- Provides responsive feedback for quick queries
- Handles transient network issues

---

## API Integration

### Databricks Genie API

**Base Endpoint Structure:**
All endpoints follow the pattern: `/api/2.0/genie/spaces/{spaceId}/...`

**Authentication:**
Bearer token authentication with Databricks Personal Access Token

**Key Endpoints:**

1. **Start Conversation**
   - Method: POST
   - Path: `/start-conversation`
   - Purpose: Begin new conversation with initial query

2. **Send Message**
   - Method: POST
   - Path: `/conversations/{conversationId}/messages`
   - Purpose: Send follow-up messages in existing conversation

3. **Get Message**
   - Method: GET
   - Path: `/conversations/{conversationId}/messages/{messageId}`
   - Purpose: Poll for message status and retrieve results

4. **List Conversations**
   - Method: GET
   - Path: `/conversations`
   - Purpose: Retrieve all conversations in space

5. **List Messages**
   - Method: GET
   - Path: `/conversations/{conversationId}/messages`
   - Purpose: Get all messages in a conversation

6. **Send Feedback**
   - Method: POST
   - Path: `/conversations/{conversationId}/messages/{messageId}/feedback`
   - Purpose: Submit feedback on responses

7. **Execute SQL**
   - Method: GET
   - Path: `/api/2.0/sql/statements/{statementId}`
   - Purpose: Retrieve query execution results

### Next.js API Routes

**Base URL:** `/api/genie/`

**Simplified Endpoints:**

1. **POST /start** - Start conversation
2. **POST /message** - Send message
3. **POST /poll** - Poll message status
4. **GET /execute** - Execute query
5. **POST /feedback** - Send feedback
6. **GET /conversations** - List conversations
7. **GET /messages** - List messages

**Benefits:**
- Simplified request/response formats
- Secure credential management
- Automatic retry logic
- Consistent error handling
- Type-safe interfaces

### API Service Features

**Request Processing:**
- Request validation and sanitization
- Automatic content-type headers
- Request logging for debugging
- Timeout management

**Response Handling:**
- Consistent response format
- Error transformation
- Success/failure indicators
- Response time logging

**Retry Logic:**
- Maximum 3 retries per request
- Exponential backoff (1s, 2s, 4s)
- Retry on network errors and 5xx errors
- No retry on 4xx client errors
- Configurable retry conditions

**Error Handling:**
- Network errors: Connection issues
- Server errors (5xx): Databricks API errors
- Client errors (4xx): Validation errors
- Timeout errors: Request timeout exceeded
- Structured error responses with details

---

## Configuration

### Environment Variables

**Required Variables:**

**DATABRICKS_HOST**
- Description: Your Databricks workspace URL
- Example: `https://adb-1234567890123456.7.azuredatabricks.net`
- Usage: Base URL for all Databricks API calls

**DATABRICKS_TOKEN**
- Description: Personal Access Token for authentication
- Example: `dapi1234567890abcdef`
- Security: Never commit to version control, server-side only
- Generation: Databricks workspace → User Settings → Access Tokens

**DATABRICKS_SPACE_ID**
- Description: Genie Space identifier
- Example: `12ab345cd6789000ef6a2fb844ba2d31`
- Location: Found in Genie UI URL after `/spaces/`

### Configuration Files

**next.config.mjs**
- Next.js framework configuration
- API route settings
- Build optimization options

**tailwind.config.ts**
- Tailwind CSS v4 configuration
- Custom theme values
- Plugin configurations

**tsconfig.json**
- TypeScript compiler options
- Path aliases (@/ prefix)
- Type checking strictness

**package.json**
- Dependencies and versions
- Build scripts
- Development tools

### Configuration Validation

The application validates configuration on startup:
- Checks all required environment variables
- Verifies variable formats
- Prevents placeholder values
- Throws descriptive errors for missing config

---

## Best Practices

### Security

**1. Credential Management**
- Store all secrets in environment variables
- Never expose tokens to client-side code
- Use API routes as secure proxy
- Rotate tokens periodically

**2. API Security**
- HTTPS only for all communications
- Bearer token authentication
- Request validation
- Error message sanitization

**3. Data Protection**
- No sensitive data in client state
- Secure session management
- Proper CORS configuration

### Performance

**1. API Optimization**
- Connection pooling with Axios
- Request deduplication
- Intelligent polling with backoff
- Response caching where appropriate

**2. Frontend Optimization**
- Code splitting with Next.js
- Lazy loading of components
- Optimized re-renders with React hooks
- Efficient state management

**3. Build Optimization**
- Tree shaking for smaller bundles
- CSS optimization with Tailwind
- Image optimization
- Static asset compression

### Error Handling

**1. Client Errors (4xx)**
- Validate input before sending
- Display user-friendly error messages
- Provide actionable feedback
- No automatic retries

**2. Server Errors (5xx)**
- Automatic retry with backoff
- Detailed error logging
- Fallback error messages
- Status monitoring

**3. Network Errors**
- Retry on connection issues
- Timeout handling
- Offline detection
- Recovery mechanisms

### Code Organization

**1. Type Safety**
- Comprehensive TypeScript types
- Separate API and domain types
- Type-safe API contracts
- Runtime type validation

**2. Component Structure**
- Single responsibility principle
- Reusable UI components
- Custom hooks for logic
- Clear prop interfaces

**3. State Management**
- Local state for component-specific data
- Custom hooks for shared logic
- Context for global state
- Minimize state dependencies

### Development Workflow

**1. Code Quality**
- ESLint for code standards
- TypeScript for type safety
- Consistent formatting
- Code reviews

**2. Testing Strategy**
- Manual testing with Postman collections
- Integration testing of API routes
- Component testing
- Error scenario testing

**3. Documentation**
- Code comments for complex logic
- API documentation
- Architecture diagrams
- Setup instructions

### Monitoring and Debugging

**1. Logging**
- Request/response logging
- Error logging with context
- Performance metrics
- User action tracking

**2. Debugging Tools**
- Browser DevTools
- Network tab for API calls
- React DevTools for components
- TypeScript errors in IDE

**3. Error Tracking**
- Console error logging
- API error details
- Status code tracking
- Error message collection

---

## API Reference

For detailed API documentation, refer to:

**Postman Collections:**
- `Databricks_Genie_API.postman_collection.json` - Official Databricks Genie API
- `Genie_Next_API.postman_collection.json` - Next.js wrapper API

**Official Documentation:**
- [Databricks Genie API Documentation](https://docs.databricks.com/api/workspace/genie)
- [Databricks Genie Blog](https://www.databricks.com/blog/genie-conversation-apis-public-preview)
- [Databricks SQL API Documentation](https://docs.databricks.com/api/workspace/sql/statements)

---

## Deployment

### Build Process

1. **Install Dependencies**: Install all required npm packages
2. **Environment Setup**: Configure production environment variables
3. **Type Checking**: Verify TypeScript compilation
4. **Linting**: Run ESLint checks
5. **Build**: Create optimized production bundle
6. **Test**: Verify build output

### Production Considerations

**Environment Variables:**
- Set all required variables in production environment
- Use secure secret management service
- Never commit secrets to repository

**Performance:**
- Enable Next.js production mode
- Configure CDN for static assets
- Enable compression
- Set appropriate cache headers

**Monitoring:**
- Set up application monitoring
- Track API response times
- Monitor error rates
- Log important events

**Scaling:**
- Horizontal scaling for API routes
- Load balancing
- Database connection pooling
- Rate limiting if needed

---

## Troubleshooting

### Common Issues

**Configuration Errors**
- Issue: Missing environment variables
- Solution: Verify all required variables are set
- Check: Configuration validation error messages

**API Connection Errors**
- Issue: Cannot connect to Databricks
- Solution: Verify DATABRICKS_HOST and network connectivity
- Check: Firewall and proxy settings

**Authentication Errors**
- Issue: 401 Unauthorized responses
- Solution: Verify DATABRICKS_TOKEN is valid and not expired
- Check: Token permissions in Databricks

**Polling Timeout**
- Issue: Query takes longer than 10 minutes
- Solution: Optimize query or increase timeout
- Check: Query complexity and data volume

**Build Errors**
- Issue: TypeScript compilation errors
- Solution: Verify all types are correctly imported
- Check: Path aliases and type definitions

### Debug Mode

Enable detailed logging by:
1. Check browser console for frontend errors
2. Review terminal output for API route logs
3. Inspect network tab for API requests
4. Use React DevTools for component state

---

## Future Enhancements

### Planned Features

**User Experience:**
- Dark mode support
- Conversation search
- Export query results
- Keyboard shortcuts
- Voice input

**Functionality:**
- Query history and favorites
- Collaborative conversations
- Advanced filtering
- Custom visualizations
- Query scheduling

**Performance:**
- Optimistic UI updates
- Background query execution
- Result caching
- Pagination for large results

**Integration:**
- Additional data sources
- External tool integration
- Webhook notifications
- API key management

---

## License

MIT License - feel free to use this project for your own applications.

---

## Support

For questions or issues:
- Review this technical guide
- Check Postman collections for API examples
- Consult official Databricks documentation
- Review application logs for error details

---

**Built with Next.js, TypeScript, and Tailwind CSS v4**
**Powered by Databricks Genie**
