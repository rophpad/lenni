import type { ReactNode } from "react";
import { ConnectedShell } from "./connected-shell";
export default function ConnectedLayout({ children }: { children: ReactNode }) { return <ConnectedShell>{children}</ConnectedShell>; }
