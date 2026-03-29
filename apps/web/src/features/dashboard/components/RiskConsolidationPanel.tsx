import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AlertTriangle, Brain, CheckCircle2, TimerReset, XCircle } from 'lucide-react'
import { DashboardRiskSnapshot } from '../hooks/useDashboardIntelligence'

interface RiskConsolidationPanelProps {
  risk: DashboardRiskSnapshot
}

const COLORS = {
  ativas: 'hsl(152 76% 32%)',
  pendentes: 'hsl(38 92% 45%)',
  vencidas: 'hsl(4 72% 47%)',
}

const riskStatusLabel = (score: number) => {
  if (score >= 55) return 'Risco alto'
  if (score >= 30) return 'Risco moderado'
  return 'Risco controlado'
}

export function RiskConsolidationPanel({ risk }: RiskConsolidationPanelProps) {
  const chartData = [
    { key: 'ativas', name: 'Ativas', value: risk.ativas, color: COLORS.ativas },
    { key: 'pendentes', name: 'Pendentes', value: risk.pendentes, color: COLORS.pendentes },
    { key: 'vencidas', name: 'Vencidas', value: risk.vencidas, color: COLORS.vencidas },
  ]

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium">
            Consolidação de Risco
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-1">
            Conformidade ambiental em tempo real
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Proporção de licenças ativas, pendentes e vencidas com leitura automática de risco.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/55">Score de risco</p>
          <p className="text-xl font-semibold text-foreground tabular-nums">{risk.score}</p>
          <p className="text-[11px] text-muted-foreground/60">{riskStatusLabel(risk.score)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5 items-center">
        <div className="relative h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={2}
                stroke="transparent"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, 'Licenças']}
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card) / 0.95)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums text-foreground">{total}</p>
              <p className="text-[11px] text-muted-foreground/70">licenças monitoradas</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] text-muted-foreground/70">Ativas</p>
              <p className="text-xl font-semibold text-primary tabular-nums">{risk.ativas}</p>
            </div>
            <div className="rounded-xl border border-warning/20 bg-warning/8 p-3">
              <p className="text-[11px] text-muted-foreground/70">Pendentes</p>
              <p className="text-xl font-semibold text-warning tabular-nums">{risk.pendentes}</p>
            </div>
            <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-3 sm:col-span-2">
              <p className="text-[11px] text-muted-foreground/70">Vencidas</p>
              <p className="text-xl font-semibold text-destructive tabular-nums">{risk.vencidas}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] text-muted-foreground/65 mb-1">Cobertura de rastreabilidade MTR → CDF</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {risk.coberturaCdfPct.toFixed(1)}%
              </p>
              <p className="text-[11px] text-muted-foreground/60">documentos com trilha fechada</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary" strokeWidth={1.8} />
          <p className="text-sm font-medium text-foreground">Insights proativos</p>
        </div>

        <div className="space-y-2">
          {risk.insights.map((insight) => {
            const tone = insight.toLowerCase()
            const isCritical = tone.includes('vencida') || tone.includes('autua')
            const isWarning = tone.includes('oportunidade') || tone.includes('taxa')

            return (
              <div
                key={insight}
                className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-background/40 px-3 py-2"
              >
                {isCritical ? (
                  <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                ) : isWarning ? (
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                ) : risk.score >= 35 ? (
                  <TimerReset className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                )}
                <p className="text-xs text-muted-foreground/85 leading-relaxed">{insight}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
