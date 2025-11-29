# Events API Setup Guide

## Overview

The events system fetches public city events from multiple sources and displays them on the dashboard. It supports:

1. **Azure Search Events Index** (Primary) - Your indexed event data
2. **Eventbrite API** (Fallback 1) - Public events from Eventbrite
3. **Example Events** (Fallback 2) - Demo data for development

## Setting Up Event Sources

### Option 1: Azure Search Events Index (Recommended)

If you have events indexed in Azure Search:

1. **Verify Index Exists**: Azure Portal → Search Service → Indexes → `events` index
2. **Index Schema Should Include**:
   - `id` (Edm.String, key)
   - `title` (Edm.String, searchable)
   - `description` (Edm.String, searchable)
   - `date` (Edm.DateTimeOffset, filterable, sortable)
   - `location` (Edm.String)
   - `city` (Edm.String, filterable)
   - `state` (Edm.String, filterable)
   - `category` (Edm.String)
   - `url` (Edm.String)

3. **Populate Index** with city events (see `AZURE_SEARCH_DATA_GUIDE.md`)

### Option 2: Eventbrite API (Public Events)

1. **Sign up**: https://www.eventbrite.com/platform/api/
2. **Get API Token**:
   - Go to Eventbrite → Account Settings → Developer Links → API Keys
   - Create a Personal OAuth Token
3. **Add to Azure**:
   - Variable name: `EVENTBRITE_API_TOKEN`
   - Value: Your Eventbrite Personal OAuth Token

**Note**: Eventbrite free tier allows searching public events. No approval needed for basic event search.

## How It Works

1. **Azure Search** is tried first (if configured)
   - Searches for events in the selected city
   - Filters for future events (next 30 days)
   - Sorted by date (upcoming first)

2. **Eventbrite** is tried if Azure Search has no results
   - Searches public events within 25 miles of the city
   - Filters for upcoming events
   - Includes venue information

3. **Example Events** are shown if no APIs are configured
   - Demo data for development
   - Shows structure of event data

## Event Data Structure

Each event includes:
```json
{
  "id": "event-001",
  "title": "Community Board Meeting",
  "description": "Monthly meeting...",
  "date": "2025-12-05T19:00:00Z",
  "location": "City Hall",
  "city": "Norfolk",
  "state": "VA",
  "category": "Government",
  "url": "https://...",
  "source": "Azure Search"
}
```

## Frontend Integration

The `EventsFeed` component:
- Automatically fetches events for the selected market city
- Updates when location changes
- Shows upcoming events (next 30 days)
- Displays date, time, location, and category
- Auto-refreshes every hour

## API Endpoint

```
GET /api/events?city=Norfolk&state=VA&limit=10&days_ahead=30
```

**Parameters**:
- `city` (required): City name
- `state` (optional): State abbreviation
- `limit` (optional, default: 10): Number of events to return
- `days_ahead` (optional, default: 30): How many days in the future to search

## Testing

Test the events API:

```bash
# Test with city/state
curl "https://your-app.azurestaticapps.net/api/events?city=Norfolk&state=VA&limit=5"

# Test with different city
curl "https://your-app.azurestaticapps.net/api/events?city=Atlanta&state=GA&limit=5"
```

## Populating Azure Search Events Index

### Manual Upload

1. Go to Azure Portal → Search Service → Indexes → `events`
2. Click "Import data"
3. Upload JSON file with events:

```json
[
  {
    "id": "event-001",
    "title": "City Council Meeting",
    "description": "Monthly city council meeting",
    "date": "2025-12-05T19:00:00Z",
    "location": "City Hall, 100 Main St",
    "city": "Norfolk",
    "state": "VA",
    "category": "Government",
    "url": "https://norfolk.gov/events/001"
  }
]
```

### Programmatic Upload

Use Azure Search SDK or REST API to upload events (see `AZURE_SEARCH_DATA_GUIDE.md`).

## Event Sources by City

For each market city, you should populate events from:

1. **City Government Websites**
   - Council meetings
   - Public hearings
   - Community forums

2. **Community Organizations**
   - Non-profit events
   - Volunteer opportunities
   - Community service

3. **Public Facilities**
   - Library events
   - Recreation center activities
   - Park events

4. **Eventbrite** (automatic if API key configured)
   - Public events posted on Eventbrite
   - Automatically filtered by location

## Next Steps

1. **Set up Eventbrite API** (easiest - gets public events automatically)
2. **Or populate Azure Search** with city-specific events
3. **Test the events feed** on the dashboard
4. **Verify events update** when changing market cities

