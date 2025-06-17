
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TodaysFocusCardProps {
  todayProgress: any;
  onMarkComplete: () => void;
}

export const TodaysFocusCard = ({ todayProgress, onMarkComplete }: TodaysFocusCardProps) => {
  return (
    <Card className="mb-6">
      <h3 className="text-lg font-black uppercase tracking-tight mb-3">
        Today's Focus
      </h3>
      <p className="text-gray-600 mb-4">
        "Every small step forward is progress. Stay committed to your vision."
      </p>
      
      {!todayProgress?.completed ? (
        <Button 
          onClick={onMarkComplete}
          className="w-full"
        >
          Mark Today Complete
        </Button>
      ) : (
        <div className="text-center py-3">
          <span className="text-green-500 font-bold">✓ Today Completed!</span>
        </div>
      )}
    </Card>
  );
};
