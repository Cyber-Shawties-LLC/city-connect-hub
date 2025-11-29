# Weather API Debugging Guide

## Issue: Weather not updating based on location

If the weather is not changing when you select different locations, follow these steps:

## Step 1: Verify Azure Maps Key is Set

1. Go to **Azure Portal** → Your **Static Web App** → **Configuration** → **Environment variables**
2. Verify `AZURE_MAPS_KEY` exists and has the correct value
3. The key should be your Azure Maps **Primary Key** (not Secondary Key)

## Step 2: Check Azure Functions Logs

1. Go to **Azure Portal** → Your **Static Web App** → **Functions**
2. Click on the `weather` function
3. Go to **Monitor** or **Logs** tab
4. Look for log messages that show:
   - `"Azure Maps key found, attempting to fetch weather for..."`
   - `"Geocoding response: ..."`
   - `"Successfully fetched weather from Azure Maps: ..."`
   - OR error messages like `"AZURE_MAPS_KEY not found"` or `"Azure Maps HTTP error"`

## Step 3: Test the Weather API Directly

Open your browser's Developer Console (F12) and check:

1. **Network Tab**: Look for requests to `/api/weather?city=...&state=...`
2. **Console Tab**: Look for:
   - `"Weather data received:"` - shows what data was returned
   - `"Weather API returned mock data"` - means Azure Maps failed
   - Any error messages

## Step 4: Common Issues and Solutions

### Issue 1: "AZURE_MAPS_KEY not found in environment variables"

**Solution:**
- Make sure the environment variable is set in Azure Static Web Apps Configuration
- The variable name must be exactly: `AZURE_MAPS_KEY` (case-sensitive)
- After adding/changing, you may need to restart the function app

### Issue 2: "Azure Maps HTTP error: 401"

**Solution:**
- Your Azure Maps key is invalid or expired
- Go to Azure Portal → Your Azure Maps Account → Authentication → Keys
- Copy the **Primary Key** again and update it in Static Web App configuration

### Issue 3: "Azure Maps HTTP error: 403"

**Solution:**
- Your Azure Maps account may not have the Weather API enabled
- Check your Azure Maps pricing tier - Weather API requires Gen1 or Gen2 pricing tier
- Go to Azure Portal → Your Azure Maps Account → Overview → Check pricing tier

### Issue 4: Weather shows mock data (same temperature for all cities)

**Solution:**
- Azure Maps API is failing silently
- Check the Azure Functions logs (Step 2) to see the actual error
- The weather API will fall back to mock data if all APIs fail

### Issue 5: Weather doesn't update when changing location

**Solution:**
- Check browser console for errors
- Verify the `WeatherCard` component is receiving location changes
- The `useEffect` dependency should include `selectedMarket?.id` and `selectedMarket?.name`

## Step 5: Manual API Test

You can test the Azure Maps API directly using curl:

```bash
# Replace YOUR_AZURE_MAPS_KEY with your actual key
# Replace "Norfolk" with any city name

# Test geocoding
curl "https://atlas.microsoft.com/search/address/json?api-version=1.0&subscription-key=YOUR_AZURE_MAPS_KEY&query=Norfolk,VA,US"

# If geocoding works, test weather (replace lat,lon with coordinates from geocoding)
curl "https://atlas.microsoft.com/weather/currentConditions/json?api-version=1.1&subscription-key=YOUR_AZURE_MAPS_KEY&query=36.8468,-76.2852"
```

## Step 6: Verify Location Changes Are Working

1. Open browser console (F12)
2. Change the location in the dropdown
3. You should see:
   - Network request to `/api/weather?city=...&state=...`
   - Console log: `"Weather data received: ..."`
4. If you don't see a new request, the location change isn't triggering the weather fetch

## Expected Behavior

When working correctly:
- ✅ Weather updates immediately when you change location
- ✅ Different cities show different temperatures
- ✅ Weather description changes (e.g., "Sunny", "Cloudy", "Rainy")
- ✅ Console shows: `"Successfully fetched weather from Azure Maps: XX°F, ..."`

## Still Not Working?

1. Check Azure Functions logs for detailed error messages
2. Verify your Azure Maps account has Weather API access (check pricing tier)
3. Test the Azure Maps API directly using curl (Step 5)
4. Check if the environment variable is accessible to Python functions (may need to restart function app)

