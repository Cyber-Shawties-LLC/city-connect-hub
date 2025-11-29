import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/useLocation';

interface WeatherData {
  temperature: number;
  feels_like: number;
  description: string;
  icon?: string;
  humidity: number;
  wind_speed: number;
  city: string;
  state?: string;
  country: string;
  timestamp: string;
}

export const WeatherCard = () => {
  const { selectedMarket, detectedLocation } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!selectedMarket) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const city = selectedMarket.name;
      const state = selectedMarket.state;
      
      // Priority 1: Use user's detected geolocation coordinates (most accurate)
      // Priority 2: Use market area's predefined coordinates
      // Priority 3: Use city/state for geocoding
      let url = `/api/weather?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
      
      if (detectedLocation?.lat && detectedLocation?.lon) {
        // Use user's actual location coordinates
        url += `&lat=${detectedLocation.lat}&lon=${detectedLocation.lon}`;
        console.log(`Using detected location: ${detectedLocation.lat}, ${detectedLocation.lon}`);
      } else if (selectedMarket.coordinates) {
        // Use market area's coordinates
        url += `&lat=${selectedMarket.coordinates.lat}&lon=${selectedMarket.coordinates.lon}`;
        console.log(`Using market coordinates: ${selectedMarket.coordinates.lat}, ${selectedMarket.coordinates.lon}`);
      } else {
        console.log(`Using city/state for geocoding: ${city}, ${state}`);
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeather(data);
        
        // Log if using mock data
        if (data._is_mock) {
          console.warn('Weather API returned mock data - Azure Maps may not be configured correctly');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Weather API error:', response.status, errorData);
        throw new Error(errorData.error || `API returned ${response.status}`);
      }
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to load weather');
      
      // Fallback to mock data
      setWeather({
        temperature: 72,
        feels_like: 74,
        description: 'Partly Cloudy',
        humidity: 65,
        wind_speed: 8,
        city: selectedMarket.name,
        state: selectedMarket.state,
        country: 'US',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedMarket?.id, selectedMarket?.name, detectedLocation?.lat, detectedLocation?.lon]);

  const getWeatherMessage = (temp: number, desc: string) => {
    if (temp >= 80) return 'Hot day ahead!';
    if (temp >= 70) return 'Perfect day for outdoor events';
    if (temp >= 60) return 'Nice weather for activities';
    if (temp >= 50) return 'Cool but pleasant';
    return 'Bundle up, it\'s chilly!';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span>City & Weather</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeather}
            disabled={loading}
            className="h-8 w-8 p-0"
            title="Refresh weather"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !weather ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error && !weather ? (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">
              {selectedMarket?.displayName || 'Select Location'}
            </p>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : weather ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-foreground">
                {weather.city}{weather.state ? `, ${weather.state}` : ''}
              </p>
              {detectedLocation && (
                <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                  Your Location
                </span>
              )}
            </div>
            <p className="text-lg text-foreground">
              {weather.temperature}°F, {weather.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {getWeatherMessage(weather.temperature, weather.description)}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>Feels like {weather.feels_like}°F</span>
              <span>•</span>
              <span>{weather.humidity}% humidity</span>
              <span>•</span>
              <span>{weather.wind_speed} mph wind</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">
              {selectedMarket?.displayName || 'Select Location'}
            </p>
            <p className="text-sm text-muted-foreground">No weather data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

