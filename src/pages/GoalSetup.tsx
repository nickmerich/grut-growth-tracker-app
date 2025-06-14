
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";

const GoalSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const goalTemplate = location.state?.goalTemplate;
  const isCustom = location.state?.isCustom || false;
  
  const [formData, setFormData] = useState({
    title: goalTemplate?.title || "",
    description: goalTemplate?.description || "",
    category: goalTemplate?.category || "personal",
    duration: goalTemplate?.suggested_duration_days || 30,
    whyItMatters: "",
    signature: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // Calculate deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + formData.duration);

      // Create the goal
      const { data: goal, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          why_it_matters: formData.whyItMatters,
          deadline: deadline.toISOString().split('T')[0],
          total_days: formData.duration,
          signature: formData.signature,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial daily coaching entry
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_coaching')
        .insert({
          user_id: user.id,
          goal_id: goal.id,
          date: today,
          affirmation: `You've committed to "${formData.title}" - every day is a step closer to your transformation.`,
          action_step: "Take the first step today. Start small, but start now."
        });

      toast({
        title: "Goal Created!",
        description: "Your GRYT journey has officially begun.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            {isCustom ? "Create Your Goal" : "Customize Your Goal"}
          </h1>
          <p className="text-lg opacity-90">
            Make this goal truly yours
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-black uppercase mb-4">Goal Details</h2>
            
            <div className="space-y-4">
              <Input
                label="Goal Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What do you want to achieve?"
                required
              />

              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your goal in detail..."
                  rows={4}
                  className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:ring-0 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-green-500"
                  required
                >
                  <option value="health">Health & Fitness</option>
                  <option value="career">Career & Business</option>
                  <option value="personal">Personal Development</option>
                  <option value="finance">Finance & Money</option>
                  <option value="relationships">Relationships</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-wide mb-2">
                  Duration (Days)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-green-500"
                  required
                >
                  <option value={21}>21 Days (Habit Formation)</option>
                  <option value={30}>30 Days (Monthly Challenge)</option>
                  <option value={60}>60 Days (Deep Change)</option>
                  <option value={90}>90 Days (Transformation)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-black uppercase mb-4">Your Why</h2>
            
            <div>
              <label className="block text-sm font-black uppercase tracking-wide mb-2">
                Why does this goal matter to you?
              </label>
              <textarea
                value={formData.whyItMatters}
                onChange={(e) => handleInputChange('whyItMatters', e.target.value)}
                placeholder="When things get tough, this is what will keep you going..."
                rows={4}
                className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:ring-0 focus:border-green-500"
                required
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-black uppercase mb-4">Your Commitment</h2>
            
            <div className="mb-4">
              <p className="text-sm mb-4">
                By signing below, you commit to completing this {formData.duration}-day journey. 
                This is your contract with yourself - your word is your bond.
              </p>
              
              <Input
                label="Digital Signature (Type your full name)"
                value={formData.signature}
                onChange={(e) => handleInputChange('signature', e.target.value)}
                placeholder="Your full name as signature"
                required
              />
            </div>

            <div className="bg-gray-100 p-4 rounded text-black text-sm">
              <p className="font-bold mb-2">Contract Summary:</p>
              <ul className="space-y-1">
                <li>• Goal: {formData.title}</li>
                <li>• Duration: {formData.duration} days</li>
                <li>• Daily commitment to progress</li>
                <li>• Complete honesty in tracking</li>
              </ul>
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full"
            size="large"
            disabled={loading || !formData.signature}
          >
            {loading ? "Creating Your Journey..." : "Start My GRYT Journey"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GoalSetup;
