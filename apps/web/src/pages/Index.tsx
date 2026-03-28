import { AppLayout } from "@/components/layout/AppLayout";
import { UrgencyWidget } from "@/features/dashboard/components/UrgencyWidget";
import { WasteChart } from "@/features/dashboard/components/WasteChart";
import { LicenseStatusList } from "@/features/dashboard/components/LicenseStatusList";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { AlertTriangle, FileX, ClipboardX, Truck, Scale, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function DashboardPage() {
  const { metrics, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center p-20">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] font-medium mb-4">
            Monitoramento de Riscos
          </p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <UrgencyWidget
            icon={FileX}
            value={metrics?.licencasAVencer ?? 0}
            label="Licenças à Vencer"
            variant={metrics?.licencasAVencer && metrics.licencasAVencer > 0 ? "warning" : "neutral"}
            pulse={metrics?.licencasAVencer && metrics.licencasAVencer > 5}
          />
          <UrgencyWidget
            icon={AlertTriangle}
            value={0} // Mocked for now, pending backend expansion
            label="Pendências Críticas"
            variant="danger"
          />
          <UrgencyWidget
            icon={ClipboardX}
            value={0}
            label="Cond. Atrasadas"
            variant="neutral"
          />
          <UrgencyWidget
            icon={Truck}
            value={metrics?.mtrsPendentes ?? 0}
            label="MTRs em Aberto"
            variant="neutral"
          />
          <UrgencyWidget
            icon={Scale}
            value={`0t`}
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

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WasteChart />
          <LicenseStatusList />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
