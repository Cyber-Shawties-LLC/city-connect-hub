# Gradio API Troubleshooting Guide

## Issue: "Penny endpoint not found" Error

If you're getting a 404 error when calling the Gradio API, try these solutions:

## Solution 1: Check the Correct Endpoint

Gradio Spaces can use different endpoints depending on the version:

1. **Gradio 4.x+**: `/api/predict`
2. **Gradio 3.x**: `/run/predict`
3. **Queue API**: `/queue/join` (for async operations)

The code now tries `/api/predict` first, then falls back to `/run/predict`.

## Solution 2: Verify fn_index

The `fn_index` parameter identifies which Gradio function to call. Common values:
- `0` - First function (most common)
- `1` - Second function
- `2` - Third function, etc.

To find the correct `fn_index`:
1. Open the Hugging Face Space in your browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Send a message in the chat
5. Look for the API call and check the `fn_index` value

## Solution 3: Check the Data Format

Gradio expects inputs in a specific order. The current format is:
```json
{
  "data": [
    "message text",
    "city name",
    [["user msg", "bot msg"], ...]  // history
  ],
  "fn_index": 0,
  "session_hash": "session_id",
  "event_data": null
}
```

## Solution 4: Test the API Directly

Test the Gradio API directly using curl:

```bash
curl -X POST "https://pythonprincess-penny-v2-2.hf.space/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "data": ["Hello", "Norfolk, VA", []],
    "fn_index": 0,
    "session_hash": "test123",
    "event_data": null
  }'
```

If that fails, try:
```bash
curl -X POST "https://pythonprincess-penny-v2-2.hf.space/run/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "data": ["Hello", "Norfolk, VA", []],
    "fn_index": 0,
    "session_hash": "test123",
    "event_data": null
  }'
```

## Solution 5: Check CORS Settings

If you get CORS errors, the Hugging Face Space needs to allow your domain:
1. Go to Space Settings
2. Enable CORS for your domain
3. Or set CORS to allow all origins (for testing)

## Solution 6: Use the Queue API (For Async)

If the Space uses async processing, you might need the queue API:

```javascript
// Step 1: Join queue
const queueResponse = await fetch(`${BACKEND_URL}/queue/join`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fn_index: 0,
    data: ["message", "city", []],
    session_hash: sessionHash
  })
});

// Step 2: Poll for result
const result = await queueResponse.json();
```

## Debugging Steps

1. **Check Browser Console**: Look for detailed error messages
2. **Check Network Tab**: See the actual request/response
3. **Check Space Logs**: Go to Hugging Face Space → Logs
4. **Test Directly**: Use curl or Postman to test the API

## Common Issues

### Issue: 404 Not Found
- **Cause**: Wrong endpoint or fn_index
- **Fix**: Try different endpoints and fn_index values

### Issue: 422 Unprocessable Entity
- **Cause**: Wrong data format
- **Fix**: Check the data array format matches what Gradio expects

### Issue: CORS Error
- **Cause**: Space doesn't allow your domain
- **Fix**: Update CORS settings in Space configuration

### Issue: Timeout
- **Cause**: Space is sleeping or slow
- **Fix**: Wait for Space to wake up, or use queue API

## Next Steps

If none of these work:
1. Check the Space's `app.py` to see the exact function signature
2. Look at the Space's API documentation
3. Contact the Space owner for API details
4. Consider using the Gradio web component embed instead

