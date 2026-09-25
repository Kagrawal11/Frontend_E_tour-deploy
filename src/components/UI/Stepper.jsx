import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const Stepper = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li key={stepIdx} className={`flex items-center ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            <div className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  stepIdx < currentStep
                    ? 'border-transparent'
                    : stepIdx === currentStep
                    ? 'border-[#7c5cff] shadow-[0_0_16px_-2px_rgba(124,92,255,0.6)]'
                    : 'border-white/15'
                }`}
                style={
                  stepIdx < currentStep
                    ? { background: 'linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)' }
                    : undefined
                }
              >
                {stepIdx < currentStep ? (
                  <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                ) : (
                  <span className={`text-sm font-medium ${
                    stepIdx === currentStep ? 'text-white' : 'text-slate-500'
                  }`}>
                    {stepIdx + 1}
                  </span>
                )}
              </div>
              <span className={`ml-4 text-sm font-medium ${
                stepIdx === currentStep ? 'text-white' : 'text-slate-500'
              }`}>
                {step}
              </span>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-4 transition-colors duration-300"
                style={{
                  background: stepIdx < currentStep ? 'linear-gradient(90deg, #7c5cff, #22d3ee)' : 'rgba(255,255,255,0.1)',
                }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
