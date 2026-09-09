import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-200/70 dark:bg-[#1C2338]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-linear-to-r after:from-transparent after:via-white/25 dark:after:via-white/5 after:to-transparent",
        className
      )}
      {...props}
    />
  );
}
