
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";
import { getPersonalizedAffirmation, getTomorrowActionStep } from "@/utils/dailyCheckinUtils";
import { MoodStep } from "@/components/checkin/MoodStep";
import { GoalStep } from "@/components/checkin/GoalStep";
import { ReflectionStep } from "@/components/checkin/ReflectionStep";
import { PlanningStep } from "@/components/checkin/PlanningStep";

const DailyCheckin = () => {
  const navigate = useNavigate();
  const { user, activeGoal, loading, submitting, submitCheckin } = useDailyCheckin();
  
  const [step, setStep] = useState(1);
  
  // Check-in form data
  const [moodScore, setMoodScore] = useState<number>(5);
  const [completed, setCompleted] = useState<boolean>(false);
  const [reflection, setReflection] = useState("");
  const [challenges, setChallenges] = useState("");
  const [wins, setWins] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");

  const handleSubmitCheckin = async () => {
    const affirmation = getPersonalizedAffirmation();
    const actionStep = getTomorrowActionStep(completed);

    await submitCheckin({
      moodScore,
      completed,
      reflection,
      affirmation,
      actionStep
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading check-in...</p>
        </div>
      </div>
    );
  }

  if (!activeGoal) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">
            No Active Goal
          </h1>
          <p className="text-lg mb-8 opacity-90">
            Set up a goal first to start your daily check-ins!
          </p>
          <Button 
            onClick={() => navigate('/goal-selection')}
            className="w-full"
          >
            Choose Your Goal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
            Daily Check-In
          </h1>
          <p className="text-lg opacity-90">
            {activeGoal.title}
          </p>
          <div className="text-sm text-green-500 mt-2">
            Step {step} of 4
          </div>
        </div>

        {step === 1 && (
          <MoodStep
            moodScore={moodScore}
            setMoodScore={setMoodScore}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <GoalStep
            completed={completed}
            setCompleted={setCompleted}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ReflectionStep
            wins={wins}
            setWins={setWins}
            challenges={challenges}
            setChallenges={setChallenges}
            reflection={reflection}
            setReflection={setReflection}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <PlanningStep
            tomorrowPlan={tomorrowPlan}
            setTomorrowPlan={setTomorrowPlan}
            affirmation={getPersonalizedAffirmation()}
            submitting={submitting}
            onSubmit={handleSubmitCheckin}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
};

export default DailyCheckin;
