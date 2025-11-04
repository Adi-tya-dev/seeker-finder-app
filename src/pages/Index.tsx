import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Package, LogOut, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Auth Actions */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {user ? (
          <>
            <Button variant="secondary" onClick={() => navigate('/messages')}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button variant="secondary" onClick={() => navigate('/my-items')}>
              <Package className="mr-2 h-4 w-4" />
              My Items
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => navigate('/auth')}>
            Login / Sign Up
          </Button>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Lost & Found
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12">
              Reuniting people with their belongings, one item at a time
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            <div 
              className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 animate-scale-in border border-border"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary to-accent">
                  <Package className="w-12 h-12 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Found Something?</h2>
                  <p className="text-muted-foreground mb-6">
                    Help someone find their lost item by reporting what you found
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => navigate('/report-found')}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  Report Found Item
                </Button>
              </div>
            </div>

            <div 
              className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 animate-scale-in border border-border"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-secondary to-blue-400">
                  <Search className="w-12 h-12 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Lost Something?</h2>
                  <p className="text-muted-foreground mb-6">
                    Browse through found items and find what you're looking for
                  </p>
                </div>
                <Button 
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/browse-items')}
                  className="w-full"
                >
                  Browse Lost Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-primary mb-2">1</div>
              <p className="text-sm text-muted-foreground">Report or search for items with detailed information</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-primary mb-2">2</div>
              <p className="text-sm text-muted-foreground">Upload photos and specify location details</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <p className="text-sm text-muted-foreground">Connect and reunite with your belongings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
