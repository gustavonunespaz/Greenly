import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useLicencas } from "@/features/licencas/hooks/useLicencas";

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LicencasPage() {
  const { licencas, isLoading } = useLicencas();
  const [filter, setFilter] = useState<string>("TODAS");
  const [search, setSearch] = useState("");

  const filtered = (licencas || []).filter((l) => {
    const matchesFilter = filter === "TODAS" || l.status === filter;
    const matchesSearch = !search || 
      l.numeroLicenca?.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase()); // Simplificação da busca
    return matchesFilter && matchesSearch;
  });

  const filters = ["TODAS", "ATIVA", "VENCIDA", "EM_RENOVACAO", "AGUARDANDO_EMISSAO"];

  if (isLoading) {
    return (
      <AppLayout title="Licenças Ambientais">
        <div className="flex items-center justify-center p-20">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Licenças Ambientais">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {f === "TODAS" ? "Todas" : f === "ATIVA" ? "Ativas" : f === "VENCIDA" ? "Vencidas" : f === "EM_RENOVACAO" ? "Em Renovação" : "Aguardando"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Buscar licença..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 w-56"
              />
            </div>
            <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Nova Licença
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider px-5 py-3">ID / Cliente</th>
                  <th className="text-left text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider px-5 py-3">Tipo</th>
                  <th className="text-left text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider px-5 py-3">Nº Licença</th>
                  <th className="text-left text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider px-5 py-3">Validade</th>
                  <th className="text-left text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider px-5 py-3">Prazo</th>
                  <th className="text-left text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lic, i) => (
                  <motion.tr
                    key={lic.id}
                    variants={item}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-foreground">{lic.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{lic.clienteId}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded">{lic.tipo}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground">{lic.numeroLicenca ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground">
                      {lic.dataValidade ? new Date(lic.dataValidade).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm tabular-nums font-medium ${
                        (lic.diasAteVencimento ?? 999) < 0 ? "text-destructive" :
                        (lic.diasAteVencimento ?? 999) <= 30 ? "text-destructive" :
                        (lic.diasAteVencimento ?? 999) <= 120 ? "text-warning" :
                        "text-primary"
                      }`}>
                        {lic.diasAteVencimento === null ? "—" : 
                         lic.diasAteVencimento < 0 ? `${Math.abs(lic.diasAteVencimento)}d atrás` :
                         `${lic.diasAteVencimento}d`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lic.status} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
