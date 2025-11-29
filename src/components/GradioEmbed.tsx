import { useRef, useEffect, useState } from 'react';

interface GradioEmbedProps {
  spaceUrl?: string;
  className?: string;
}

export const GradioEmbed = ({ 
  spaceUrl = "https://pythonprincess-penny-v2-2.hf.space",
  className = ""
}: GradioEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Gradio script is already loaded
    if (document.querySelector('script[src*="gradio.js"]')) {
      setScriptLoaded(true);
      return;
    }

    // Load Gradio script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://gradio.s3-us-west-2.amazonaws.com/4.44.0/gradio.js';
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load Gradio script');
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount - it might be used elsewhere
    };
  }, []);

  useEffect(() => {
    if (scriptLoaded && containerRef.current) {
      // Wait a bit for Gradio to initialize, then create the element
      const timer = setTimeout(() => {
        if (containerRef.current) {
          try {
            // Clear any existing content
            containerRef.current.innerHTML = '';
            // Create the gradio-app element using DOM API
            // This avoids React trying to parse the custom element
            const app = document.createElement('gradio-app');
            if (app) {
              app.setAttribute('src', spaceUrl);
              app.style.cssText = 'width: 100%; height: 100%; min-height: 500px; display: block;';
              containerRef.current.appendChild(app);
            } else {
              throw new Error('Failed to create gradio-app element');
            }
          } catch (e: any) {
            console.error('Error creating gradio-app:', e);
            setError(e.message || 'Failed to initialize Gradio app');
          }
        }
      }, 500); // Give more time for script to load
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, spaceUrl]);

  if (error) {
    return (
      <div className={`${className} p-4 border rounded-lg bg-destructive/10`}>
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          You can still use the chat by visiting the Space directly: 
          <a href={spaceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline ml-1">
            Open Penny Chat
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        className="w-full min-h-[500px] border rounded-lg overflow-hidden bg-background"
        style={{ 
          position: 'relative'
        }}
      >
        {!scriptLoaded && (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-sm text-muted-foreground">Loading Gradio interface...</p>
          </div>
        )}
      </div>
    </div>
  );
};

