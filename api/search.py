import os
import requests
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function for Azure Cognitive Search integration.
    Supports multiple indexes: documents, events, geo, resources, weather
    """
    try:
        # Get search term from query params or body
        term = req.params.get("q") or req.params.get("query") or "*"
        body_data = req.get_json() or {}
        if not term or term == "*":
            term = body_data.get("q") or body_data.get("query") or "*"
        
        # Get index type from query params or body (defaults to "events")
        index_type = req.params.get("index_type") or body_data.get("index_type") or "events"
        
        # Get Azure Search configuration
        endpoint = os.environ.get("AZURE_SEARCH_ENDPOINT")
        # Support both AZURE_SEARCH_KEY and AZURE_SEARCH_API_KEY
        key = os.environ.get("AZURE_SEARCH_KEY") or os.environ.get("AZURE_SEARCH_API_KEY")
        
        # Map index types to environment variable names
        index_map = {
            "documents": os.environ.get("AZURE_SEARCH_INDEX_DOCUMENTS"),
            "events": os.environ.get("AZURE_SEARCH_INDEX_EVENTS"),
            "geo": os.environ.get("AZURE_SEARCH_INDEX_GEO"),
            "geolocation": os.environ.get("AZURE_SEARCH_INDEX_GEO"),
            "resources": os.environ.get("AZURE_SEARCH_INDEX_RESOURCES"),
            "weather": os.environ.get("AZURE_SEARCH_INDEX_WEATHER"),
        }
        
        # Get the specific index, or fall back to generic AZURE_SEARCH_INDEX
        index = index_map.get(index_type.lower()) or os.environ.get("AZURE_SEARCH_INDEX", "your-index")
        
        if not endpoint or not key:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Azure Search not configured"})
            }, 500
        
        if not index or index == "your-index":
            return {
                "statusCode": 500,
                "body": json.dumps({
                    "error": f"Search index not configured for type: {index_type}",
                    "available_types": list(index_map.keys())
                })
            }, 500
        
        headers = {
            "Content-Type": "application/json",
            "api-key": key
        }
        
        search_body = { "search": term }
        
        url = f"{endpoint}/indexes/{index}/docs/search?api-version=2023-07-01-Preview"
        
        logger.info(f"Searching index: {index} with term: {term}")
        
        response = requests.post(url, headers=headers, json=search_body, timeout=30)
        response.raise_for_status()
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "results": response.json(),
                "index_used": index,
                "index_type": index_type
            })
        }, 200
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }, 500
