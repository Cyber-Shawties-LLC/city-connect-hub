# Testing Guide - Penny AI Integration

## Quick Test Steps

### 1. Start the Development Server

The dev server should already be running. If not:
```bash
npm run dev
```

The app should be available at: `http://localhost:5173`

### 2. Test the Integration

#### Step 1: Sign Up / Log In
1. Navigate to `http://localhost:5173`
2. Click on "Sign Up" or go to `/auth`
3. Create an account (or log in if you have one)
4. You should be redirected to the Dashboard

#### Step 2: Test Chat with Penny
1. On the Dashboard, find the "Chat with Penny" section
2. Type a message like:
   - "What community events are happening this weekend?"
   - "Tell me about local government services"
   - "What's the weather like?"
3. Click "Send" or press Enter
4. Wait for Penny's response

### 3. Check Browser Console

Open Developer Tools (F12) and check:
- **Console tab**: Look for any errors
- **Network tab**: 
  - Filter by "chat" or "penny"
  - Check the request payload (should have `message`, `user_id`, `session_id`, `tenant_id`)
  - Check the response status and body

### 4. Expected Request Format

When you send a message, the request should look like:
```json
{
  "message": "What community events are happening?",
  "user_id": "abc123",
  "session_id": "session_1234567890_xyz",
  "tenant_id": "norfolk"
}
```

### 5. Expected Response Format

Penny should respond with:
```json
{
  "response": "Here are some community events...",
  "intent": "community_events",
  "tenant_id": "norfolk",
  "session_id": "session_1234567890_xyz",
  "timestamp": "2025-01-XX...",
  "response_time_ms": 245
}
```

## Troubleshooting

### Issue: White Screen / App Won't Load
- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Check if dev server is running

### Issue: "API Error: 404"
- The endpoint might be `/api/chat` instead of `/chat`
- Check `src/lib/config.ts` and verify the endpoint
- Check if Penny backend is deployed and accessible

### Issue: "API Error: 500"
- Penny backend might be having issues
- Check Penny backend logs
- Verify the request format matches what Penny expects

### Issue: CORS Error
- Penny backend needs to allow requests from `http://localhost:5173`
- Check Penny's CORS configuration
- For production, update `ALLOWED_ORIGINS` in Penny's environment

### Issue: No Response / Loading Forever
- Check Network tab to see if request is pending
- Check browser console for errors
- Verify Penny backend is running and accessible

### Issue: Wrong Response Format
- Check Network tab to see actual response
- Update `src/lib/api.ts` if response format differs
- Check Penny's API documentation

## Manual API Test

You can test the API directly using curl:

```bash
curl -X POST "https://peoplesplaza-hgd4dsbygqmdjgfz.eastus-01.azurewebsites.net/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What community events are happening this weekend?",
    "tenant_id": "norfolk",
    "user_id": "test_user",
    "session_id": "test_session"
  }'
```

Expected: A JSON response with Penny's reply.

## What to Verify

✅ **Authentication**: User can sign up/login  
✅ **Dashboard Loads**: No white screen after login  
✅ **Chat Interface**: Chat box appears and is functional  
✅ **Message Sending**: Messages are sent to Penny API  
✅ **Response Receiving**: Penny's responses appear in chat  
✅ **Session Management**: Session ID persists across messages  
✅ **Error Handling**: Errors are displayed gracefully  

## Next Steps After Testing

1. If everything works: Commit and push changes
2. If there are issues: Check the troubleshooting section above
3. If endpoint is wrong: Update `src/lib/config.ts`
4. If response format differs: Update `src/lib/api.ts` and `src/hooks/usePennyChats.ts`



