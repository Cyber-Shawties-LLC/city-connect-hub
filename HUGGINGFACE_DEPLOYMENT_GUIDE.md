# Deploying Penny to Hugging Face Spaces

Hugging Face Spaces is an excellent free option for deploying your FastAPI backend! It provides:
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Public URL
- ✅ Easy GitHub integration
- ✅ Automatic deployments on push

## Step 1: Prepare Penny for Hugging Face Spaces

### 1.1 Clone the Penny Repository

```bash
git clone https://github.com/Cyber-Shawties-LLC/Penny.git
cd Penny
```

### 1.2 Create `app.py` for Hugging Face Spaces

Hugging Face Spaces expects a specific structure. Create or update `app.py` in the root of the Penny repo:

```python
# app.py (for Hugging Face Spaces)
from app.main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
```

**Note:** Hugging Face Spaces uses port 7860 by default.

### 1.3 Create `requirements.txt` (if not exists)

Make sure `requirements.txt` includes all dependencies:
- fastapi
- uvicorn
- All other Penny dependencies

### 1.4 Update CORS Settings

Update `app/main.py` or `app/router.py` in the Penny repo to allow requests from your frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:5173",
        "https://your-frontend-domain.com",  # Add your production frontend URL
        "*"  # For development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 1.5 Create `README.md` for the Space

Create a `README.md` in the Penny repo root:

```markdown
---
title: Penny AI Assistant
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Penny - Civic Engagement AI Assistant

FastAPI backend for the City Connect Hub frontend.
```

## Step 2: Deploy to Hugging Face Spaces

### 2.1 Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Fill in:
   - **Space name**: `penny-ai` (or your preferred name)
   - **SDK**: Select **"Docker"** (for FastAPI)
   - **Visibility**: Public (or Private if you prefer)
4. Click **"Create Space"**

### 2.2 Push Penny Code to the Space

**Option A: Using Git (Recommended)**

```bash
# In your Penny repository
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/penny-ai
git push huggingface main
```

**Option B: Using the Web Interface**

1. Go to your Space page
2. Click **"Files and versions"** tab
3. Upload files or use the web editor

### 2.3 Configure Environment Variables

1. Go to your Space settings
2. Navigate to **"Variables and secrets"**
3. Add required environment variables:
   - `AZURE_MAPS_KEY` (if needed)
   - `AZURE_OPENAI_KEY` (if needed)
   - `ENVIRONMENT=production`
   - Any other secrets Penny needs

### 2.4 Wait for Deployment

Hugging Face will automatically:
- Build your Docker container
- Install dependencies
- Start your FastAPI app
- Provide a public URL

**Your Space URL will be:**
```
https://YOUR_USERNAME-penny-ai.hf.space
```

## Step 3: Connect Frontend to Hugging Face Space

### 3.1 Update Frontend Config

Update `src/lib/config.ts` in your frontend:

```typescript
// Backend URL - Your Hugging Face Space URL
export const BACKEND_URL = "https://YOUR_USERNAME-penny-ai.hf.space";

// Penny FastAPI endpoint
export const CHAT_ENDPOINT = `${BACKEND_URL}/chat`;
```

### 3.2 Test the Connection

1. Open your frontend at `http://localhost:8081`
2. Try sending a message to Penny
3. Check browser console (F12) for any errors
4. Check Network tab to see the API call

## Step 4: Verify the Endpoint

### 4.1 Test the Health Endpoint

```bash
curl https://YOUR_USERNAME-penny-ai.hf.space/health
```

### 4.2 Test the Chat Endpoint

```bash
curl -X POST "https://YOUR_USERNAME-penny-ai.hf.space/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, Penny!",
    "tenant_id": "norfolk",
    "user_id": "test_user",
    "session_id": "test_session"
  }'
```

## Step 5: Handle Hugging Face Space Specifics

### 5.1 Port Configuration

Hugging Face Spaces uses port **7860** by default. Make sure your FastAPI app listens on this port or configure it in your Space settings.

### 5.2 Path Configuration

If your Space URL includes a path (like `/api`), update the endpoint:

```typescript
export const CHAT_ENDPOINT = `${BACKEND_URL}/api/chat`;
```

### 5.3 CORS Configuration

Ensure Penny's CORS settings allow your frontend domain. Update in `app/main.py`:

```python
allow_origins=[
    "https://your-frontend-domain.com",
    "http://localhost:8081",  # For local development
]
```

## Troubleshooting

### Issue: 404 Not Found
- Check if the endpoint path is correct (`/chat` vs `/api/chat`)
- Verify the route is defined in Penny's `app/router.py`

### Issue: CORS Error
- Update CORS settings in Penny's `app/main.py`
- Add your frontend URL to `allow_origins`

### Issue: 500 Internal Server Error
- Check Hugging Face Space logs
- Verify all environment variables are set
- Check if all dependencies are in `requirements.txt`

### Issue: Timeout
- Hugging Face Spaces have timeout limits
- Consider optimizing Penny's response time
- Check if any long-running operations need to be optimized

## Alternative: Using Hugging Face Inference API

If you want to use Hugging Face's Inference API instead of deploying the full FastAPI app:

1. Create a Space with a Gradio interface
2. Expose the API endpoint
3. Connect via the Inference API

However, for a full FastAPI backend, deploying the Docker container is recommended.

## Benefits of Hugging Face Spaces

✅ **Free hosting** - No cost for public spaces  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Easy updates** - Push to GitHub, auto-deploys  
✅ **Public URL** - Shareable and accessible  
✅ **Built-in monitoring** - View logs and metrics  
✅ **Community features** - Easy to share and collaborate  

## Next Steps

1. Deploy Penny to Hugging Face Spaces
2. Update `src/lib/config.ts` with your Space URL
3. Test the connection
4. Deploy your frontend (via Lovable or other platform)
5. Update CORS to allow your production frontend URL

## Example Configuration

**Frontend (`src/lib/config.ts`):**
```typescript
export const BACKEND_URL = "https://cyber-shawties-penny-ai.hf.space";
export const CHAT_ENDPOINT = `${BACKEND_URL}/chat`;
```

**Penny (`app/main.py`):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```



