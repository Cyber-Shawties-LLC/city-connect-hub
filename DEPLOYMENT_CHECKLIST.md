# Deployment Checklist - Penny API Fix

## ✅ Environment Variables (Already Set in Azure)

You have these configured in Azure Portal:
- ✅ `HF_TOKEN` - Hugging Face authentication token
- ✅ `PENNY_SPACE_URL` - Hugging Face Space URL

## ✅ Function Structure (Ready)

The function is properly structured:
```
api/
  agent/
    __init__.py      ✅ (function code with queue handling)
    function.json    ✅ (HTTP trigger configuration)
  host.json          ✅ (function app config)
  requirements.txt   ✅ (Python dependencies)
```

## 🚀 Next Step: Deploy

The function code is ready but needs to be deployed. You have two options:

### Option 1: Automatic Deployment (Recommended)

1. **Commit and push to GitHub:**
   ```bash
   git add api/agent/
   git commit -m "Add Azure Function for Penny API with Gradio queue support"
   git push origin main
   ```

2. **GitHub Actions will automatically deploy:**
   - Check: https://github.com/YOUR_REPO/actions
   - Look for "Azure Static Web Apps CI/CD" workflow
   - Wait for it to complete (usually 2-5 minutes)

3. **Verify deployment:**
   - Azure Portal → Static Web App → Functions
   - Should see `agent` function listed
   - Check logs for any errors

### Option 2: Manual Deployment

1. **Azure Portal:**
   - Go to your Static Web App
   - Functions → Upload
   - Upload the `api/agent/` folder

## ✅ After Deployment - Test

1. **Check browser console:**
   - Should see: "Calling Penny API via Azure Function"
   - Should NOT see: "Azure Function endpoint failed"

2. **Test the endpoint:**
   ```bash
   curl -X POST https://blue-dune-00f22300f.3.azurestaticapps.net/api/agent \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "city": "Norfolk, VA"}'
   ```

3. **Check function logs:**
   - Azure Portal → Static Web App → Functions → agent → Logs
   - Should see: "HF_TOKEN found: hf_..."
   - Should see: "Calling Penny Space: ..."

## 🔍 Troubleshooting

### If still getting 404:

1. **Check function name:**
   - Folder must be exactly `api/agent/`
   - Not `api/agent.py` (old structure)

2. **Check function.json:**
   - Must be in `api/agent/` folder
   - Must have `httpTrigger` binding

3. **Check deployment logs:**
   - GitHub Actions → Latest workflow run
   - Look for errors in build/deploy steps

### If getting 500 errors:

1. **Check HF_TOKEN:**
   - Must start with `hf_`
   - Must have read access to the Space
   - Check Azure Portal → Environment variables → Show value

2. **Check PENNY_SPACE_URL:**
   - Should be: `https://pythonprincess-penny-v2-2.hf.space`
   - Or your custom Space URL

3. **Check function logs:**
   - Azure Portal → Functions → agent → Logs
   - Look for specific error messages

## 📋 Summary

✅ Environment variables configured
✅ Function code ready with queue handling
✅ Function structure correct
⏳ **Waiting for deployment** - Push to GitHub!

Once deployed, the Penny API should work through the Azure Function, which will:
1. Use your HF_TOKEN for authentication
2. Handle Gradio's queue system automatically
3. Return responses to the frontend

