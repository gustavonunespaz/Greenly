import { AppLayout } from "@/components/layout/AppLayout";
import { UrgencyWidget } from "@/features/dashboard/components/UrgencyWidget";
import { WasteChart } from "@/features/dashboard/components/WasteChart";
import { LicenseStatusList } from "@/features/dashboard/components/LicenseStatusList";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  AlertTriangle,
  FileX,
  ClipboardX,
  Truck,
  Scale,
  Building2,
  FilePlus2,
  ClipboardPlus,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTrackViewLoaded } from "@/hooks/use-track-view-loaded";
import { trackFirstValidAction, trackFlowCompleted } from "@/lib/telemetry";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const quickActions = [
  {
    label: "Nova licença",
    description: "Cadastrar licença e iniciar monitoramento de prazo.",
    to: "/licencas?quickAction=nova-licenca",
    icon: FilePlus2,
  },
  {
    label: "Novo MTR",
    description: "Emitir manifesto de transporte para operação atual.",
    to: "/mtrs?quickAction=novo-mtr",
    icon: Truck,
  },
  {
    label: "Nova condicionante",
    description: "Registrar condicionante e definir responsabilidade.",
    to: "/condicionantes?quickAction=nova-condicionante",
    icon: ClipboardPlus,
  },
  {
    label: "Novo cliente",
    description: "Adicionar cliente para iniciar gestão ambiental.",
    to: "/clientes?quickAction=novo-cliente",
    icon: Building2,
  },
];

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
  useTrackViewLoaded("dashboard");

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
            Escolha uma ação para avançar e acompanhe os riscos em tempo real.
          </p>
        </motion.div>

        <motion.div variants={item} className="space-y-2">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.12em] font-medium">
            Ações Rápidas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  onClick={() => {
                    trackFirstValidAction("dashboard", "quick_action_click", {
                      target: action.to,
                      actionLabel: action.label,
                    });
                    trackFlowCompleted("dashboard", "quick_action_navigation", {
                      target: action.to,
                      actionLabel: action.label,
                    });
                  }}
                  className="glass-card-interactive p-4 flex items-start gap-3 group"
                >
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <ArrowRight className="h-3.5 w-3.5 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
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
