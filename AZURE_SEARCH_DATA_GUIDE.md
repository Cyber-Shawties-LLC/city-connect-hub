# Azure Search Data Guide

## Overview

Your Azure Search service (`ragpp`) is configured to provide city-specific information for each market area. The search service uses multiple indexes to organize different types of public information.

## Search Indexes

Your search service should have the following indexes configured:

### 1. **Events Index** (`AZURE_SEARCH_INDEX_EVENTS`)
**Purpose:** Community events, meetings, festivals, and activities

**Data Structure:**
```json
{
  "id": "event-001",
  "title": "Community Board Meeting",
  "description": "Monthly community board meeting discussing local issues",
  "date": "2025-12-05T19:00:00Z",
  "location": "City Hall, 100 Main St",
  "city": "Norfolk",
  "state": "VA",
  "category": "Government",
  "organizer": "City Council",
  "contact": "events@norfolk.gov",
  "url": "https://norfolk.gov/events/001"
}
```

**Example Data:**
- City council meetings
- Community festivals
- Public hearings
- Library events
- Park activities
- Farmers markets
- Concerts and performances

### 2. **Resources Index** (`AZURE_SEARCH_INDEX_RESOURCES`)
**Purpose:** Community resources, services, and facilities

**Data Structure:**
```json
{
  "id": "resource-001",
  "name": "Norfolk Public Library - Main Branch",
  "type": "Library",
  "description": "Main public library offering books, computers, and community programs",
  "address": "235 E Plume St, Norfolk, VA 23510",
  "city": "Norfolk",
  "state": "VA",
  "phone": "(757) 664-7323",
  "hours": "Mon-Thu: 9am-8pm, Fri-Sat: 9am-5pm",
  "services": ["Books", "Computers", "Meeting Rooms", "Children's Programs"],
  "url": "https://norfolk.gov/library"
}
```

**Example Data:**
- Public libraries
- Community centers
- Health clinics
- Food banks
- Senior centers
- Recreation facilities
- Government offices
- Emergency services

### 3. **Documents Index** (`AZURE_SEARCH_INDEX_DOCUMENTS`)
**Purpose:** Official documents, announcements, and public information

**Data Structure:**
```json
{
  "id": "doc-001",
  "title": "2025 Budget Proposal",
  "type": "Budget",
  "description": "Proposed city budget for fiscal year 2025",
  "city": "Norfolk",
  "state": "VA",
  "date": "2025-11-15T00:00:00Z",
  "category": "Government",
  "url": "https://norfolk.gov/budget/2025",
  "tags": ["budget", "finance", "city-council"]
}
```

**Example Data:**
- City budgets and financial reports
- Public notices
- Zoning changes
- Policy documents
- Meeting minutes
- Public records
- Announcements

### 4. **Geo Index** (`AZURE_SEARCH_INDEX_GEO`)
**Purpose:** Geographic locations, landmarks, and points of interest

**Data Structure:**
```json
{
  "id": "geo-001",
  "name": "Waterside District",
  "type": "Entertainment District",
  "description": "Waterfront entertainment and dining area",
  "latitude": 36.8468,
  "longitude": -76.2852,
  "city": "Norfolk",
  "state": "VA",
  "address": "333 Waterside Dr, Norfolk, VA 23510",
  "category": "Entertainment",
  "tags": ["dining", "shopping", "waterfront"]
}
```

**Example Data:**
- Parks and recreation areas
- Landmarks
- Tourist attractions
- Business districts
- Neighborhoods
- Transportation hubs
- Points of interest

### 5. **Weather Index** (`AZURE_SEARCH_INDEX_WEATHER`)
**Purpose:** Historical weather data and climate information (optional)

**Data Structure:**
```json
{
  "id": "weather-001",
  "city": "Norfolk",
  "state": "VA",
  "date": "2025-11-28",
  "temperature_high": 72,
  "temperature_low": 58,
  "conditions": "Partly Cloudy",
  "precipitation": 0.0,
  "humidity": 65
}
```

**Note:** This index is optional. Current weather is typically fetched from Azure Maps Weather API in real-time.

## How to Populate Indexes

### Option 1: Manual Data Entry
1. Go to Azure Portal → Your Search Service → Indexes
2. Select an index (e.g., "events")
3. Use the "Import data" feature to upload JSON files or connect to a data source

### Option 2: Programmatic Upload
Use the Azure Search REST API or SDK to upload documents:

```python
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

endpoint = "https://ragpp.search.windows.net"
key = "your-search-key"
index_name = "events"

client = SearchClient(
    endpoint=endpoint,
    index_name=index_name,
    credential=AzureKeyCredential(key)
)

# Upload a document
document = {
    "id": "event-001",
    "title": "Community Board Meeting",
    "description": "Monthly meeting",
    "date": "2025-12-05T19:00:00Z",
    "city": "Norfolk",
    "state": "VA",
    "location": "City Hall"
}

client.upload_documents(documents=[document])
```

### Option 3: Indexer (Automated)
Set up indexers to automatically pull data from:
- Azure Blob Storage
- Azure SQL Database
- Cosmos DB
- Other data sources

## City-Specific Data

Each index should contain data filtered by city/state. When searching, include the city in the query:

**Example Search:**
```
GET /api/search?q=community events&index_type=events&city=Norfolk&state=VA
```

The search function should filter results by the selected market city.

## Integration with Frontend

The search API is available at `/api/search` and can be called from the frontend:

```typescript
// Search for events in Norfolk
const response = await fetch('/api/search?q=meetings&index_type=events');
const data = await response.json();
```

## Recommended Data Sources

For each market city, you should populate indexes with:

1. **Events:**
   - City government websites
   - Event calendars
   - Community organization websites
   - Social media event pages

2. **Resources:**
   - City directories
   - Government service listings
   - Non-profit organization databases
   - Public facility listings

3. **Documents:**
   - City council agendas
   - Public notices
   - Budget documents
   - Policy announcements

4. **Geo:**
   - City GIS data
   - Tourism board information
   - Business directories
   - Landmark databases

## Next Steps

1. **Create Indexes** in Azure Search Portal (if not already created)
2. **Define Index Schemas** with appropriate fields for each data type
3. **Populate Data** using one of the methods above
4. **Test Searches** using the `/api/search` endpoint
5. **Integrate with Frontend** to display search results on the dashboard

## Index Schema Examples

See Azure Search documentation for creating indexes with proper field definitions (text, date, geography, etc.).

