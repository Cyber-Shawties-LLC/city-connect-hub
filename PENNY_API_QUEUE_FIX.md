# Penny API Queue System Fix

## Issue
The Hugging Face Gradio API is returning: "This API endpoint does not accept direct HTTP POST requests. Please join the queue to use this API."

## Solution
Gradio requires using the queue system for API calls. The Azure Function has been updated to handle this.

## How It Works

1. **Try `/api/predict` first** - Newer Gradio versions handle queues automatically
2. **If queue error, use queue system:**
   - `/queue/join` - Get a queue hash
   - `/queue/push` - Submit the request
   - `/queue/status` - Poll for results

## Current Implementation

The Azure Function (`api/agent.py`) now:
- Tries `/api/predict` first
- Falls back to queue system if needed
- Handles polling for results
- Returns proper error messages

## Testing

1. **Check Azure Function logs:**
   - Azure Portal → Static Web App → Functions → agent → Logs
   - Look for "Calling Penny Space" messages

2. **Check browser console:**
   - Should see "Calling Penny API via Azure Function"
   - Should not see queue errors

3. **Verify environment variables:**
   - `HF_TOKEN` must be set in Azure
   - `PENNY_SPACE_URL` should be set (has default)

## If Still Failing

1. **Check if Azure Function is deployed:**
   - Azure Portal → Static Web App → Functions
   - Should see `agent` function listed

2. **Check function logs for errors:**
   - Look for authentication errors
   - Look for timeout errors
   - Look for queue errors

3. **Verify Hugging Face Space is running:**
   - Visit: https://pythonprincess-penny-v2-2.hf.space
   - Should see the Gradio interface

4. **Check HF_TOKEN:**
   - Must be a valid Hugging Face token
   - Should have read access to the Space

