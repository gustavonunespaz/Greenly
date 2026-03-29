import { CalendarClock, ArrowRight, FileWarning, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardDeadlineItem } from '../hooks/useDashboardIntelligence'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'

interface UpcomingDeadlinesTimelineProps {
  deadlines: DashboardDeadlineItem[]
}

const urgencyClass: Record<DashboardDeadlineItem['urgencia'], string> = {
  ALTA: 'text-destructive border-destructive/30 bg-destructive/10',
  MEDIA: 'text-warning border-warning/30 bg-warning/10',
  BAIXA: 'text-primary border-primary/25 bg-primary/10',
}

function formatDueDate(value: Date | null) {
  if (!value) return 'Sem data definida'
  return value.toLocaleDateString('pt-BR')
}

function formatDaysLeft(days: number) {
  if (days < 0) return `Atrasado há ${Math.abs(days)} dia(s)`
  if (days === 0) return 'Vence hoje'
  return `Faltam ${days} dia(s)`
}

export function UpcomingDeadlinesTimeline({ deadlines }: UpcomingDeadlinesTimelineProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium">
            Vencimentos Próximos
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-1">
            Cronograma de licenças e condicionantes
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Priorização por urgência para agir antes de embargo, autuação ou multa.
          </p>
        </div>
        <CalendarClock className="h-5 w-5 text-primary/70 shrink-0" strokeWidth={1.8} />
      </div>

      {deadlines.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nenhum vencimento próximo"
          description="Ainda não há tarefas críticas de renovação ou condicionantes no horizonte recente."
          compact
        />
      ) : (
        <div className="space-y-2">
          {deadlines.map((item, index) => {
            const markerClass =
              item.urgencia === 'ALTA'
                ? 'bg-destructive'
                : item.urgencia === 'MEDIA'
                  ? 'bg-warning'
                  : 'bg-primary'

            return (
              <Link
                to={item.destino}
                key={`${item.tipo}-${item.id}`}
                className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 hover:border-primary/25 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex flex-col items-center shrink-0 pt-1">
                    <div className={`h-2.5 w-2.5 rounded-full ${markerClass}`} />
                    {index < deadlines.length - 1 ? (
                      <div className="w-px h-9 bg-border/70 mt-1.5" />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                          {item.subtitulo}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={item.status} className="hidden sm:inline-flex" />
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-muted-foreground/70">
                        {formatDueDate(item.dataLimite)}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span
                        className={`text-[11px] rounded-full border px-2 py-0.5 tabular-nums ${urgencyClass[item.urgencia]}`}
                      >
                        {formatDaysLeft(item.diasRestantes)}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-[11px] text-muted-foreground/70 inline-flex items-center gap-1">
                        {item.tipo === 'LICENCA' ? (
                          <FileWarning className="h-3 w-3" />
                        ) : (
                          <ClipboardList className="h-3 w-3" />
                        )}
                        {item.tipo === 'LICENCA' ? 'Licença' : 'Condicionante'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
