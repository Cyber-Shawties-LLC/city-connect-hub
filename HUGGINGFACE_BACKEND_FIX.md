# Fixing Hugging Face Space Backend for Gradio Integration

## Problem Summary

The error you're seeing:
```
"Input should be a valid dictionary or object to extract fields from"
"input": ["Penny whats the weather?", "Norfolk, VA", []]
```

This happens because:
- **Gradio** sends parameters as an **array**: `[message, city, history]`
- **FastAPI** expects a **dictionary/object**: `{message: "...", city: "...", history: []}`
- The Gradio function needs to convert the array format to the dictionary format before calling FastAPI

## Solution Overview

You need to modify the Gradio interface function in your Hugging Face Space to:
1. Accept the array format from Gradio
2. Unpack it into named parameters
3. Convert to dictionary format for FastAPI
4. Call your FastAPI endpoint
5. Return the response in Gradio's expected format

---

## Step-by-Step Guide

### Step 1: Access Your Hugging Face Space Code

1. Go to https://huggingface.co/spaces/CyberShawties/Penny_V2
2. Click on the **"Files and versions"** tab
3. You'll see the repository files (likely `app.py`, `requirements.txt`, etc.)

### Step 2: Locate the Gradio Interface Function

Find the file that contains your Gradio interface (likely `app.py` or `main.py`). Look for a function like:

```python
def chat_with_penny_sync(message, city, history):
    # Current implementation
    pass
```

### Step 3: Update the Function to Handle Array Format

The function needs to:
1. Accept parameters in the order Gradio sends them (as positional arguments)
2. Convert them to the format your FastAPI endpoint expects
3. Call your FastAPI endpoint
4. Return the response in Gradio format

Here's the updated function structure:

```python
def chat_with_penny_sync(message: str, city: str, history: list):
    """
    Gradio interface function that converts array format to FastAPI format.
    
    Args:
        message: User's message (string)
        city: Selected city (string)
        history: Chat history as list of tuples [[user_msg, bot_msg], ...]
    
    Returns:
        Tuple of (updated_history, cleared_message) for Gradio
    """
    try:
        # Convert Gradio history format to FastAPI format if needed
        # Gradio sends: [[user_msg, bot_msg], [user_msg, bot_msg], ...]
        # FastAPI might expect: [[user_msg, bot_msg], ...] (same format)
        
        # Prepare the payload for FastAPI
        payload = {
            "message": message,
            "city": city,
            "tenant_id": "norfolk",  # or extract from city
            "history": history  # Already in correct format
        }
        
        # Call your FastAPI endpoint
        # Option 1: If FastAPI is in the same app, import and call directly
        from app.main import chat_endpoint_function  # Adjust import path
        response = chat_endpoint_function(payload)
        
        # Option 2: If FastAPI is separate, use HTTP request
        # import requests
        # response = requests.post(
        #     "http://localhost:8000/api/chat",  # Your FastAPI endpoint
        #     json=payload
        # ).json()
        
        # Extract bot response
        bot_message = response.get("response", "I'm sorry, I didn't get a response.")
        
        # Update history for Gradio format
        # Gradio expects: [[user_msg, bot_msg], [user_msg, bot_msg], ...]
        updated_history = history + [[message, bot_message]]
        
        # Return in Gradio format: (updated_history, cleared_message)
        return updated_history, ""  # Clear the input textbox
        
    except Exception as e:
        # Handle errors gracefully
        error_message = f"Error: {str(e)}"
        updated_history = history + [[message, error_message]]
        return updated_history, ""
```

### Step 4: Update the Gradio Interface Definition

Make sure your Gradio interface is set up correctly:

```python
import gradio as gr

# Your updated function
def chat_with_penny_sync(message, city, history):
    # ... implementation from Step 3
    pass

# Create the Gradio interface
with gr.Blocks() as demo:
    city_dropdown = gr.Dropdown(
        choices=["Norfolk, VA", "Atlanta, GA", "Birmingham, AL", ...],
        value="Norfolk, VA",
        label="📍 Select Your City"
    )
    
    chatbot = gr.Chatbot(
        label="💬 Chat with PENNY",
        height=500
    )
    
    message_input = gr.Textbox(
        placeholder="Type your message here...",
        label="Message"
    )
    
    # Connect the interface
    # When button is clicked or Enter is pressed
    message_input.submit(
        fn=chat_with_penny_sync,
        inputs=[message_input, city_dropdown, chatbot],
        outputs=[chatbot, message_input],
        api_name="chat_with_penny_sync"  # Important: This creates the API endpoint
    )
    
    # Also handle button click
    send_button.click(
        fn=chat_with_penny_sync,
        inputs=[message_input, city_dropdown, chatbot],
        outputs=[chatbot, message_input],
        api_name="chat_with_penny_sync_1"  # Alternative endpoint name
    )

demo.launch()
```

### Step 5: Alternative - Direct FastAPI Integration

If your FastAPI endpoint is separate, you can call it directly:

```python
import requests
import os

def chat_with_penny_sync(message: str, city: str, history: list):
    """
    Calls FastAPI endpoint with proper format conversion.
    """
    try:
        # Get FastAPI URL (could be internal or external)
        fastapi_url = os.getenv("FASTAPI_URL", "http://localhost:8000")
        endpoint = f"{fastapi_url}/api/chat"  # Adjust to your endpoint
        
        # Prepare payload in FastAPI format
        payload = {
            "message": message,
            "city": city,
            "tenant_id": "norfolk",
            "history": history,
            # Add other fields if needed
        }
        
        # Make request to FastAPI
        response = requests.post(
            endpoint,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        # Extract bot message
        bot_message = result.get("response", "I'm sorry, I didn't get a response.")
        
        # Update history for Gradio
        updated_history = history + [[message, bot_message]]
        
        return updated_history, ""  # Return (history, cleared_input)
        
    except requests.exceptions.RequestException as e:
        error_msg = f"API Error: {str(e)}"
        updated_history = history + [[message, error_msg]]
        return updated_history, ""
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        updated_history = history + [[message, error_msg]]
        return updated_history, ""
```

### Step 6: Update FastAPI Endpoint (If Needed)

If your FastAPI endpoint also needs updating, ensure it accepts the dictionary format:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Tuple, Optional

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    city: Optional[str] = "Norfolk, VA"
    tenant_id: Optional[str] = "norfolk"
    history: Optional[List[Tuple[str, str]]] = []
    user_id: Optional[str] = None
    session_id: Optional[str] = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    FastAPI endpoint that accepts dictionary format.
    """
    # Your existing chat logic here
    response_text = await process_chat(
        message=request.message,
        city=request.city,
        history=request.history,
        tenant_id=request.tenant_id
    )
    
    return {
        "response": response_text,
        "intent": "unknown",
        "tenant_id": request.tenant_id,
        "session_id": request.session_id,
        "timestamp": datetime.now().isoformat()
    }
```

### Step 7: Test Locally (Optional but Recommended)

Before pushing to Hugging Face, test locally:

```bash
# In your Penny repository
python app.py  # or however you run Gradio

# In another terminal, test the API
curl -X POST "http://localhost:7860/api/chat_with_penny_sync" \
  -H "Content-Type: application/json" \
  -d '{"data": ["Hello", "Norfolk, VA", []]}'
```

### Step 8: Commit and Push to Hugging Face

1. **Commit your changes:**
   ```bash
   git add app.py  # or whatever file you modified
   git commit -m "Fix Gradio array to FastAPI dictionary conversion"
   git push
   ```

2. **Or use Hugging Face's web editor:**
   - Go to your Space → Files and versions
   - Click on the file you need to edit
   - Click "Edit" button
   - Make your changes
   - Click "Commit changes"

3. **Wait for rebuild:**
   - Hugging Face will automatically rebuild your Space
   - Check the "Logs" tab to see if there are any errors
   - The rebuild usually takes 2-5 minutes

### Step 9: Verify the Fix

After the Space rebuilds, test it:

```bash
# Test the Gradio API endpoint
curl -X POST "https://CYBERSHAWTIES-PENNY-V2.hf.space/run/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "fn_index": 1,
    "data": ["Hello, what is the weather?", "Norfolk, VA", []],
    "session_hash": "test123"
  }'
```

You should get a response with the updated chat history.

---

## Key Points to Remember

1. **Gradio sends arrays**: `[message, city, history]`
2. **FastAPI expects dictionaries**: `{message: "...", city: "...", history: []}`
3. **Your Gradio function is the bridge**: It converts array → dictionary → calls FastAPI → returns array
4. **Return format**: Gradio expects `(updated_history, cleared_message)` tuple

## Common Issues and Solutions

### Issue: "Function not found" error
- **Solution**: Make sure `api_name` is set in your Gradio interface
- Check that the function name matches what you're calling

### Issue: "History format incorrect"
- **Solution**: Ensure history is in format `[[user_msg, bot_msg], [user_msg, bot_msg], ...]`
- Both Gradio and FastAPI use this format, so no conversion needed

### Issue: "Timeout" errors
- **Solution**: Increase timeout in your requests or FastAPI endpoint
- Check Hugging Face Space logs for backend errors

### Issue: "CORS" errors
- **Solution**: Make sure CORS is configured in your FastAPI app:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # Or specific origins
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

## Quick Reference: File Structure

Your Hugging Face Space should have:

```
Penny_V2/
├── app.py              # Main Gradio interface (UPDATE THIS)
├── requirements.txt    # Dependencies
├── README.md          # Space description
└── (other files from your repo)
```

The key file to modify is `app.py` (or wherever your Gradio interface is defined).

---

## Need Help?

If you encounter issues:
1. Check the Hugging Face Space **Logs** tab for error messages
2. Test the endpoint using curl (see Step 9)
3. Verify the function signature matches what Gradio expects
4. Ensure all dependencies are in `requirements.txt`

---

## Summary

The fix involves updating your Gradio function to:
1. ✅ Accept array parameters from Gradio
2. ✅ Convert to dictionary format
3. ✅ Call FastAPI endpoint
4. ✅ Return response in Gradio format

Once you make these changes and push to Hugging Face, the frontend should work correctly!

