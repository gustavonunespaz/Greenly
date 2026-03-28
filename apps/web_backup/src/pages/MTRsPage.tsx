import { AppLayout } from "@/components/layout/AppLayout";
import { mtrs, type StatusMTR } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Truck, PackageCheck, FileCheck2 } from "lucide-react";

const steps: { key: StatusMTR; label: string; icon: React.ElementType }[] = [
  { key: "EMITIDO", label: "Emitido", icon: Circle },
  { key: "EM_TRANSITO", label: "Em Trânsito", icon: Truck },
  { key: "RECEBIDO", label: "Recebido", icon: PackageCheck },
  { key: "CDF_EMITIDO", label: "CDF Emitido", icon: FileCheck2 },
];

const stepIndex: Record<StatusMTR, number> = {
  EMITIDO: 0,
  EM_TRANSITO: 1,
  RECEBIDO: 2,
  CDF_EMITIDO: 3,
  CANCELADO: -1,
  COM_DIVERGENCIA: -2,
};

function MTRTimeline({ status }: { status: StatusMTR }) {
  const current = stepIndex[status];
  const isError = current < 0;

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const completed = !isError && i <= current;
        const active = !isError && i === current;
        const Icon = completed ? CheckCircle2 : step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                  completed
                    ? active
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsla(161,94%,30%,0.5)]"
                      : "bg-primary/20 text-primary"
                    : "bg-white/[0.04] text-muted-foreground/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
              <span className={`text-[9px] mt-1 ${completed ? "text-primary" : "text-muted-foreground/40"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-[2px] w-6 mx-0.5 mt-[-14px] rounded-full ${
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

export default function MTRsPage() {
  return (
    <AppLayout title="Manifestos de Transporte (MTR)">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {mtrs.map((mtr, i) => (
          <motion.div
            key={mtr.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass-card-hover p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-medium text-foreground">{mtr.numero}</span>
                  <StatusBadge status={mtr.status} />
                </div>
                <p className="text-sm text-muted-foreground">{mtr.cliente}</p>
                <p className="text-xs text-muted-foreground/70">
                  {mtr.residuo} · {mtr.volume} {mtr.unidade} · {mtr.tipoDestinacao}
                </p>
                <div className="text-xs text-muted-foreground/50 flex gap-4 mt-1">
                  <span>Transp: {mtr.transportadora}</span>
                  <span>Dest: {mtr.destinador}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="shrink-0">
                <MTRTimeline status={mtr.status} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AppLayout>
  );
}
