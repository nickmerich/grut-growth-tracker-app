
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface GoalStepProps {
  completed: boolean;
  setCompleted: (completed: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export const GoalStep = ({ completed, setCompleted, onNext, onBack }: GoalStepProps) => {
  return (
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
          <Button onClick={onBack} variant="secondary" className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1">
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};
