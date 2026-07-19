import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "bg-fg/10 text-muted" },
  SUBMITTED: { label: "Under verification", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  IN_VERIFICATION: { label: "Under verification", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  RE_VERIFICATION: { label: "Re-checking", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  INFO_REQUESTED: { label: "Info requested", cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  PUBLISHED: { label: "Published", cls: "bg-brand/15 text-brand" },
  UNPUBLISHED: { label: "Hidden", cls: "bg-fg/10 text-muted" },
  REJECTED: { label: "Rejected", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
  CLOSED: { label: "Closed", cls: "bg-fg/10 text-muted" },
  NEW: { label: "New", cls: "bg-brand/15 text-brand" },
  RESPONDED: { label: "Responded", cls: "bg-brand/15 text-brand" },
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const m = MAP[status] ?? { label: status, cls: "bg-fg/10 text-muted" };
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold", m.cls, className)}>
      {m.label}
    </span>
  );
}
