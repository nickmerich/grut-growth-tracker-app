
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  category: string;
  image_url: string | null;
  available: boolean;
}

interface GrowthPoints {
  total_points: number;
  spent_points: number;
  current_level: number;
}

const Rewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("rewards");
  const [user, setUser] = useState<any>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [growthPoints, setGrowthPoints] = useState<GrowthPoints | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "ALL", icon: "🎁" },
    { id: "gift-cards", label: "GIFT CARDS", icon: "💳" },
    { id: "experiences", label: "EXPERIENCES", icon: "🎢" },
    { id: "products", label: "PRODUCTS", icon: "📦" },
    { id: "digital", label: "DIGITAL", icon: "💻" },
  ];

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
      loadRewards(),
      loadGrowthPoints(user.id)
    ]);
    setLoading(false);
  };

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('available', true)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error: any) {
      console.error('Error loading rewards:', error);
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

  const handleRedeemReward = async (reward: Reward) => {
    if (!user || !growthPoints) return;

    const availablePoints = growthPoints.total_points - growthPoints.spent_points;
    
    if (availablePoints < reward.points_cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.points_cost - availablePoints} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_cost,
          status: 'pending'
        });

      if (redemptionError) throw redemptionError;

      // Update spent points
      const { error: pointsError } = await supabase
        .from('growth_points')
        .update({
          spent_points: growthPoints.spent_points + reward.points_cost
        })
        .eq('user_id', user.id);

      if (pointsError) throw pointsError;

      toast({
        title: "Reward Redeemed! 🎉",
        description: `${reward.title} has been added to your account. Check your email for details.`,
      });

      // Reload growth points
      await loadGrowthPoints(user.id);
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredRewards = selectedCategory === "all" 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const availablePoints = growthPoints ? growthPoints.total_points - growthPoints.spent_points : 0;

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Rewards Store
          </h1>
          <p className="text-lg opacity-90">
            Exchange your GRYT points for real rewards
          </p>
        </div>

        {/* Points Display */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-black text-green-500 mb-2">
              {availablePoints}
            </div>
            <div className="text-sm font-bold text-gray-500 mb-4">
              AVAILABLE POINTS
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-black text-green-500">
                  {growthPoints?.total_points || 0}
                </div>
                <div className="text-xs font-bold text-gray-500">
                  TOTAL EARNED
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-green-500">
                  {growthPoints?.spent_points || 0}
                </div>
                <div className="text-xs font-bold text-gray-500">
                  SPENT
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-green-500">
                  {growthPoints?.current_level || 1}
                </div>
                <div className="text-xs font-bold text-gray-500">
                  LEVEL
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full border-2 border-white text-sm font-bold
                ${selectedCategory === category.id 
                  ? 'bg-green-500 text-black' 
                  : 'bg-transparent text-white hover:bg-white hover:text-black'
                }
                transition-all duration-150
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="space-y-4">
          {filteredRewards.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-400">
                No rewards available in this category yet.
              </p>
            </Card>
          ) : (
            filteredRewards.map((reward) => {
              const canAfford = availablePoints >= reward.points_cost;
              
              return (
                <Card key={reward.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                        {reward.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {reward.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="bg-green-500 text-black px-3 py-1 text-sm font-bold rounded">
                          {reward.points_cost} Points
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          {reward.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleRedeemReward(reward)}
                    disabled={!canAfford}
                    className={`w-full ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                    variant={canAfford ? "primary" : "secondary"}
                  >
                    {canAfford ? "Redeem Now" : "Need More Points"}
                  </Button>
                </Card>
              );
            })
          )}
        </div>

        {/* How to Earn Points */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-black uppercase tracking-tight mb-4">
            How to Earn Points
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Daily goal completion</span>
              <span className="font-bold text-green-500">+25 points</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Weekly streak bonus</span>
              <span className="font-bold text-green-500">+50 points</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Monthly challenge</span>
              <span className="font-bold text-green-500">+100 points</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Goal completion</span>
              <span className="font-bold text-green-500">+200 points</span>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default Rewards;
