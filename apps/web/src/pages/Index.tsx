import { AppLayout } from "@/components/layout/AppLayout";
import { UrgencyWidget } from "@/features/dashboard/components/UrgencyWidget";
import { WasteChart } from "@/features/dashboard/components/WasteChart";
import { LicenseStatusList } from "@/features/dashboard/components/LicenseStatusList";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AlertTriangle, FileX, ClipboardX, Truck, Scale, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-4">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-8 w-16" />
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-72 skeleton" />
        <div className="glass-card p-6 h-72 skeleton" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { metrics, isLoading } = useDashboard();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <SkeletonDashboard />
      </AppLayout>
    );
  }

  const firstName = user?.nome?.split(' ')[0] || 'Usuário';

  return (
    <AppLayout title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Greeting */}
        <motion.div variants={item}>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {getGreeting()}, <span className="gradient-text">{firstName}</span>
          </h2>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Aqui está o resumo da sua operação ambiental
          </p>
        </motion.div>

        {/* Section Label */}
        <motion.div variants={item}>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.12em] font-medium">
            Monitoramento de Riscos
          </p>
        </motion.div>

        {/* Metric Cards */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <UrgencyWidget
            icon={FileX}
            value={metrics?.licencasAVencer ?? 0}
            label="Licenças à Vencer"
            variant={metrics?.licencasAVencer && metrics.licencasAVencer > 0 ? "warning" : "neutral"}
            pulse={metrics?.licencasAVencer ? metrics.licencasAVencer > 5 : false}
          />
          <UrgencyWidget
            icon={AlertTriangle}
            value={metrics?.pendenciasCriticas ?? 0}
            label="Pendências Críticas"
            variant={metrics?.pendenciasCriticas && metrics.pendenciasCriticas > 0 ? "danger" : "neutral"}
            pulse={metrics?.pendenciasCriticas ? metrics.pendenciasCriticas > 0 : false}
          />
          <UrgencyWidget
            icon={ClipboardX}
            value={metrics?.condicionantesAtrasadas ?? 0}
            label="Cond. Atrasadas"
            variant={metrics?.condicionantesAtrasadas && metrics.condicionantesAtrasadas > 0 ? "warning" : "neutral"}
          />
          <UrgencyWidget
            icon={Truck}
            value={metrics?.mtrsPendentes ?? 0}
            label="MTRs em Aberto"
            variant={metrics?.mtrsPendentes && metrics.mtrsPendentes > 0 ? "warning" : "neutral"}
          />
          <UrgencyWidget
            icon={Scale}
            value={`${Number(metrics?.residuosNoMes ?? 0).toFixed(1)}t`}
            label="Resíduos no Mês"
            variant="success"
            subtitle="Classe I + II-A + II-B"
          />
          <UrgencyWidget
            icon={Building2}
            value={metrics?.totalClientes ?? 0}
            label="Clientes Ativos"
            variant="neutral"
          />
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WasteChart />
          <LicenseStatusList />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
