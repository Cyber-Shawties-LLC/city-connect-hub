import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from '@/hooks/useLocation';

interface NewsItem {
  title: string;
  time: string;
  source: string;
}

export const LiveNewsCard = () => {
  const { selectedMarket } = useLocation();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        const city = selectedMarket?.name || 'Norfolk';
        // Fetch from Azure Function API
        const response = await fetch(`/api/news?city=${city}&limit=3`);
        
        if (response.ok) {
          const data = await response.json();
          const articles = data.articles || [];
          
          // Convert to news items format (headlines only)
          const items: NewsItem[] = articles.slice(0, 2).map((article: any) => ({
            title: article.title || '',
            time: formatTimeAgo(article.publishedAt || ''),
            source: article.source || 'Local News'
          }));
          
          setNewsItems(items);
        } else {
          // If 404, function might not be deployed - use fallback silently
          if (response.status === 404) {
            console.warn('Live News API endpoint not found (404). Using fallback.');
          }
          // Fallback to static items if API fails
          const city = selectedMarket?.name || 'City';
          setNewsItems([
            { title: `${city} Community Meeting Tonight`, time: "7:00 PM", source: "City Hall" },
            { title: `${city} Park Opens Downtown`, time: "Saturday", source: "City Events" }
          ]);
        }
      } catch (error: any) {
        // Don't log 404 errors as errors - they're expected if functions aren't deployed
        if (!error.message?.includes('404')) {
          console.error('Error fetching live news:', error);
        }
        // Fallback to static items
        const city = selectedMarket?.name || 'City';
        setNewsItems([
          { title: `${city} Community Meeting Tonight`, time: "7:00 PM", source: "City Hall" },
          { title: `${city} Park Opens Downtown`, time: "Saturday", source: "City Events" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveNews();
    // Refresh every 15 minutes
    const interval = setInterval(fetchLiveNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedMarket?.id, selectedMarket?.name]); // Refetch when location changes

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Radio className="h-5 w-5 text-primary" />
          <span>
            Live News
            {selectedMarket && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                - {selectedMarket.displayName}
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : newsItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No news available</p>
          ) : (
            newsItems.map((item, index) => (
              <div key={index} className="border-l-2 border-primary pl-3">
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.time} • {item.source}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

