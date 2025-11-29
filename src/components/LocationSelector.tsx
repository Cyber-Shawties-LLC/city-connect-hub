import { useState, useEffect } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const LocationSelector = () => {
  const {
    selectedMarket,
    detectedMarket,
    isDetecting,
    locationError,
    setSelectedMarket,
    detectLocation,
  } = useLocation();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Show location prompt on first load if location hasn't been detected
  useEffect(() => {
    // Check if we've already prompted or detected location
    const hasDetectedLocation = localStorage.getItem('location_detected');
    const hasPromptedBefore = localStorage.getItem('location_prompt_shown');
    
    // Show prompt if:
    // 1. We haven't prompted before
    // 2. We haven't detected location
    // 3. User hasn't explicitly dismissed it
    if (!hasPromptedBefore && !hasDetectedLocation && !hasPrompted) {
      // Small delay to let page load first
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
        setHasPrompted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasPrompted]);

  const handleAllowLocation = async () => {
    setShowLocationPrompt(false);
    localStorage.setItem('location_prompt_shown', 'true');
    await detectLocation();
    // Mark as detected if successful (will be set in detectLocation)
  };

  const handleDenyLocation = () => {
    setShowLocationPrompt(false);
    localStorage.setItem('location_prompt_shown', 'true');
    localStorage.setItem('location_detected', 'denied');
  };

  // Mark location as detected when successfully detected
  useEffect(() => {
    if (detectedMarket && !locationError) {
      localStorage.setItem('location_detected', 'true');
    }
  }, [detectedMarket, locationError]);

  const handleMarketChange = (marketId: string) => {
    const market = MARKET_AREAS.find(m => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
    }
  };

  const handleDetectClick = async () => {
    await detectLocation();
  };

  return (
    <>
      <AlertDialog open={showLocationPrompt} onOpenChange={setShowLocationPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use Your Location?</AlertDialogTitle>
            <AlertDialogDescription>
              We can automatically detect your location to show you relevant events, news, and weather for your area. 
              This helps us provide the most accurate information for your city.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDenyLocation}>
              Not Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAllowLocation}>
              Allow Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            onClick={handleDetectClick}
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

