import os
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function to proxy requests to Penny Hugging Face Space.
    Handles Gradio API format conversion and queue management.
    """
    try:
        # Get request body
        body = req.get_json() or {}
        
        # Extract parameters from request
        message = body.get("message", "")
        city = body.get("city", "Norfolk, VA")
        history = body.get("history", [])
        session_id = body.get("session_id") or f"session_{hash(str(req))}"
        
        if not message:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Message is required"})
            }, 400
        
        # Get Hugging Face token from environment
        # Token should be set in Azure Static Web App → Configuration → Environment variables
        # Format: hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        HF_TOKEN = os.environ.get("HF_TOKEN")
        if not HF_TOKEN:
            logger.error("HF_TOKEN environment variable not set")
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "HF_TOKEN not configured"})
            }, 500
        
        # Log token status (without exposing the actual token)
        logger.info(f"HF_TOKEN found: {HF_TOKEN[:10]}...{HF_TOKEN[-4:] if len(HF_TOKEN) > 14 else '***'}")
        
        # Penny Hugging Face Space URL
        PENNY_SPACE_URL = os.environ.get("PENNY_SPACE_URL", "https://CYBERSHAWTIES-PENNY-V2.hf.space")
        predict_endpoint = f"{PENNY_SPACE_URL}/run/predict"
        
        # Prepare Gradio API request
        # Gradio expects: { fn_index, data: [message, city, history], session_hash, event_data }
        gradio_payload = {
            "fn_index": 1,  # chat_with_penny_sync function index
            "data": [
                message,
                city,
                history
            ],
            "session_hash": session_id,
            "event_data": None
        }
        
        # Headers for Hugging Face Space
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {HF_TOKEN}" if HF_TOKEN else None
        }
        # Remove None values
        headers = {k: v for k, v in headers.items() if v is not None}
        
        logger.info(f"Calling Penny Space: {predict_endpoint}")
        logger.info(f"Payload: {json.dumps(gradio_payload, indent=2)}")
        
        # Make request to Gradio API
        response = requests.post(
            predict_endpoint,
            headers=headers,
            json=gradio_payload,
            timeout=60  # Gradio can take time
        )
        
        if not response.ok:
            error_text = response.text
            logger.error(f"Penny API error: {response.status_code} - {error_text}")
            return {
                "statusCode": response.status_code,
                "body": json.dumps({
                    "error": f"Penny API error: {response.status_code}",
                    "details": error_text
                })
            }, response.status_code
        
        result = response.json()
        
        # Gradio returns: { data: [chatbot_history, cleared_message] }
        # chatbot_history is array of [user_msg, bot_msg] tuples
        response_data = result.get("data", result)
        
        # Extract history and bot message
        if isinstance(response_data, list) and len(response_data) > 0:
            history_array = response_data[0] if isinstance(response_data[0], list) else []
            last_message = history_array[-1] if history_array else None
            bot_reply = last_message[1] if last_message and len(last_message) > 1 else "I'm sorry, I didn't get a response."
        else:
            bot_reply = "I'm sorry, I didn't get a response."
            history_array = history
        
        # Return in format expected by frontend
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "data": response_data,
                "response": bot_reply,
                "history": history_array,
                "session_id": session_id
            })
        }, 200
        
    except requests.exceptions.Timeout:
        logger.error("Request to Penny Space timed out")
        return {
            "statusCode": 504,
            "body": json.dumps({"error": "Request to Penny timed out"})
        }, 504
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return {
            "statusCode": 502,
            "body": json.dumps({"error": f"Failed to connect to Penny: {str(e)}"})
        }, 502
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Internal server error: {str(e)}"})
        }, 500
