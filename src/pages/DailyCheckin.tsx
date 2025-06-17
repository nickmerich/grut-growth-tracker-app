import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const DailyCheckin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  // Check-in form data
  const [moodScore, setMoodScore] = useState<number>(5);
  const [completed, setCompleted] = useState<boolean>(false);
  const [reflection, setReflection] = useState("");
  const [challenges, setChallenges] = useState("");
  const [wins, setWins] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");

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

  const handleSubmitCheckin = async () => {
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
            completed,
            notes: reflection
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
            completed,
            mood_score: moodScore,
            reflection: reflection,
            affirmation: getPersonalizedAffirmation(),
            action_step: getTomorrowActionStep()
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
        const pointsEarned = completed ? 15 : 5; // More points for completing the goal
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
        title: completed ? "Great Work! 🎉" : "Thanks for Checking In!",
        description: completed 
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

  const getPersonalizedAffirmation = () => {
    const affirmations = [
      "Every step forward is progress, no matter how small.",
      "You are capable of amazing things when you stay consistent.",
      "Today's effort is tomorrow's strength.",
      "Your commitment to growth is inspiring.",
      "Small daily improvements lead to stunning results."
    ];
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  };

  const getTomorrowActionStep = () => {
    if (completed) {
      return "Build on today's success by maintaining the same energy and focus.";
    } else {
      return "Tomorrow is a fresh start. Focus on one small action that moves you closer to your goal.";
    }
  };

  const moodEmojis = ["😢", "😕", "😐", "🙂", "😊", "😄", "🤩", "🎉", "🔥", "⭐"];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading check-in...</p>
        </div>
      </div>
    );
  }

  if (!activeGoal) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">
            No Active Goal
          </h1>
          <p className="text-lg mb-8 opacity-90">
            Set up a goal first to start your daily check-ins!
          </p>
          <Button 
            onClick={() => navigate('/goal-selection')}
            className="w-full"
          >
            Choose Your Goal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Daily Check-In
          </h1>
          <p className="text-lg opacity-90">
            {activeGoal.title}
          </p>
          <div className="text-sm text-green-500 mt-2">
            Step {step} of 4
          </div>
        </div>

        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">
              How's Your Mood Today?
            </h2>
            <p className="text-gray-600 mb-6">
              Rate your overall mood and energy level (1-10)
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-2 mb-4">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setMoodScore(index + 1)}
                    className={`text-2xl p-2 rounded transition-all ${
                      moodScore === index + 1 
                        ? 'bg-green-500 scale-110' 
                        : 'hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <span className="text-lg font-bold">Mood Score: {moodScore}/10</span>
              </div>
              
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">
              Did You Work On Your Goal Today?
            </h2>
            <p className="text-gray-600 mb-6">
              Any progress counts, even small steps!
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setCompleted(true)}
                  variant={completed ? "primary" : "secondary"}
                  className="h-20"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">✅</div>
                    <div>Yes, I did!</div>
                  </div>
                </Button>
                <Button
                  onClick={() => setCompleted(false)}
                  variant={!completed ? "primary" : "secondary"}
                  className="h-20"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">📝</div>
                    <div>Not today</div>
                  </div>
                </Button>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={() => setStep(1)} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">
              Reflect on Today
            </h2>
            <p className="text-gray-600 mb-6">
              Take a moment to reflect on your progress and challenges
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  What did you accomplish today?
                </label>
                <Textarea
                  placeholder="Describe what you worked on or achieved..."
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  What challenges did you face?
                </label>
                <Textarea
                  placeholder="What made it difficult? What got in your way?"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  Overall reflection
                </label>
                <Textarea
                  placeholder="How do you feel about today's progress?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={() => setStep(2)} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-6">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">
              Plan Tomorrow
            </h2>
            <p className="text-gray-600 mb-6">
              Set your intention for tomorrow's progress
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  What's your plan for tomorrow?
                </label>
                <Textarea
                  placeholder="What specific action will you take tomorrow?"
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-black mb-2">Your Daily Affirmation:</h3>
                <p className="text-black italic">"{getPersonalizedAffirmation()}"</p>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={() => setStep(3)} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitCheckin}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Complete Check-In"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DailyCheckin;
