# Verify Penny API is Working

## Good News: No Errors!

If you're not seeing Penny API errors in the console, that's a **good sign**! It could mean:

1. ✅ The Azure Function is deployed and working
2. ✅ The API calls are succeeding
3. ✅ Errors are being handled gracefully

## How to Verify It's Actually Working

### Option 1: Test the Chat

1. **Go to the dashboard**
2. **Open the "Chat with Penny" section**
3. **Send a test message** (e.g., "Hello" or "What's the weather?")
4. **Check the console:**
   - Should see: "Calling Penny API via Azure Function"
   - Should see: "Penny API response: ..."
   - Should NOT see any errors

### Option 2: Check Browser Network Tab

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Send a message in Penny chat**
4. **Look for:**
   - Request to `/api/agent` (should be 200 OK)
   - Response should contain Penny's reply

### Option 3: Check Azure Function Logs

1. **Azure Portal:**
   - Go to your Static Web App
   - Click "Functions" → "agent"
   - Click "Logs" or "Monitor"
   - Look for recent function executions
   - Should see: "HF_TOKEN found: hf_..."
   - Should see: "Calling Penny Space: ..."

### Option 4: Test the Endpoint Directly

Open browser console and run:
```javascript
fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello",
    city: "Norfolk, VA",
    history: []
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected result:**
- Should return: `{ data: [...], response: "...", history: [...] }`
- Should NOT return: `{ error: "..." }`

## What to Look For

### ✅ Success Indicators:
- No errors in console when using chat
- Penny responds to messages
- Network tab shows 200 OK for `/api/agent`
- Azure Function logs show successful calls

### ⚠️ Potential Issues:
- Chat doesn't respond (but no errors) = Function might not be deployed
- Timeout errors = Function is slow or queue is taking time
- 500 errors = Function deployed but has runtime errors

## If Chat Isn't Working (But No Errors)

1. **Check if function is deployed:**
   - Azure Portal → Functions → Should see "agent" listed
   - If not listed, function isn't deployed yet

2. **Check function logs:**
   - Look for any errors or warnings
   - Check if HF_TOKEN is being read correctly

3. **Try sending a message:**
   - The function only runs when called
   - If you haven't used the chat, it won't show in logs

## Quick Test

The easiest way to verify:
1. **Send a message in Penny chat**
2. **If Penny responds = It's working! ✅**
3. **If no response = Check the steps above**

