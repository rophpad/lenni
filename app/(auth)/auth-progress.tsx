"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "../components/logo";

const AuthProgressContext = createContext<(step: number) => void>(() => undefined);

export function useAuthProgress(step: number) {
  const setStep = useContext(AuthProgressContext);
  useEffect(() => setStep(step), [setStep, step]);
}

export function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [step, setStep] = useState(pathname === "/register" ? 1 : 2);
  const steps = ["Account", "Profile", "Career", "Roadmap"];

  useEffect(() => {
    if (pathname === "/register") setStep(1);
  }, [pathname]);

  return (
    <AuthProgressContext.Provider value={setStep}>
      <main className="relative z-1 flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-115">
          <Logo />
          <div className="mb-8 text-body-s text-subtle">Your AI Career Copilot</div>
          {(pathname === "/register" || pathname === "/onboarding") && (
            <div className="mb-8" aria-label={`Step ${step} of ${steps.length}: ${steps[step - 1]}`}>
              <div className="mb-2 flex items-center justify-between kicker text-subtle"><span>Step {step} of {steps.length}</span><span className="text-accent">{steps[step - 1]}</span></div>
              <div className="flex gap-1">{steps.map((label, index) => (
                <span aria-label={label} aria-current={index + 1 === step ? "step" : undefined} className={`h-0.75 flex-1 rounded-sm transition-colors ${index + 1 <= step ? "bg-accent" : "bg-ui-border"}`} key={label}/>
              ))}</div>
            </div>
          )}
          {children}
        </div>
      </main>
    </AuthProgressContext.Provider>
  );
}
