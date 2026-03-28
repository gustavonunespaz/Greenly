import { AppLayout } from "@/components/layout/AppLayout";
import { UrgencyWidget } from "@/components/dashboard/UrgencyWidget";
import { WasteChart } from "@/components/dashboard/WasteChart";
import { LicenseStatusList } from "@/components/dashboard/LicenseStatusList";
import { dashboardStats } from "@/lib/mock-data";
import { AlertTriangle, FileX, ClipboardX, Truck, Scale, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Urgency Header */}
        <motion.div variants={item}>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] font-medium mb-4">
            Monitoramento de Riscos
          </p>
        </motion.div>

        {/* Urgency Widgets */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <UrgencyWidget
            icon={FileX}
            value={dashboardStats.licencasVencidas}
            label="Licenças Vencidas"
            variant="danger"
            pulse
          />
          <UrgencyWidget
            icon={AlertTriangle}
            value={dashboardStats.licencasVencendo30d}
            label="Vencem em 30 dias"
            variant="warning"
          />
          <UrgencyWidget
            icon={ClipboardX}
            value={dashboardStats.condicionantesAtrasadas}
            label="Cond. Atrasadas"
            variant="danger"
            pulse
          />
          <UrgencyWidget
            icon={Truck}
            value={dashboardStats.mtrsEmAberto}
            label="MTRs em Aberto"
            variant="neutral"
          />
          <UrgencyWidget
            icon={Scale}
            value={`${dashboardStats.residuosProcessadosMes}t`}
            label="Resíduos no Mês"
            variant="success"
            subtitle="Classe I + II-A + II-B"
          />
          <UrgencyWidget
            icon={Building2}
            value={dashboardStats.clientesAtivos}
            label="Clientes Ativos"
            variant="neutral"
          />
        </motion.div>

        {/* Charts & Lists */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WasteChart />
          <LicenseStatusList />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
