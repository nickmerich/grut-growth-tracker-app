
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "HOME", icon: "🏠" },
  { id: "goal", label: "GOAL", icon: "🎯" },
  { id: "progress", label: "PROGRESS", icon: "📊" },
  { id: "rewards", label: "REWARDS", icon: "🏆" },
  { id: "profile", label: "PROFILE", icon: "👤" }
];

export const BottomNav = ({ currentTab, onTabChange }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-3 border-black">
      <div className="flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex-1 py-3 px-2 text-center transition-all duration-150",
              "border-r-3 border-black last:border-r-0",
              currentTab === item.id 
                ? "bg-green-500 text-black" 
                : "bg-white text-black hover:bg-gray-100"
            )}
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="text-xs font-black uppercase tracking-tight">
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
