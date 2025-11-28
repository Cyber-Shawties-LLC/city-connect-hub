# Fixing Penny Connection Error

## 🔍 Issue Found

The Hugging Face Space endpoint `/api/chat` exists but expects a different request format. The error shows:
```json
{"detail":[{"type":"missing","loc":["body","data"],"msg":"Field required"}]}
```

This suggests the Space might be using Gradio's API wrapper or a different FastAPI structure.

## ✅ Quick Fixes to Try

### Option 1: Check the Actual Endpoint

The Space might expose FastAPI routes differently. Try these in your browser console on the Azure site:

```javascript
// Test 1: Try /chat (direct FastAPI route)
fetch('https://CYBERSHAWTIES-PENNY-V2.hf.space/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello",
    tenant_id: "norfolk",
    user_id: "test",
    session_id: "test"
  })
}).then(r => r.json()).then(console.log).catch(console.error);

// Test 2: Try /api/predict (Gradio format)
fetch('https://CYBERSHAWTIES-PENNY-V2.hf.space/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: ["Hello", "norfolk", "test", "test"]
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Option 2: Check Hugging Face Space Code

1. Go to: https://huggingface.co/spaces/CyberShawties/Penny_V2
2. Check the **Files** tab
3. Look at `app/main.py` or `app/router.py`
4. Find the actual route definition
5. See what format it expects

### Option 3: Update API Client for Gradio Format

If the Space uses Gradio, you might need to wrap the payload:

```typescript
// In src/lib/api.ts - if Gradio format needed
export async function talkToPenny(payload: PennyPayload): Promise<PennyResponse> {
  // Gradio expects data as array
  const gradioPayload = {
    data: [
      payload.message,
      payload.tenant_id || "norfolk",
      payload.user_id || "",
      payload.session_id || ""
    ]
  };
  
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gradioPayload),
  });
  // ... rest of code
}
```

## 🎯 Most Likely Solution

The Space probably needs the FastAPI route exposed directly. You may need to:

1. **Check the Space's app structure** - Is it using Gradio or pure FastAPI?
2. **Update the Space code** to expose `/chat` route properly
3. **Or update the frontend** to match the Space's expected format

## 📋 Next Steps

1. **Check browser console** on your Azure site for the exact error
2. **Test the endpoint** using the JavaScript above
3. **Check the Space code** to see what format it expects
4. **Share the error details** so I can provide a specific fix

## 🔧 Current Configuration

- **Endpoint**: `/api/chat` (updated)
- **URL**: `https://CYBERSHAWTIES-PENNY-V2.hf.space`
- **Error**: Expects `data` field in body

Let me know what error you see in the browser console and I'll provide the exact fix!

