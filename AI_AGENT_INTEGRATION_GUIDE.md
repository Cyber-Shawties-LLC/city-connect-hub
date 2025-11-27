# AI Agent Integration Guide

This guide explains how to connect an AI agent from a GitHub repository to your City Connect Hub website.

## Current Setup - Penny AI Integration ✅

Your app is now connected to **Penny AI** (FastAPI backend) from [https://github.com/Cyber-Shawties-LLC/Penny](https://github.com/Cyber-Shawties-LLC/Penny):

- **Config**: `src/lib/config.ts` - Contains the backend URL and endpoint
- **API Client**: `src/lib/api.ts` - Handles API calls matching Penny's FastAPI format
- **Hook**: `src/hooks/usePennyChats.ts` - React hook for chat functionality with session management

### Penny API Format

**Request:**
```json
{
  "message": "What community events are happening this weekend?",
  "tenant_id": "norfolk",
  "user_id": "user123",
  "session_id": "session456"
}
```

**Response:**
```json
{
  "response": "Hi! Here are some great community events...",
  "intent": "community_events",
  "tenant_id": "norfolk",
  "session_id": "session456",
  "timestamp": "2025-11-26T10:30:00Z",
  "response_time_ms": 245
}
```

## Integration Options

### Option 1: Direct API Integration (If Agent Has REST API)

If the AI agent repo provides a REST API endpoint:

1. **Update the config** (`src/lib/config.ts`):
```typescript
export const BACKEND_URL = "https://your-ai-agent-api.com";
export const CHAT_ENDPOINT = `${BACKEND_URL}/api/chat`;
// Or whatever endpoint the agent uses
```

2. **Update the API client** (`src/lib/api.ts`) if the payload/response format differs:
```typescript
// Adjust interfaces to match the agent's API
export interface AgentPayload {
  message: string;
  // Add other required fields
}

export interface AgentResponse {
  reply: string;
  // Add other response fields
}
```

### Option 2: Deploy Agent as Backend Service

If the agent needs to be deployed separately:

1. **Clone and deploy the agent repo**:
   - Deploy to a cloud service (Azure, AWS, Heroku, Railway, etc.)
   - Or run locally and use a tunnel (ngrok, Cloudflare Tunnel)

2. **Update your config** to point to the deployed URL

3. **Handle CORS** if needed - the agent backend should allow requests from your frontend domain

### Option 3: Create a Proxy Backend

If you need to add authentication, rate limiting, or handle CORS:

1. **Create a backend service** (Node.js/Express, Python/Flask, etc.) that:
   - Receives requests from your frontend
   - Calls the AI agent API
   - Returns responses to your frontend

2. **Deploy the proxy** and update your config

### Option 4: Frontend Integration (If Agent is a Library)

If the agent is a JavaScript/TypeScript library:

1. **Install the package**:
```bash
npm install <agent-package-name>
# or
npm install github:<username>/<repo-name>
```

2. **Import and use in your hook** (`src/hooks/usePennyChats.ts`):
```typescript
import { AgentClient } from 'agent-package';

// Use the agent client instead of API calls
const agent = new AgentClient({ /* config */ });
```

## Step-by-Step: Connecting a New Agent

### Step 1: Understand the Agent's Interface

Check the GitHub repo for:
- API documentation
- Required environment variables
- Request/response formats
- Authentication requirements

### Step 2: Choose Integration Method

Based on the agent type:
- **Backend API** → Option 1 or 2
- **Frontend Library** → Option 4
- **Needs custom logic** → Option 3

### Step 3: Update Your Code

#### If using a different API endpoint:

**Update `src/lib/config.ts`:**
```typescript
export const BACKEND_URL = "https://your-new-agent-url.com";
export const CHAT_ENDPOINT = `${BACKEND_URL}/api/chat`;
```

#### If the API format is different:

**Update `src/lib/api.ts`:**
```typescript
// Modify interfaces to match new agent
export interface AgentPayload {
  // Match the agent's expected format
  prompt?: string;
  message?: string;
  input?: string;
}

export interface AgentResponse {
  // Match the agent's response format
  answer?: string;
  response?: string;
  output?: string;
}

export async function talkToAgent(
  payload: AgentPayload
): Promise<AgentResponse> {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add auth headers if needed
      // "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
```

**Update `src/hooks/usePennyChats.ts`:**
```typescript
import { talkToAgent, AgentPayload, AgentResponse } from "../lib/api";

// Update the sendMessage function to use the new API
// Adjust how you extract the response based on the agent's format
```

### Step 4: Handle Environment Variables

If the agent needs API keys or secrets:

1. **Create `.env` file** (add to `.gitignore`):
```env
VITE_AI_AGENT_URL=https://your-agent-url.com
VITE_AI_AGENT_API_KEY=your-api-key
```

2. **Update `src/lib/config.ts`:**
```typescript
export const BACKEND_URL = import.meta.env.VITE_AI_AGENT_URL || "default-url";
export const API_KEY = import.meta.env.VITE_AI_AGENT_API_KEY;
```

3. **Update API calls** to include the key in headers

### Step 5: Test the Integration

1. Test with simple messages
2. Check browser console for errors
3. Verify response format matches expectations
4. Test error handling

## Common Issues & Solutions

### CORS Errors
- **Solution**: Deploy agent with CORS enabled, or use a proxy backend

### Authentication
- **Solution**: Add API keys to environment variables and include in request headers

### Different Response Format
- **Solution**: Update the response parsing in `usePennyChats.ts`

### Rate Limiting
- **Solution**: Implement request throttling or upgrade the agent's plan

## Example: Connecting OpenAI API

If you wanted to connect OpenAI (as an example):

```typescript
// src/lib/api.ts
export async function talkToOpenAI(input: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }],
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
}
```

## Need Help?

To get specific help for your agent:
1. Share the GitHub repo URL
2. Share the agent's API documentation
3. Specify deployment preferences (cloud service, local, etc.)

