
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/textarea";

interface PlanningStepProps {
  tomorrowPlan: string;
  setTomorrowPlan: (plan: string) => void;
  affirmation: string;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export const PlanningStep = ({ 
  tomorrowPlan, setTomorrowPlan, affirmation, 
  submitting, onSubmit, onBack 
}: PlanningStepProps) => {
  return (
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
          <p className="text-black italic">"{affirmation}"</p>
        </div>
        
        <div className="flex space-x-4">
          <Button onClick={onBack} variant="secondary" className="flex-1">
            Back
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "Submitting..." : "Complete Check-In"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
