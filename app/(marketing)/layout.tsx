import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionProvider } from "@/components/motion/MotionProvider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </MotionProvider>
  );
}
