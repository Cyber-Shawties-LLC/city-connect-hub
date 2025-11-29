import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, ExternalLink, MapPin, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from '@/hooks/useLocation';
import { API_URL } from '@/lib/config';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  city: string;
  state: string;
  category: string;
  url: string;
  source?: string;
}

export const EventsFeed = () => {
  const { selectedMarket } = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = async () => {
    if (!selectedMarket) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const city = selectedMarket.name;
      const state = selectedMarket.state;
      
      const response = await fetch(`${API_URL}/events?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&limit=10&days_ahead=30`);
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setLastUpdated(new Date());
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Auto-refresh every hour
    const interval = setInterval(fetchEvents, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedMarket?.id, selectedMarket?.name]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 0) return 'Past event';
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Tomorrow';
      if (diffInDays < 7) return `In ${diffInDays} days`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'Date TBD';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>
              Upcoming Events
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
            onClick={fetchEvents}
            disabled={loading}
            className="h-8 w-8 p-0"
            title="Refresh events"
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
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {loading && events.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 border-l-2 border-primary/30 pl-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : error && events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchEvents}>
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No upcoming events found</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0 hover:border-primary/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2">
                        {event.title}
                      </h3>
                      {event.source && event.source !== "Example" && (
                        <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                          {event.source}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(event.date)}</span>
                        {formatTime(event.date) && (
                          <span>at {formatTime(event.date)}</span>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      {event.category && (
                        <span className="text-primary">• {event.category}</span>
                      )}
                    </div>
                  </div>
                  {event.url && event.url !== '#' && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                      aria-label="View event details"
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

