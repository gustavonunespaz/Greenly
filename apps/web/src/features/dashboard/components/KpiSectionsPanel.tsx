import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import {
  DashboardKpiSection,
  DashboardSectorMetric,
  KpiHealth,
} from '../hooks/useDashboardIntelligence'

interface KpiSectionsPanelProps {
  sections: DashboardKpiSection[]
  sectorMetrics: DashboardSectorMetric[]
}

const statusClasses: Record<KpiHealth, string> = {
  ok: 'text-primary bg-primary/10 border-primary/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  critical: 'text-destructive bg-destructive/10 border-destructive/20',
  info: 'text-muted-foreground bg-muted/40 border-white/[0.08]',
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) {
    return <TrendingUp className="h-3.5 w-3.5 text-primary" />
  }

  if (value < 0) {
    return <TrendingDown className="h-3.5 w-3.5 text-destructive" />
  }

  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export function KpiSectionsPanel({ sections, sectorMetrics }: KpiSectionsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <section key={section.id} className="glass-card p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/55 font-medium">
                KPI Monitorado
              </p>
              <h3 className="text-base font-semibold text-foreground mt-1">{section.title}</h3>
              <p className="text-xs text-muted-foreground/70 mt-1">{section.description}</p>
            </div>

            <div className="space-y-2.5">
              {section.kpis.map((kpi) => (
                <article
                  key={kpi.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12px] text-muted-foreground/80 leading-relaxed">{kpi.label}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${statusClasses[kpi.status]}`}
                    >
                      {kpi.status === 'ok'
                        ? 'Estável'
                        : kpi.status === 'warning'
                          ? 'Atenção'
                          : kpi.status === 'critical'
                            ? 'Crítico'
                            : 'Monitorar'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xl font-semibold text-foreground tabular-nums">{kpi.value}</p>
                    {typeof kpi.trend === 'number' ? (
                      <div className="flex items-center gap-1 text-xs tabular-nums">
                        <TrendIcon value={kpi.trend} />
                        <span
                          className={
                            kpi.trend > 0
                              ? 'text-primary'
                              : kpi.trend < 0
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                          }
                        >
                          {kpi.trend > 0 ? '+' : ''}
                          {kpi.trend.toFixed(1)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-muted-foreground/65 leading-relaxed">{kpi.helper}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="glass-card p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/55 font-medium">
            KPIs Setoriais Específicos
          </p>
          <h3 className="text-base font-semibold text-foreground mt-1">
            Indicadores por perfil de operação
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Agronegócio, energia e saúde com foco em desempenho regulatório e eficiência setorial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sectorMetrics.map((metric) => (
            <article
              key={metric.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-1.5"
            >
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground/55">
                {metric.setor}
              </p>
              <p className="text-sm text-muted-foreground/80">{metric.label}</p>
              <p className="text-xl font-semibold text-foreground tabular-nums">{metric.value}</p>
              <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border ${statusClasses[metric.status]}`}>
                {metric.status === 'ok'
                  ? 'Saudável'
                  : metric.status === 'warning'
                    ? 'Variação'
                    : metric.status === 'critical'
                      ? 'Ajustar já'
                      : 'Sem base'}
              </span>
              <p className="text-[11px] text-muted-foreground/65 leading-relaxed">{metric.helper}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
