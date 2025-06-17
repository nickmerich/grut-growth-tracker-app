
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/ui/BottomNav";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CheckinCard } from "@/components/dashboard/CheckinCard";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { TodaysFocusCard } from "@/components/dashboard/TodaysFocusCard";
import { QuickActions } from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("home");
  const {
    user,
    activeGoal,
    todayProgress,
    todayCheckin,
    streak,
    loading,
    markDayComplete
  } = useDashboard();

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 px-6 pt-8 pb-24">
        <DashboardHeader 
          streak={streak} 
          totalDays={activeGoal.total_days} 
        />

        <CheckinCard todayCheckin={todayCheckin} />

        <GoalCard 
          activeGoal={activeGoal} 
          streak={streak} 
        />

        <TodaysFocusCard 
          todayProgress={todayProgress}
          onMarkComplete={markDayComplete}
        />

        <QuickActions />
      </div>

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Dashboard;
