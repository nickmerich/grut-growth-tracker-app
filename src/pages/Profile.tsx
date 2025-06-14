
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    await fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            full_name: fullName,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully!",
      });

      await fetchProfile(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
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
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Profile
          </h1>
          <p className="text-lg opacity-90">
            Manage your account settings
          </p>
        </div>

        {/* Profile Form */}
        <Card className="mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Personal Information
          </h2>
          
          <form onSubmit={updateProfile} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            
            <Input
              label="Email"
              type="email"
              value={user?.email || ""}
              disabled
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </Card>

        {/* Account Actions */}
        <Card className="mb-6">
          <h3 className="text-lg font-black uppercase tracking-tight mb-4">
            Account Actions
          </h3>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/goal-selection')}
              variant="secondary"
              className="w-full"
            >
              Start New Goal
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="ghost"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="text-lg font-black uppercase tracking-tight mb-3">
            About GRYT
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            GRYT helps you build lasting habits through commitment contracts, 
            daily coaching, and rewards. Transform your life one day at a time.
          </p>
        </Card>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Profile;
