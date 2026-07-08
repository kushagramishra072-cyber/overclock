import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNavigation />
    </div>
  );
}
