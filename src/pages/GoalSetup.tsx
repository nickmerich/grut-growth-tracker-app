
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
  
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [whyItMatters, setWhyItMatters] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const goalTemplate = location.state?.goalTemplate;
  const isCustom = location.state?.isCustom;

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    });

    // Pre-fill form if using template
    if (goalTemplate) {
      setGoalTitle(goalTemplate.title);
      setGoalDescription(goalTemplate.description);
      setDuration(goalTemplate.suggested_duration_days);
    }
  }, [goalTemplate, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Calculate deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + duration);

      const { error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            title: goalTitle,
            description: goalDescription,
            total_days: duration,
            why_it_matters: whyItMatters,
            signature: signature,
            category: goalTemplate?.category || 'personal',
            deadline: deadline.toISOString().split('T')[0],
            is_active: true,
            progress: 0,
            daily_streak: 0,
            completed_days: 0,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Goal Created!",
        description: "Your journey begins now. Let's make it happen!",
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
            {isCustom ? "Create Your Goal" : "Set Up Your Goal"}
          </h1>
          <p className="text-lg opacity-90">
            Make your commitment official
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Goal Title"
              type="text"
              placeholder="What do you want to achieve?"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-black uppercase tracking-wide mb-2">
                Goal Description
              </label>
              <textarea
                className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:ring-0 focus:border-green-500"
                placeholder="Describe your goal in detail..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wide mb-2">
                Duration (Days)
              </label>
              <select
                className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-green-500"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={21}>21 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wide mb-2">
                Why This Matters to You
              </label>
              <textarea
                className="w-full px-4 py-4 border-3 border-black bg-white text-black font-bold placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:ring-0 focus:border-green-500"
                placeholder="Why is this goal important to you? What will achieving it mean?"
                value={whyItMatters}
                onChange={(e) => setWhyItMatters(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wide mb-2">
                Digital Signature
              </label>
              <Input
                type="text"
                placeholder="Type your full name to sign the commitment"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                By signing, you commit to giving your best effort for {duration} days.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating Goal..." : "Sign & Start Journey"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default GoalSetup;
