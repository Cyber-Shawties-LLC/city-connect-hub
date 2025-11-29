# Azure Function 404 Error - Solution

## Issue
The `/api/agent` endpoint is returning **404 Not Found**, meaning Azure Static Web Apps isn't recognizing the function.

## Root Cause
Azure Static Web Apps Python functions need to follow a specific structure. I've created the function in two formats:
1. ✅ `api/agent.py` (flat file - matches other functions like `news.py`, `weather.py`)
2. ❌ `api/agent/__init__.py` (folder structure - might be conflicting)

## Solution

### Option 1: Use Flat File Structure (Recommended)

The flat file `api/agent.py` should work since it matches the pattern of other working functions (`news.py`, `weather.py`, etc.).

**Steps:**
1. **Remove the folder structure** (to avoid conflicts):
   ```bash
   rm -rf api/agent/
   ```

2. **Keep only the flat file:**
   - `api/agent.py` ✅

3. **Commit and push:**
   ```bash
   git add api/agent.py
   git rm -r api/agent/
   git commit -m "Use flat file structure for agent function"
   git push origin main
   ```

### Option 2: Check Azure Portal

1. **Azure Portal → Static Web App → Functions:**
   - Check if `agent` function is listed
   - If not listed, it's not being discovered

2. **Check function logs:**
   - Functions → agent → Logs
   - Look for deployment errors

### Option 3: Verify Function Structure

Azure Static Web Apps Python functions should:
- Have `def main(req):` function
- Be in `api/` directory
- Match the pattern of other working functions

**Current structure:**
```
api/
  agent.py          ✅ (flat file - should work)
  news.py           ✅ (working)
  weather.py         ✅ (working)
  events.py          ✅ (working)
  host.json          ✅
  requirements.txt   ✅
```

## Why 404 Happens

1. **Function not deployed:**
   - Code not pushed to GitHub
   - GitHub Actions deployment failed
   - Function not discovered during deployment

2. **Wrong structure:**
   - Folder structure conflicts with flat file
   - Missing or incorrect function.json
   - Function name doesn't match file name

3. **Deployment issues:**
   - Build errors in GitHub Actions
   - Python dependencies not installed
   - Function app not configured correctly

## Quick Fix

1. **Remove folder structure:**
   ```bash
   git rm -r api/agent/
   ```

2. **Keep flat file:**
   - `api/agent.py` is already created ✅

3. **Commit and push:**
   ```bash
   git add api/agent.py
   git commit -m "Fix agent function structure"
   git push origin main
   ```

4. **Wait for deployment:**
   - Check GitHub Actions
   - Wait 2-5 minutes

5. **Test:**
   - Send message in Penny chat
   - Should see "Calling Penny API via Azure Function"
   - Should NOT see 404 error

## Verification

After deployment, check:
- Azure Portal → Functions → Should see `agent` listed
- Browser console → Should see successful API calls
- Network tab → `/api/agent` should return 200 OK

