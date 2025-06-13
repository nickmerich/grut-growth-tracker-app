
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
}

export const Button = ({ 
  children, 
  variant = "primary", 
  size = "default",
  className,
  ...props 
}: ButtonProps) => {
  const baseStyles = "font-black uppercase tracking-wide transition-all duration-150 border-3 border-black focus:outline-none focus:ring-0";
  
  const variants = {
    primary: "bg-green-500 text-black border-black hover:bg-white hover:text-black",
    secondary: "bg-black text-white border-white hover:bg-white hover:text-black",
    ghost: "bg-transparent text-white border-white hover:bg-white hover:text-black"
  };

  const sizes = {
    default: "px-6 py-4 text-sm",
    large: "px-8 py-6 text-base"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
