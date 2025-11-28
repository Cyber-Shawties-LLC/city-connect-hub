# CORS Configuration Guide

## ❌ You DON'T Need CORS in Azure

**Azure Static Web Apps** is just serving your frontend files. It doesn't need CORS configuration because:
- It's making **outgoing** requests (not receiving them)
- CORS is only needed on the **server** that receives the requests

## ✅ You DO Need CORS in Hugging Face Space

The **Hugging Face Space** (Penny backend) needs to allow requests from your Azure domain.

## 🔧 How to Configure CORS in Penny (Hugging Face Space)

### Step 1: Get Your Azure Static Web App URL

Your Azure Static Web App URL will be something like:
- `https://your-app-name.azurestaticapps.net`
- Or your custom domain if configured

**To find it:**
1. Go to Azure Portal
2. Find your Static Web App resource
3. Check the "Overview" page for the URL

### Step 2: Update Penny's Code in Hugging Face Space

1. **Go to**: https://huggingface.co/spaces/CyberShawties/Penny_V2
2. **Click "Files and versions"** tab
3. **Find and edit** `app/main.py` or wherever CORS is configured
4. **Add/Update CORS middleware**:

```python
from fastapi.middleware.cors import CORSMiddleware

# Add this after creating your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app-name.azurestaticapps.net",  # Your Azure Static Web App URL
        "http://localhost:8081",  # For local development
        "http://localhost:5173",  # For local development
        "*"  # Temporary for testing - remove in production!
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 3: Commit and Push

1. **Commit** the changes in the Hugging Face Space
2. **Wait** for the Space to rebuild
3. **Test** the connection from your Azure site

## 🧪 Testing CORS

After configuring CORS, test from your Azure site's browser console:

```javascript
fetch('https://CYBERSHAWTIES-PENNY-V2.hf.space/api/chat_with_penny_sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: ["Hello", "Norfolk, VA", []]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**If CORS is configured correctly:**
- ✅ Request succeeds
- ✅ You get a response

**If CORS is NOT configured:**
- ❌ Browser console shows: "CORS policy" error
- ❌ Request is blocked by browser

## 📋 Quick Checklist

- [ ] Get your Azure Static Web App URL
- [ ] Update CORS in Penny's Hugging Face Space code
- [ ] Add your Azure URL to `allow_origins`
- [ ] Commit and push changes to Space
- [ ] Wait for Space to rebuild
- [ ] Test from Azure site

## 💡 Important Notes

1. **No trailing slash** in the URL (use `https://your-app.azurestaticapps.net` not `https://your-app.azurestaticapps.net/`)
2. **Include protocol** (`https://` not just the domain)
3. **For production**, remove the `"*"` wildcard and only allow specific domains
4. **For local dev**, keep `localhost` URLs in the list

## 🐛 If You Still Get CORS Errors

1. **Double-check** the URL is exactly correct (no typos)
2. **Verify** the Space has rebuilt after your changes
3. **Check** browser console for the exact error message
4. **Try** adding `"*"` temporarily to test (then remove it)

## Summary

- ❌ **Azure**: No CORS configuration needed
- ✅ **Hugging Face Space**: CORS configuration required
- 🎯 **Action**: Update Penny's code in the Space to allow your Azure domain

