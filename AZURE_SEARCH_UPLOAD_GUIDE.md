# Azure Search Index - How to Upload Events

## The Problem

The **Azure Search Index JSON editor** only accepts **one document at a time** (a single object `{...}`), not multiple documents in an array `[{...}]`.

When you try to paste an array, you get:
```
an unexpected 'StartArray' node was found when reading from the JSON reader. 
a 'StartObject' node was expected.
```

## Solution: Use the Python Upload Script

You have a Python script ready to upload all events at once!

### Step 1: Install Required Package

```bash
pip install azure-search-documents
```

### Step 2: Set Your Azure Search Credentials

Edit `scripts/upload_events_to_azure_search.py` and update:

```python
# Get from Azure Portal → Your Search Service → Keys
endpoint = "https://YOUR_SEARCH_SERVICE.search.windows.net"
api_key = "YOUR_SEARCH_API_KEY"
index_name = "civic-events-index"  # or "events" - whatever your index is named
```

### Step 3: Run the Script

```bash
cd scripts
python upload_events_to_azure_search.py
```

This will:
1. Load all events from `events_template.json`
2. Upload them to your Azure Search index
3. Show you how many events were uploaded

## Alternative: Use Azure Portal "Import Data"

### Method 1: Import Data Feature

1. Go to **Azure Portal** → Your Search Service → **Indexes** → `civic-events-index`
2. Click **"Import data"** (not "Index JSON editor")
3. Choose **"Upload JSON files"**
4. Upload your `events_template.json` file
5. Click **"Import"**

### Method 2: Use REST API Directly

You can also use curl or Postman:

```bash
# Replace with your actual values
ENDPOINT="https://YOUR_SEARCH_SERVICE.search.windows.net"
API_KEY="YOUR_API_KEY"
INDEX_NAME="civic-events-index"

# Upload documents
curl -X POST "${ENDPOINT}/indexes/${INDEX_NAME}/docs/index?api-version=2023-07-01-Preview" \
  -H "api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d @scripts/events_template.json
```

## Why the JSON Editor Doesn't Work

The **"Index JSON editor"** in Azure Portal is designed for:
- ✅ Editing a **single document** (one event)
- ✅ Viewing document structure
- ❌ **NOT** for bulk uploads

For bulk uploads, you need:
- ✅ **Import data** feature
- ✅ **REST API** calls
- ✅ **Python SDK** (like the script provided)
- ✅ **Azure Search Indexer** (for automated updates)

## Quick Steps Summary

**Easiest Method:**
1. Use the Python script: `python scripts/upload_events_to_azure_search.py`
2. Or use Azure Portal → Indexes → `civic-events-index` → **"Import data"** → Upload `events_template.json`

**Don't use:** The "Index JSON editor" for bulk uploads - it's only for single documents!

