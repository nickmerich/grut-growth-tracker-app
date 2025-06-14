
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  subscription_tier: string;
  timezone: string;
  daily_reminder_time: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setUser(user);
    await Promise.all([
      loadProfile(user.id),
      loadAchievements(user.id)
    ]);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
      setEditedProfile(data || {});
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAchievements = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error: any) {
      console.error('Error loading achievements:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...editedProfile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });

      setProfile({ ...profile, ...editedProfile } as Profile);
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Profile
          </h1>
          <p className="text-lg opacity-90">
            Manage your GRYT journey
          </p>
        </div>

        {/* Profile Info */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight">
              Personal Information
            </h2>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="text-sm"
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  className="text-sm"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedProfile(profile || {});
                  }}
                  variant="secondary"
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Full Name"
                  value={editedProfile.full_name || ""}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, full_name: e.target.value }))}
                />
                <Input
                  label="Username"
                  value={editedProfile.username || ""}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                />
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-2">
                    Daily Reminder Time
                  </label>
                  <input
                    type="time"
                    value={editedProfile.daily_reminder_time || "09:00"}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, daily_reminder_time: e.target.value }))}
                    className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-green-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-1">Full Name</label>
                  <p className="text-lg">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-1">Username</label>
                  <p className="text-lg">{profile?.username || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-1">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-black uppercase tracking-wide mb-1">Subscription</label>
                  <span className={`
                    px-3 py-1 text-sm font-bold rounded uppercase
                    ${profile?.subscription_tier === 'premium' 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-gray-500 text-white'
                    }
                  `}>
                    {profile?.subscription_tier || 'free'}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Achievements
          </h2>
          
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-gray-400">
                Complete goals to unlock achievements!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="text-center p-4 bg-green-500 text-black rounded border-2 border-black"
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h3 className="font-black text-sm uppercase mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-xs">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
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
            className="w-full text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
          >
            Sign Out
          </Button>
        </div>

        {/* App Info */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-black uppercase tracking-tight mb-4">
            About GRYT
          </h3>
          
          <div className="text-sm space-y-2 text-gray-600">
            <p>Version 1.0.0</p>
            <p>© 2024 GRYT - Become the best version of you</p>
            <div className="flex gap-4 text-green-500">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Support</a>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default Profile;
