
interface DashboardHeaderProps {
  streak: number;
  totalDays: number;
}

export const DashboardHeader = ({ streak, totalDays }: DashboardHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
        Your Journey
      </h1>
      <p className="text-lg opacity-90">
        Day {streak + 1} of {totalDays}
      </p>
    </div>
  );
};
