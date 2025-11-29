import { useRef, useEffect } from 'react';

interface GradioEmbedProps {
  spaceUrl?: string;
  className?: string;
}

export const GradioEmbed = ({ 
  spaceUrl = "https://pythonprincess-penny-v2-2.hf.space",
  className = ""
}: GradioEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the gradio-app element is properly initialized
    // The script is loaded in index.html, so we just need to ensure the element exists
    if (containerRef.current) {
      const gradioApp = containerRef.current.querySelector('gradio-app');
      if (!gradioApp) {
        // Create the gradio-app element if it doesn't exist
        const app = document.createElement('gradio-app');
        app.setAttribute('src', spaceUrl);
        app.style.width = '100%';
        app.style.height = '100%';
        app.style.minHeight = '500px';
        app.style.display = 'block';
        containerRef.current.appendChild(app);
      }
    }
  }, [spaceUrl]);

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        className="w-full min-h-[500px] border rounded-lg overflow-hidden bg-background"
        style={{ 
          position: 'relative'
        }}
      >
        {/* Gradio Web Component - using the exact format from Hugging Face */}
        <gradio-app 
          src={spaceUrl}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '500px',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
};

