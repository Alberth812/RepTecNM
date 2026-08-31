"use client";

import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/registro/cn";

type StepStatus = "current" | "error" | "complete" | "pending";

interface StepIndicatorProps {
  steps: readonly string[];
  currentStep: number;
  furthestStep: number;
  onStepClick: (index: number) => void;
  stepStatus: readonly StepStatus[];
}

export default function StepIndicator({
  steps,
  currentStep,
  furthestStep,
  onStepClick,
  stepStatus}: StepIndicatorProps) {
  return (
    <div>
      {/* Móvil */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Paso {currentStep + 1} de {steps.length}
          </span>

          <span
            className={cn(
              stepStatus[currentStep] === "error"
                ? "font-semibold text-red-600"
                : "text-[#004B87]",
            )}
          >
            {steps[currentStep]}
          </span>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#004B87] transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`}}
          />
        </div>
      </div>

      {/* Escritorio */}
      <ol className="hidden items-start sm:flex">
        {steps.map((step, index) => {
          const status = stepStatus[index];

          const isCurrent = status === "current";
          const isCompleted = status === "complete";
          const hasError = status === "error";
          const isClickable = index <= furthestStep;

          // El conector después de este paso.
          // Solo queda "completo" si este paso está completo.
          const connectorCompleted = status === "complete";

          // El último paso no necesita conector.
          const hasConnector = index < steps.length - 1;

          return (
            <li
              key={step}
              className="relative flex flex-1 flex-col items-center"
            >
              <div className="flex w-full items-center">
                {/* Conector izquierdo */}
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors duration-300",
                    index === 0
                      ? "bg-transparent"
                      : stepStatus[index - 1] === "complete"
                        ? "bg-[#004B87]"
                        : stepStatus[index - 1] === "error"
                          ? "bg-red-300"
                          : "bg-slate-300",
                  )}
                />

                {/* Círculo */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => onStepClick(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step}${hasError ? " — contiene errores" : ""}`}
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200",

                    // Current
                    isCurrent &&
                      "border-[#004B87] bg-[#004B87] text-white shadow-sm",

                    // Complete
                    isCompleted &&
                      !isCurrent &&
                      "border-[#004B87] bg-white text-[#004B87]",

                    // Error
                    hasError &&
                      !isCurrent &&
                      "border-red-500 bg-red-50 text-red-600",

                    // Pending
                    status === "pending" &&
                      "border-slate-300 bg-white text-slate-400",

                    // Cursor
                    isClickable
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-not-allowed",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : hasError ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Conector derecho */}
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors duration-300",
                    !hasConnector
                      ? "bg-transparent"
                      : connectorCompleted
                        ? "bg-[#004B87]"
                        : hasError
                          ? "bg-red-300"
                          : "bg-slate-300",
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "mt-1.5 px-1 text-center text-[11px] leading-tight",
                  isCurrent && "font-semibold text-[#004B87]",
                  hasError && !isCurrent && "font-semibold text-red-600",
                  !isCurrent && !hasError && "text-slate-500",
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
