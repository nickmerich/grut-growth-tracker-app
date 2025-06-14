import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

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
    await fetchDashboardData(user.id);
  };

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch active goal
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (goals && goals.length > 0) {
        setActiveGoal(goals[0]);
        
        // Fetch today's progress
        const today = new Date().toISOString().split('T')[0];
        const { data: progress } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('goal_id', goals[0].id)
          .eq('date', today)
          .single();

        setTodayProgress(progress);

        // Fetch today's check-in
        const { data: checkin } = await supabase
          .from('daily_coaching')
          .select('*')
          .eq('goal_id', goals[0].id)
          .eq('date', today)
          .single();

        setTodayCheckin(checkin);

        // Calculate streak
        await calculateStreak(goals[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async (goalId: string) => {
    try {
      const { data: logs } = await supabase
        .from('progress_logs')
        .select('date, completed')
        .eq('goal_id', goalId)
        .eq('completed', true)
        .order('date', { ascending: false });

      if (!logs || logs.length === 0) {
        setStreak(0);
        return;
      }

      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < logs.length; i++) {
        const logDate = new Date(logs[i].date);
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === currentStreak) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const markDayComplete = async () => {
    if (!activeGoal || !user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('progress_logs')
        .upsert([
          {
            goal_id: activeGoal.id,
            user_id: user.id,
            date: today,
            completed: true,
            notes: "Completed daily goal"
          }
        ]);

      if (error) throw error;

      // Award points - get current points first
      const { data: currentPoints } = await supabase
        .from('growth_points')
        .select('total_points, spent_points')
        .eq('user_id', user.id)
        .single();

      if (currentPoints) {
        const newTotal = (currentPoints.total_points || 0) + 10;
        await supabase
          .from('growth_points')
          .update({ 
            total_points: newTotal,
            earned_points: (currentPoints.total_points || 0) + 10
          })
          .eq('user_id', user.id);
      }

      toast({
        title: "Day Completed! 🎉",
        description: "You earned 10 points! Keep the momentum going!",
      });

      // Refresh data
      await fetchDashboardData(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    switch (tab) {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!activeGoal) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-6">
              Ready to Start?
            </h1>
            <p className="text-lg mb-8 opacity-90">
              You don't have an active goal yet. Let's create one!
            </p>
            <Button 
              onClick={() => navigate('/goal-selection')}
              className="w-full"
            >
              Choose Your Goal
            </Button>
          </div>
        </div>
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  const progressPercentage = activeGoal ? 
    Math.round((streak / activeGoal.total_days) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
            Your Journey
          </h1>
          <p className="text-lg opacity-90">
            Day {streak + 1} of {activeGoal.total_days}
          </p>
        </div>

        {/* Daily Check-in Card */}
        <Card className="mb-6">
          <h3 className="text-lg font-black uppercase tracking-tight mb-3">
            Daily Check-In
          </h3>
          
          {!todayCheckin ? (
            <div>
              <p className="text-gray-600 mb-4">
                Take 2 minutes to reflect on your progress and plan ahead.
              </p>
              <Button 
                onClick={() => navigate('/daily-checkin')}
                className="w-full"
              >
                Start Daily Check-In
              </Button>
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-green-500 font-bold">✓ Today's Check-In Complete!</span>
              <p className="text-sm text-gray-600 mt-2">
                Mood: {todayCheckin.mood_score}/10 | {todayCheckin.completed ? 'Goal Completed' : 'Goal Pending'}
              </p>
            </div>
          )}
        </Card>

        {/* Active Goal Card */}
        <Card className="mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight mb-3">
            {activeGoal.title}
          </h2>
          <p className="text-gray-600 mb-4">
            {activeGoal.description}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-300 h-3 border-2 border-black">
              <div 
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{streak}</div>
              <div className="text-xs font-bold uppercase">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{activeGoal.total_days - streak}</div>
              <div className="text-xs font-bold uppercase">Days Left</div>
            </div>
          </div>
        </Card>

        {/* Daily Action */}
        <Card className="mb-6">
          <h3 className="text-lg font-black uppercase tracking-tight mb-3">
            Today's Focus
          </h3>
          <p className="text-gray-600 mb-4">
            "Every small step forward is progress. Stay committed to your vision."
          </p>
          
          {!todayProgress?.completed ? (
            <Button 
              onClick={markDayComplete}
              className="w-full"
            >
              Mark Today Complete
            </Button>
          ) : (
            <div className="text-center py-3">
              <span className="text-green-500 font-bold">✓ Today Completed!</span>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => navigate('/progress')}
            variant="secondary"
            className="text-sm"
          >
            View Progress
          </Button>
          <Button 
            onClick={() => navigate('/rewards')}
            variant="secondary"
            className="text-sm"
          >
            Earn Rewards
          </Button>
        </div>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Dashboard;
