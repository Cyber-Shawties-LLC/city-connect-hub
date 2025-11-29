# Azure Function 404 Error - Fix Guide

## Current Issue

The console shows:
```
"Calling Penny API via Azure Function: Object { endpoint: "/api/agent", ... }"
"Azure Function endpoint failed, trying direct Hugging Face Space..."
```

This means `/api/agent` is returning **404 Not Found**.

## Why This Happens

The Azure Function code is ready but **not deployed yet**. The function needs to be:
1. ✅ Committed to git (done)
2. ⏳ Pushed to GitHub (may need to do this)
3. ⏳ Deployed by GitHub Actions (automatic after push)

## Quick Fix

### Step 1: Verify Files Are Committed

```bash
git status
```

If `api/agent/` shows as modified or untracked:
```bash
git add api/agent/
git commit -m "Add Azure Function for Penny API"
```

### Step 2: Push to GitHub

```bash
git push origin main
```

### Step 3: Wait for Deployment

1. Go to: https://github.com/YOUR_REPO/actions
2. Find "Azure Static Web Apps CI/CD" workflow
3. Wait for it to complete (2-5 minutes)

### Step 4: Verify Deployment

1. **Azure Portal:**
   - Static Web App → Functions
   - Should see `agent` function listed

2. **Test the endpoint:**
   ```bash
   curl -X POST https://blue-dune-00f22300f.3.azurestaticapps.net/api/agent \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "city": "Norfolk, VA"}'
   ```

3. **Check browser console:**
   - Send a message in Penny chat
   - Should see: "Calling Penny API via Azure Function"
   - Should NOT see: "Azure Function endpoint failed"
   - Penny should respond!

## Alternative: Check if Already Deployed

If you've already pushed, check:

1. **Azure Portal → Static Web App → Functions:**
   - Is `agent` listed?
   - If yes, check logs for errors
   - If no, deployment may have failed

2. **GitHub Actions:**
   - Check latest workflow run
   - Look for errors in build/deploy steps

3. **Function Structure:**
   - Ensure `api/agent/__init__.py` exists
   - Ensure `api/agent/function.json` exists
   - Both should be committed to git

## Expected After Deployment

✅ `/api/agent` returns 200 OK  
✅ Function uses `HF_TOKEN` from Azure  
✅ Function handles Gradio queue automatically  
✅ Penny chat works without errors  

## If Still Getting 404 After Deployment

1. **Check function name:**
   - Must be exactly `agent` (folder name)
   - Not `Agent` or `AGENT`

2. **Check function.json:**
   - Must be in `api/agent/` folder
   - Must have `httpTrigger` binding

3. **Check Azure Portal logs:**
   - Functions → agent → Logs
   - Look for deployment or runtime errors

4. **Check GitHub Actions:**
   - Look for build errors
   - Check if `api_location: "api"` is set correctly

