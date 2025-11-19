import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logo from '@/assets/peoples-plaza-icon.png';
import cobblestone from '@/assets/cobblestone.png';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Cobblestone Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url(${cobblestone})`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <img src={logo} alt="People's Plaza" className="h-12 w-auto drop-shadow-lg" />
            <Button
              variant="ghost"
              onClick={() => navigate('/about')}
              className="text-foreground hover:text-primary"
            >
              About
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Main Headline */}
            <div className="text-center space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
                Connect with Your
                <span className="block text-primary mt-2">Community</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                AI-powered civic engagement platform for discovering events, resources, 
                and staying informed about your city.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')} 
                className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/auth')} 
                className="text-lg px-10 py-6 border-2"
              >
                Sign In
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-24">
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Local Events</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Discover community events, board meetings, and activities happening in your area.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">AI Assistant</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Chat with Penny for instant answers about city resources and civic services.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Stay Informed</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time weather updates, community news, and important civic notifications.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
