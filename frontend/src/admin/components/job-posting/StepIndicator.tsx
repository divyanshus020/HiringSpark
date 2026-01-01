import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold transition-all duration-500 shadow-lg",
                  isCompleted && "bg-gradient-to-br from-emerald-500 to-teal-500 text-white scale-105",
                  isCurrent && "bg-gradient-to-br from-indigo-600 to-purple-600 text-white ring-4 ring-indigo-200 scale-110",
                  !isCompleted && !isCurrent && "bg-white text-gray-400 border-2 border-gray-200"
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6 animate-in zoom-in" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "mt-3 text-sm font-semibold hidden sm:block transition-colors",
                  isCurrent ? "text-indigo-700" : "text-gray-500"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-1 w-16 rounded-full transition-all duration-500",
                  stepNumber < currentStep 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                    : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
