# Postman Collections Guide

This guide explains how to use the Postman collections for testing Databricks Genie APIs.

---

## 📦 Collections Overview

### 1. Databricks Genie API Collection
**File:** `Databricks_Genie_API.postman_collection.json`

This collection contains the official Databricks Genie API endpoints. Use this to:
- Test direct integration with Databricks
- Understand the raw API structure
- Debug Databricks-specific issues
- Validate API responses

### 2. Genie Next.js API Collection
**File:** `Genie_Next_API.postman_collection.json`

This collection contains the Next.js wrapper API endpoints. Use this to:
- Test the application's API layer
- Validate request/response transformations
- Debug application-specific issues
- Test end-to-end workflows

---

## 🚀 Getting Started

### Step 1: Import Collections

1. Open Postman
2. Click **Import** button (top left)
3. Navigate to the `docs/` folder
4. Select both JSON files:
   - `Databricks_Genie_API.postman_collection.json`
   - `Genie_Next_API.postman_collection.json`
5. Click **Import**

### Step 2: Configure Variables

#### For Databricks Genie API Collection:

1. Click on the collection name
2. Go to **Variables** tab
3. Set the following variables:

| Variable | Current Value | Description |
|----------|--------------|-------------|
| `DATABRICKS_HOST` | `your-workspace.databricks.com` | Your Databricks workspace URL (without https://) |
| `DATABRICKS_TOKEN` | `dapi...` | Your Personal Access Token |
| `DATABRICKS_SPACE_ID` | `12ab345c...` | Your Genie Space ID |

**How to get these values:**

- **DATABRICKS_HOST**: Copy from your Databricks workspace URL
  - Example: `adb-1234567890123456.7.azuredatabricks.net`
- **DATABRICKS_TOKEN**: 
  - Go to Databricks workspace
  - Click User Settings → Access Tokens
  - Generate a new token
- **DATABRICKS_SPACE_ID**:
  - Open Genie in Databricks
  - Copy the ID from the URL: `.../genie/spaces/{SPACE_ID}`

#### For Genie Next.js API Collection:

1. Click on the collection name
2. Go to **Variables** tab
3. Set the following variable:

| Variable | Current Value | Description |
|----------|--------------|-------------|
| `BASE_URL` | `http://localhost:3000/api` | Your application's API base URL |

**Note:** For production, change to your deployed URL (e.g., `https://your-domain.com/api`)

---

## 🔄 Testing Workflows

### Workflow 1: Start a New Conversation (Databricks API)

**Use Case:** Test direct Databricks Genie integration

1. **Start Conversation**
   - Endpoint: `POST /api/2.0/genie/spaces/{spaceId}/start-conversation`
   - Action: Run the request
   - Result: Saves `CONVERSATION_ID` and `MESSAGE_ID` automatically

2. **Poll Message Status**
   - Endpoint: `GET /api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}/messages/{messageId}`
   - Action: Run the request (can run multiple times)
   - Result: Shows message status (SUBMITTED → EXECUTING_QUERY → COMPLETED)

3. **Execute Query** (if query was generated)
   - Endpoint: `GET /api/2.0/sql/statements/{statementId}`
   - Action: Run the request
   - Result: Returns query results in `data_array` format

4. **Send Feedback**
   - Endpoint: `POST /api/2.0/genie/spaces/{spaceId}/conversations/{conversationId}/messages/{messageId}/feedback`
   - Action: Edit rating (POSITIVE/NEGATIVE) and run
   - Result: Feedback submitted successfully

### Workflow 2: Start a New Conversation (Next.js API)

**Use Case:** Test application's wrapper API

1. **Start Conversation**
   - Endpoint: `POST /api/genie/start`
   - Action: Run the request
   - Result: Saves `conversationId` and `messageId` automatically

2. **Poll Message Status**
   - Endpoint: `POST /api/genie/poll`
   - Action: Run the request (can run multiple times)
   - Result: Shows message with status and attachments

3. **Execute Query** (if query was generated)
   - Endpoint: `GET /api/genie/execute?statementId={statementId}`
   - Action: Run the request
   - Result: Returns formatted query results

4. **Send Follow-up Message**
   - Endpoint: `POST /api/genie/message`
   - Action: Edit content and run
   - Result: New message created, starts polling cycle again

### Workflow 3: Browse Existing Conversations

**Use Case:** View and resume past conversations

1. **List Conversations**
   - Endpoint: `GET /api/genie/conversations`
   - Action: Run the request
   - Result: Shows all conversations with timestamps

2. **List Messages** (for a specific conversation)
   - Endpoint: `GET /api/genie/messages?conversationId={conversationId}`
   - Action: Run the request
   - Result: Shows all messages in the conversation

---

## 🧪 Test Scripts

Both collections include automated test scripts that:

### Pre-request Scripts
- Validate required environment variables
- Set default values
- Log request information

### Test Scripts
- Validate response status codes
- Check response structure
- Save variables for subsequent requests
- Log success/failure messages

### Automatic Variable Management
- `CONVERSATION_ID` / `conversationId` - Saved from start/list endpoints
- `MESSAGE_ID` / `messageId` - Saved from message endpoints
- `STATEMENT_ID` / `statementId` - Saved from poll endpoints

**Benefits:**
- No manual copying of IDs
- Seamless workflow between requests
- Automatic validation of responses

---

## 📊 Understanding Responses

### Message Status Flow

```
SUBMITTED
    ↓
EXECUTING_QUERY (Genie is processing)
    ↓
QUERY_RESULT_SUCCESS (Query generated and executed)
    ↓
COMPLETED (Final state with results)
```

**Or on error:**
```
SUBMITTED → EXECUTING_QUERY → QUERY_RESULT_ERROR → FAILED
```

### Response Structure

**Start Conversation Response:**
```json
{
  "conversation_id": "abc123...",
  "message_id": "msg456...",
  "conversation": { ... },
  "message": { ... }
}
```

**Poll Message Response:**
```json
{
  "message": {
    "message_id": "msg456...",
    "status": "COMPLETED",
    "content": "Based on your data...",
    "attachments": [
      {
        "query": {
          "query": "SELECT * FROM ...",
          "statement_id": "stmt789...",
          "suggested_follow_up_questions": [...]
        }
      }
    ]
  }
}
```

**Execute Query Response:**
```json
{
  "statement_id": "stmt789...",
  "status": { "state": "FINISHED" },
  "manifest": {
    "schema": {
      "columns": [
        { "name": "customer_id", "type_name": "STRING" },
        { "name": "revenue", "type_name": "DECIMAL" }
      ]
    },
    "total_row_count": 10
  },
  "result": {
    "data_array": [
      ["CUST001", 15000.50],
      ["CUST002", 12500.75],
      ...
    ]
  }
}
```

---

## 🔍 Debugging Tips

### Common Issues

**1. Authentication Error (401)**
```
Issue: "Unauthorized" or "Invalid token"
Solution:
- Verify DATABRICKS_TOKEN is correct
- Check token hasn't expired
- Ensure token has necessary permissions
```

**2. Not Found Error (404)**
```
Issue: "Space not found" or "Conversation not found"
Solution:
- Verify DATABRICKS_SPACE_ID is correct
- Check conversation_id/message_id variables
- Ensure you have access to the space
```

**3. Permission Error (403)**
```
Issue: "Permission denied"
Solution:
- Verify your user has access to the Genie space
- Check workspace permissions
- Ensure token has correct scopes
```

**4. Connection Error**
```
Issue: "Could not connect to Databricks"
Solution:
- Verify DATABRICKS_HOST is correct (without https://)
- Check network connectivity
- Verify no firewall blocking requests
```

**5. Variables Not Set**
```
Issue: Request fails with {{variable}} in URL
Solution:
- Check collection variables are configured
- Run previous requests to set dependent variables
- Manually set the variable if needed
```

### Debug Checklist

- [ ] All collection variables are set correctly
- [ ] Required requests run in order (Start → Poll → Execute)
- [ ] Check Console tab for detailed logs
- [ ] Review Test Results for specific failures
- [ ] Verify variable values in Environment/Collection tabs
- [ ] Check Postman console for request/response details

---

## 📝 Best Practices

### 1. Variable Management
- Always set collection variables before first use
- Use environment variables for different workspaces
- Don't commit tokens to version control

### 2. Request Order
- Follow the workflow sequence (Start → Poll → Execute)
- Wait for COMPLETED status before executing queries
- Let auto-saved variables flow between requests

### 3. Polling Strategy
- Poll every 5-10 seconds for quick queries
- Use longer intervals for complex queries
- Check status before deciding to re-poll

### 4. Error Handling
- Review error messages in response body
- Check test results for validation failures
- Use Postman Console for detailed debugging

### 5. Testing
- Test with simple queries first
- Gradually increase complexity
- Use feedback endpoint to improve responses

---

## 🎯 Quick Reference

### Databricks API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/start-conversation` | POST | Start new conversation |
| `/conversations` | GET | List all conversations |
| `/conversations/{id}` | GET | Get conversation details |
| `/messages` | POST | Send follow-up message |
| `/messages` | GET | List all messages |
| `/messages/{id}` | GET | Get message status (poll) |
| `/feedback` | POST | Submit feedback |
| `/sql/statements/{id}` | GET | Execute/get query results |

### Next.js API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/genie/start` | POST | Start conversation |
| `/genie/message` | POST | Send message |
| `/genie/poll` | POST | Poll message status |
| `/genie/execute` | GET | Get query results |
| `/genie/feedback` | POST | Send feedback |
| `/genie/conversations` | GET | List conversations |
| `/genie/messages` | GET | List messages |

---

## 🔗 Related Documentation

- **[Technical Guide](./TECHNICAL_GUIDE.md)** - Architecture and implementation details
- **[README](../README.md)** - Project setup and overview
- **[Databricks Genie API](https://docs.databricks.com/api/workspace/genie)** - Official API documentation

---

## 💡 Tips for Success

1. **Start Simple**: Begin with the "Start Conversation" request
2. **Follow Workflows**: Use the documented workflows above
3. **Check Variables**: Verify auto-saved variables after each request
4. **Monitor Status**: Poll until status is COMPLETED
5. **Use Test Scripts**: They provide valuable feedback
6. **Read Responses**: Response bodies contain helpful information
7. **Save Examples**: Save successful responses as examples for reference

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Test Results** - Click "Test Results" tab after running request
2. **Review Console** - View → Show Postman Console for detailed logs
3. **Verify Variables** - Check collection/environment variables
4. **Read Error Messages** - Response body contains error details
5. **Consult Documentation** - Review this guide and Technical Guide
6. **Test Direct API** - Use Databricks collection to isolate issues

---

**Happy Testing! 🚀**

