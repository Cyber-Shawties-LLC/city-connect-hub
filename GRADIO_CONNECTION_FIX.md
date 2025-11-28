# Fixed: Gradio API Connection

## ✅ What Was Fixed

Your Hugging Face Space uses **Gradio**, not direct FastAPI. I've updated the code to use Gradio's queue system.

### Changes Made:

1. **`src/lib/config.ts`** - Updated endpoint to `/api/chat_with_penny_sync`
2. **`src/lib/api.ts`** - Implemented Gradio queue system:
   - Submits job to queue
   - Polls for results
   - Extracts bot response from history
3. **`src/hooks/usePennyChats.tsx`** - Updated to:
   - Build chat history in Gradio format
   - Pass city parameter
   - Handle Gradio response format

## 🔍 How Gradio Queue Works

1. **Submit job** to `/queue/push` with your message
2. **Poll status** using `/queue/status` 
3. **Get result** when status is "COMPLETE"

## 🧪 Testing

After pushing these changes:

1. **Deploy to Azure** (push to GitHub)
2. **Visit your Azure Static Web App**
3. **Sign in and go to Dashboard**
4. **Send a message to Penny**
5. **Check browser console** (F12) for any errors

## ⚠️ Potential Issues

### Issue: Still Getting Queue Errors

If you still see queue-related errors, the Space might need:
- **CORS configured** to allow your Azure domain
- **Queue settings** adjusted in the Space

### Issue: Timeout Errors

If requests timeout:
- The Space might be sleeping (visit it first)
- Response might be taking too long (increase timeout)
- Check Space logs on Hugging Face

### Issue: Wrong Response Format

If the response format is different:
- Check browser console for actual response
- Update the response parsing in `src/lib/api.ts`

## 🔧 Alternative: Direct FastAPI Endpoint

If the Gradio queue is problematic, you could:
1. **Expose FastAPI directly** in the Space (modify Penny's code)
2. **Use a proxy** between your frontend and the Space
3. **Deploy Penny separately** as pure FastAPI (not via Gradio)

## 📋 Next Steps

1. **Push the changes** to GitHub
2. **Wait for Azure deployment**
3. **Test the connection**
4. **Check browser console** for detailed errors
5. **Share any errors** you see for further debugging

The code is now configured for Gradio's queue system. Test it and let me know if you encounter any issues!

