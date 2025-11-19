import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Cloud, Newspaper, AlertCircle, MessageSquare } from 'lucide-react';
import logo from '@/assets/peoples-plaza-logo.jpg';
import icon from '@/assets/peoples-plaza-icon.png';
import { ChatBox } from '@/components/ChatBox';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center space-x-3">
            <img src={logo} alt="People's Plaza" className="h-12 w-auto" />
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
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Stay connected with your community</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* City Info */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-primary" />
                <span>City & Weather</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">New York, NY</p>
                <p className="text-lg">72°F, Partly Cloudy</p>
                <p className="text-sm text-muted-foreground">Perfect day for outdoor events</p>
              </div>
            </CardContent>
          </Card>

          {/* News */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <span>Local News</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-2 border-primary pl-3">
                  <p className="font-medium text-sm">Community Board Meeting Tonight</p>
                  <p className="text-xs text-muted-foreground">7:00 PM at City Hall</p>
                </div>
                <div className="border-l-2 border-secondary pl-3">
                  <p className="font-medium text-sm">New Park Opens Downtown</p>
                  <p className="text-xs text-muted-foreground">Grand opening ceremony Saturday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Updates */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span>Important</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-2 border-destructive pl-3">
                  <p className="font-medium text-sm">Street Closure Alert</p>
                  <p className="text-xs text-muted-foreground">Main St closed for repairs</p>
                </div>
                <div className="border-l-2 border-accent pl-3">
                  <p className="font-medium text-sm">Policy Update</p>
                  <p className="text-xs text-muted-foreground">New parking regulations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        <Card>
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
      </main>

      {/* Footer Logo */}
      <footer className="fixed bottom-4 right-4">
        <img src={icon} alt="People's Plaza Icon" className="h-12 w-12 opacity-50" />
      </footer>
    </div>
  );
};

export default Dashboard;
