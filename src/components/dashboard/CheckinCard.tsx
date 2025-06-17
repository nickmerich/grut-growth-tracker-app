
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface CheckinCardProps {
  todayCheckin: any;
}

export const CheckinCard = ({ todayCheckin }: CheckinCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-black uppercase tracking-tight mb-3">
        Daily Check-In
      </h3>
      
      {!todayCheckin ? (
        <div>
          <p className="text-gray-600 mb-4">
            Take 2 minutes to reflect on your progress and plan ahead.
          </p>
          <Button 
            onClick={() => navigate('/daily-checkin')}
            className="w-full"
          >
            Start Daily Check-In
          </Button>
        </div>
      ) : (
        <div className="text-center py-3">
          <span className="text-green-500 font-bold">✓ Today's Check-In Complete!</span>
          <p className="text-sm text-gray-600 mt-2">
            Mood: {todayCheckin.mood_score}/10 | {todayCheckin.completed ? 'Goal Completed' : 'Goal Pending'}
          </p>
        </div>
      )}
    </Card>
  );
};
