import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Cloud, Newspaper, AlertCircle, MessageSquare, History } from 'lucide-react';
import icon from '@/assets/peoples-plaza-icon.png';
import cobblestone from '@/assets/cobblestone.png';
import { ChatBox } from '@/components/ChatBox';
import { ChatHistory } from '@/components/ChatHistory';
import { PennyChatProvider } from '@/hooks/usePennyChats';
import { useNavigate } from 'react-router-dom';

import { usePennyChat } from "../hooks/usePennyChats";

// ⭐ ADD THIS:
import { useState } from "react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { messages, loading, sendMessage } = usePennyChat();
  const [input, setInput] = useState("");

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
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
            <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Stay connected with your community</p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* City Info */}
            <Card className="hover:shadow-lg transition-shadow border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span>City & Weather</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">New York, NY</p>
                  <p className="text-lg text-foreground">72°F, Partly Cloudy</p>
                  <p className="text-sm text-muted-foreground">Perfect day for outdoor events</p>
                </div>
              </CardContent>
            </Card>

            {/* News */}
            <Card className="hover:shadow-lg transition-shadow border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <span>Local News</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-medium text-sm text-foreground">Community Board Meeting Tonight</p>
                    <p className="text-xs text-muted-foreground">7:00 PM at City Hall</p>
                  </div>
                  <div className="border-l-2 border-primary/60 pl-3">
                    <p className="font-medium text-sm text-foreground">New Park Opens Downtown</p>
                    <p className="text-xs text-muted-foreground">Grand opening ceremony Saturday</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                
                {/* ⭐ CONNECT CHATBOX TO PENNY — ONLY ADD THIS */}
                <ChatBox 
                  messages={messages}
                  loading={loading}
                  sendMessage={sendMessage}
                />

              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
    </PennyChatProvider>
  );
};

export default Dashboard;

