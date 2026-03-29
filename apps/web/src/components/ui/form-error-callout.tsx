import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionableFormError } from "@/lib/form-actionable-error";

type FormErrorCalloutProps = {
  error: ActionableFormError | null;
  onAction?: () => void;
};

export function FormErrorCallout({ error, onAction }: FormErrorCalloutProps) {
  if (!error) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-destructive">{error.title}</p>
          <p className="text-xs text-destructive/90">{error.message}</p>
          <p className="text-xs text-muted-foreground">{error.guidance}</p>
          <details className="text-[11px] text-muted-foreground/80">
            <summary className="cursor-pointer select-none hover:text-foreground/80 transition-colors">
              Ver detalhe técnico
            </summary>
            <p className="mt-1.5">{error.technicalFallback}</p>
          </details>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onAction}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {error.actionLabel}
        </Button>
      </div>
    </div>
  );
}
