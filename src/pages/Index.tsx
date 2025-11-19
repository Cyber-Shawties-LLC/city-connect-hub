import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logo from '@/assets/peoples-plaza-logo.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <img src={logo} alt="People's Plaza" className="h-16 w-auto" />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Connect with Your Community
          </h1>
          <p className="text-xl text-muted-foreground">
            People's Plaza is your AI-powered civic assistant, helping you discover local events,
            resources, and stay informed about what's happening in your city.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8">
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🗓️</span>
              </div>
              <h3 className="text-xl font-semibold">Local Events</h3>
              <p className="text-muted-foreground">
                Discover community events, meetings, and activities happening near you.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold">AI Assistant</h3>
              <p className="text-muted-foreground">
                Chat with Penny to get instant answers about city resources and services.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <span className="text-2xl">📰</span>
              </div>
              <h3 className="text-xl font-semibold">Stay Informed</h3>
              <p className="text-muted-foreground">
                Get real-time updates on weather, news, and important civic information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
