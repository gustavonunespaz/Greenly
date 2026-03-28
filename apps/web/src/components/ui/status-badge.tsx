import { cn } from "@/lib/utils";
import type { StatusLicenca, StatusCondicionante, StatusMTR } from "@/lib/mock-data";

type AnyStatus = StatusLicenca | StatusCondicionante | StatusMTR;

const statusConfig: Record<string, { label: string; className: string }> = {
  // Licenças
  ATIVA: { label: "Ativa", className: "bg-primary/10 text-primary" },
  VENCIDA: { label: "Vencida", className: "bg-destructive/10 text-destructive" },
  EM_RENOVACAO: { label: "Em Renovação", className: "bg-warning/10 text-warning" },
  AGUARDANDO_EMISSAO: { label: "Aguardando", className: "bg-accent/10 text-accent" },
  SUSPENSA: { label: "Suspensa", className: "bg-destructive/10 text-destructive" },
  // Condicionantes
  A_CUMPRIR: { label: "A Cumprir", className: "bg-accent/10 text-accent" },
  EM_ANDAMENTO: { label: "Em Andamento", className: "bg-warning/10 text-warning" },
  CUMPRIDA: { label: "Cumprida", className: "bg-primary/10 text-primary" },
  ATRASADA: { label: "Atrasada", className: "bg-destructive/10 text-destructive" },
  DISPENSADA: { label: "Dispensada", className: "bg-muted text-muted-foreground" },
  // MTR
  EMITIDO: { label: "Emitido", className: "bg-muted text-muted-foreground" },
  EM_TRANSITO: { label: "Em Trânsito", className: "bg-accent/10 text-accent" },
  RECEBIDO: { label: "Recebido", className: "bg-primary/10 text-primary" },
  CDF_EMITIDO: { label: "CDF Emitido", className: "bg-primary/15 text-primary font-medium" },
  CANCELADO: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
  COM_DIVERGENCIA: { label: "Divergência", className: "bg-destructive/10 text-destructive" },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap",
      config.className,
      className,
    )}>
      {config.label}
    </span>
  );
}
