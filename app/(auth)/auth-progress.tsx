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

  useEffect(() => {
    if (pathname === "/register") setStep(1);
  }, [pathname]);

  return (
    <AuthProgressContext.Provider value={setStep}>
      <main className="relative z-1 flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-115">
          <Logo />
          <div className="mb-7.5 text-[13.5px] text-subtle">Your AI Career Copilot</div>
          {pathname === "/register" || pathname === "/onboarding" && (
            <div className="mb-8.5 flex gap-1.5" aria-label={`Step ${step} of 4`}>
              {[1, 2, 3, 4].map((item) => (
                <span className={`h-0.75 flex-1 rounded-sm ${item <= step ? "bg-accent" : "bg-ui-border"}`} key={item}/>
              ))}
            </div>
          )}
          {children}
        </div>
      </main>
    </AuthProgressContext.Provider>
  );
}
