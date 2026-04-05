import { AlertTriangle, ArrowRight, Clock, FileCheck, ClipboardList, Truck, ShieldCheck, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { DashboardDeadlineItem } from '../hooks/useDashboardIntelligence'

interface Props {
  items: DashboardDeadlineItem[]
  maxItems?: number
}

function urgencyConfig(urgencia: DashboardDeadlineItem['urgencia'], dias: number) {
  if (dias < 0) return {
    bg: 'bg-destructive/8',
    border: 'border-destructive/20',
    badge: 'bg-destructive/15 text-destructive',
    badgeLabel: `${Math.abs(dias)}d atrasado`,
    dot: 'bg-destructive status-pulse',
  }

  if (urgencia === 'ALTA') return {
    bg: 'bg-destructive/5',
    border: 'border-destructive/15',
    badge: 'bg-destructive/15 text-destructive',
    badgeLabel: `${dias}d restantes`,
    dot: 'bg-destructive status-pulse',
  }

  if (urgencia === 'MEDIA') return {
    bg: 'bg-warning/5',
    border: 'border-warning/15',
    badge: 'bg-warning/15 text-warning',
    badgeLabel: `${dias}d restantes`,
    dot: 'bg-warning',
  }

  return {
    bg: 'bg-white/[0.02]',
    border: 'border-white/[0.08]',
    badge: 'bg-muted/50 text-muted-foreground',
    badgeLabel: `${dias}d restantes`,
    dot: 'bg-muted-foreground/50',
  }
}

const tipoIcon: Record<string, typeof FileCheck> = {
  LICENCA: FileCheck,
  CONDICIONANTE: ClipboardList,
  OBRIGACAO: ShieldCheck,
  TAREFA: ListTodo,
  MTR: Truck,
}

const tipoLabel: Record<string, string> = {
  LICENCA: 'Licença',
  CONDICIONANTE: 'Condicionante',
  OBRIGACAO: 'Obrigação oficial',
  TAREFA: 'Tarefa',
  MTR: 'MTR',
}

function actionLabel(item: DashboardDeadlineItem) {
  if (item.diasRestantes < 0) {
    if (item.tipo === 'LICENCA') return 'Renovar'
    if (item.tipo === 'OBRIGACAO') return 'Regularizar'
    return 'Resolver'
  }

  if (item.tipo === 'LICENCA') return 'Ver licença'
  if (item.tipo === 'OBRIGACAO') return 'Ver obrigação'
  if (item.tipo === 'TAREFA') return 'Abrir agenda'
  if (item.tipo === 'CONDICIONANTE') return 'Ver detalhes'
  return 'Acompanhar'
}

const itemAnim = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export function UrgentItemsPanel({ items, maxItems = 6 }: Props) {
  const urgentItems = items
    .filter(i => i.urgencia === 'ALTA' || i.urgencia === 'MEDIA' || i.diasRestantes < 0)
    .slice(0, maxItems)

  if (urgentItems.length === 0) {
    return (
      <div className="glass-card p-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Tudo em dia!</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Nenhum item exige atenção urgente no momento.
          </p>
        </div>
      </div>
    )
  }

  const criticalCount = urgentItems.filter(i => i.urgencia === 'ALTA' || i.diasRestantes < 0).length

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {urgentItems.length} {urgentItems.length === 1 ? 'item precisa' : 'itens precisam'} de atenção
            </h3>
            {criticalCount > 0 && (
              <p className="text-[11px] text-destructive/80">
                {criticalCount} {criticalCount === 1 ? 'crítico' : 'críticos'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {urgentItems.map((item, i) => {
          const config = urgencyConfig(item.urgencia, item.diasRestantes)
          const Icon = tipoIcon[item.tipo] || FileCheck

          return (
            <motion.div
              key={item.id}
              variants={itemAnim}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={item.destino}
                className={`flex items-center gap-3 px-5 py-3 ${config.bg} hover:brightness-105 transition-all duration-200 group`}
              >
                <div className="relative shrink-0">
                  <div className={`h-9 w-9 rounded-xl border ${config.border} flex items-center justify-center bg-background/50`}>
                    <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${config.dot} ring-2 ring-background`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                      {tipoLabel[item.tipo]}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${config.badge}`}>
                      {config.badgeLabel}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium truncate mt-0.5">{item.titulo}</p>
                  <p className="text-[11px] text-muted-foreground/60 truncate">{item.subtitulo}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] text-primary font-medium">{actionLabel(item)}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
