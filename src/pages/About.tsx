import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/peoples-plaza-icon.png';
import cobblestone from '@/assets/cobblestone.png';

const About = () => {
  const navigate = useNavigate();

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
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="text-center space-y-6 mb-16">
              <img 
                src={logo} 
                alt="People's Plaza" 
                className="h-24 w-24 mx-auto drop-shadow-lg"
              />
              <h1 className="text-5xl font-bold text-foreground">
                About People's Plaza
              </h1>
              <p className="text-xl text-muted-foreground">
                Your AI-powered civic engagement platform
              </p>
            </div>

            {/* Mission Section */}
            <div className="space-y-12">
              <section className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  People's Plaza bridges the gap between citizens and their communities through 
                  innovative technology. We believe that civic engagement should be accessible, 
                  intuitive, and empowering for everyone.
                </p>
              </section>

              <section className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-primary">What We Offer</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p>
                      <strong className="text-foreground">AI Assistant:</strong> Penny, your civic companion, 
                      provides instant answers to questions about local events, resources, and city services.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p>
                      <strong className="text-foreground">Real-Time Updates:</strong> Stay informed with 
                      current weather conditions, community news, and important civic notifications.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p>
                      <strong className="text-foreground">Event Discovery:</strong> Find local events, 
                      community board meetings, and activities that matter to you.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p>
                      <strong className="text-foreground">Community Resources:</strong> Access comprehensive 
                      information about city services, public transportation, and civic programs.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Our Technology</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Built with modern web technologies and powered by advanced AI, People's Plaza 
                  delivers a seamless, responsive experience across all devices. Our platform is 
                  designed with security, accessibility, and user privacy at its core.
                </p>
              </section>

              <section className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Get Started Today</h2>
                <p className="text-muted-foreground mb-6">
                  Join thousands of engaged citizens using People's Plaza to stay connected 
                  with their communities.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="shadow-lg"
                >
                  Create Your Account
                </Button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;
