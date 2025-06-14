
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Progress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("progress");
  const [user, setUser] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
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
    await fetchProgressData(user.id);
  };

  const fetchProgressData = async (userId: string) => {
    try {
      // Fetch active goal
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (goals && goals.length > 0) {
        setActiveGoal(goals[0]);
        
        // Fetch progress logs
        const { data: logs } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('goal_id', goals[0].id)
          .order('log_date', { ascending: false });

        setProgressLogs(logs || []);
      }
    } catch (error: any) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
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
          <p>Loading progress...</p>
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
              No Active Goal
            </h1>
            <p className="text-lg mb-8 opacity-90">
              Start a goal to track your progress!
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

  const completedDays = progressLogs.filter(log => log.completed).length;
  const progressPercentage = Math.round((completedDays / activeGoal.duration_days) * 100);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Your Progress
          </h1>
          <p className="text-lg opacity-90">
            {activeGoal.title}
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">
            Overview
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{completedDays}</div>
              <div className="text-xs font-bold uppercase">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{progressPercentage}%</div>
              <div className="text-xs font-bold uppercase">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">{activeGoal.duration_days - completedDays}</div>
              <div className="text-xs font-bold uppercase">Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 h-4 border-2 border-black">
            <div 
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </Card>

        {/* Progress Calendar/Log */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Daily Log
          </h3>
          
          {progressLogs.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No progress logged yet. Start your journey today!
                </p>
              </div>
            </Card>
          ) : (
            progressLogs.map((log) => (
              <Card key={log.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">
                      {new Date(log.log_date).toLocaleDateString()}
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {log.completed ? (
                      <span className="text-green-500 font-bold">✓ Completed</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                    {log.mood_score && (
                      <div className="text-sm text-gray-600">
                        Mood: {log.mood_score}/10
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Progress;
