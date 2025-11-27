# Quick Deployment Steps - Penny to Hugging Face Spaces

## TL;DR - Fastest Path to Deploy

### 1. Prepare Penny Repository (5 minutes)

```bash
# Clone Penny repo
git clone https://github.com/Cyber-Shawties-LLC/Penny.git
cd Penny

# Create app.py for Hugging Face (if it doesn't exist)
cat > app.py << 'EOF'
from app.main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
EOF

# Ensure requirements.txt exists with all dependencies
# (Should already exist in the repo)
```

### 2. Update CORS in Penny (2 minutes)

Edit `app/main.py` or `app/router.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

# Add this after creating your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For now, allow all (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Create Hugging Face Space (3 minutes)

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Name: `penny-ai` (or your choice)
4. SDK: **Docker**
5. Click **"Create Space"**

### 4. Push Code to Space (2 minutes)

```bash
# In the Penny directory
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/penny-ai
git push hf main
```

### 5. Configure Environment Variables (2 minutes)

1. Go to your Space → Settings → Variables and secrets
2. Add:
   - `AZURE_MAPS_KEY` (if needed)
   - `AZURE_OPENAI_KEY` (if needed)
   - `ENVIRONMENT=production`

### 6. Update Frontend Config (1 minute)

Edit `src/lib/config.ts`:

```typescript
export const BACKEND_URL = "https://YOUR_USERNAME-penny-ai.hf.space";
export const CHAT_ENDPOINT = `${BACKEND_URL}/chat`;
```

### 7. Test (2 minutes)

```bash
# Test the endpoint
curl -X POST "https://YOUR_USERNAME-penny-ai.hf.space/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "tenant_id": "norfolk", "user_id": "test", "session_id": "test"}'
```

**Total time: ~15 minutes!**

## What You'll Get

- ✅ Public URL: `https://YOUR_USERNAME-penny-ai.hf.space`
- ✅ Automatic HTTPS
- ✅ Free hosting
- ✅ Auto-deploy on git push

## Common Issues & Quick Fixes

**404 Error?**
- Check if endpoint is `/chat` or `/api/chat`
- Look at Penny's router.py to see the actual route

**CORS Error?**
- Make sure CORS middleware is added in Penny's main.py
- Add your frontend URL to `allow_origins`

**500 Error?**
- Check Space logs (Settings → Logs)
- Verify environment variables are set
- Check requirements.txt has all dependencies



