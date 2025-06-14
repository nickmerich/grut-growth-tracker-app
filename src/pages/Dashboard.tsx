
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  daily_streak: number;
  completed_days: number;
  total_days: number;
  deadline: string;
}

interface DailyCoaching {
  id: string;
  affirmation: string;
  action_step: string;
  completed: boolean;
  mood_score: number | null;
}

interface GrowthPoints {
  total_points: number;
  current_level: number;
  earned_points: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [dailyCoaching, setDailyCoaching] = useState<DailyCoaching | null>(null);
  const [growthPoints, setGrowthPoints] = useState<GrowthPoints | null>(null);
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
      loadActiveGoal(user.id),
      loadDailyCoaching(user.id),
      loadGrowthPoints(user.id)
    ]);
    setLoading(false);
  };

  const loadActiveGoal = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('archived', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setActiveGoal(data);
    } catch (error: any) {
      console.error('Error loading active goal:', error);
    }
  };

  const loadDailyCoaching = async (userId: string) => {
    if (!activeGoal) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_coaching')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', activeGoal.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setDailyCoaching(data);
    } catch (error: any) {
      console.error('Error loading daily coaching:', error);
    }
  };

  const loadGrowthPoints = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('growth_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setGrowthPoints(data);
    } catch (error: any) {
      console.error('Error loading growth points:', error);
    }
  };

  const handleCompleteDaily = async () => {
    if (!dailyCoaching || !user || !activeGoal) return;

    try {
      await supabase
        .from('daily_coaching')
        .update({ completed: true })
        .eq('id', dailyCoaching.id);

      // Award points for daily completion
      const pointsToAdd = 25; // Base daily points
      if (growthPoints) {
        await supabase
          .from('growth_points')
          .update({
            total_points: growthPoints.total_points + pointsToAdd,
            earned_points: growthPoints.earned_points + pointsToAdd
          })
          .eq('user_id', user.id);
      }

      // Update goal progress
      const newCompletedDays = activeGoal.completed_days + 1;
      const newStreak = activeGoal.daily_streak + 1;
      const newProgress = (newCompletedDays / activeGoal.total_days) * 100;

      await supabase
        .from('goals')
        .update({
          completed_days: newCompletedDays,
          daily_streak: newStreak,
          progress: newProgress
        })
        .eq('id', activeGoal.id);

      toast({
        title: "Daily Goal Completed! 🎉",
        description: `+${pointsToAdd} points earned!`,
      });

      // Reload data
      await checkUserAndLoadData();
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
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!activeGoal) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-6 pt-8 pb-24 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Ready to Start?
          </h1>
          <p className="text-lg opacity-90 mb-8">
            You haven't selected a goal yet. Let's find the perfect challenge for you.
          </p>
          <Button 
            onClick={() => navigate('/goal-selection')}
            size="large"
          >
            Choose Your Goal
          </Button>
          
          <div className="mt-8">
            <Button 
              onClick={handleSignOut}
              variant="ghost"
              className="text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    );
  }

  const daysLeft = Math.max(0, activeGoal.total_days - activeGoal.completed_days);
  const progressPercentage = Math.round(activeGoal.progress);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Your Journey
            </h1>
            <p className="text-green-500 font-bold">
              Level {growthPoints?.current_level || 1} • {growthPoints?.total_points || 0} Points
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-white"
          >
            Sign Out
          </button>
        </div>

        {/* Active Goal Card */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                {activeGoal.title}
              </h2>
              <span className="bg-green-500 text-black px-2 py-1 text-xs font-bold rounded uppercase">
                {activeGoal.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-green-500">
                {daysLeft}
              </div>
              <div className="text-xs font-bold text-gray-500">
                DAYS LEFT
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">Progress</span>
              <span className="text-sm font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-300 h-3 border-2 border-black">
              <div 
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">
                {activeGoal.daily_streak}
              </div>
              <div className="text-xs font-bold text-gray-500">
                DAY STREAK
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">
                {activeGoal.completed_days}/{activeGoal.total_days}
              </div>
              <div className="text-xs font-bold text-gray-500">
                DAYS COMPLETED
              </div>
            </div>
          </div>
        </Card>

        {/* Daily Coaching */}
        {dailyCoaching && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">
              Today's Coaching
            </h3>
            
            <div className="mb-4">
              <p className="text-sm font-bold text-green-500 mb-2">AFFIRMATION:</p>
              <p className="text-sm leading-relaxed">
                {dailyCoaching.affirmation}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-bold text-green-500 mb-2">ACTION STEP:</p>
              <p className="text-sm leading-relaxed">
                {dailyCoaching.action_step}
              </p>
            </div>

            {!dailyCoaching.completed ? (
              <Button
                onClick={handleCompleteDaily}
                className="w-full"
              >
                Mark Today Complete
              </Button>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-bold text-green-500">
                  TODAY'S GOAL COMPLETED!
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/progress')}
            variant="secondary"
            className="py-6"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-black">VIEW PROGRESS</div>
            </div>
          </Button>
          
          <Button
            onClick={() => navigate('/rewards')}
            variant="secondary"
            className="py-6"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-black">EARN REWARDS</div>
            </div>
          </Button>
        </div>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default Dashboard;
