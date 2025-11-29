# Hugging Face Space CORS Configuration Guide

## Overview

Since we're now using the Azure Function (`/api/agent`) as a proxy, **you typically don't need to configure CORS on the Hugging Face Space** because:
- The Azure Function makes server-to-server requests (no CORS needed)
- The frontend only talks to your Azure Function (same origin or properly configured CORS)

However, if you want to use the Hugging Face Space directly (fallback mode), you'll need CORS configuration.

## Where to Find CORS Settings in Hugging Face Spaces

### Option 1: Gradio App Configuration (Recommended)

If your Hugging Face Space uses Gradio, CORS is typically configured in the Gradio app code:

1. **Navigate to your Hugging Face Space:**
   - Go to: https://huggingface.co/spaces/pythonprincess/Penny_V2.2
   - Click on the "Files" tab

2. **Find the main Gradio app file:**
   - Look for files like `app.py`, `main.py`, or `gradio_app.py`
   - This is where your Gradio interface is defined

3. **Add CORS configuration to your Gradio app:**

```python
import gradio as gr

# Create your Gradio interface
# ... your existing code ...

# Configure CORS when launching the app
if __name__ == "__main__":
    app = gr.Interface(
        # ... your interface configuration ...
    )
    
    # Enable CORS for your Azure Static Web App domain
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        # Add CORS configuration
        allowed_paths=["*"],  # Allow all paths
        # Or specify your domain:
        # cors_allow_origins=["https://blue-dune-00f22300f.3.azurestaticapps.net"]
    )
```

### Option 2: Space Configuration File

Some Hugging Face Spaces use a configuration file:

1. **Check for `config.json` or `.env` file:**
   - In the "Files" tab of your Space
   - Look for configuration files

2. **Add CORS headers in your FastAPI/Gradio app:**

If you're using FastAPI (which Gradio uses under the hood):

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://blue-dune-00f22300f.3.azurestaticapps.net",
        "http://localhost:8080",  # For local development
        "*"  # Or allow all origins (less secure)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 3: Gradio Blocks API (If using Blocks)

If you're using Gradio Blocks:

```python
import gradio as gr

with gr.Blocks() as demo:
    # ... your interface ...

# Configure CORS
demo.launch(
    server_name="0.0.0.0",
    cors_allow_origins=[
        "https://blue-dune-00f22300f.3.azurestaticapps.net",
        "http://localhost:8080"
    ]
)
```

## Current Setup (Recommended - No CORS Needed)

**You don't need to configure CORS** because:

1. **Frontend → Azure Function:** Same origin (or Azure handles CORS)
2. **Azure Function → Hugging Face:** Server-to-server (no CORS)

The Azure Function (`api/agent.py`) already includes CORS headers:

```python
"headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
}
```

## How to Verify CORS is Working

### Test Direct Hugging Face Space Access (if needed):

1. **Open browser console** (F12)
2. **Try to call the Hugging Face Space directly:**
   ```javascript
   fetch('https://pythonprincess-penny-v2-2.hf.space/api/predict', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ data: ['test', 'Norfolk, VA', []] })
   })
   ```
3. **Check for CORS errors:**
   - If you see: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
   - Then CORS needs to be configured

### Test Azure Function (Current Setup):

1. **Check browser console** for API calls to `/api/agent`
2. **Should see successful responses** (no CORS errors)
3. **Network tab** should show 200 status for `/api/agent` requests

## Troubleshooting

### If you see CORS errors:

1. **Check Azure Function is deployed:**
   - Verify `/api/agent` endpoint exists
   - Check Azure Portal → Static Web App → Functions

2. **Check environment variables:**
   - `HF_TOKEN` must be set in Azure
   - `PENNY_SPACE_URL` should be set (optional, has default)

3. **Check Azure Function logs:**
   - Azure Portal → Static Web App → Functions → agent → Logs
   - Look for errors or authentication issues

## Summary

**You don't need to configure CORS on Hugging Face Space** because:
- ✅ Azure Function acts as a proxy (no CORS needed)
- ✅ Azure Function already has CORS headers configured
- ✅ Server-to-server communication doesn't require CORS

**Only configure CORS if:**
- You want to use Hugging Face Space directly (bypassing Azure Function)
- You're testing direct access to the Space
- The Azure Function fallback isn't working

