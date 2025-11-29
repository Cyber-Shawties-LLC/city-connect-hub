# WeatherAPI.com Troubleshooting Guide

## Issue: Weather not showing on static site

If you've added `WEATHERAPI_KEY` to Azure but weather still isn't working, follow these steps:

## Step 1: Verify Environment Variable

1. **Azure Portal** → Your Static Web App → **Configuration** → **Environment variables**
2. **Variable name**: `WEATHERAPI_KEY` (exact match, case-sensitive)
3. **Value**: Your WeatherAPI.com API key (from https://www.weatherapi.com/)
4. **Save** and **restart** the function app

## Step 2: Verify API Key

1. Go to https://www.weatherapi.com/
2. Log in to your account
3. Go to **Dashboard** → **API Key**
4. Copy your API key
5. Make sure it matches what's in Azure

## Step 3: Test WeatherAPI.com Directly

Test your API key works:

```bash
# Replace YOUR_API_KEY with your actual key
curl "https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=Norfolk,VA&aqi=no"
```

**Expected response**:
```json
{
  "location": {...},
  "current": {
    "temp_f": 72,
    "condition": {"text": "Partly cloudy"},
    ...
  }
}
```

**If you get an error**:
- `401 Unauthorized` → API key is wrong
- `403 Forbidden` → API key expired or quota exceeded
- `400 Bad Request` → Check query format

## Step 4: Check Azure Functions Logs

1. **Azure Portal** → Static Web App → **Functions** → `weather` → **Monitor**
2. Look for log messages:
   - ✅ `"Fetching weather from WeatherAPI.com for..."`
   - ✅ `"Successfully fetched weather from WeatherAPI.com: XX°F"`
   - ❌ `"WeatherAPI.com HTTP error: 401"` → Wrong API key
   - ❌ `"WeatherAPI.com HTTP error: 403"` → Quota exceeded or key expired
   - ❌ `"WEATHERAPI_KEY not found"` → Environment variable not set

## Step 5: Verify Function App Restart

After adding/changing environment variables:
1. **Azure Portal** → Static Web App → **Overview**
2. Click **"Restart"** (or wait a few minutes for auto-restart)
3. Environment variables are loaded on function app startup

## Step 6: Test Weather API Endpoint

Test the weather function directly:

```bash
# Replace with your actual app URL
curl "https://your-app.azurestaticapps.net/api/weather?city=Norfolk&state=VA"
```

**Check response**:
- Should return JSON with `temperature`, `description`, etc.
- If `_is_mock: true` → API is failing, using mock data
- If `_error` field → Check the error message

## Common Issues

### Issue 1: "WeatherAPI Key present: False"

**Solution**: 
- Environment variable name must be exactly `WEATHERAPI_KEY`
- Check it's saved in Azure Configuration
- Restart the function app

### Issue 2: "WeatherAPI.com HTTP error: 401"

**Solution**:
- API key is incorrect
- Get a new key from https://www.weatherapi.com/
- Update in Azure Configuration

### Issue 3: "WeatherAPI.com HTTP error: 403"

**Solution**:
- API quota exceeded (free tier: 1M calls/month)
- Or API key expired
- Check your WeatherAPI.com dashboard for quota status

### Issue 4: Weather shows same for all cities

**Solution**:
- Weather API is failing and using mock data
- Check Azure Functions logs for errors
- Verify `WEATHERAPI_KEY` is set correctly

### Issue 5: Weather not updating when changing location

**Solution**:
- Check browser console for API errors
- Verify the weather API is being called with correct city/state
- Check network tab to see if `/api/weather` requests are successful

## Testing Checklist

- [ ] `WEATHERAPI_KEY` is set in Azure Configuration
- [ ] Function app has been restarted after adding the key
- [ ] API key works when tested directly with curl
- [ ] Azure Functions logs show successful weather API calls
- [ ] Browser console shows weather data being received
- [ ] Weather updates when changing market cities

## Still Not Working?

1. **Check Azure Functions logs** for specific error messages
2. **Test API key directly** using curl (Step 3)
3. **Verify environment variable** is accessible to Python functions
4. **Check WeatherAPI.com dashboard** for quota/status
5. **Try a different city** to see if it's city-specific

