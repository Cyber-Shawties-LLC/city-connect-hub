#!/usr/bin/env python3
"""
Script to upload events to Azure Search Events Index.
Usage: python upload_events_to_azure_search.py events.json
"""

import sys
import json
import os
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from datetime import datetime

def upload_events(events_file, endpoint, key, index_name):
    """Upload events from JSON file to Azure Search"""
    
    # Create search client
    client = SearchClient(
        endpoint=endpoint,
        index_name=index_name,
        credential=AzureKeyCredential(key)
    )
    
    # Load events from JSON file
    print(f"Loading events from {events_file}...")
    with open(events_file, 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    print(f"Found {len(events)} events to upload")
    
    # Validate events
    validated_events = []
    for event in events:
        # Ensure required fields
        if not event.get('id'):
            print(f"Warning: Event missing 'id', skipping: {event.get('title', 'Unknown')}")
            continue
        
        # Ensure date is in correct format
        if event.get('date'):
            try:
                # Validate date format
                datetime.fromisoformat(event['date'].replace('Z', '+00:00'))
            except ValueError:
                print(f"Warning: Invalid date format for event {event.get('id')}: {event.get('date')}")
                continue
        
        validated_events.append(event)
    
    print(f"Validated {len(validated_events)} events")
    
    # Upload in batches (Azure Search allows up to 1000 documents per batch)
    batch_size = 1000
    total_uploaded = 0
    
    for i in range(0, len(validated_events), batch_size):
        batch = validated_events[i:i + batch_size]
        print(f"Uploading batch {i//batch_size + 1} ({len(batch)} events)...")
        
        try:
            result = client.upload_documents(documents=batch)
            
            # Count successful uploads
            successful = sum(1 for r in result if r.succeeded)
            failed = len(result) - successful
            
            total_uploaded += successful
            
            if failed > 0:
                print(f"  ⚠️  {failed} events failed to upload")
                for r in result:
                    if not r.succeeded:
                        print(f"    - {r.key}: {r.error_message}")
            else:
                print(f"  ✅ All {len(batch)} events uploaded successfully")
                
        except Exception as e:
            print(f"  ❌ Error uploading batch: {str(e)}")
            raise
    
    print(f"\n✅ Total: {total_uploaded} events uploaded to Azure Search")
    return total_uploaded

def main():
    if len(sys.argv) < 2:
        print("Usage: python upload_events_to_azure_search.py <events.json>")
        print("\nEnvironment variables required:")
        print("  AZURE_SEARCH_ENDPOINT - Your Azure Search endpoint")
        print("  AZURE_SEARCH_KEY - Your Azure Search API key")
        print("  AZURE_SEARCH_INDEX_EVENTS - Index name (default: 'events')")
        sys.exit(1)
    
    events_file = sys.argv[1]
    
    if not os.path.exists(events_file):
        print(f"Error: File not found: {events_file}")
        sys.exit(1)
    
    # Get configuration from environment variables
    endpoint = os.environ.get("AZURE_SEARCH_ENDPOINT")
    key = os.environ.get("AZURE_SEARCH_KEY") or os.environ.get("AZURE_SEARCH_API_KEY")
    index_name = os.environ.get("AZURE_SEARCH_INDEX_EVENTS", "events")
    
    if not endpoint:
        print("Error: AZURE_SEARCH_ENDPOINT environment variable not set")
        sys.exit(1)
    
    if not key:
        print("Error: AZURE_SEARCH_KEY or AZURE_SEARCH_API_KEY environment variable not set")
        sys.exit(1)
    
    print(f"Azure Search Endpoint: {endpoint}")
    print(f"Index Name: {index_name}")
    print()
    
    try:
        upload_events(events_file, endpoint, key, index_name)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

