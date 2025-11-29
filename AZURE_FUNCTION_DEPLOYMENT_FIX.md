# Azure Function Deployment Fix

## Issue
The `/api/agent` endpoint is returning 404, which means the Azure Function isn't deployed or accessible.

## What I Fixed

1. **Created proper Azure Function structure:**
   - Moved `api/agent.py` → `api/agent/__init__.py`
   - Created `api/agent/function.json` with HTTP trigger configuration

2. **Updated the function to handle Gradio queue system:**
   - Tries `/api/predict` first
   - Falls back to queue system if needed
   - Handles polling for results

## Next Steps to Deploy

### Option 1: Automatic Deployment (Recommended)

1. **Commit and push to GitHub:**
   ```bash
   git add api/agent/
   git commit -m "Fix Azure Function structure and Gradio queue handling"
   git push origin main
   ```

2. **GitHub Actions will automatically deploy:**
   - The workflow in `.github/workflows/azure-static-web-apps-blue-dune-00f22300f.yml` will build and deploy
   - Check GitHub Actions tab to see deployment status

### Option 2: Manual Deployment via Azure Portal

1. **Go to Azure Portal:**
   - Navigate to your Static Web App
   - Go to "Functions" section
   - Click "Upload" or "Deploy"

2. **Upload the function:**
   - Upload the `api/agent/` folder
   - Or use Azure CLI/VS Code extension

### Option 3: Verify Function Structure

The function should be structured as:
```
api/
  agent/
    __init__.py    (the function code)
    function.json  (HTTP trigger config)
  host.json        (function app config)
  requirements.txt (Python dependencies)
```

## Verify Deployment

1. **Check Azure Portal:**
   - Static Web App → Functions
   - Should see `agent` function listed
   - Check logs for any errors

2. **Test the endpoint:**
   ```bash
   curl -X POST https://blue-dune-00f22300f.3.azurestaticapps.net/api/agent \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "city": "Norfolk, VA"}'
   ```

3. **Check browser console:**
   - Should see "Calling Penny API via Azure Function"
   - Should NOT see "Azure Function endpoint failed"

## Environment Variables Required

Make sure these are set in Azure Portal → Configuration → Environment variables:

- `HF_TOKEN` - Your Hugging Face token (required)
- `PENNY_SPACE_URL` - Optional (defaults to pythonprincess-penny-v2-2.hf.space)
- `WEATHERAPI_KEY` - For weather API (optional)
- `NEWS_API_KEY` - For news API (optional)

## If Still Getting 404

1. **Check function name:**
   - Function folder must be named `agent`
   - `function.json` must be in `api/agent/` folder

2. **Check function.json:**
   - Must have `httpTrigger` binding
   - `authLevel` should be `"anonymous"` for public access

3. **Check host.json:**
   - Should be in `api/` root directory
   - Should have extension bundle configured

4. **Check logs:**
   - Azure Portal → Static Web App → Functions → agent → Logs
   - Look for deployment or runtime errors

## Current Status

✅ Function code updated with queue handling
✅ Function structure created (`api/agent/` folder)
✅ Configuration file created (`function.json`)
⏳ **Waiting for deployment** - Push to GitHub to trigger deployment

