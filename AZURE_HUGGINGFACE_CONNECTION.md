# Connecting Hugging Face Agent to Azure Static Web App

## ✅ Configuration Complete

Your frontend is now configured to connect to the Hugging Face Space:
- **Space**: `CyberShawties/Penny_V2`
- **URL**: `https://CYBERSHAWTIES-PENNY-V2.hf.space`
- **Endpoint**: `/chat`

## 🔧 What Was Updated

1. **`src/lib/config.ts`** - Updated to point to Hugging Face Space
2. **`src/lib/api.ts`** - Updated to use `message` field (matching Penny's FastAPI format)
3. **`src/hooks/usePennyChats.tsx`** - Updated to send `message` instead of `input`

## ⚠️ Critical: Configure CORS on Hugging Face Space

The most important step is to configure CORS in your Penny backend on Hugging Face to allow requests from your Azure Static Web App domain.

### Step 1: Get Your Azure Static Web App URL

Your Azure Static Web App will have a URL like:
- `https://your-app-name.azurestaticapps.net`
- Or your custom domain if configured

### Step 2: Update Penny's CORS Settings

You need to update the Penny code in the Hugging Face Space:

1. **Go to your Hugging Face Space**: https://huggingface.co/spaces/CyberShawties/Penny_V2
2. **Edit the code** (or clone and push):
   - Find `app/main.py` or `app/router.py`
   - Update CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app-name.azurestaticapps.net",  # Your Azure Static Web App URL
        "http://localhost:8081",  # For local development
        "http://localhost:5173",  # For local development
        "*"  # Temporary for testing - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

3. **Commit and push** the changes to the Space

### Step 3: Test the Connection

1. **Deploy your frontend** to Azure (push to GitHub)
2. **Visit your Azure Static Web App**
3. **Sign in and go to Dashboard**
4. **Try sending a message to Penny**
5. **Check browser console** (F12) for errors

## 🐛 Troubleshooting

### CORS Error

**Symptom**: Browser console shows "CORS policy" error

**Solution**: 
- Make sure CORS is configured in Penny's `app/main.py`
- Add your exact Azure Static Web App URL to `allow_origins`
- No trailing slashes in the URL

### 404 Not Found

**Symptom**: API returns 404

**Solution**:
- Check if endpoint is `/chat` or `/api/chat`
- Update `src/lib/config.ts` if needed:
  ```typescript
  export const CHAT_ENDPOINT = `${BACKEND_URL}/api/chat`;
  ```

### Timeout / Space Sleeping

**Symptom**: Request times out

**Solution**:
- Hugging Face Spaces sleep after inactivity
- Visit the Space URL first to wake it up
- Wait 30-60 seconds for cold start

### 500 Internal Server Error

**Symptom**: Backend returns 500

**Solution**:
- Check Hugging Face Space logs
- Verify environment variables are set
- Check if all dependencies are installed

## 📋 Testing Checklist

- [ ] CORS configured in Penny backend
- [ ] Azure Static Web App deployed
- [ ] Frontend config points to Hugging Face Space
- [ ] Space is awake (visit it in browser)
- [ ] Test message sends successfully
- [ ] Penny responds correctly
- [ ] No errors in browser console

## 🔐 Environment Variables (Optional)

If you want to use different URLs for different environments, you can set environment variables in Azure:

1. **Azure Portal** → Your Static Web App → Configuration → Application settings
2. **Add**:
   - Name: `VITE_PENNY_BACKEND_URL`
   - Value: `https://CYBERSHAWTIES-PENNY-V2.hf.space`

The config will automatically use this if set.

## 🚀 Quick Test

After deploying, test from browser console on your Azure site:

```javascript
fetch('https://CYBERSHAWTIES-PENNY-V2.hf.space/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello, Penny!",
    tenant_id: "norfolk",
    user_id: "test_user",
    session_id: "test_session"
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 📝 Next Steps

1. **Configure CORS** in Penny backend (most important!)
2. **Deploy frontend** to Azure (push to GitHub)
3. **Test the connection** from your Azure site
4. **Monitor** browser console for any errors
5. **Update CORS** if you get CORS errors

## 💡 Pro Tips

- **Wake up the Space** before testing (visit it in browser)
- **Check Network tab** in DevTools to see actual requests/responses
- **Use browser console** to test API directly
- **Check Hugging Face Space logs** if backend errors occur

