
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/ui/BottomNav";

const Index = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("home");

  const handleStartJourney = () => {
    // Will navigate to goal selection in future iterations
    console.log("Starting GRYT journey...");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
        <div className="text-center max-w-md">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 leading-tight">
            BECOME THE BEST VERSION OF YOU
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl font-bold mb-12 opacity-90 leading-relaxed">
            Pick one goal. Sign a contract. Get daily coaching. Earn real rewards.
          </p>
          
          {/* CTA Button */}
          <Button 
            onClick={handleStartJourney}
            className="w-full"
            variant="primary"
          >
            START YOUR GRYT JOURNEY
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default Index;
