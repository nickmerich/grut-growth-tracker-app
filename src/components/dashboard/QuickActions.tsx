
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        onClick={() => navigate('/progress')}
        variant="secondary"
        className="text-sm"
      >
        View Progress
      </Button>
      <Button 
        onClick={() => navigate('/rewards')}
        variant="secondary"
        className="text-sm"
      >
        Earn Rewards
      </Button>
    </div>
  );
};
