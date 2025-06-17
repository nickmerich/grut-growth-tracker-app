
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/textarea";

interface ReflectionStepProps {
  wins: string;
  setWins: (wins: string) => void;
  challenges: string;
  setChallenges: (challenges: string) => void;
  reflection: string;
  setReflection: (reflection: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ReflectionStep = ({ 
  wins, setWins, challenges, setChallenges, 
  reflection, setReflection, onNext, onBack 
}: ReflectionStepProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black uppercase tracking-tight mb-4">
        Reflect on Today
      </h2>
      <p className="text-gray-600 mb-6">
        Take a moment to reflect on your progress and challenges
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-black uppercase tracking-wide mb-2">
            What did you accomplish today?
          </label>
          <Textarea
            placeholder="Describe what you worked on or achieved..."
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-black uppercase tracking-wide mb-2">
            What challenges did you face?
          </label>
          <Textarea
            placeholder="What made it difficult? What got in your way?"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-black uppercase tracking-wide mb-2">
            Overall reflection
          </label>
          <Textarea
            placeholder="How do you feel about today's progress?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
          />
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
