# Weather API Setup Guide

## Overview

The weather system uses a priority-based approach with multiple fallback options:

1. **Azure Maps Weather API** (Primary) - Uses your existing Azure Maps account
2. **OpenWeatherMap** (Fallback 1) - Free tier available
3. **WeatherAPI.com** (Fallback 2) - Free tier available
4. **Mock Data** (Last Resort) - For development/testing

## Setting Up Weather APIs

### Option 1: Azure Maps (Already Configured)

Your Azure Maps account should already be set up. Verify:
- **Environment Variable**: `AZURE_MAPS_KEY`
- **Location**: Azure Portal → Static Web App → Configuration → Environment variables
- **Value**: Your Azure Maps Primary Key

### Option 2: OpenWeatherMap (Recommended Fallback)

1. **Sign up**: https://openweathermap.org/api
2. **Free tier**: 60 calls/minute, 1,000,000 calls/month
3. **Get API key**: After signup, go to API keys section
4. **Add to Azure**:
   - Variable name: `OPENWEATHER_API_KEY`
   - Value: Your OpenWeatherMap API key

### Option 3: WeatherAPI.com (Alternative Fallback)

1. **Sign up**: https://www.weatherapi.com/
2. **Free tier**: 1 million calls/month
3. **Get API key**: After signup, copy your API key
4. **Add to Azure**:
   - Variable name: `WEATHERAPI_KEY`
   - Value: Your WeatherAPI.com API key

## How It Works

1. **Azure Maps** is tried first (if `AZURE_MAPS_KEY` is set)
2. If Azure Maps fails, **OpenWeatherMap** is tried (if `OPENWEATHER_API_KEY` is set)
3. If OpenWeatherMap fails, **WeatherAPI.com** is tried (if `WEATHERAPI_KEY` is set)
4. If all fail, **mock data** is returned (for development)

## Testing

Test the weather API directly:

```bash
# Test with city/state
curl "https://your-app.azurestaticapps.net/api/weather?city=Norfolk&state=VA"

# Test with coordinates
curl "https://your-app.azurestaticapps.net/api/weather?city=Norfolk&state=VA&lat=36.8468&lon=-76.2852"
```

## Penny Chat Integration

Penny now automatically detects weather queries and fetches weather data:

**User asks**: "What's the weather?"
**Penny receives**: Enhanced message with current weather data
**Penny responds**: With accurate weather information

Weather keywords that trigger the API:
- weather
- temperature
- temp
- forecast
- rain
- snow
- sunny
- cloudy
- how hot
- how cold

## Troubleshooting

### Weather shows same for all cities

**Check:**
1. Azure Functions logs for weather API errors
2. Browser console for API call failures
3. Verify API keys are set in Azure

### Azure Maps not working

**Check:**
1. `AZURE_MAPS_KEY` is set correctly
2. Azure Maps account has Weather API enabled
3. Check Azure Maps pricing tier (Weather API requires Gen1 or Gen2)

### All APIs failing

**Solution:**
- Add `OPENWEATHER_API_KEY` or `WEATHERAPI_KEY` as fallback
- Both have free tiers and are easy to set up

## Recommended Setup

For best reliability, set up:
1. ✅ `AZURE_MAPS_KEY` (Primary - you have this)
2. ✅ `OPENWEATHER_API_KEY` (Fallback - recommended)
3. ⚠️ `WEATHERAPI_KEY` (Optional - additional fallback)

This ensures weather always works even if one API has issues.

