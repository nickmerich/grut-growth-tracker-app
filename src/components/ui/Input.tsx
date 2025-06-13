
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-black uppercase tracking-wide mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-4 border-3 border-black bg-white text-black",
            "font-bold placeholder:text-gray-500 placeholder:font-normal",
            "focus:outline-none focus:ring-0 focus:border-green-500",
            "disabled:bg-gray-100 disabled:text-gray-500",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
