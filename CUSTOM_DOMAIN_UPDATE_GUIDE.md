# Custom Domain Update Guide

## Overview

You've updated Azure Static Web App with a custom domain. Here's what needs to be checked/updated:

## ✅ What's Already Configured (No Changes Needed)

### 1. Azure Functions CORS
All your Azure Functions already use `"Access-Control-Allow-Origin": "*"` which means they accept requests from **any domain**, including your custom domain.

**Files that are already configured:**
- `api/agent.py` - Uses `"*"` for CORS
- `api/news.py` - Uses `"*"` for CORS
- `api/weather.py` - Uses `"*"` for CORS
- `api/events.py` - Uses `"*"` for CORS
- All other API functions - Use `"*"` for CORS

### 2. Frontend Code
- ✅ No hardcoded domains in the code
- ✅ Uses relative paths (`/api/agent`, `/api/news`, etc.)
- ✅ Will automatically work with your custom domain

### 3. Azure Static Web App Configuration
- ✅ `staticwebapp.config.json` doesn't reference specific domains
- ✅ Routes are domain-agnostic

## ⚠️ What Might Need Updating

### 1. Hugging Face Space CORS (If Using Direct Access)

**Only needed if:**
- You're using the Hugging Face Space directly (bypassing Azure Function)
- You have `ALLOWED_ORIGINS` environment variable set in Hugging Face Space

**How to update:**
1. Go to your Hugging Face Space: https://huggingface.co/spaces/pythonprincess/Penny_V2.2
2. Click **Settings** → **Variables and secrets**
3. If `ALLOWED_ORIGINS` exists, update it to include your custom domain:
   ```
   https://your-custom-domain.com,https://blue-dune-00f22300f.3.azurestaticapps.net
   ```
4. Or set it to `*` to allow all origins (less secure but easier)

**Note:** Since you're using Azure Function as a proxy, you typically **don't need** to update Hugging Face CORS because:
- Frontend → Azure Function (same origin or Azure handles CORS)
- Azure Function → Hugging Face (server-to-server, no CORS needed)

### 2. Environment Variables (Optional)

If you have any environment variables that reference the old domain, update them in:
- **Azure Portal** → **Static Web App** → **Configuration** → **Application settings**

**Common variables to check:**
- `ALLOWED_ORIGINS` (if set)
- Any webhook URLs
- Any callback URLs

### 3. Documentation Files (Optional)

The following documentation files reference the old domain, but these are just examples and don't affect functionality:
- `HUGGINGFACE_CORS_CONFIGURATION.md`
- `AZURE_FUNCTION_500_FIX.md`
- `AZURE_FUNCTION_404_FIX.md`
- Other `.md` files with example URLs

**These are just documentation** - you can update them later if you want, but they don't affect the app.

## ✅ Quick Verification Checklist

1. **Test your custom domain:**
   ```bash
   curl https://your-custom-domain.com/api/news?city=Norfolk&limit=5
   ```
   Should return news articles (or mock data if API not configured)

2. **Check browser console:**
   - Open your site on the custom domain
   - Check for CORS errors (should be none)
   - Check for 404 errors on API calls

3. **Test Penny chat:**
   - Send a message in the chat
   - Should work if Azure Function is deployed and `HF_TOKEN` is set

## Summary

**You don't need to update anything in the code!** 

The app is already configured to work with any domain because:
- ✅ All API functions use `"*"` for CORS
- ✅ Frontend uses relative paths
- ✅ No hardcoded domains in code

**Only update if:**
- You have `ALLOWED_ORIGINS` in Hugging Face Space (and want to restrict it)
- You have environment variables referencing the old domain (unlikely)

Your custom domain should work immediately! 🎉

