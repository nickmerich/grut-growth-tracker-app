
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Rewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("rewards");
  const [user, setUser] = useState<any>(null);
  const [userPoints, setUserPoints] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
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
    await fetchRewardsData(user.id);
  };

  const fetchRewardsData = async (userId: string) => {
    try {
      // Fetch user points
      const { data: points } = await supabase
        .from('growth_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      setUserPoints(points);

      // Fetch available rewards
      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*')
        .order('points_cost', { ascending: true });

      setRewards(rewardsData || []);
    } catch (error: any) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (reward: any) => {
    if (!user || !userPoints) return;

    const currentPoints = (userPoints.total_points || 0) - (userPoints.spent_points || 0);

    if (currentPoints < reward.points_cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.points_cost - currentPoints} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Update spent points
      const newSpentPoints = (userPoints.spent_points || 0) + reward.points_cost;
      
      const { error: pointsError } = await supabase
        .from('growth_points')
        .update({ 
          spent_points: newSpentPoints
        })
        .eq('user_id', user.id);

      if (pointsError) throw pointsError;

      // Log redemption
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert([
          {
            user_id: user.id,
            reward_id: reward.id,
            points_spent: reward.points_cost
          }
        ]);

      if (redemptionError) throw redemptionError;

      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've successfully redeemed ${reward.title}!`,
      });

      // Refresh data
      await fetchRewardsData(user.id);
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
      case "home":
        navigate('/dashboard');
        break;
      case "goal":
        navigate('/goal-selection');
        break;
      case "progress":
        navigate('/progress');
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
          <p>Loading rewards...</p>
        </div>
      </div>
    );
  }

  const currentPoints = userPoints ? (userPoints.total_points || 0) - (userPoints.spent_points || 0) : 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Rewards
          </h1>
          <p className="text-lg opacity-90">
            Redeem your hard-earned points
          </p>
        </div>

        {/* Points Balance */}
        <Card className="mb-6">
          <div className="text-center">
            <h2 className="text-lg font-black uppercase tracking-tight mb-2">
              Your Points
            </h2>
            <div className="text-4xl font-black text-green-500 mb-2">
              {currentPoints}
            </div>
            <div className="text-sm text-gray-600">
              Total Earned: {userPoints?.total_points || 0}
            </div>
          </div>
        </Card>

        {/* Available Rewards */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight">
            Available Rewards
          </h3>
          
          {rewards.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No rewards available at the moment. Check back soon!
                </p>
              </div>
            </Card>
          ) : (
            rewards.map((reward) => {
              const canAfford = currentPoints >= reward.points_cost;
              
              return (
                <Card key={reward.id}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-black uppercase tracking-tight">
                        {reward.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {reward.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 font-bold">
                          {reward.points_cost} Points
                        </span>
                        {reward.category && (
                          <span className="text-xs bg-gray-200 text-black px-2 py-1 rounded font-bold">
                            {reward.category.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => redeemReward(reward)}
                      disabled={!canAfford}
                      variant={canAfford ? "primary" : "ghost"}
                      className="ml-4"
                    >
                      {canAfford ? "Redeem" : "Need More"}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* How to Earn Points */}
        <Card className="mt-8">
          <h3 className="text-lg font-black uppercase tracking-tight mb-3">
            How to Earn Points
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Complete daily goal</span>
              <span className="text-green-500 font-bold">+10 points</span>
            </li>
            <li className="flex justify-between">
              <span>Weekly streak bonus</span>
              <span className="text-green-500 font-bold">+50 points</span>
            </li>
            <li className="flex justify-between">
              <span>Complete full goal</span>
              <span className="text-green-500 font-bold">+500 points</span>
            </li>
          </ul>
        </Card>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Rewards;
