import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import { DashboardTrendPoint } from '../hooks/useDashboardIntelligence'

interface SustainabilityTrendPanelProps {
  trendPoints: DashboardTrendPoint[]
  selectedMonthKey: string
  onSelectMonth: (monthKey: string) => void
}

function formatNumber(value: number, digits = 1) {
  return value.toFixed(digits)
}

export function SustainabilityTrendPanel({
  trendPoints,
  selectedMonthKey,
  onSelectMonth,
}: SustainabilityTrendPanelProps) {
  const selected =
    trendPoints.find((point) => point.monthKey === selectedMonthKey) ||
    trendPoints[trendPoints.length - 1]

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium">
            Tendências Históricas
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-1">
            Resíduos, emissões e recursos (6 meses)
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Clique no mês para abrir o drill-down rastreável de MTR/CDF e custos.
          </p>
        </div>
        {selected ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/55">Mês selecionado</p>
            <p className="text-sm font-medium text-foreground">{selected.mes}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendPoints} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.45)" vertical={false} />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground) / 0.8)', fontSize: 11 }}
              />
              <YAxis
                yAxisId="volume"
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fill: 'hsl(var(--muted-foreground) / 0.75)', fontSize: 10 }}
                tickFormatter={(value) => `${value}t`}
              />
              <YAxis
                yAxisId="percent"
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fill: 'hsl(var(--muted-foreground) / 0.75)', fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card) / 0.95)',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Volume de resíduos') return [`${value.toFixed(1)} t`, name]
                  if (name === 'Desvio de aterro') return [`${value.toFixed(1)}%`, name]
                  if (name === 'Não conformidades') return [value, name]
                  return [value, name]
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Bar yAxisId="volume" dataKey="residuosTon" name="Volume de resíduos" radius={[5, 5, 0, 0]}>
                {trendPoints.map((entry) => (
                  <Cell
                    key={`bar-${entry.monthKey}`}
                    fill={
                      entry.monthKey === selectedMonthKey
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--primary) / 0.45)'
                    }
                    cursor="pointer"
                    onClick={() => onSelectMonth(entry.monthKey)}
                  />
                ))}
              </Bar>

              <Line
                yAxisId="percent"
                type="monotone"
                dataKey="desvioAterroPct"
                name="Desvio de aterro"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--accent))' }}
                activeDot={{ r: 4 }}
              />

              <Line
                yAxisId="volume"
                type="monotone"
                dataKey="naoConformidades"
                name="Não conformidades"
                stroke="hsl(var(--destructive))"
                strokeDasharray="4 3"
                strokeWidth={1.8}
                dot={{ r: 2.5, fill: 'hsl(var(--destructive))' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] text-muted-foreground/70">CO2 por unidade</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {selected ? `${formatNumber(selected.co2PorUnidade, 3)} tCO2e/ton` : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] text-muted-foreground/70">Consumo de combustível</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {selected ? `${formatNumber(selected.combustivelLitros, 0)} L` : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] text-muted-foreground/70">Uso hídrico e energético</p>
            <p className="text-sm text-foreground tabular-nums mt-1">
              {selected ? `${formatNumber(selected.aguaM3, 1)} m3 • ${formatNumber(selected.energiaKwh, 0)} kWh` : '—'}
            </p>
          </div>

          <div className="h-[120px] rounded-xl border border-white/[0.08] bg-white/[0.02] px-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground) / 0.75)', fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card) / 0.95)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(0)}/ton`, 'Custo logístico']}
                />
                <Area
                  type="monotone"
                  dataKey="custoPorTon"
                  stroke="hsl(var(--warning))"
                  fill="url(#costGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
