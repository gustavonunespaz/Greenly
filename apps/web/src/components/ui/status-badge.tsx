import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  // Licenças
  ATIVA: { label: "Ativa", className: "bg-primary/10 text-primary ring-1 ring-primary/20" },
  VENCIDA: { label: "Vencida", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  EM_RENOVACAO: { label: "Em Renovação", className: "bg-warning/10 text-warning ring-1 ring-warning/20" },
  AGUARDANDO_EMISSAO: { label: "Aguardando", className: "bg-accent/10 text-accent ring-1 ring-accent/20" },
  SUSPENSA: { label: "Suspensa", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  CASSADA: { label: "Cassada", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  DISPENSADA: { label: "Dispensada", className: "bg-muted/80 text-muted-foreground" },
  ARQUIVADA: { label: "Arquivada", className: "bg-muted/80 text-muted-foreground" },
  // Condicionantes
  A_CUMPRIR: { label: "A Cumprir", className: "bg-accent/10 text-accent ring-1 ring-accent/20" },
  EM_ANDAMENTO: { label: "Em Andamento", className: "bg-warning/10 text-warning ring-1 ring-warning/20" },
  CUMPRIDA: { label: "Cumprida", className: "bg-primary/10 text-primary ring-1 ring-primary/20" },
  ATRASADA: { label: "Atrasada", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  // MTR
  EMITIDO: { label: "Emitido", className: "bg-muted/80 text-muted-foreground ring-1 ring-white/[0.06]" },
  EM_TRANSITO: { label: "Em Trânsito", className: "bg-accent/10 text-accent ring-1 ring-accent/20" },
  RECEBIDO: { label: "Recebido", className: "bg-primary/10 text-primary ring-1 ring-primary/20" },
  CDF_EMITIDO: { label: "CDF Emitido", className: "bg-primary/15 text-primary ring-1 ring-primary/25 font-medium" },
  CANCELADO: { label: "Cancelado", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  COM_DIVERGENCIA: { label: "Divergência", className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
      config.className,
      className,
    )}>
      {config.label}
    </span>
  );
}
