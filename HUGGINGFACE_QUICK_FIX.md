# Quick Fix: Hugging Face Space Backend

## The Problem
Gradio sends: `["message", "city", []]` (array)  
FastAPI expects: `{message: "...", city: "...", history: []}` (dictionary)

## The Fix (Copy-Paste Ready)

### Option 1: If FastAPI is in the same codebase

Update your `chat_with_penny_sync` function in `app.py`:

```python
def chat_with_penny_sync(message: str, city: str, history: list):
    """
    Gradio function that converts array to dictionary for FastAPI.
    """
    try:
        # Import your FastAPI function (adjust import path)
        from app.routers.chat import process_chat_message  # Adjust this
        
        # Call FastAPI function with dictionary format
        result = process_chat_message(
            message=message,
            city=city,
            tenant_id="norfolk",
            history=history
        )
        
        # Extract bot response
        bot_message = result.get("response", "I'm sorry, I didn't get a response.")
        
        # Update history: add [user_message, bot_message]
        updated_history = history + [[message, bot_message]]
        
        # Return for Gradio: (updated_history, cleared_input)
        return updated_history, ""
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        updated_history = history + [[message, error_msg]]
        return updated_history, ""
```

### Option 2: If FastAPI is separate (HTTP call)

```python
import requests
import os

def chat_with_penny_sync(message: str, city: str, history: list):
    """
    Calls FastAPI via HTTP with proper format conversion.
    """
    try:
        # Get FastAPI URL (set in Hugging Face Space settings if needed)
        fastapi_url = os.getenv("FASTAPI_URL", "http://localhost:8000")
        
        # Prepare dictionary payload for FastAPI
        payload = {
            "message": message,
            "city": city,
            "tenant_id": "norfolk",
            "history": history
        }
        
        # Call FastAPI endpoint
        response = requests.post(
            f"{fastapi_url}/api/chat",  # Adjust endpoint
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        # Extract bot message
        bot_message = result.get("response", "I'm sorry, I didn't get a response.")
        
        # Update history for Gradio
        updated_history = history + [[message, bot_message]]
        
        return updated_history, ""
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        updated_history = history + [[message, error_msg]]
        return updated_history, ""
```

### Ensure Gradio Interface is Set Up

```python
import gradio as gr

# Your function (from above)
def chat_with_penny_sync(message, city, history):
    # ... implementation
    pass

# Create interface
with gr.Blocks() as demo:
    city = gr.Dropdown(
        choices=["Norfolk, VA", "Atlanta, GA", ...],
        value="Norfolk, VA",
        label="📍 Select Your City"
    )
    
    chatbot = gr.Chatbot(label="💬 Chat with PENNY")
    msg = gr.Textbox(placeholder="Type your message...")
    
    # Connect with api_name
    msg.submit(
        fn=chat_with_penny_sync,
        inputs=[msg, city, chatbot],
        outputs=[chatbot, msg],
        api_name="chat_with_penny_sync"  # ← This creates the API endpoint
    )

demo.launch()
```

## Steps to Deploy

1. **Edit the file** in Hugging Face Space (Files → Edit)
2. **Update the function** with code from above
3. **Commit changes**
4. **Wait for rebuild** (2-5 minutes)
5. **Test** using curl or your frontend

## Test After Deploy

```bash
curl -X POST "https://CYBERSHAWTIES-PENNY-V2.hf.space/run/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "fn_index": 1,
    "data": ["Hello", "Norfolk, VA", []],
    "session_hash": "test123"
  }'
```

Expected response:
```json
{
  "data": [
    [["Hello", "Bot response here"]],
    ""
  ]
}
```

## That's It!

The key is converting the **array** `[message, city, history]` to a **dictionary** `{message: ..., city: ..., history: ...}` before calling FastAPI.

