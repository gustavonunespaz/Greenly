import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10" : "py-20",
        className,
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 emerald-glow">
        <Icon className="h-8 w-8 text-primary/70" strokeWidth={1.2} />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground/60 max-w-sm">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-5 h-9 rounded-xl px-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
