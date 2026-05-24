"use client";

import React, { useState } from "react";
import type { StoryPath, StoryStep } from "@/lib/types";

interface StoryPathProps {
  storyPath: StoryPath;
  currentTurn: number;
  completedStepIds: string[];
}

export default function StoryPath({
  storyPath,
  currentTurn,
  completedStepIds,
}: StoryPathProps) {
  const [minimized, setMinimized] = useState(false);

  // Determine current step: first step that isn't completed
  const currentStep = storyPath.steps.find((step) => !completedStepIds.includes(step.id)) || storyPath.steps[storyPath.steps.length - 1];
  
  const currentStepIndex = storyPath.steps.findIndex(s => s.id === currentStep.id);
  const progress = ((currentStepIndex) / storyPath.steps.length) * 100;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed top-20 left-4 z-40 px-3 py-2 bg-slate-900/90 border border-amber-500/30 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 hover:bg-slate-800 transition-colors group"
      >
        <span className="text-amber-400 text-sm">{"\u270E"}</span>
        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest group-hover:text-amber-200">
          Story: {storyPath.name}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed top-20 left-4 z-40 w-72 bg-slate-950/90 border border-amber-900/40 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden font-mono">
      {/* Header */}
      <div className="bg-amber-900/20 px-3 py-2 border-b border-amber-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">{"\u270E"}</span>
          <span className="text-amber-200 font-bold text-[10px] uppercase tracking-wider">
            Guided Story
          </span>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-slate-500 hover:text-amber-400 transition-colors"
        >
          {"\u2014"}
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-slate-100 font-serif font-bold text-sm mb-1">
          {storyPath.name}
        </h3>
        <p className="text-slate-400 text-[10px] leading-relaxed mb-3">
          {storyPath.description}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current Step */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-400 font-bold text-[10px] uppercase">
              Step {currentStepIndex + 1}: {currentStep.title}
            </span>
            <span className="text-slate-600 text-[9px]">
              Year {currentStep.year}
            </span>
          </div>
          
          <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
            {currentStep.description}
          </p>

          <div className="space-y-2">
            <div>
              <div className="text-slate-500 text-[9px] uppercase tracking-tighter mb-0.5">
                Objective
              </div>
              <p className="text-amber-100/80 text-[10px] italic leading-snug">
                {currentStep.objective}
              </p>
            </div>

            <div>
              <div className="text-slate-500 text-[9px] uppercase tracking-tighter mb-0.5">
                Advisor Hint
              </div>
              <p className="text-sky-300/80 text-[10px] leading-snug">
                {currentStep.hint}
              </p>
            </div>
          </div>
        </div>

        {/* Step List (Mini) */}
        <div className="mt-3 flex justify-between gap-1">
          {storyPath.steps.map((step, i) => {
            const isCompleted = completedStepIds.includes(step.id);
            const isCurrent = step.id === currentStep.id;
            
            return (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full ${
                  isCompleted ? "bg-amber-500" : isCurrent ? "bg-amber-500/40" : "bg-slate-800"
                }`}
                title={step.title}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
