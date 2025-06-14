
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface ProgressLog {
  id: string;
  date: string;
  notes: string;
  photo_url: string | null;
  completed: boolean;
}

const Progress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("progress");
  const [user, setUser] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [showAddLog, setShowAddLog] = useState(false);
  const [newLogNotes, setNewLogNotes] = useState("");
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
    await loadActiveGoal(user.id);
    setLoading(false);
  };

  const loadActiveGoal = async (userId: string) => {
    try {
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('archived', false)
        .single();

      if (goalError && goalError.code !== 'PGRST116') throw goalError;
      setActiveGoal(goal);

      if (goal) {
        const { data: logs, error: logsError } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('goal_id', goal.id)
          .order('date', { ascending: false });

        if (logsError) throw logsError;
        setProgressLogs(logs || []);
      }
    } catch (error: any) {
      console.error('Error loading progress data:', error);
    }
  };

  const handleAddProgressLog = async () => {
    if (!user || !activeGoal || !newLogNotes.trim()) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          goal_id: activeGoal.id,
          date: today,
          notes: newLogNotes,
          completed: true
        });

      if (error) throw error;

      toast({
        title: "Progress Logged!",
        description: "Your progress has been recorded.",
      });

      setNewLogNotes("");
      setShowAddLog(false);
      await loadActiveGoal(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateCalendarDays = () => {
    if (!activeGoal) return [];
    
    const startDate = new Date(activeGoal.created_at);
    const days = [];
    
    for (let i = 0; i < activeGoal.total_days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const log = progressLogs.find(log => log.date === dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isPast = date < new Date(new Date().toISOString().split('T')[0]);
      
      days.push({
        date: dateString,
        day: date.getDate(),
        completed: !!log?.completed,
        isToday,
        isPast
      });
    }
    
    return days;
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
      <div className="min-h-screen bg-black text-white">
        <div className="px-6 pt-8 pb-24 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            No Active Goal
          </h1>
          <p className="text-lg opacity-90 mb-8">
            Start a goal to track your progress.
          </p>
          <Button onClick={() => navigate('/goal-selection')}>
            Choose a Goal
          </Button>
        </div>
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const completionRate = Math.round((activeGoal.completed_days / activeGoal.total_days) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Progress Tracker
          </h1>
          <p className="text-lg opacity-90">
            {activeGoal.title}
          </p>
        </div>

        {/* Stats Overview */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-green-500">
                {activeGoal.daily_streak}
              </div>
              <div className="text-xs font-bold text-gray-500">
                STREAK
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-green-500">
                {completionRate}%
              </div>
              <div className="text-xs font-bold text-gray-500">
                COMPLETE
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-green-500">
                {activeGoal.completed_days}
              </div>
              <div className="text-xs font-bold text-gray-500">
                DAYS DONE
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-black uppercase tracking-tight mb-4">
            Daily Progress Calendar
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-sm font-bold border-2 border-black
                  ${day.completed 
                    ? 'bg-green-500 text-black' 
                    : day.isToday 
                      ? 'bg-yellow-400 text-black'
                      : day.isPast
                        ? 'bg-red-200 text-gray-600'
                        : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {day.day}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border border-black"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border border-black"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-black"></div>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-black"></div>
              <span>Future</span>
            </div>
          </div>
        </Card>

        {/* Add Progress Log */}
        {!showAddLog ? (
          <Button
            onClick={() => setShowAddLog(true)}
            className="w-full mb-6"
          >
            Log Today's Progress
          </Button>
        ) : (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">
              Log Your Progress
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  How did today go?
                </label>
                <textarea
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  placeholder="Describe your progress, challenges, wins..."
                  rows={4}
                  className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:ring-0 focus:border-green-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleAddProgressLog}
                  disabled={!newLogNotes.trim()}
                  className="flex-1"
                >
                  Save Progress
                </Button>
                <Button
                  onClick={() => {
                    setShowAddLog(false);
                    setNewLogNotes("");
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Progress Logs */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Recent Entries
          </h3>
          
          {progressLogs.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-400">
                No progress logs yet. Start tracking your journey!
              </p>
            </Card>
          ) : (
            progressLogs.slice(0, 5).map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-green-500">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                  {log.completed && (
                    <span className="text-xs bg-green-500 text-black px-2 py-1 rounded font-bold">
                      COMPLETED
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">
                  {log.notes}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default Progress;
