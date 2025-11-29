# Quick Start: Populate Events for All Market Cities

## Step-by-Step Guide

### Step 1: Create Events Index in Azure Search

1. Go to **Azure Portal** → Your Search Service (`ragpp`) → **Indexes**
2. Click **"+ Add index"**
3. **Index name**: `events`
4. Click **"Create"**

### Step 2: Add Index Fields

Click **"+ Add field"** for each field:

| Field Name | Type | Options |
|------------|------|---------|
| `id` | String | ✅ Key, ✅ Retrievable |
| `title` | String | ✅ Searchable, ✅ Retrievable |
| `description` | String | ✅ Searchable, ✅ Retrievable |
| `date` | DateTimeOffset | ✅ Filterable, ✅ Sortable, ✅ Retrievable |
| `location` | String | ✅ Searchable, ✅ Retrievable |
| `city` | String | ✅ Filterable, ✅ Retrievable |
| `state` | String | ✅ Filterable, ✅ Retrievable |
| `category` | String | ✅ Searchable, ✅ Filterable, ✅ Retrievable |
| `url` | String | ✅ Retrievable |
| `organizer` | String | ✅ Searchable, ✅ Retrievable |
| `contact` | String | ✅ Retrievable |

Click **"Save"** when done.

### Step 3: Prepare Your Events Data

1. Use the template: `scripts/events_template.json`
2. Add events for all 7 cities:
   - Norfolk, VA
   - El Paso, TX
   - Atlanta, GA
   - Providence, RI
   - Birmingham, AL
   - Chesterfield, VA
   - Seattle, WA

3. **Event ID Format**: `{city-id}-{number}` (e.g., `norfolk-001`, `atlanta-002`)

4. **Date Format**: ISO 8601 with UTC (e.g., `2025-12-05T19:00:00Z`)

### Step 4: Upload Events

#### Option A: Using Azure Portal (Easiest)

1. Go to **Azure Portal** → Search Service → Indexes → `events`
2. Click **"Import data"**
3. Choose **"Upload JSON files"**
4. Upload your `events.json` file
5. Click **"Import"**

#### Option B: Using Python Script (Recommended for Large Datasets)

1. **Install dependencies**:
   ```bash
   pip install azure-search-documents
   ```

2. **Set environment variables**:
   ```bash
   export AZURE_SEARCH_ENDPOINT="https://ragpp.search.windows.net"
   export AZURE_SEARCH_KEY="your-search-key"
   export AZURE_SEARCH_INDEX_EVENTS="events"
   ```

3. **Run the script**:
   ```bash
   python scripts/upload_events_to_azure_search.py scripts/events_template.json
   ```

### Step 5: Verify Events

1. **Test in Azure Portal**:
   - Go to Search Service → Indexes → `events` → **Search Explorer**
   - Search for: `*`
   - Filter: `city eq 'Norfolk' and state eq 'VA'`

2. **Test via API**:
   ```bash
   curl "https://your-app.azurestaticapps.net/api/events?city=Norfolk&state=VA&limit=5"
   ```

3. **Check Dashboard**:
   - Change market city in dropdown
   - Events should update for each city

## Data Collection for Each City

### Quick Sources:

1. **City Government Websites**:
   - Look for "Events", "Calendar", "Public Meetings"
   - Example: `norfolk.gov/events`, `atlanta.gov/calendar`

2. **Public Libraries**:
   - Library event calendars
   - Program schedules

3. **Parks & Recreation**:
   - Community programs
   - Festival schedules

4. **City Council/Board Meetings**:
   - Regular meeting schedules
   - Public hearing notices

## Sample Event Structure

```json
{
  "id": "norfolk-001",
  "title": "Norfolk City Council Meeting",
  "description": "Monthly city council meeting to discuss local issues.",
  "date": "2025-12-05T19:00:00Z",
  "location": "City Hall, 100 Main St, Norfolk, VA 23510",
  "city": "Norfolk",
  "state": "VA",
  "category": "Government",
  "url": "https://norfolk.gov/events/council-meeting",
  "organizer": "Norfolk City Council",
  "contact": "council@norfolk.gov"
}
```

## Tips

- **Start with 5-10 events per city** to test
- **Use future dates** (next 30-90 days)
- **Include recurring events** (weekly farmers market, monthly meetings)
- **Add variety**: Government, Community, Education, Arts & Culture
- **Keep descriptions concise** but informative
- **Include URLs** when available

## Troubleshooting

**Events not showing?**
- Check index exists
- Verify events uploaded (check document count)
- Test search in Azure Portal Search Explorer
- Check city/state values match exactly

**Wrong city showing?**
- Verify `city` and `state` fields in events match market selection
- Check filter syntax in API logs

**Date issues?**
- Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- Always use UTC (Z suffix)
- Ensure dates are in the future

## Next Steps After Upload

1. ✅ Test events show on dashboard for each city
2. ✅ Verify events update when changing market
3. ✅ Add more events as you find them
4. ✅ Set up regular updates (weekly/monthly)
5. ✅ Consider automated scraping for recurring events

