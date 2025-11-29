import os
import requests
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function for Azure Maps geolocation search.
    """
    try:
        # Get query from params or body
        query = req.params.get("query")
        body_data = req.get_json() or {}
        if not query:
            query = body_data.get("query")
        
        if not query:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Query parameter is required"})
            }, 400
        
        maps_key = os.environ.get("AZURE_MAPS_KEY")
        if not maps_key:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Azure Maps key not configured"})
            }, 500
        
        url = f"https://atlas.microsoft.com/search/address/json?api-version=1.0&subscription-key={maps_key}&query={query}"
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(response.json())
        }, 200
        
    except Exception as e:
        logger.error(f"Geolocation error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }, 500
