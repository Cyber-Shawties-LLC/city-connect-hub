# Backend Connection Troubleshooting Guide

## Current Issue
The Penny backend at `https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net` is not accessible.

## Quick Diagnosis

### 1. Check if Backend is Deployed
The backend URL cannot be resolved, which means:
- ❌ The backend is not deployed to Azure
- ❌ The URL is incorrect
- ❌ The backend service is down

### 2. Test the Endpoint
Try these commands to test the backend:

```bash
# Test /chat endpoint
curl -X POST "https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "tenant_id": "norfolk", "user_id": "test", "session_id": "test"}'

# Test /api/chat endpoint (alternative)
curl -X POST "https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "tenant_id": "norfolk", "user_id": "test", "session_id": "test"}'

# Test health endpoint
curl "https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net/health"
```

## Solutions

### Option 1: Deploy Penny Backend to Azure

1. **Clone the Penny repository:**
   ```bash
   git clone https://github.com/Cyber-Shawties-LLC/Penny.git
   cd Penny
   ```

2. **Follow the deployment guide in the Penny repo:**
   - See the README.md in the Penny repo for Azure deployment instructions
   - The repo mentions Azure ML deployment and Azure Container Instances

3. **Update the frontend config** (`src/lib/config.ts`) with the new deployed URL

### Option 2: Run Backend Locally for Development

1. **Clone and set up Penny locally:**
   ```bash
   git clone https://github.com/Cyber-Shawties-LLC/Penny.git
   cd Penny
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Set environment variables:**
   ```bash
   export AZURE_MAPS_KEY=your_key
   export ENVIRONMENT=development
   ```

3. **Run the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Update frontend config for local development:**
   ```typescript
   // src/lib/config.ts
   export const BACKEND_URL = "http://localhost:8000";
   export const CHAT_ENDPOINT = `${BACKEND_URL}/chat`;
   ```

5. **Update CORS in Penny backend** to allow your frontend:
   ```python
   # In app/main.py or app/router.py
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:8081", "http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Option 3: Use a Tunnel Service (for quick testing)

If you run Penny locally, use a tunnel to make it accessible:

1. **Using ngrok:**
   ```bash
   ngrok http 8000
   ```
   Then update `src/lib/config.ts` with the ngrok URL

2. **Using Cloudflare Tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```

## Verify Endpoint Path

According to the Penny repo, the endpoint should be `/chat`, but some deployments might use `/api/chat`. 

**Check the actual endpoint:**
1. Look at the Penny repo's `app/router.py` or `app/main.py`
2. Check the FastAPI route definitions
3. Test both `/chat` and `/api/chat`

## Current Configuration

Your frontend is configured to use:
- **Backend URL**: `https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net`
- **Endpoint**: `/chat`
- **Full URL**: `https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net/chat`

## Next Steps

1. **Check if you have access to deploy the backend**
   - If yes, deploy it following the Penny repo instructions
   - If no, contact the team member who manages deployments

2. **For local development:**
   - Run Penny locally
   - Update the config to point to `http://localhost:8000`
   - Ensure CORS is configured

3. **Check browser console:**
   - Open DevTools (F12)
   - Look at the Network tab when sending a message
   - Check the Console tab for detailed error messages
   - The improved error handling will now show more specific errors

## Error Messages You Might See

- **"Failed to fetch"** → Backend not running or URL incorrect
- **"404 Not Found"** → Endpoint path is wrong (try `/api/chat`)
- **"CORS error"** → Backend needs to allow your frontend origin
- **"500 Internal Server Error"** → Backend is running but has an error

## Testing After Fix

Once the backend is accessible, test with:

```bash
curl -X POST "YOUR_BACKEND_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What community events are happening?",
    "tenant_id": "norfolk",
    "user_id": "test_user",
    "session_id": "test_session"
  }'
```

Expected response:
```json
{
  "response": "Here are some community events...",
  "intent": "community_events",
  "tenant_id": "norfolk",
  "session_id": "test_session",
  "timestamp": "2025-01-XX...",
  "response_time_ms": 245
}
```



