import os
import requests
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function for fetching weather data.
    Uses Azure Maps Weather API (primary) with fallback to OpenWeatherMap/WeatherAPI.com.
    """
    try:
        # Get query parameters
        city = req.params.get("city") or "Norfolk"
        state = req.params.get("state") or ""
        
        # Get Azure Maps key (primary)
        azure_maps_key = os.environ.get("AZURE_MAPS_KEY")
        
        # Fallback APIs (if Azure Maps not configured)
        openweather_api_key = os.environ.get("OPENWEATHER_API_KEY")
        weatherapi_key = os.environ.get("WEATHERAPI_KEY")
        
        weather_data = None
        
        # Try Azure Maps Weather API first (if key is configured)
        if azure_maps_key:
            logger.info(f"Azure Maps key found, attempting to fetch weather for {city}, {state}")
            try:
                # First, get coordinates for the city using Azure Maps Geocoding
                geocode_url = "https://atlas.microsoft.com/search/address/json"
                geocode_params = {
                    "api-version": "1.0",
                    "subscription-key": azure_maps_key,
                    "query": f"{city}, {state}, US" if state else f"{city}, US"
                }
                
                logger.info(f"Geocoding {city}, {state} with Azure Maps")
                geocode_response = requests.get(geocode_url, params=geocode_params, timeout=10)
                geocode_response.raise_for_status()
                geocode_data = geocode_response.json()
                
                logger.info(f"Geocoding response: {json.dumps(geocode_data)[:200]}")
                
                if geocode_data.get("results") and len(geocode_data["results"]) > 0:
                    position = geocode_data["results"][0]["position"]
                    lat = position["lat"]
                    lon = position["lon"]
                    
                    logger.info(f"Found coordinates: {lat}, {lon}")
                    
                    # Now get current weather conditions using Azure Maps Weather API
                    weather_url = "https://atlas.microsoft.com/weather/currentConditions/json"
                    weather_params = {
                        "api-version": "1.1",
                        "subscription-key": azure_maps_key,
                        "query": f"{lat},{lon}"
                    }
                    
                    logger.info(f"Fetching weather from Azure Maps for coordinates {lat},{lon}")
                    weather_response = requests.get(weather_url, params=weather_params, timeout=10)
                    weather_response.raise_for_status()
                    weather_result = weather_response.json()
                    
                    logger.info(f"Weather API response received")
                    
                    if weather_result.get("results") and len(weather_result["results"]) > 0:
                        current = weather_result["results"][0]
                        
                        # Convert Azure Maps Weather format to our format
                        # Temperature is in Celsius, convert to Fahrenheit
                        temp_c = current["temperature"]["value"]
                        temp_f = round(temp_c * 9/5 + 32)
                        
                        # RealFeel temperature (if available)
                        realfeel_c = current.get("realFeelTemperature", {}).get("value", temp_c)
                        realfeel_f = round(realfeel_c * 9/5 + 32)
                        
                        # Wind speed (convert from m/s to mph)
                        wind_mps = current.get("wind", {}).get("speed", {}).get("value", 0)
                        wind_mph = round(wind_mps * 2.237)
                        
                        weather_data = {
                            "temperature": temp_f,
                            "feels_like": realfeel_f,
                            "description": current["phrase"],
                            "icon": None,  # Azure Maps doesn't provide icon codes like OpenWeatherMap
                            "humidity": current.get("relativeHumidity", 0),
                            "wind_speed": wind_mph,
                            "city": city,
                            "state": state,
                            "country": "US",
                            "timestamp": datetime.now().isoformat()
                        }
                        
                        logger.info(f"Successfully fetched weather from Azure Maps: {temp_f}°F, {current['phrase']}")
                    else:
                        logger.warning("Azure Maps Weather API returned no results")
                        weather_data = None
                else:
                    logger.warning(f"Azure Maps Geocoding returned no results for {city}, {state}")
                    weather_data = None
                        
            except requests.exceptions.HTTPError as e:
                error_text = e.response.text if hasattr(e, 'response') else str(e)
                logger.error(f"Azure Maps HTTP error: {e.response.status_code} - {error_text}")
                weather_data = None
            except requests.exceptions.RequestException as e:
                logger.error(f"Azure Maps request error: {str(e)}")
                weather_data = None
            except (KeyError, IndexError) as e:
                logger.error(f"Azure Maps Weather data parsing error: {str(e)}")
                weather_data = None
        else:
            logger.warning("AZURE_MAPS_KEY not found in environment variables")
        
        # Fallback to OpenWeatherMap if Azure Maps failed or not configured
        if not weather_data and openweather_api_key:
            try:
                # OpenWeatherMap API
                # Format: "City, State, Country" or just "City, Country"
                query = f"{city},{state},US" if state else f"{city},US"
                url = "https://api.openweathermap.org/data/2.5/weather"
                params = {
                    "q": query,
                    "appid": openweather_api_key,
                    "units": "imperial"  # Fahrenheit
                }
                
                logger.info(f"Fetching weather from OpenWeatherMap for {query}")
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                # Convert OpenWeatherMap format to our format
                weather_data = {
                    "temperature": round(data["main"]["temp"]),
                    "feels_like": round(data["main"]["feels_like"]),
                    "description": data["weather"][0]["description"].title(),
                    "icon": data["weather"][0]["icon"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": round(data["wind"].get("speed", 0)),
                    "city": data["name"],
                    "country": data["sys"].get("country", "US"),
                    "timestamp": datetime.now().isoformat()
                }
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"OpenWeatherMap error: {str(e)}, trying WeatherAPI")
                weather_data = None
        
        # Fallback to WeatherAPI.com if OpenWeatherMap failed or not configured
        if not weather_data and weatherapi_key:
            try:
                # WeatherAPI.com
                query = f"{city},{state}" if state else city
                url = f"http://api.weatherapi.com/v1/current.json"
                params = {
                    "key": weatherapi_key,
                    "q": query,
                    "aqi": "no"
                }
                
                logger.info(f"Fetching weather from WeatherAPI for {query}")
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                # Convert WeatherAPI format to our format
                weather_data = {
                    "temperature": round(data["current"]["temp_f"]),
                    "feels_like": round(data["current"]["feelslike_f"]),
                    "description": data["current"]["condition"]["text"],
                    "icon": data["current"]["condition"]["icon"],
                    "humidity": data["current"]["humidity"],
                    "wind_speed": round(data["current"]["wind_mph"]),
                    "city": data["location"]["name"],
                    "state": data["location"].get("region", state),
                    "country": data["location"]["country"],
                    "timestamp": datetime.now().isoformat()
                }
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"WeatherAPI error: {str(e)}")
                weather_data = None
        
        # If no API keys or all failed, return mock data with error info
        if not weather_data:
            logger.warning(f"No weather data available for {city}, {state}. Returning mock data.")
            weather_data = get_mock_weather(city, state)
            # Add a flag to indicate this is mock data
            weather_data["_is_mock"] = True
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps(weather_data)
        }, 200
        
    except Exception as e:
        logger.error(f"Weather error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }, 500

def get_mock_weather(city: str, state: str = ""):
    """Generate mock weather data for development"""
    # Simple mock data based on city (for testing)
    mock_temps = {
        "Norfolk": 72,
        "El Paso": 85,
        "Atlanta": 68,
        "Providence": 55,
        "Birmingham": 70,
        "Chesterfield": 65,
        "Seattle": 58
    }
    
    temp = mock_temps.get(city, 70)
    
    return {
        "temperature": temp,
        "feels_like": temp + 2,
        "description": "Partly Cloudy",
        "icon": "02d",
        "humidity": 65,
        "wind_speed": 8,
        "city": city,
        "state": state,
        "country": "US",
        "timestamp": datetime.now().isoformat()
    }

