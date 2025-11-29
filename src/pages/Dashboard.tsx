import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, AlertCircle, MessageSquare, History } from 'lucide-react';
import icon from '@/assets/peoples-plaza-icon.png';
import cobblestone from '@/assets/cobblestone.png';
import { ChatBox } from '@/components/ChatBox';
import { ChatHistory } from '@/components/ChatHistory';
import { NewsFeed } from '@/components/NewsFeed';
import { LiveNewsCard } from '@/components/LiveNewsCard';
import { LocationSelector } from '@/components/LocationSelector';
import { WeatherCard } from '@/components/WeatherCard';
// import { EventsFeed } from '@/components/EventsFeed'; // Commented out to match dashboard screenshot
import { PennyChatProvider } from '@/hooks/usePennyChats';
import { LocationProvider, useLocation } from '@/hooks/useLocation';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { selectedMarket } = useLocation(); // This is safe because DashboardContent is wrapped in LocationProvider

  // Safety check - if user is null, redirect (shouldn't happen due to ProtectedRoute, but just in case)
  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <ErrorBoundary>
      <PennyChatProvider>
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
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center space-x-3">
              <img src={icon} alt="People's Plaza" className="h-12 w-auto drop-shadow-lg" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{currentDate}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome, {user?.name}!</h1>
                <p className="text-muted-foreground">Stay connected with your community</p>
              </div>
              <div className="w-64">
                <LocationSelector />
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* City Info & Weather */}
            <WeatherCard />

            {/* Live News Card */}
            <LiveNewsCard />

            {/* Important Updates */}
            <Card className="hover:shadow-lg transition-shadow border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span>Important</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-2 border-destructive pl-3">
                    <p className="font-medium text-sm text-foreground">Street Closure Notice</p>
                    <p className="text-xs text-muted-foreground">Main St. closed Friday 9AM-5PM</p>
                  </div>
                  <div className="border-l-2 border-destructive/60 pl-3">
                    <p className="font-medium text-sm text-foreground">Parking Changes</p>
                    <p className="text-xs text-muted-foreground">New regulations effective next week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* News Feed Section */}
          <div className="mb-8">
            <NewsFeed />
          </div>

          {/* Chat Section with History */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat History Sidebar */}
            <Card className="border-border shadow-lg lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>Chat History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <ChatHistory />
                </div>
              </CardContent>
            </Card>

            {/* Chat with Penny */}
            <Card className="border-primary/20 shadow-lg lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Chat with Penny</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChatBox />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
      </PennyChatProvider>
    </ErrorBoundary>
  );
};

const Dashboard = () => {
  return (
    <LocationProvider>
      <DashboardContent />
    </LocationProvider>
  );
};

export default Dashboard;

