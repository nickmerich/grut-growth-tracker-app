
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-white text-black border-3 border-black p-6",
        "shadow-[8px_8px_0px_0px_#000000]",
        onClick && "cursor-pointer hover:shadow-[12px_12px_0px_0px_#000000] transition-all duration-150",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
