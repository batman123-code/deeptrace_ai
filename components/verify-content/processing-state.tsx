'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Search, BrainCircuit, FileSearch, ShieldCheck } from 'lucide-react';

interface ProcessingStateProps {
  type?: 'image' | 'audio' | 'url';
  onComplete: () => void;
}

export function ProcessingState({ type = 'image', onComplete }: ProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const getSteps = () => {
    if (type === 'url') {
      return [
        { id: 'validating', label: 'Validating & connecting to URL...', icon: FileSearch },
        { id: 'fetching', label: 'Fetching webpage & extracting text content...', icon: Search },
        { id: 'analyzing', label: 'Gemma 4 analyzing article claims & sources...', icon: BrainCircuit },
        { id: 'extracting', label: 'Extracting key claims...', icon: FileSearch },
        { id: 'retrieving', label: 'Retrieving supporting evidence (Fact Check & News)...', icon: Search },
        { id: 'generating', label: 'Generating investigation report...', icon: ShieldCheck },
      ];
    }
    if (type === 'audio') {
      return [
        { id: 'uploading', label: 'Uploading audio file...', icon: FileSearch },
        { id: 'preparing', label: 'Preparing audio spectrum & transcription...', icon: Search },
        { id: 'analyzing', label: 'Gemma 4 analyzing audio authenticity & claims...', icon: BrainCircuit },
        { id: 'extracting', label: 'Extracting spoken claims...', icon: FileSearch },
        { id: 'retrieving', label: 'Retrieving supporting evidence...', icon: Search },
        { id: 'generating', label: 'Generating investigation report...', icon: ShieldCheck },
      ];
    }
    return [
      { id: 'uploading', label: 'Uploading media file...', icon: FileSearch },
      { id: 'preparing', label: 'Preparing forensic analysis...', icon: Search },
      { id: 'analyzing', label: 'Gemma 4 analyzing visual content...', icon: BrainCircuit },
      { id: 'extracting', label: 'Extracting claims...', icon: FileSearch },
      { id: 'retrieving', label: 'Retrieving supporting evidence...', icon: Search },
      { id: 'generating', label: 'Generating investigation report...', icon: ShieldCheck },
    ];
  };

  const steps = getSteps();

  useEffect(() => {
    if (currentStep >= steps.length) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 600 + Math.random() * 400);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto my-12 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">Analysis in Progress</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          const Icon = step.icon;

          return (
            <div key={step.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-50/50 border border-blue-100' : 'border border-transparent'}`}>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : isActive ? (
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
