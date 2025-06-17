
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { moodEmojis } from "@/utils/dailyCheckinUtils";

interface MoodStepProps {
  moodScore: number;
  setMoodScore: (score: number) => void;
  onNext: () => void;
}

export const MoodStep = ({ moodScore, setMoodScore, onNext }: MoodStepProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black uppercase tracking-tight mb-4">
        How's Your Mood Today?
      </h2>
      <p className="text-gray-600 mb-6">
        Rate your overall mood and energy level (1-10)
      </p>
      
      <div className="space-y-4">
        <div className="flex justify-center items-center space-x-2 mb-4">
          {moodEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => setMoodScore(index + 1)}
              className={`text-2xl p-2 rounded transition-all ${
                moodScore === index + 1 
                  ? 'bg-green-500 scale-110' 
                  : 'hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="text-center">
          <span className="text-lg font-bold">Mood Score: {moodScore}/10</span>
        </div>
        
        <Button onClick={onNext} className="w-full">
          Next
        </Button>
      </div>
    </Card>
  );
};
