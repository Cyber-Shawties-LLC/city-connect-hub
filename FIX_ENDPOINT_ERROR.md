# Fix: "Penny endpoint not found" Error

## ✅ What I Just Fixed

1. **Updated endpoint** to use `/run/chat_with_penny_sync` (simpler Gradio API)
2. **Simplified API call** - removed complex queue system, using direct `/run` endpoint
3. **Better error messages** - will show more specific errors

## 🔍 What to Check Now

### 1. Check Browser Console

On your Azure site, open DevTools (F12) and check:

**Console Tab:**
- Look for the exact error message
- Should show: "Penny API call failed:" with details

**Network Tab:**
- Filter by "chat" or "penny" or "hf.space"
- Click on the failed request
- Check:
  - **Request URL**: Should be `https://CYBERSHAWTIES-PENNY-V2.hf.space/run/chat_with_penny_sync`
  - **Status Code**: 
    - `404` = Endpoint not found
    - `CORS error` = CORS not configured
    - `500` = Backend error
  - **Response**: What error message is returned

### 2. Test the Endpoint Directly

In browser console on your Azure site, run:

```javascript
fetch('https://CYBERSHAWTIES-PENNY-V2.hf.space/run/chat_with_penny_sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(["Hello, Penny!", "Norfolk, VA", []])
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => {
  console.log('✅ Success:', data);
})
.catch(err => {
  console.error('❌ Error:', err);
});
```

**What you'll see:**
- ✅ **Success**: Response with chat history
- ❌ **404**: Endpoint path is wrong
- ❌ **CORS error**: Need to configure CORS in Space
- ❌ **500**: Backend error

### 3. Most Likely Issue: CORS

If you see a CORS error, you need to:

1. **Go to**: https://huggingface.co/spaces/CyberShawties/Penny_V2
2. **Edit the code** to add CORS
3. **Add your Azure URL** to allowed origins

## 🚀 Next Steps

1. **Push the updated code** to GitHub
2. **Wait for Azure to deploy**
3. **Test again** on your Azure site
4. **Check browser console** for the specific error
5. **Share the error** you see so I can provide exact fix

## 📋 Common Errors & Fixes

### Error: "404 Not Found"
- **Fix**: The endpoint might be different
- **Try**: Check if Space uses a different API structure

### Error: "CORS policy"
- **Fix**: Configure CORS in Hugging Face Space
- **Action**: Add your Azure URL to `allow_origins`

### Error: "500 Internal Server Error"
- **Fix**: Check Hugging Face Space logs
- **Action**: Verify environment variables are set

### Error: "Request timeout"
- **Fix**: Space might be sleeping
- **Action**: Visit the Space URL first to wake it up

The code is now simplified and should work better. Push and test, then share what error you see!

