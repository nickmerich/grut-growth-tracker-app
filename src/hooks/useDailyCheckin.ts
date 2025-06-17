
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDailyCheckin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    await fetchActiveGoal(user.id);
  };

  const fetchActiveGoal = async (userId: string) => {
    try {
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (goals && goals.length > 0) {
        setActiveGoal(goals[0]);
      }
    } catch (error: any) {
      console.error('Error fetching active goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitCheckin = async (checkinData: {
    moodScore: number;
    completed: boolean;
    reflection: string;
    affirmation: string;
    actionStep: string;
  }) => {
    if (!user || !activeGoal) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .upsert([
          {
            goal_id: activeGoal.id,
            user_id: user.id,
            date: today,
            completed: checkinData.completed,
            notes: checkinData.reflection
          }
        ]);

      if (progressError) throw progressError;

      // Add daily coaching entry
      const { error: coachingError } = await supabase
        .from('daily_coaching')
        .upsert([
          {
            goal_id: activeGoal.id,
            user_id: user.id,
            date: today,
            completed: checkinData.completed,
            mood_score: checkinData.moodScore,
            reflection: checkinData.reflection,
            affirmation: checkinData.affirmation,
            action_step: checkinData.actionStep
          }
        ]);

      if (coachingError) throw coachingError;

      // Award points for checking in
      const { data: currentPoints } = await supabase
        .from('growth_points')
        .select('total_points, earned_points')
        .eq('user_id', user.id)
        .single();

      if (currentPoints) {
        const pointsEarned = checkinData.completed ? 15 : 5;
        const newTotal = (currentPoints.total_points || 0) + pointsEarned;
        const newEarned = (currentPoints.earned_points || 0) + pointsEarned;
        
        await supabase
          .from('growth_points')
          .update({ 
            total_points: newTotal,
            earned_points: newEarned
          })
          .eq('user_id', user.id);
      }

      toast({
        title: checkinData.completed ? "Great Work! 🎉" : "Thanks for Checking In!",
        description: checkinData.completed 
          ? `You earned 15 points! Keep the momentum going!`
          : `You earned 5 points for staying accountable!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    activeGoal,
    loading,
    submitting,
    submitCheckin
  };
};
