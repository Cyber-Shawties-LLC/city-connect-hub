import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation, MARKET_AREAS } from '@/hooks/useLocation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const LocationSelector = () => {
  const {
    selectedMarket,
    detectedMarket,
    isDetecting,
    locationError,
    setSelectedMarket,
    detectLocation,
  } = useLocation();

  // Auto-detect location on mount (only once)
  useEffect(() => {
    // Only auto-detect if no market is selected yet
    if (!selectedMarket) {
      detectLocation();
    }
  }, []); // Empty dependency array - only run once on mount

  const handleMarketChange = (marketId: string) => {
    const market = MARKET_AREAS.find(m => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={selectedMarket?.id || 'norfolk'}
          onValueChange={handleMarketChange}
        >
          <SelectTrigger className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select market area" />
          </SelectTrigger>
          <SelectContent>
            {MARKET_AREAS.map((market) => (
              <SelectItem key={market.id} value={market.id}>
                {market.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={detectLocation}
          disabled={isDetecting}
          title="Detect my location"
        >
          {isDetecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Status messages */}
      {isDetecting && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Detecting your location...</AlertDescription>
        </Alert>
      )}

      {locationError && !isDetecting && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {detectedMarket && !isDetecting && !locationError && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Detected location: {detectedMarket.displayName}
          </AlertDescription>
        </Alert>
      )}

      {selectedMarket && (
        <p className="text-xs text-muted-foreground">
          Current market: <span className="font-medium">{selectedMarket.displayName}</span>
        </p>
      )}
    </div>
  );
};

