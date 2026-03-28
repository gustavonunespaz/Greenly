import { AppLayout } from "@/components/layout/AppLayout";
import { condicionantes } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { Clock, Upload } from "lucide-react";

export default function CondicionantesPage() {
  const sorted = [...condicionantes].sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <AppLayout title="Condicionantes">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {sorted.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded">
                    {c.codigo}
                  </span>
                  <StatusBadge status={c.status} />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 bg-white/[0.03] px-2 py-0.5 rounded">
                    {c.tipo}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-2">{c.descricao}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    Prazo: {c.prazo}
                  </span>
                  <span>Responsável: {c.responsavel}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-lg tabular-nums font-semibold ${
                  c.diasRestantes < 0 ? "text-destructive" :
                  c.diasRestantes <= 30 ? "text-warning" :
                  "text-primary"
                }`}>
                  {c.diasRestantes < 0 ? `${Math.abs(c.diasRestantes)}d` : `${c.diasRestantes}d`}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {c.diasRestantes < 0 ? "atrasada" : "restantes"}
                </span>
                {c.status !== "CUMPRIDA" && c.status !== "DISPENSADA" && (
                  <button className="mt-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center gap-1.5">
                    <Upload className="h-3 w-3" strokeWidth={1.5} />
                    Anexar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AppLayout>
  );
}
