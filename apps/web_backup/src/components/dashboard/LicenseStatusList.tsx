import { licencas } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileCheck } from "lucide-react";

export function LicenseStatusList() {
  const urgent = licencas
    .filter((l) => l.status === "VENCIDA" || l.diasRestantes <= 120)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Licenças Críticas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Vencidas ou próximas do vencimento</p>
        </div>
        <FileCheck className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="space-y-3">
        {urgent.map((lic) => (
          <div
            key={lic.id}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{lic.cliente}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lic.tipo} · {lic.orgao} · {lic.numeroLicenca}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className={`text-xs tabular-nums font-medium ${
                lic.diasRestantes < 0 ? "text-destructive" :
                lic.diasRestantes <= 30 ? "text-destructive" :
                lic.diasRestantes <= 120 ? "text-warning" :
                "text-primary"
              }`}>
                {lic.diasRestantes < 0 ? `${Math.abs(lic.diasRestantes)}d atrás` : `${lic.diasRestantes}d`}
              </span>
              <StatusBadge status={lic.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
