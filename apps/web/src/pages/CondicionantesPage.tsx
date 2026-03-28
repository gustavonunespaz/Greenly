import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, ClipboardList, Filter, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useCondicionantes } from "@/features/licencas/hooks/useCondicionantes";
import { toast } from "@/components/ui/sonner";
import type { StatusCondicionante } from "@greenly/shared";

const filterLabels: Record<string, string> = {
  TODAS: "Todas",
  A_CUMPRIR: "A Cumprir",
  EM_ANDAMENTO: "Em Andamento",
  ATRASADA: "Atrasadas",
  CUMPRIDA: "Cumpridas",
};

export default function CondicionantesPage() {
  const { condicionantes, isLoading, atualizarStatusCondicionante, isAtualizandoStatus, condicionanteAtualizandoId } = useCondicionantes();
  const [filter, setFilter] = useState("TODAS");
  const sorted = [...condicionantes]
    .filter((c) => filter === "TODAS" || c.status === filter)
    .sort((a, b) => {
      const aDias = a.diasRestantes ?? Number.POSITIVE_INFINITY;
      const bDias = b.diasRestantes ?? Number.POSITIVE_INFINITY;
      return aDias - bDias;
    });

  const filters = ["TODAS", "A_CUMPRIR", "EM_ANDAMENTO", "ATRASADA", "CUMPRIDA"];

  async function handleAtualizarStatus(id: string, status: StatusCondicionante) {
    try {
      await atualizarStatusCondicionante({
        id,
        dto: {
          status,
          dataCumprimento: status === "CUMPRIDA" ? new Date() : undefined,
        },
      });
      toast.success("Status da condicionante atualizado.");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response: { data: { error: string } } }).response.data.error
          : "Não foi possível atualizar o status.";
      toast.error(message);
    }
  }

  return (
    <AppLayout title="Condicionantes">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground/40 mr-1" strokeWidth={1.5} />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                filter === f
                  ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              {filterLabels[f]}
              {f === "ATRASADA" && (
                <span className="ml-1.5 text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">
                  {condicionantes.filter((c) => c.status === "ATRASADA").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-4 w-full max-w-[540px]" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 emerald-glow">
              <ClipboardList className="h-8 w-8 text-primary/70" strokeWidth={1.2} />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">Nenhuma condicionante encontrada</h3>
            <p className="text-sm text-muted-foreground/50">Altere os filtros para visualizar condicionantes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="glass-card-interactive p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground/70 bg-white/[0.04] px-2 py-1 rounded-lg ring-1 ring-white/[0.04]">
                        {c.codigo || `ID-${c.id.substring(0, 8)}`}
                      </span>
                      <StatusBadge status={c.status} />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 bg-white/[0.02] px-2 py-0.5 rounded-lg">
                        {c.tipo === "PERIODICA" ? "Periódica" : "Pontual"}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">{c.descricao}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/50">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        Prazo: {c.prazo ? new Date(c.prazo).toLocaleDateString("pt-BR") : "Não definido"}
                      </span>
                      <span>Responsável: {c.responsavelCliente || "Não definido"}</span>
                      <span>Cliente: {c.clienteNome}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-2xl tabular-nums font-semibold ${
                      (c.diasRestantes ?? 999999) < 0 ? "text-destructive" :
                      (c.diasRestantes ?? 999999) <= 30 ? "text-warning" :
                      "text-primary"
                    }`}>
                      {c.diasRestantes === null || c.diasRestantes === undefined
                        ? "—"
                        : `${Math.abs(c.diasRestantes)}d`}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {c.diasRestantes === null || c.diasRestantes === undefined
                        ? "sem prazo"
                        : c.diasRestantes < 0
                        ? "atrasada"
                        : "restantes"}
                    </span>
                    {c.status === "A_CUMPRIR" && (
                      <button
                        onClick={() => handleAtualizarStatus(c.id, "EM_ANDAMENTO")}
                        disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-muted-foreground/70 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <PlayCircle className="h-3 w-3" strokeWidth={1.5} />
                        Iniciar
                      </button>
                    )}
                    {c.status !== "CUMPRIDA" && c.status !== "DISPENSADA" && (
                      <button
                        onClick={() => handleAtualizarStatus(c.id, "CUMPRIDA")}
                        disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/15 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                        Marcar cumprida
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
