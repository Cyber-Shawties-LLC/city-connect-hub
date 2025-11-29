# How to Upload Events to Azure Search Index

## Method 1: Using Python Script (EASIEST - Recommended)

You have a Python script ready to upload all events at once!

### Step 1: Install Required Package

```bash
pip install azure-search-documents
```

### Step 2: Set Environment Variables

**On Windows (PowerShell):**
```powershell
$env:AZURE_SEARCH_ENDPOINT="https://ragpp.search.windows.net"
$env:AZURE_SEARCH_KEY="YOUR_SEARCH_API_KEY"
$env:AZURE_SEARCH_INDEX_EVENTS="civic-events-index"
```

**On Linux/Mac:**
```bash
export AZURE_SEARCH_ENDPOINT="https://ragpp.search.windows.net"
export AZURE_SEARCH_KEY="YOUR_SEARCH_API_KEY"
export AZURE_SEARCH_INDEX_EVENTS="civic-events-index"
```

**Get your API key from:**
- Azure Portal → Your Search Service (`ragpp`) → **Keys**
- Copy either "Primary admin key" or "Secondary admin key"

### Step 3: Run the Upload Script

```bash
cd scripts
python upload_events_to_azure_search.py events_template.json
```

This will upload all events from `events_template.json` to your `civic-events-index`.

## Method 2: Using Azure Portal REST API (Alternative)

### Step 1: Get Your Search Service Details

1. Go to **Azure Portal** → Your Search Service (`ragpp`) → **Keys**
2. Copy your **Primary admin key**
3. Note your **Search Service endpoint**: `https://ragpp.search.windows.net`
4. Index name: `civic-events-index`

### Step 2: Use Azure Portal Search Explorer

1. Go to **Azure Portal** → Search Service → **Indexes** → `civic-events-index`
2. Click on **"Search explorer"** tab (you're already there!)
3. Look for **"Documents"** tab or **"Upload documents"** button
4. If not visible, use the REST API method below

### Step 3: Upload via REST API (Using curl or Postman)

**Using curl:**
```bash
# Replace with your actual values
ENDPOINT="https://ragpp.search.windows.net"
API_KEY="YOUR_PRIMARY_ADMIN_KEY"
INDEX_NAME="civic-events-index"

# Upload documents
curl -X POST "${ENDPOINT}/indexes/${INDEX_NAME}/docs/index?api-version=2023-07-01-Preview" \
  -H "api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d @scripts/events_template.json
```

**Using PowerShell:**
```powershell
$endpoint = "https://ragpp.search.windows.net"
$apiKey = "YOUR_PRIMARY_ADMIN_KEY"
$indexName = "civic-events-index"
$jsonContent = Get-Content -Path "scripts/events_template.json" -Raw

$headers = @{
    "api-key" = $apiKey
    "Content-Type" = "application/json"
}

$uri = "${endpoint}/indexes/${indexName}/docs/index?api-version=2023-07-01-Preview"

Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $jsonContent
```

## Method 3: Using Azure Portal "Import data" Feature

### Step 1: Find Import Data

1. Go to **Azure Portal** → Your Search Service (`ragpp`)
2. Look for **"Import data"** in the left sidebar or top menu
3. Click **"Import data"**

### Step 2: Configure Import

1. **Data source**: Choose "Upload JSON files" or "JSON from Azure Blob Storage"
2. **Index**: Select `civic-events-index`
3. **Upload your file**: Select `scripts/events_template.json`
4. Click **"Import"**

**Note**: If "Import data" is not visible, it might not be available in your Search Service tier. Use Method 1 (Python script) instead.

## Method 4: Using Azure Portal Index JSON Editor (Single Documents Only)

⚠️ **This method only works for ONE document at a time** - not recommended for bulk uploads.

1. Go to **Azure Portal** → Search Service → **Indexes** → `civic-events-index`
2. Click **"Edit JSON"** button
3. Paste **ONE** event object (not the array):
   ```json
   {
     "id": "norfolk-001",
     "title": "Norfolk City Council Meeting",
     "description": "...",
     "date": "2025-12-05T19:00:00Z",
     ...
   }
   ```
4. Click **"Save"**
5. Repeat for each event (tedious!)

## Recommended: Use the Python Script (Method 1)

The Python script is the easiest and most reliable method. It will:
- ✅ Upload all events at once
- ✅ Validate the data
- ✅ Show progress
- ✅ Handle errors gracefully
- ✅ Work from any environment

## Troubleshooting

### "Import data" not visible?
- Your Search Service tier might not support it
- Use the Python script instead (Method 1)

### "Upload documents" button not in Search Explorer?
- Search Explorer is for searching, not uploading
- Use "Import data" or the Python script

### Getting 403 Forbidden?
- Check your API key is correct
- Make sure you're using the Primary or Secondary admin key (not query key)

### Getting 404 Not Found?
- Verify the index name is exactly `civic-events-index`
- Check the endpoint URL is correct

## Quick Start (Easiest Method)

```bash
# 1. Install package
pip install azure-search-documents

# 2. Set environment variables (replace with your values)
export AZURE_SEARCH_ENDPOINT="https://ragpp.search.windows.net"
export AZURE_SEARCH_KEY="YOUR_KEY_HERE"
export AZURE_SEARCH_INDEX_EVENTS="civic-events-index"

# 3. Run the script
cd scripts
python upload_events_to_azure_search.py events_template.json
```

That's it! All events will be uploaded.

