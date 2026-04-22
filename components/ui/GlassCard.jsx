import { cn } from "@/lib/utils";

export default function GlassCard({ className = "", children }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl border p-5 sm:p-6",
        "bg-white/75 dark:bg-white/5 border-black/10 dark:border-white/10",
        className,
      )}
    >
      {children}
    </div>
  );
}
