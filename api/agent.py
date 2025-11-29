import os
import requests
import json
import logging
import urllib.parse
import time
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function to proxy requests to Penny Hugging Face Space.
    Handles Gradio API format conversion and queue management.
    Also detects weather queries and fetches weather data.
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
        
        # Check if message is asking about weather or events
        weather_keywords = ["weather", "temperature", "temp", "forecast", "rain", "snow", "sunny", "cloudy", "how hot", "how cold", "what's the weather"]
        event_keywords = ["event", "activities", "things to do", "what's happening", "recommendations", "suggest", "outdoor", "indoor"]
        message_lower = message.lower()
        is_weather_query = any(keyword in message_lower for keyword in weather_keywords)
        is_event_query = any(keyword in message_lower for keyword in event_keywords)
        
        # Fetch weather data (for weather queries or event recommendations)
        # Also fetch events if user is asking about events/activities
        weather_info = None
        events_info = None
        
        if is_weather_query or is_event_query:
            try:
                # Parse city from "City, State" format
                city_parts = city.split(",")
                city_name = city_parts[0].strip() if city_parts else "Norfolk"
                state_name = city_parts[1].strip() if len(city_parts) > 1 else ""
                
                # For Azure Functions, call the weather function directly
                # We'll import and call the weather function's logic
                # Or make an HTTP request to the weather endpoint
                
                # In Azure Functions, we can call other functions using the function app URL
                # Get the function app URL from environment
                function_app_url = os.environ.get("WEBSITE_HOSTNAME", "")
                
                if function_app_url and function_app_url != "localhost":
                    # Production - construct full URL to weather function
                    protocol = "https" if "azurewebsites.net" in function_app_url or "azurestaticapps.net" in function_app_url else "http"
                    weather_url = f"{protocol}://{function_app_url}/api/weather?city={urllib.parse.quote(city_name)}&state={urllib.parse.quote(state_name)}"
                else:
                    # Local development - Azure Functions Core Tools uses port 7071
                    weather_url = f"http://localhost:7071/api/weather?city={urllib.parse.quote(city_name)}&state={urllib.parse.quote(state_name)}"
                
                logger.info(f"Fetching weather from: {weather_url}")
                
                # Make request to weather API
                weather_response = requests.get(weather_url, timeout=10)
                if weather_response.ok:
                    weather_info = weather_response.json()
                    logger.info(f"Weather data fetched: {weather_info.get('temperature')}°F for {city_name}")
                else:
                    logger.warning(f"Weather API returned {weather_response.status_code}: {weather_response.text[:200]}")
            except Exception as e:
                logger.warning(f"Failed to fetch weather data: {str(e)}")
                weather_info = None
            
            # If we have weather info, enhance the message to Penny
            if weather_info and not weather_info.get("_is_mock"):
                weather_text = f"Current weather in {city}: {weather_info.get('temperature')}°F, {weather_info.get('description')}. Feels like {weather_info.get('feels_like')}°F. Humidity: {weather_info.get('humidity')}%. Wind: {weather_info.get('wind_speed')} mph."
                
                # If event query, also fetch events for weather-based recommendations
                if is_event_query:
                    try:
                        # Parse city from "City, State" format
                        city_parts = city.split(",")
                        city_name = city_parts[0].strip() if city_parts else "Norfolk"
                        state_name = city_parts[1].strip() if len(city_parts) > 1 else ""
                        
                        # Get function app URL
                        function_app_url = os.environ.get("WEBSITE_HOSTNAME", "")
                        
                        if function_app_url and function_app_url != "localhost":
                            protocol = "https" if "azurewebsites.net" in function_app_url or "azurestaticapps.net" in function_app_url else "http"
                            events_url = f"{protocol}://{function_app_url}/api/events?city={urllib.parse.quote(city_name)}&state={urllib.parse.quote(state_name)}&limit=5"
                        else:
                            events_url = f"http://localhost:7071/api/events?city={urllib.parse.quote(city_name)}&state={urllib.parse.quote(state_name)}&limit=5"
                        
                        logger.info(f"Fetching events from: {events_url}")
                        events_response = requests.get(events_url, timeout=10)
                        if events_response.ok:
                            events_data = events_response.json()
                            events_info = events_data.get("events", [])
                            logger.info(f"Found {len(events_info)} events for recommendations")
                    except Exception as e:
                        logger.warning(f"Failed to fetch events: {str(e)}")
                        events_info = None
                
                # Build context message
                context_parts = [f"[Weather Context: {weather_text}]"]
                
                if events_info and len(events_info) > 0:
                    # Suggest events based on weather
                    temp = weather_info.get('temperature', 70)
                    condition = weather_info.get('description', '').lower()
                    
                    # Weather-based event recommendations
                    if temp >= 70 and ('sunny' in condition or 'clear' in condition):
                        weather_note = "Perfect weather for outdoor events!"
                    elif temp >= 60 and ('partly' in condition or 'clear' in condition):
                        weather_note = "Nice weather for outdoor activities."
                    elif temp < 50 or 'rain' in condition or 'snow' in condition:
                        weather_note = "Consider indoor events due to weather."
                    else:
                        weather_note = "Check event details for indoor/outdoor status."
                    
                    # Format events list with dates
                    events_list = []
                    for e in events_info[:3]:
                        event_date = e.get('date', '')
                        try:
                            if event_date:
                                date_obj = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                                date_str = date_obj.strftime('%b %d at %I:%M %p')
                            else:
                                date_str = "TBD"
                        except:
                            date_str = "TBD"
                        events_list.append(f"- {e.get('title', 'Event')} on {date_str} at {e.get('location', 'TBD')}")
                    
                    context_parts.append(f"[Upcoming Events in {city}: {weather_note}\n" + "\n".join(events_list) + "]")
                
                enhanced_message = f"{message}\n\n" + "\n\n".join(context_parts)
                message = enhanced_message
                logger.info("Enhanced message with weather and events data")
        
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
        # Space: pythonprincess/Penny_V2.2
        # URL: https://huggingface.co/spaces/pythonprincess/Penny_V2.2
        PENNY_SPACE_URL = os.environ.get("PENNY_SPACE_URL", "https://pythonprincess-penny-v2-2.hf.space")
        
        # Use /run/predict endpoint (most reliable for Gradio)
        # This endpoint works with proper authentication
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
        # Use /run/predict with authentication - this should work
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
