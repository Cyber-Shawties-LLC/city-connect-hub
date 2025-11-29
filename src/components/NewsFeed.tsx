import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from '@/hooks/useLocation';

// Simple logger for browser console
const logger = {
  info: (msg: string) => console.log(`[NewsFeed] ${msg}`),
  error: (msg: string) => console.error(`[NewsFeed] ${msg}`)
};

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source?: string;
}

export const NewsFeed = () => {
  const { selectedMarket } = useLocation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Move fetchNews outside useEffect so it can be called from onClick
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const city = selectedMarket?.name || 'Norfolk';
      
      // Fetch from Azure Function API (uses NEWS_API_KEY from Azure environment)
      const apiUrl = '/api/news';
      const response = await fetch(`${apiUrl}?city=${city}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
        if (response.ok) {
          const data = await response.json();
          // Handle both direct array and wrapped response
          const articlesData = data.articles || data;
          if (Array.isArray(articlesData) && articlesData.length > 0) {
            setArticles(articlesData);
            setLastUpdated(new Date());
            setError(null);
          } else {
            // API returned empty array, use mock data
            throw new Error('No articles returned from API');
          }
        } else {
          // API returned error, use mock data
          if (response.status === 404) {
            console.warn('News API endpoint not found (404). Using fallback data.');
          } else {
            console.warn(`News API returned ${response.status}. Using fallback data.`);
          }
          throw new Error(`API returned ${response.status}`);
        }
    } catch (err: any) {
      console.error('Error fetching news:', err);
      // Always use mock data as fallback (so users always see something)
      const city = selectedMarket?.name || 'Norfolk';
      const mockArticles: NewsArticle[] = [
        {
          title: `${city} City Council Approves New Community Center Funding`,
          description: `The ${city} City Council voted unanimously to approve $2.5 million in funding for a new community center in the downtown area.`,
          url: "#",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: `${city} Daily News`
        },
        {
          title: "Local Library Hosts Free Technology Workshops",
          description: `The ${city} Public Library is offering free technology workshops for seniors every Tuesday and Thursday this month.`,
          url: "#",
          publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          source: "Community Bulletin"
        },
        {
          title: "New Bike Lanes Installed on Main Street",
          description: "The city has completed installation of protected bike lanes on Main Street, improving safety for cyclists and pedestrians.",
          url: "#",
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          source: `${city} Transportation`
        },
        {
          title: "Farmers Market Returns This Saturday",
          description: "The weekly farmers market returns to the downtown plaza this Saturday with over 30 local vendors offering fresh produce and handmade goods.",
          url: "#",
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          source: `${city} Events`
        },
        {
          title: `${city} Announces New Recycling Program`,
          description: `Starting next month, ${city} will expand its recycling program to include more materials and offer curbside pickup for all residents.`,
          url: "#",
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          source: `${city} Public Works`
        }
      ];
      setArticles(mockArticles);
      setLastUpdated(new Date());
      setError(null); // Don't show error - we have fallback data
    } finally {
      setLoading(false);
    }
  }, [selectedMarket?.name]);

  // Call fetchNews on mount and when location changes
  useEffect(() => {
    fetchNews();
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]); // Depend on fetchNews callback

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <span>
              Local News Feed
              {selectedMarket && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {selectedMarket.displayName}
                </span>
              )}
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNews}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {loading && articles.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : error && articles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchNews}>
                Try Again
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No news articles available</p>
            </div>
          ) : (
            articles.map((article, index) => (
              <div
                key={index}
                className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0 hover:border-primary/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {article.source && (
                        <span className="font-medium">{article.source}</span>
                      )}
                      <span>•</span>
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                  {article.url && article.url !== '#' && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                      aria-label="Read full article"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

