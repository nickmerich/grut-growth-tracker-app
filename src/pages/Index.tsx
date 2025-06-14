
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/ui/BottomNav";

const Index = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("home");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleStartJourney = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    
    if (user) {
      // Navigate to different pages based on tab
      switch (tab) {
        case "home":
          navigate('/dashboard');
          break;
        case "goal":
          navigate('/goal-selection');
          break;
        case "progress":
          navigate('/progress');
          break;
        case "rewards":
          navigate('/rewards');
          break;
        case "profile":
          navigate('/profile');
          break;
        default:
          break;
      }
    } else {
      // If not authenticated, redirect to auth for all tabs except home
      if (tab !== "home") {
        navigate('/auth');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/lovable-uploads/c5926c23-0546-4aab-b5f8-5d4ebd1e0420.png" 
              alt="GRYT Logo" 
              className="w-32 h-32 mx-auto"
            />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 leading-tight">
            BECOME THE BEST VERSION OF YOU
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl font-bold mb-12 opacity-90 leading-relaxed">
            Pick one goal. Sign a contract. Get daily coaching. Earn real rewards.
          </p>
          
          {/* CTA Button */}
          <Button 
            onClick={handleStartJourney}
            className="w-full"
            variant="primary"
          >
            {user ? "CONTINUE YOUR JOURNEY" : "START YOUR GRYT JOURNEY"}
          </Button>

          {/* Additional Actions for Authenticated Users */}
          {user && (
            <div className="mt-6 space-y-3">
              <Button 
                onClick={() => navigate('/goal-selection')}
                className="w-full"
                variant="secondary"
              >
                START NEW GOAL
              </Button>
              
              <div className="text-center">
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Sign In Link for Non-Authenticated Users */}
          {!user && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/auth')}
                className="text-sm text-green-500 hover:underline"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
