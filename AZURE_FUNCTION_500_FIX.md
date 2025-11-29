# Azure Function 500 Error - Fix Guide

## Current Issue

The Azure Function `/api/agent` is deployed but returning **500 Internal Server Error**.

## What I Fixed

1. **Simplified the queue system:**
   - Removed complex queue polling logic
   - Using `/run/predict` directly with authentication
   - This is more reliable for Azure Functions

2. **Fixed HTTP method access:**
   - Added proper method checking for OPTIONS requests
   - Handles CORS preflight correctly

3. **Better error handling:**
   - All exceptions are caught and logged
   - Returns proper error responses

## Next Steps

### 1. Commit and Push the Fix

```bash
git add api/agent/__init__.py
git commit -m "Simplify Azure Function - fix 500 error"
git push origin main
```

### 2. Wait for Deployment

- GitHub Actions will deploy automatically
- Check: https://github.com/YOUR_REPO/actions
- Wait 2-5 minutes for deployment

### 3. Check Azure Function Logs

After deployment, check logs:
- Azure Portal → Static Web App → Functions → agent → Logs
- Look for:
  - "HF_TOKEN found: hf_..."
  - "Calling Penny Space: ..."
  - Any error messages

### 4. Test Again

Send a message in Penny chat and check:
- Console should show: "Calling Penny API via Azure Function"
- Should NOT show: "Azure Function endpoint failed"
- Should NOT show: 500 error
- Penny should respond!

## Common 500 Error Causes

1. **Missing environment variables:**
   - Check `HF_TOKEN` is set in Azure
   - Check `PENNY_SPACE_URL` (optional, has default)

2. **Python import errors:**
   - Check `requirements.txt` has all dependencies
   - `requests` and `time` should be available

3. **Function timeout:**
   - Function timeout is set to 5 minutes in `host.json`
   - Should be enough for Gradio calls

4. **Authentication issues:**
   - HF_TOKEN might be invalid
   - Check token format: should start with `hf_`

## If Still Getting 500

1. **Check Azure Function logs:**
   - Most important: Look for the actual error message
   - Will tell you exactly what's failing

2. **Test the function directly:**
   ```bash
   curl -X POST https://blue-dune-00f22300f.3.azurestaticapps.net/api/agent \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "city": "Norfolk, VA"}'
   ```

3. **Check environment variables:**
   - Azure Portal → Static Web App → Configuration
   - Verify `HF_TOKEN` is set and correct

## Expected Behavior After Fix

✅ Function returns 200 OK (not 500)  
✅ Function uses HF_TOKEN correctly  
✅ Function calls Hugging Face Space  
✅ Penny responds to messages  

The simplified version should be more reliable and easier to debug.

