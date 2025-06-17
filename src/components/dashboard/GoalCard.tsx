
import { Card } from "@/components/ui/Card";

interface GoalCardProps {
  activeGoal: any;
  streak: number;
}

export const GoalCard = ({ activeGoal, streak }: GoalCardProps) => {
  const progressPercentage = Math.round((streak / activeGoal.total_days) * 100);

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-black uppercase tracking-tight mb-3">
        {activeGoal.title}
      </h2>
      <p className="text-gray-600 mb-4">
        {activeGoal.description}
      </p>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-bold mb-2">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-300 h-3 border-2 border-black">
          <div 
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-2xl font-black text-green-500">{streak}</div>
          <div className="text-xs font-bold uppercase">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-green-500">{activeGoal.total_days - streak}</div>
          <div className="text-xs font-bold uppercase">Days Left</div>
        </div>
      </div>
    </Card>
  );
};
