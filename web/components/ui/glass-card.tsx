import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  panel,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { panel?: boolean }) {
  return (
    <div
      className={cn(panel ? "glass-panel" : "glass", "rounded-4xl", className)}
      {...props}
    />
  );
}
