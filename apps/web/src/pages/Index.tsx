import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { useLastVisit } from '@/hooks/use-last-visit'
import { trackFirstValidAction, trackFlowCompleted } from '@/lib/telemetry'
import { useClienteContexto } from '@/features/clientes/components/ClienteContextProvider'
import {
  Building2,
  FilePlus2,
  Truck,
  ClipboardPlus,
  Radar,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useDashboardIntelligence } from '@/features/dashboard/hooks/useDashboardIntelligence'
import { RiskConsolidationPanel } from '@/features/dashboard/components/RiskConsolidationPanel'
import { UpcomingDeadlinesTimeline } from '@/features/dashboard/components/UpcomingDeadlinesTimeline'
import { SustainabilityTrendPanel } from '@/features/dashboard/components/SustainabilityTrendPanel'
import { KpiSectionsPanel } from '@/features/dashboard/components/KpiSectionsPanel'
import { TraceabilityPanel } from '@/features/dashboard/components/TraceabilityPanel'
import { UrgentItemsPanel } from '@/features/dashboard/components/UrgentItemsPanel'
import { WhatsNewBanner } from '@/features/dashboard/components/WhatsNewBanner'

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
    to: '/licencas?quickAction=nova-licenca',
    icon: FilePlus2,
  },
  {
    label: 'Novo MTR',
    to: '/mtrs?quickAction=novo-mtr',
    icon: Truck,
  },
  {
    label: 'Nova condicionante',
    to: '/condicionantes?quickAction=nova-condicionante',
    icon: ClipboardPlus,
  },
  {
    label: 'Novo cliente',
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

      <div className="glass-card p-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-[360px] skeleton" />
        <div className="glass-card p-6 h-[360px] skeleton" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { clienteId, clienteNome } = useClienteContexto()
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
  const [showDetailedPanels, setShowDetailedPanels] = useState(false)
  const { getTimeSinceLastVisit } = useLastVisit()

  useTrackViewLoaded('dashboard')

  useEffect(() => {
    if (!selectedMonthKey && defaultMonthKey) {
      setSelectedMonthKey(defaultMonthKey)
    }
  }, [defaultMonthKey, selectedMonthKey])

  // Build "what's new" items from deadlines data
  const whatsNewItems = useMemo(() => {
    const items: Array<{ id: string; text: string }> = []
    const overdue = deadlines.filter(d => d.diasRestantes < 0).length
    const critical = deadlines.filter(d => d.urgencia === 'ALTA' && d.diasRestantes >= 0).length

    if (overdue > 0) {
      items.push({ id: 'overdue', text: `${overdue} item(ns) ficaram atrasados` })
    }
    if (critical > 0) {
      items.push({ id: 'critical', text: `${critical} item(ns) entraram em urgência alta` })
    }
    if (risk.vencidas > 0) {
      items.push({ id: 'licencas-vencidas', text: `${risk.vencidas} licença(s) vencida(s) requerem atenção` })
    }

    return items
  }, [deadlines, risk])

  // Filter deadlines by client context
  const filteredDeadlines = useMemo(() => {
    if (!clienteId) return deadlines
    return deadlines.filter(d =>
      d.subtitulo && d.subtitulo !== 'Cliente não identificado'
    )
  }, [deadlines, clienteId])

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <SkeletonDashboard />
      </AppLayout>
    )
  }

  const firstName = user?.nome?.split(' ')[0] || 'Usuário'
  const activeMonthKey = selectedMonthKey || defaultMonthKey
  const urgentCount = filteredDeadlines.filter(d => d.urgencia === 'ALTA' || d.urgencia === 'MEDIA' || d.diasRestantes < 0).length

  return (
    <AppLayout title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Greeting + Summary */}
        <motion.div variants={item}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                {getGreeting()}, <span className="gradient-text">{firstName}</span>
              </h2>
              <p className="text-sm text-muted-foreground/65 mt-1">
                {urgentCount > 0 ? (
                  <>
                    Você tem <span className="text-foreground font-medium">{urgentCount} {urgentCount === 1 ? 'item' : 'itens'}</span> que {urgentCount === 1 ? 'precisa' : 'precisam'} de atenção.
                  </>
                ) : (
                  'Tudo em dia! Continue acompanhando seus indicadores.'
                )}
              </p>
              {clienteNome && (
                <div className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-primary/8 border border-primary/15 px-3 py-1">
                  <Building2 className="h-3 w-3 text-primary" />
                  <span className="text-[11px] text-primary font-medium">Contexto: {clienteNome}</span>
                </div>
              )}
            </div>

            {/* Compact Quick Actions */}
            <div className="flex items-center gap-1.5">
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
                    className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-primary/[0.04] transition-all duration-200"
                    title={action.label}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium hidden lg:inline">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* What's New Banner (Eixo 5) */}
        <motion.div variants={item}>
          <WhatsNewBanner
            timeSinceLabel={getTimeSinceLastVisit()}
            items={whatsNewItems}
          />
        </motion.div>

        {/* ZONE 1: Urgent Items + Compliance Summary (side by side) */}
        <motion.div variants={item} className="grid grid-cols-1 2xl:grid-cols-[1.2fr_1fr] gap-5">
          {/* Urgent items panel */}
          <UrgentItemsPanel items={filteredDeadlines} maxItems={6} />

          {/* Compliance summary card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Resumo de Conformidade</h3>
                <p className="text-[11px] text-muted-foreground/60">Visão consolidada</p>
              </div>
            </div>

            {/* Compliance score bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground/60">Score de risco</span>
                <span className={`text-lg font-bold tabular-nums ${
                  risk.score <= 15 ? 'text-primary' : risk.score <= 35 ? 'text-warning' : 'text-destructive'
                }`}>
                  {risk.score}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    risk.score <= 15 ? 'bg-primary' : risk.score <= 35 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(risk.score, 100)}%` }}
                />
              </div>
            </div>

            {/* Key metrics summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-lg font-bold text-foreground tabular-nums">{risk.ativas}</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Licenças ativas</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-lg font-bold text-foreground tabular-nums">{risk.pendentes}</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">A vencer</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className={`text-lg font-bold tabular-nums ${risk.vencidas > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {risk.vencidas}
                </p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Vencidas</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-lg font-bold text-foreground tabular-nums">{risk.coberturaCdfPct.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Cobertura CDF</p>
              </div>
            </div>

            {/* Top insight */}
            {risk.insights[0] && (
              <div className="rounded-xl bg-primary/[0.04] border border-primary/10 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{risk.insights[0]}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ZONE 2: Deadlines Timeline */}
        <motion.div variants={item}>
          <UpcomingDeadlinesTimeline deadlines={filteredDeadlines} />
        </motion.div>

        {/* Radar badge + Toggle for detailed panels */}
        <motion.div variants={item}>
          <button
            onClick={() => setShowDetailedPanels(!showDetailedPanels)}
            className="w-full flex items-center justify-between gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 hover:bg-primary/[0.07] transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Radar className="h-3.5 w-3.5 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.08em] text-primary/90 font-medium">
                Radar de conformidade e sustentabilidade
              </p>
            </div>
            {showDetailedPanels
              ? <ChevronUp className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
              : <ChevronDown className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
            }
          </button>
        </motion.div>

        {/* ZONE 3: Detailed panels (collapsible) */}
        {showDetailedPanels && (
          <>
            <motion.div variants={item} className="grid grid-cols-1 2xl:grid-cols-[1.1fr_1fr] gap-6">
              <RiskConsolidationPanel risk={risk} />
              <div /> {/* Already showing deadlines above */}
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
          </>
        )}
      </motion.div>
    </AppLayout>
  )
}
