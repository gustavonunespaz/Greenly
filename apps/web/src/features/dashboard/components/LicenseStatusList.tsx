import { useLicencas } from "@/features/licencas/hooks/useLicencas";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { FileCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LicenseStatusList() {
  const { licencas, isLoading } = useLicencas();
  const navigate = useNavigate();

  const critical = (licencas || [])
    .filter(l => l.status === 'VENCIDA' || l.status === 'EM_RENOVACAO' || (l.diasAteVencimento !== null && l.diasAteVencimento !== undefined && l.diasAteVencimento <= 120))
    .sort((a, b) => (a.diasAteVencimento ?? 999) - (b.diasAteVencimento ?? 999))
    .slice(0, 6);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Licenças Críticas</h3>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">Vencidas e próximas do vencimento</p>
        </div>
        <button
          onClick={() => navigate('/licencas')}
          className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-32" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : critical.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <FileCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-foreground font-medium">Tudo em dia!</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Nenhuma licença crítica encontrada</p>
        </div>
      ) : (
        <div className="space-y-1">
          {critical.map((lic, i) => (
            <motion.div
              key={lic.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => navigate('/licencas')}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
            >
              <div className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-mono font-medium text-muted-foreground/70">{lic.tipo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {lic.numeroLicenca || lic.id.substring(0, 8)}
                </p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  {lic.diasAteVencimento !== null && lic.diasAteVencimento !== undefined ? (
                    <span className={
                      lic.diasAteVencimento < 0 ? "text-destructive" :
                      lic.diasAteVencimento <= 30 ? "text-destructive" :
                      lic.diasAteVencimento <= 120 ? "text-warning" :
                      "text-primary"
                    }>
                      {lic.diasAteVencimento < 0
                        ? `Vencida há ${Math.abs(lic.diasAteVencimento)} dias`
                        : `${lic.diasAteVencimento} dias restantes`}
                    </span>
                  ) : "—"}
                </p>
              </div>
              <StatusBadge status={lic.status as any} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
