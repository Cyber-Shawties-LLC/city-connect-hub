# Azure Search Events Index - Population Guide

## Overview

This guide will help you populate the Azure Search Events Index with public events for all 7 market cities.

## Market Cities

1. **Norfolk, Virginia**
2. **El Paso, Texas**
3. **Atlanta, Georgia**
4. **Providence, Rhode Island**
5. **Birmingham, Alabama**
6. **Chesterfield, Virginia**
7. **Seattle, Washington**

## Step 1: Create the Events Index

### In Azure Portal:

1. Go to **Azure Portal** → Your Search Service (`ragpp`) → **Indexes**
2. Click **"+ Add index"**
3. Name: `events`
4. Click **"Create"**

### Index Schema

Add the following fields:

| Field Name | Type | Key | Searchable | Filterable | Sortable | Retrievable |
|------------|------|-----|------------|------------|----------|-------------|
| `id` | Edm.String | ✅ Yes | No | No | No | Yes |
| `title` | Edm.String | No | ✅ Yes | No | No | Yes |
| `description` | Edm.String | No | ✅ Yes | No | No | Yes |
| `date` | Edm.DateTimeOffset | No | No | ✅ Yes | ✅ Yes | Yes |
| `location` | Edm.String | No | ✅ Yes | No | No | Yes |
| `city` | Edm.String | No | No | ✅ Yes | No | Yes |
| `state` | Edm.String | No | No | ✅ Yes | No | Yes |
| `category` | Edm.String | No | ✅ Yes | ✅ Yes | No | Yes |
| `url` | Edm.String | No | No | No | No | Yes |
| `organizer` | Edm.String | No | ✅ Yes | No | No | Yes |
| `contact` | Edm.String | No | No | No | No | Yes |

**Key Field**: `id` (must be unique for each event)

## Step 2: Prepare Event Data

### Event Data Structure

Each event should follow this JSON structure:

```json
{
  "id": "norfolk-001",
  "title": "City Council Meeting",
  "description": "Monthly city council meeting to discuss local issues and upcoming projects.",
  "date": "2025-12-05T19:00:00Z",
  "location": "City Hall, 100 Main St, Norfolk, VA 23510",
  "city": "Norfolk",
  "state": "VA",
  "category": "Government",
  "url": "https://norfolk.gov/events/council-meeting-dec-5",
  "organizer": "Norfolk City Council",
  "contact": "council@norfolk.gov"
}
```

### Date Format

- Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- Example: `2025-12-05T19:00:00Z` (December 5, 2025 at 7:00 PM UTC)
- Always use UTC timezone (Z suffix)

### Categories

Suggested categories:
- Government
- Community
- Education
- Arts & Culture
- Sports & Recreation
- Health & Wellness
- Business
- Environment
- Volunteer

## Step 3: Data Sources for Each City

### Norfolk, Virginia
- **City Website**: https://www.norfolk.gov/
- **Event Calendar**: Check city website for public meetings, events
- **Library Events**: Norfolk Public Library calendar
- **Parks & Recreation**: Community events, festivals
- **City Council**: Regular meetings, public hearings

### El Paso, Texas
- **City Website**: https://www.elpasotexas.gov/
- **Event Calendar**: City events, festivals
- **Library Events**: El Paso Public Library
- **Parks & Recreation**: Community programs
- **City Council**: Public meetings

### Atlanta, Georgia
- **City Website**: https://www.atlantaga.gov/
- **Event Calendar**: City events, cultural programs
- **Library Events**: Atlanta-Fulton Public Library
- **Parks & Recreation**: Community events
- **City Council**: Public meetings

### Providence, Rhode Island
- **City Website**: https://www.providenceri.gov/
- **Event Calendar**: City events, community programs
- **Library Events**: Providence Public Library
- **Parks & Recreation**: Community activities
- **City Council**: Public meetings

### Birmingham, Alabama
- **City Website**: https://www.birminghamal.gov/
- **Event Calendar**: City events, festivals
- **Library Events**: Birmingham Public Library
- **Parks & Recreation**: Community programs
- **City Council**: Public meetings

### Chesterfield, Virginia
- **County Website**: https://www.chesterfield.gov/
- **Event Calendar**: County events, community programs
- **Library Events**: Chesterfield County Public Library
- **Parks & Recreation**: Community activities
- **Board of Supervisors**: Public meetings

### Seattle, Washington
- **City Website**: https://www.seattle.gov/
- **Event Calendar**: City events, cultural programs
- **Library Events**: Seattle Public Library
- **Parks & Recreation**: Community events
- **City Council**: Public meetings

## Step 4: Upload Events to Azure Search

### Method 1: Using Azure Portal (Small Datasets)

1. Go to **Azure Portal** → Search Service → Indexes → `events`
2. Click **"Import data"**
3. Choose **"Upload JSON files"** or **"JSON from Azure Blob Storage"**
4. Upload your JSON file with events
5. Click **"Import"**

### Method 2: Using Azure Search REST API (Recommended)

Use the following Python script or similar:

```python
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
import json

# Configuration
endpoint = "https://ragpp.search.windows.net"
key = "YOUR_SEARCH_KEY"  # Get from Azure Portal
index_name = "events"

# Create client
client = SearchClient(
    endpoint=endpoint,
    index_name=index_name,
    credential=AzureKeyCredential(key)
)

# Load events from JSON file
with open('events.json', 'r') as f:
    events = json.load(f)

# Upload events
result = client.upload_documents(documents=events)
print(f"Uploaded {len(result)} events")
```

### Method 3: Using Azure Search Indexer (Automated)

1. Create a **Data Source** pointing to Azure Blob Storage with your events JSON
2. Create an **Indexer** that reads from the data source
3. Schedule the indexer to run periodically (daily, weekly)

## Step 5: Sample Events JSON File

Create a file `events.json` with events for all cities:

```json
[
  {
    "id": "norfolk-001",
    "title": "Norfolk City Council Meeting",
    "description": "Monthly city council meeting to discuss local issues and upcoming projects.",
    "date": "2025-12-05T19:00:00Z",
    "location": "City Hall, 100 Main St, Norfolk, VA 23510",
    "city": "Norfolk",
    "state": "VA",
    "category": "Government",
    "url": "https://norfolk.gov/events/council-meeting-dec-5",
    "organizer": "Norfolk City Council",
    "contact": "council@norfolk.gov"
  },
  {
    "id": "norfolk-002",
    "title": "Norfolk Farmers Market",
    "description": "Weekly farmers market featuring local produce, crafts, and food vendors.",
    "date": "2025-12-07T08:00:00Z",
    "location": "Downtown Plaza, Norfolk, VA",
    "city": "Norfolk",
    "state": "VA",
    "category": "Community",
    "url": "https://norfolk.gov/farmers-market",
    "organizer": "Norfolk Parks & Recreation",
    "contact": "parks@norfolk.gov"
  },
  {
    "id": "el-paso-001",
    "title": "El Paso City Council Meeting",
    "description": "Regular city council meeting open to the public.",
    "date": "2025-12-10T14:00:00Z",
    "location": "City Hall, El Paso, TX",
    "city": "El Paso",
    "state": "TX",
    "category": "Government",
    "url": "https://elpasotexas.gov/events",
    "organizer": "El Paso City Council",
    "contact": ""
  },
  {
    "id": "atlanta-001",
    "title": "Atlanta Public Library Story Time",
    "description": "Children's story time session. All ages welcome.",
    "date": "2025-12-08T10:00:00Z",
    "location": "Atlanta Public Library - Main Branch",
    "city": "Atlanta",
    "state": "GA",
    "category": "Education",
    "url": "https://atlantapubliclibrary.org/events",
    "organizer": "Atlanta Public Library",
    "contact": ""
  },
  {
    "id": "providence-001",
    "title": "Providence Community Cleanup",
    "description": "Join neighbors for a community cleanup day. Supplies provided.",
    "date": "2025-12-12T09:00:00Z",
    "location": "Various Locations, Providence, RI",
    "city": "Providence",
    "state": "RI",
    "category": "Community Service",
    "url": "",
    "organizer": "Providence Parks Department",
    "contact": ""
  },
  {
    "id": "birmingham-001",
    "title": "Birmingham Art Walk",
    "description": "Monthly art walk featuring local artists and galleries.",
    "date": "2025-12-15T17:00:00Z",
    "location": "Arts District, Birmingham, AL",
    "city": "Birmingham",
    "state": "AL",
    "category": "Arts & Culture",
    "url": "",
    "organizer": "Birmingham Arts Council",
    "contact": ""
  },
  {
    "id": "chesterfield-001",
    "title": "Chesterfield Board of Supervisors Meeting",
    "description": "Monthly board meeting to discuss county business.",
    "date": "2025-12-11T18:00:00Z",
    "location": "County Administration Building, Chesterfield, VA",
    "city": "Chesterfield",
    "state": "VA",
    "category": "Government",
    "url": "",
    "organizer": "Chesterfield Board of Supervisors",
    "contact": ""
  },
  {
    "id": "seattle-001",
    "title": "Seattle City Council Public Hearing",
    "description": "Public hearing on proposed city budget.",
    "date": "2025-12-09T18:00:00Z",
    "location": "City Hall, Seattle, WA",
    "city": "Seattle",
    "state": "WA",
    "category": "Government",
    "url": "",
    "organizer": "Seattle City Council",
    "contact": ""
  }
]
```

## Step 6: Verify Events Are Searchable

### Test Search API

```bash
# Search for events in Norfolk
curl "https://your-app.azurestaticapps.net/api/search?q=meetings&index_type=events&city=Norfolk&state=VA"

# Search for all events in a city
curl "https://your-app.azurestaticapps.net/api/search?q=*&index_type=events&city=Atlanta&state=GA"
```

### Test Events API

```bash
# Get upcoming events for Norfolk
curl "https://your-app.azurestaticapps.net/api/events?city=Norfolk&state=VA&limit=10"
```

## Step 7: Maintain and Update Events

### Regular Updates

- **Weekly**: Update with new upcoming events
- **Daily**: Remove past events (or let them expire naturally)
- **Monthly**: Review and refresh recurring events

### Automated Updates (Optional)

Set up an Azure Function or scheduled job to:
1. Scrape city websites for new events
2. Parse event data
3. Upload to Azure Search
4. Run daily or weekly

## Data Collection Tips

### Where to Find Events

1. **City Government Websites**
   - Look for "Events", "Calendar", "Public Meetings" sections
   - Subscribe to city newsletters
   - Check city social media

2. **Public Libraries**
   - Library event calendars
   - Program schedules
   - Community room bookings

3. **Parks & Recreation Departments**
   - Activity calendars
   - Community programs
   - Festival schedules

4. **Community Organizations**
   - Non-profit event listings
   - Volunteer opportunities
   - Community service events

5. **Local News Sources**
   - Event listings in local newspapers
   - Community calendar sections
   - Online event directories

## Best Practices

1. **Unique IDs**: Use format like `{city}-{number}` (e.g., `norfolk-001`)
2. **Future Events Only**: Only index upcoming events (next 30-90 days)
3. **Accurate Dates**: Use proper timezone (convert to UTC)
4. **Complete Information**: Include as much detail as possible
5. **Regular Cleanup**: Remove or archive past events
6. **City-Specific**: Ensure events are tagged with correct city/state

## Troubleshooting

### Events Not Showing

1. Check index exists: Azure Portal → Search Service → Indexes
2. Verify events are uploaded: Check document count in index
3. Test search directly: Use Azure Portal Search Explorer
4. Check filters: Ensure city/state filters match exactly

### Events Not Filtering by City

1. Verify `city` and `state` fields are filterable in index schema
2. Check field values match exactly (case-sensitive)
3. Test filter syntax: `city eq 'Norfolk' and state eq 'VA'`

### Date Issues

1. Ensure dates are in ISO 8601 format
2. Use UTC timezone (Z suffix)
3. Verify `date` field is `Edm.DateTimeOffset` type
4. Check date filter: `date ge {current_date}`

## Next Steps

1. ✅ Create the `events` index in Azure Search
2. ✅ Collect event data for all 7 market cities
3. ✅ Format events as JSON
4. ✅ Upload to Azure Search
5. ✅ Test the events API
6. ✅ Verify events show on dashboard
7. ✅ Set up regular updates/maintenance

