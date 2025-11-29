import os
import requests
import json
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(req):
    """
    Azure Function for fetching local news articles.
    Uses NewsAPI.org to fetch live local news.
    """
    try:
        # Get query parameters
        city = req.params.get("city") or "Norfolk"
        limit = int(req.params.get("limit") or "10")
        
        # Get NewsAPI key from environment (required for live news)
        news_api_key = os.environ.get("NEWS_API_KEY")
        
        if not news_api_key:
            logger.warning("NEWS_API_KEY not set, returning mock data")
            articles = get_mock_news(city)
        else:
            # Use NewsAPI to fetch live news
            try:
                # Search for local news about the city
                url = "https://newsapi.org/v2/everything"
                params = {
                    "q": f"{city} OR \"{city} local\" OR \"{city} city\"",
                    "sortBy": "publishedAt",
                    "language": "en",
                    "pageSize": limit,
                    "apiKey": news_api_key
                }
                
                logger.info(f"Fetching news for {city} using NewsAPI")
                response = requests.get(url, params=params, timeout=15)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "ok":
                    articles = [
                        {
                            "title": article.get("title", ""),
                            "description": article.get("description", "") or article.get("content", "")[:200] + "...",
                            "url": article.get("url", ""),
                            "publishedAt": article.get("publishedAt", ""),
                            "source": article.get("source", {}).get("name", "Unknown Source")
                        }
                        for article in data.get("articles", [])
                        if article.get("title") and article.get("url")  # Filter out invalid articles
                    ]
                    
                    # If no articles found, try a broader search
                    if not articles:
                        logger.info("No articles found with specific query, trying broader search")
                        params["q"] = f"{city}"
                        response = requests.get(url, params=params, timeout=15)
                        response.raise_for_status()
                        data = response.json()
                        
                        articles = [
                            {
                                "title": article.get("title", ""),
                                "description": article.get("description", "") or article.get("content", "")[:200] + "...",
                                "url": article.get("url", ""),
                                "publishedAt": article.get("publishedAt", ""),
                                "source": article.get("source", {}).get("name", "Unknown Source")
                            }
                            for article in data.get("articles", [])
                            if article.get("title") and article.get("url")
                        ]
                    
                    logger.info(f"Fetched {len(articles)} articles from NewsAPI")
                else:
                    logger.warning(f"NewsAPI returned error: {data.get('message', 'Unknown error')}")
                    articles = get_mock_news(city)
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"NewsAPI request error: {str(e)}")
                articles = get_mock_news(city)
            except Exception as e:
                logger.error(f"NewsAPI error: {str(e)}")
                articles = get_mock_news(city)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "articles": articles,
                "city": city,
                "count": len(articles)
            })
        }, 200
        
    except Exception as e:
        logger.error(f"News error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }, 500

def get_mock_news(city: str):
    """Generate realistic mock news articles for development"""
    now = datetime.now()
    return [
        {
            "title": f"{city} City Council Approves New Community Center Funding",
            "description": f"The {city} City Council voted unanimously to approve $2.5 million in funding for a new community center in the downtown area.",
            "url": "#",
            "publishedAt": (now - timedelta(hours=2)).isoformat(),
            "source": f"{city} Daily News"
        },
        {
            "title": f"Local Library Hosts Free Technology Workshops",
            "description": f"The {city} Public Library is offering free technology workshops for seniors every Tuesday and Thursday this month.",
            "url": "#",
            "publishedAt": (now - timedelta(hours=5)).isoformat(),
            "source": "Community Bulletin"
        },
        {
            "title": f"New Bike Lanes Installed on Main Street",
            "description": f"The city has completed installation of protected bike lanes on Main Street, improving safety for cyclists and pedestrians.",
            "url": "#",
            "publishedAt": (now - timedelta(hours=8)).isoformat(),
            "source": f"{city} Transportation"
        },
        {
            "title": "Farmers Market Returns This Saturday",
            "description": f"The weekly farmers market returns to the downtown plaza this Saturday with over 30 local vendors offering fresh produce and handmade goods.",
            "url": "#",
            "publishedAt": (now - timedelta(hours=12)).isoformat(),
            "source": f"{city} Events"
        },
        {
            "title": f"City Announces New Recycling Program",
            "description": f"Starting next month, {city} will expand its recycling program to include more materials and offer curbside pickup for all residents.",
            "url": "#",
            "publishedAt": (now - timedelta(days=1)).isoformat(),
            "source": f"{city} Public Works"
        }
    ]

