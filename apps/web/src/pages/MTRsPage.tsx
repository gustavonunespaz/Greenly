import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Truck, PackageCheck, FileCheck2, ExternalLink } from "lucide-react";
import { useResiduos } from "@/features/residuos/hooks/useResiduos";

const steps = [
  { key: "EMITIDO", label: "Emitido", icon: Circle },
  { key: "EM_TRANSITO", label: "Em Trânsito", icon: Truck },
  { key: "RECEBIDO", label: "Recebido", icon: PackageCheck },
  { key: "CDF_EMITIDO", label: "CDF", icon: FileCheck2 },
];

const stepIndex: Record<string, number> = {
  EMITIDO: 0,
  EM_TRANSITO: 1,
  RECEBIDO: 2,
  CDF_EMITIDO: 3,
  CANCELADO: -1,
  COM_DIVERGENCIA: -2,
};

function MTRTimeline({ status }: { status: string }) {
  const current = stepIndex[status] ?? -1;
  const isError = current < 0;

  return (
    <div className="flex items-center gap-1.5 hidden sm:flex">
      {steps.map((step, i) => {
        const completed = !isError && i <= current;
        const active = !isError && i === current;
        const Icon = completed ? CheckCircle2 : step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center group relative">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ring-2 ring-background ${
                  completed
                    ? active
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsla(161,94%,30%,0.5)] z-10 scale-110"
                      : "bg-primary/20 text-primary"
                    : "bg-white/[0.04] text-muted-foreground/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
              <span className={`absolute -bottom-5 text-[9px] whitespace-nowrap hidden lg:block transition-colors duration-300 ${completed ? "text-primary/80 font-medium" : "text-muted-foreground/40"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-[2px] w-8 mx-[-2px] rounded-full z-0 transition-colors duration-500 ${
                  !isError && i < current ? "bg-primary/50" : "bg-white/[0.06]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonMTR() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 w-1/2">
              <div className="flex items-center gap-3">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-5 w-20 rounded-full" />
              </div>
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-32" />
            </div>
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center">
                  <div className="skeleton h-7 w-7 rounded-full" />
                  {j < 3 && <div className="skeleton h-[2px] w-8 mx-[-2px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MTRsPage() {
  // Passamos undefined para listar todos (o hook não tem esse suporte direto,
  // mas como o hook verifica enabled: !!clienteId, precisamos ajustar o useResiduos.
  // Pra MVP, vamos manter genérico ou usar um ID fixo mockado se necessário.
  // Vou usar um ID fixo falso para o TanStack fazer o fetch
  const { mtrs, isLoading } = useResiduos("all"); 

  return (
    <AppLayout title="Manifestos de Transporte (MTR)">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground/60">
            Acompanhamento em tempo real das movimentações
          </p>
        </div>

        {isLoading ? <SkeletonMTR /> : (!mtrs || mtrs.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 emerald-glow">
              <Truck className="h-8 w-8 text-primary/70" strokeWidth={1.2} />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">Nenhum MTR emitido</h3>
            <p className="text-sm text-muted-foreground/50">Os manifestos de transporte aparecerão aqui</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {mtrs.map((mtr, i) => (
              <motion.div
                key={mtr.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                className="glass-card-interactive p-5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                        {mtr.numeroMTR || "MTR-PENDENTE"}
                      </span>
                      <StatusBadge status={mtr.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-xs text-muted-foreground/80 truncate">
                        <span className="text-muted-foreground/40 mr-1">Gerador:</span> 
                        {mtr.clienteId}
                      </p>
                      <p className="text-xs text-muted-foreground/80 truncate">
                        <span className="text-muted-foreground/40 mr-1">Resíduo:</span> 
                        {mtr.volume} {mtr.unidadeMedida}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 truncate col-span-1 md:col-span-2">
                        <span className="text-muted-foreground/40 mr-1">T/D:</span> 
                        {mtr.transportadoraId} → {mtr.destinadorId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <MTRTimeline status={mtr.status} />
                    
                    <button className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-200">
                      <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
