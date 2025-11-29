# How to Find Your Hugging Face Token

## Step 1: Go to Hugging Face Website

1. Visit **https://huggingface.co/**
2. **Sign in** to your account (or create one if you don't have one)

## Step 2: Navigate to Access Tokens

1. Click on your **profile picture/icon** in the top right corner
2. Select **"Settings"** from the dropdown menu
3. In the left sidebar, click on **"Access Tokens"**

   **OR** go directly to: **https://huggingface.co/settings/tokens**

## Step 3: Create a New Token

1. Click the **"New token"** button
2. Give it a name (e.g., "Penny API Token" or "City Connect Hub")
3. Select the token type:
   - **Read** ✅ **RECOMMENDED** - For calling the API to chat with Penny (this is all you need!)
   - **Write** - Only needed if you're modifying/updating the Space itself
4. Click **"Generate token"**

### Which Token Do You Need?

**For this project, you only need a READ token** because:
- ✅ You're just calling the Penny API to get chat responses
- ✅ You're not modifying the Space code
- ✅ You're not uploading files to the Space
- ✅ You're not changing the Space configuration

**You would only need a WRITE token if:**
- ❌ You're updating the Space's code
- ❌ You're uploading files to the Space
- ❌ You're modifying the Space settings

## Step 4: Copy the Token

⚠️ **IMPORTANT**: Copy the token immediately! You won't be able to see it again.

The token will look like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 5: Add Token to Azure

1. Go to **Azure Portal** → Your Static Web App
2. Navigate to **Configuration** → **Environment variables**
3. Click **"+ New application setting"**
4. Add:
   - **Name**: `HF_TOKEN`
   - **Value**: Paste your token (starts with `hf_`)
5. Click **"OK"** and **"Save"**
6. **Restart** the function app for changes to take effect

## Alternative: Check Existing Tokens

If you already have tokens:
1. Go to **https://huggingface.co/settings/tokens**
2. You'll see a list of your existing tokens
3. Click on a token name to see details
4. If you forgot a token, you'll need to create a new one (old tokens can't be viewed again)

## Token Permissions

For the Penny AI agent, you **ONLY need READ access**:
- ✅ **Read token** - To call the Space API and get chat responses
- ❌ **Write token** - NOT needed (unless you're modifying the Space)

The token is used in the `Authorization: Bearer <token>` header when calling the Gradio API endpoints.

### What Each Token Type Does:

**Read Token:**
- ✅ Call the Space API (`/api/predict`, `/run/predict`)
- ✅ Get responses from Penny
- ✅ Access public Spaces
- ✅ This is all you need for your app!

**Write Token:**
- ✅ Everything a Read token can do, PLUS:
- ✅ Update Space code
- ✅ Upload files to the Space
- ✅ Modify Space settings
- ✅ Publish new versions
- ❌ **Not needed** for just chatting with Penny

## Security Notes

- ⚠️ **Never commit tokens to Git** - Always use environment variables
- ⚠️ **Don't share tokens** - They give access to your Hugging Face account
- ⚠️ **Rotate tokens** if they're exposed - Delete old ones and create new ones
- ✅ **Use environment variables** in Azure for secure storage

## Troubleshooting

### "Invalid token" error:
- Check that the token starts with `hf_`
- Verify the token hasn't expired
- Make sure you copied the entire token (no spaces)

### "Token not found" error:
- Verify `HF_TOKEN` is set in Azure Configuration
- Check the variable name is exactly `HF_TOKEN` (case-sensitive)
- Restart the function app after adding the token

### "Unauthorized" error:
- Verify the token has the correct permissions (Read access)
- Check if the token belongs to the correct Hugging Face account
- Ensure the Space is public or you have access to it

## Quick Links

- **Hugging Face Settings**: https://huggingface.co/settings
- **Access Tokens Page**: https://huggingface.co/settings/tokens
- **Penny Space**: https://huggingface.co/spaces/pythonprincess/Penny_V2.2

