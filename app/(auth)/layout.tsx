import type { ReactNode } from "react";
import { AuthShell } from "./auth-progress";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
