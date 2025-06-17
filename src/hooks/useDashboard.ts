
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  return {
    user,
    activeGoal,
    todayProgress,
    todayCheckin,
    streak,
    loading,
    markDayComplete,
    fetchDashboardData
  };
};
