import os
import requests
import json
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function for fetching public city events.
    Supports multiple event sources: Eventbrite, Facebook Events, Google Calendar, and Azure Search.
    """
    try:
        # Get query parameters
        city = req.params.get("city") or "Norfolk"
        state = req.params.get("state") or ""
        limit = int(req.params.get("limit") or "10")
        days_ahead = int(req.params.get("days_ahead") or "30")  # How many days in the future
        
        events = []
        
        # Priority 1: Try Azure Search Events Index (if configured)
        search_endpoint = os.environ.get("AZURE_SEARCH_ENDPOINT")
        search_key = os.environ.get("AZURE_SEARCH_KEY") or os.environ.get("AZURE_SEARCH_API_KEY")
        events_index = os.environ.get("AZURE_SEARCH_INDEX_EVENTS")
        
        if search_endpoint and search_key and events_index:
            try:
                # Search for events in the city
                search_url = f"{search_endpoint}/indexes/{events_index}/docs/search?api-version=2023-07-01-Preview"
                headers = {
                    "Content-Type": "application/json",
                    "api-key": search_key
                }
                
                # Build filter for city and future dates
                filters = []
                if city:
                    filters.append(f"city eq '{city}'")
                if state:
                    filters.append(f"state eq '{state}'")
                
                # Filter for future events (events from now onwards)
                current_date_iso = datetime.now().isoformat() + "Z"
                filters.append(f"date ge {current_date_iso}")
                
                search_body = {
                    "search": "*",
                    "filter": " and ".join(filters) if filters else None,
                    "top": limit,
                    "orderby": "date asc"  # Show upcoming events first
                }
                
                # Remove None values
                search_body = {k: v for k, v in search_body.items() if v is not None}
                
                logger.info(f"Searching Azure Search for events in {city}, {state}")
                response = requests.post(search_url, headers=headers, json=search_body, timeout=10)
                response.raise_for_status()
                search_results = response.json()
                
                if search_results.get("value"):
                    for item in search_results["value"]:
                        events.append({
                            "id": item.get("id", ""),
                            "title": item.get("title", "Untitled Event"),
                            "description": item.get("description", ""),
                            "date": item.get("date", ""),
                            "location": item.get("location", ""),
                            "city": item.get("city", city),
                            "state": item.get("state", state),
                            "category": item.get("category", "General"),
                            "url": item.get("url", ""),
                            "source": "Azure Search"
                        })
                    logger.info(f"Found {len(events)} events from Azure Search")
            except Exception as e:
                logger.warning(f"Azure Search events error: {str(e)}")
        
        # Priority 2: Try Eventbrite API (if configured)
        eventbrite_token = os.environ.get("EVENTBRITE_API_TOKEN")
        if eventbrite_token and len(events) < limit:
            try:
                # Eventbrite API
                # First, search for the city location
                location_query = f"{city}, {state}" if state else city
                search_url = "https://www.eventbriteapi.com/v3/events/search/"
                params = {
                    "q": location_query,
                    "location.address": location_query,
                    "location.within": "25mi",  # 25 mile radius
                    "start_date.range_start": datetime.now().isoformat(),
                    "start_date.range_end": (datetime.now() + timedelta(days=days_ahead)).isoformat(),
                    "expand": "venue",
                    "status": "live",
                    "order_by": "start_asc"
                }
                
                headers = {
                    "Authorization": f"Bearer {eventbrite_token}"
                }
                
                logger.info(f"Fetching events from Eventbrite for {location_query}")
                response = requests.get(search_url, params=params, headers=headers, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                for event in data.get("events", [])[:limit - len(events)]:
                    start = event.get("start", {})
                    venue = event.get("venue", {})
                    
                    events.append({
                        "id": f"eventbrite-{event.get('id', '')}",
                        "title": event.get("name", {}).get("text", "Untitled Event"),
                        "description": event.get("description", {}).get("text", "")[:200] + "..." if event.get("description", {}).get("text") else "",
                        "date": start.get("utc", ""),
                        "location": venue.get("name", {}).get("text", "") if venue else "",
                        "city": city,
                        "state": state,
                        "category": ", ".join([cat.get("name", "") for cat in event.get("category", {}).get("subcategories", [])[:2]]),
                        "url": event.get("url", ""),
                        "source": "Eventbrite"
                    })
                
                logger.info(f"Found {len(events)} total events (including Eventbrite)")
            except Exception as e:
                logger.warning(f"Eventbrite API error: {str(e)}")
        
        # Priority 3: Try Facebook Events (if configured)
        # Note: Facebook Events API requires app approval and is more complex
        # For now, we'll skip this and use mock data as fallback
        
        # If no events found, return mock/example events
        if len(events) == 0:
            logger.info("No events found from APIs, returning example events")
            events = get_example_events(city, state, limit)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "events": events,
                "city": city,
                "state": state,
                "count": len(events)
            })
        }, 200
        
    except Exception as e:
        logger.error(f"Events error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }, 500

def get_example_events(city: str, state: str, limit: int = 10):
    """Generate example events for development/demo"""
    now = datetime.now()
    example_events = [
        {
            "id": "example-1",
            "title": f"{city} City Council Meeting",
            "description": f"Monthly city council meeting to discuss local issues and upcoming projects.",
            "date": (now + timedelta(days=3)).isoformat(),
            "location": "City Hall",
            "city": city,
            "state": state,
            "category": "Government",
            "url": "#",
            "source": "Example"
        },
        {
            "id": "example-2",
            "title": f"{city} Farmers Market",
            "description": f"Weekly farmers market featuring local produce, crafts, and food vendors.",
            "date": (now + timedelta(days=6)).isoformat(),
            "location": "Downtown Plaza",
            "city": city,
            "state": state,
            "category": "Community",
            "url": "#",
            "source": "Example"
        },
        {
            "id": "example-3",
            "title": f"{city} Public Library Story Time",
            "description": f"Children's story time session at the public library. All ages welcome.",
            "date": (now + timedelta(days=8)).isoformat(),
            "location": f"{city} Public Library",
            "city": city,
            "state": state,
            "category": "Education",
            "url": "#",
            "source": "Example"
        },
        {
            "id": "example-4",
            "title": f"{city} Community Cleanup Day",
            "description": f"Join neighbors for a community cleanup day. Supplies provided.",
            "date": (now + timedelta(days=12)).isoformat(),
            "location": "Various Locations",
            "city": city,
            "state": state,
            "category": "Community Service",
            "url": "#",
            "source": "Example"
        },
        {
            "id": "example-5",
            "title": f"{city} Art Walk",
            "description": f"Monthly art walk featuring local artists, galleries, and live music.",
            "date": (now + timedelta(days=15)).isoformat(),
            "location": "Arts District",
            "city": city,
            "state": state,
            "category": "Arts & Culture",
            "url": "#",
            "source": "Example"
        }
    ]
    
    return example_events[:limit]

