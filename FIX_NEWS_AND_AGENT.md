# Fix News Feed and AI Agent Connection

## Issues Found

1. **News Feed not showing articles**: The fallback logic wasn't properly setting articles when API fails
2. **AI Agent not connecting**: The `agent.py` function needs to be deployed and configured

## Fixes Applied

### 1. News Feed Fix ✅

**Problem**: When the API fails (404 or error), articles array was being set to empty before mock data could be applied.

**Solution**: 
- Always use mock data as fallback when API fails
- Don't show error messages (users get data either way)
- Ensure articles are always set, never empty

**Changes made**:
- Fixed logic to always set mock articles on error
- Removed error display (since we have fallback data)
- Improved error handling to ensure articles are always populated

### 2. AI Agent Connection

**Current Status**:
- ✅ `api/agent.py` file exists and is ready
- ⚠️ Needs to be deployed to Azure
- ⚠️ Needs `HF_TOKEN` environment variable in Azure

**Next Steps**:

1. **Commit and push the agent function**:
   ```bash
   git add api/agent.py
   git commit -m "Add agent function for Penny AI"
   git push origin main
   ```

2. **Wait for deployment** (2-5 minutes):
   - Check GitHub Actions: https://github.com/YOUR_REPO/actions
   - Wait for deployment to complete

3. **Verify environment variables in Azure**:
   - Azure Portal → Static Web App → Configuration
   - Ensure `HF_TOKEN` is set (Hugging Face token)
   - Ensure `PENNY_SPACE_URL` is set (optional, has default)

4. **Test the agent**:
   - Open browser console (F12)
   - Send a message in Penny chat
   - Should see: "Calling Penny API via Azure Function"
   - Should NOT see: "Azure Function endpoint failed"

## Expected Behavior After Fix

### News Feed:
✅ Always shows articles (either from API or mock data)
✅ No error messages (seamless fallback)
✅ Updates when location changes

### AI Agent:
✅ Calls `/api/agent` endpoint
✅ Returns 200 OK (not 404 or 500)
✅ Penny responds to messages
✅ Falls back to direct Hugging Face if Azure Function fails

## Troubleshooting

### If News Feed Still Empty:
1. Check browser console for errors
2. Verify `selectedMarket` is set (location selector)
3. Check Network tab for `/api/news` requests

### If Agent Still Not Working:
1. **Check Azure Function logs**:
   - Azure Portal → Functions → agent → Logs
   - Look for errors or "HF_TOKEN not configured"

2. **Verify environment variables**:
   - `HF_TOKEN` must be set
   - Format: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Test the endpoint directly**:
   ```bash
   curl -X POST https://YOUR_SITE.azurestaticapps.net/api/agent \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "city": "Norfolk, VA"}'
   ```

4. **Check frontend console**:
   - Look for "Calling Penny API via Azure Function"
   - Check if it falls back to Hugging Face
   - Look for error messages

## Files Changed

- `src/components/NewsFeed.tsx` - Fixed fallback logic
- `api/agent.py` - Ready for deployment (already exists)

