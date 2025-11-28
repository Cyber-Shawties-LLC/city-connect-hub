# Debugging Penny Connection Errors

## Quick Diagnostic Steps

### 1. Check Browser Console

Open your Azure Static Web App and:

1. **Open DevTools** (F12)
2. **Go to Console tab** - Look for error messages
3. **Go to Network tab** - Filter by "chat" or "hf.space"
4. **Click on the failed request** to see:
   - Request URL
   - Request payload
   - Response status
   - Response body

### 2. Common Error Types

#### CORS Error
**Looks like**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**: 
- Update CORS in Penny's Hugging Face Space
- Add your Azure Static Web App URL to `allow_origins`

#### 404 Not Found
**Looks like**: `API Error: 404` or `Not Found`

**Solution**:
- Try `/api/chat` instead of `/chat`
- Check if the endpoint path is correct

#### 500 Internal Server Error
**Looks like**: `API Error: 500`

**Solution**:
- Check Hugging Face Space logs
- Verify environment variables are set
- Check if Space is running

#### Timeout / Failed to Fetch
**Looks like**: `Failed to fetch` or `NetworkError`

**Solution**:
- Space might be sleeping - visit it in browser first
- Check if Space URL is correct
- Verify network connectivity

### 3. Test the Endpoint Directly

Run this in your browser console on the Azure site:

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

### 4. Check Request Format

The request should look like:
```json
{
  "message": "Your message here",
  "tenant_id": "norfolk",
  "user_id": "user123",
  "session_id": "session456"
}
```

### 5. Verify Configuration

Check `src/lib/config.ts`:
- Should point to: `https://CYBERSHAWTIES-PENNY-V2.hf.space`
- Endpoint should be: `/chat` (or `/api/chat` if that's what Penny uses)

## What Error Are You Seeing?

Please share:
1. **Error message** from browser console
2. **Network tab** details (status code, response)
3. **Request URL** being called
4. **Any CORS errors**

This will help identify the exact issue!

