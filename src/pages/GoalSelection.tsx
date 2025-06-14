
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  suggested_duration_days: number;
  is_premium: boolean;
}

const GoalSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goalTemplates, setGoalTemplates] = useState<GoalTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "ALL GOALS", icon: "🎯" },
    { id: "health", label: "HEALTH", icon: "💪" },
    { id: "career", label: "CAREER", icon: "🚀" },
    { id: "personal", label: "PERSONAL", icon: "🌱" },
    { id: "finance", label: "FINANCE", icon: "💰" },
  ];

  useEffect(() => {
    fetchGoalTemplates();
  }, []);

  const fetchGoalTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setGoalTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load goal templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = selectedCategory === "all" 
    ? goalTemplates 
    : goalTemplates.filter(goal => goal.category === selectedCategory);

  const handleGoalSelect = (goal: GoalTemplate) => {
    navigate('/goal-setup', { state: { goalTemplate: goal } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Choose Your Goal
          </h1>
          <p className="text-lg opacity-90">
            Select a goal that will transform your life
          </p>
        </div>

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

        {/* Goal Templates Grid */}
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <Card 
              key={goal.id}
              onClick={() => handleGoalSelect(goal)}
              className="cursor-pointer hover:shadow-[12px_12px_0px_0px_#000000] transition-all duration-150"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {goal.title}
                </h3>
                {goal.is_premium && (
                  <span className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">
                    PREMIUM
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {goal.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-green-500 uppercase">
                  {goal.suggested_duration_days} Days
                </span>
                <span className="text-sm font-bold text-gray-500 uppercase">
                  {goal.category}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg opacity-70">
              No goals found in this category
            </p>
          </div>
        )}

        {/* Custom Goal Option */}
        <div className="mt-8">
          <Card 
            onClick={() => navigate('/goal-setup', { state: { isCustom: true } })}
            className="cursor-pointer border-dashed border-2 border-green-500 bg-transparent"
          >
            <div className="text-center py-8">
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                Create Custom Goal
              </h3>
              <p className="text-gray-400">
                Design your own personalized challenge
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoalSelection;
