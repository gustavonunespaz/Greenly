import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { trackFirstValidAction, trackFlowCompleted } from '@/lib/telemetry'
import {
  Building2,
  FilePlus2,
  Truck,
  ClipboardPlus,
  ArrowRight,
  Radar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDashboardIntelligence } from '@/features/dashboard/hooks/useDashboardIntelligence'
import { RiskConsolidationPanel } from '@/features/dashboard/components/RiskConsolidationPanel'
import { UpcomingDeadlinesTimeline } from '@/features/dashboard/components/UpcomingDeadlinesTimeline'
import { SustainabilityTrendPanel } from '@/features/dashboard/components/SustainabilityTrendPanel'
import { KpiSectionsPanel } from '@/features/dashboard/components/KpiSectionsPanel'
import { TraceabilityPanel } from '@/features/dashboard/components/TraceabilityPanel'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const quickActions = [
  {
    label: 'Nova licença',
    description: 'Cadastrar licença e iniciar monitoramento de prazo.',
    to: '/licencas?quickAction=nova-licenca',
    icon: FilePlus2,
  },
  {
    label: 'Novo MTR',
    description: 'Emitir manifesto de transporte para operação atual.',
    to: '/mtrs?quickAction=novo-mtr',
    icon: Truck,
  },
  {
    label: 'Nova condicionante',
    description: 'Registrar condicionante e definir responsabilidade.',
    to: '/condicionantes?quickAction=nova-condicionante',
    icon: ClipboardPlus,
  },
  {
    label: 'Novo cliente',
    description: 'Adicionar cliente para iniciar gestão ambiental.',
    to: '/clientes?quickAction=novo-cliente',
    icon: Building2,
  },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-52" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-4">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-40" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-[360px] skeleton" />
        <div className="glass-card p-6 h-[360px] skeleton" />
      </div>

      <div className="glass-card p-6 h-[380px] skeleton" />
      <div className="glass-card p-6 h-[360px] skeleton" />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    isLoading,
    sections,
    sectorMetrics,
    risk,
    deadlines,
    trendPoints,
    traceabilityRows,
    defaultMonthKey,
  } = useDashboardIntelligence()
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('')

  useTrackViewLoaded('dashboard')

  useEffect(() => {
    if (!selectedMonthKey && defaultMonthKey) {
      setSelectedMonthKey(defaultMonthKey)
    }
  }, [defaultMonthKey, selectedMonthKey])

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <SkeletonDashboard />
      </AppLayout>
    )
  }

  const firstName = user?.nome?.split(' ')[0] || 'Usuário'
  const activeMonthKey = selectedMonthKey || defaultMonthKey

  return (
    <AppLayout title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {getGreeting()}, <span className="gradient-text">{firstName}</span>
          </h2>
          <p className="text-sm text-muted-foreground/65 mt-1">
            Use o radar ambiental para antecipar riscos legais, ESG e operacionais em poucos segundos.
          </p>
        </motion.div>

        <motion.div variants={item} className="space-y-2">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.12em] font-medium">
            Ações Rápidas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  onClick={() => {
                    trackFirstValidAction('dashboard', 'quick_action_click', {
                      target: action.to,
                      actionLabel: action.label,
                    })
                    trackFlowCompleted('dashboard', 'quick_action_navigation', {
                      target: action.to,
                      actionLabel: action.label,
                    })
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
                    <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5">
            <Radar className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] uppercase tracking-[0.08em] text-primary/90 font-medium">
              Radar de conformidade e sustentabilidade
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 2xl:grid-cols-[1.1fr_1fr] gap-6">
          <RiskConsolidationPanel risk={risk} />
          <UpcomingDeadlinesTimeline deadlines={deadlines} />
        </motion.div>

        <motion.div variants={item}>
          <KpiSectionsPanel sections={sections} sectorMetrics={sectorMetrics} />
        </motion.div>

        <motion.div variants={item}>
          <SustainabilityTrendPanel
            trendPoints={trendPoints}
            selectedMonthKey={activeMonthKey}
            onSelectMonth={setSelectedMonthKey}
          />
        </motion.div>

        <motion.div variants={item}>
          <TraceabilityPanel rows={traceabilityRows} selectedMonthKey={activeMonthKey} />
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
