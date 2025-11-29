# Penny Hugging Face Space Update

## Updated Configuration

The Penny AI agent has been updated to use the new Hugging Face Space:

**New Space**: [pythonprincess/Penny_V2.2](https://huggingface.co/spaces/pythonprincess/Penny_V2.2)

**Space URL**: `https://pythonprincess-penny-v2-2.hf.space`

## Changes Made

### 1. Frontend Configuration (`src/lib/config.ts`)
- Updated `BACKEND_URL` to point to the new Space
- Default URL: `https://pythonprincess-penny-v2-2.hf.space`
- Can still be overridden with `VITE_PENNY_BACKEND_URL` environment variable

### 2. Azure Function (`api/agent.py`)
- Updated default `PENNY_SPACE_URL` to the new Space
- Can still be overridden with `PENNY_SPACE_URL` environment variable in Azure

## Testing

1. **Test the Chat Interface**:
   - Go to Dashboard → Chat with Penny
   - Send a test message
   - Verify Penny responds correctly

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Check Network tab for requests to `pythonprincess-penny-v2-2.hf.space`
   - Verify no CORS errors

3. **Verify API Calls**:
   - Requests should go to: `https://pythonprincess-penny-v2-2.hf.space/run/predict`
   - Using Gradio API format with `fn_index: 1`

## Environment Variables

### Frontend (Optional)
- `VITE_PENNY_BACKEND_URL` - Override the default Hugging Face Space URL

### Azure Functions (Optional)
- `PENNY_SPACE_URL` - Override the default Hugging Face Space URL in Azure

## API Endpoint

The chat uses the Gradio `/run/predict` endpoint:
- **URL**: `https://pythonprincess-penny-v2-2.hf.space/run/predict`
- **Method**: POST
- **Format**: Gradio API format with `fn_index: 1`

## Troubleshooting

### If Penny doesn't respond:
1. Check if the Space is running (visit the Hugging Face Space page)
2. Verify CORS is enabled on the Space
3. Check browser console for errors
4. Verify the Space URL is correct

### If you need to switch back:
- Update `BACKEND_URL` in `src/lib/config.ts`
- Or set `VITE_PENNY_BACKEND_URL` environment variable
- Or set `PENNY_SPACE_URL` in Azure Functions environment variables

