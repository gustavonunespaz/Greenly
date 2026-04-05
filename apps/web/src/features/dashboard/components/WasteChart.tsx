import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type TooltipEntry = {
  color?: string;
  name?: string;
  value?: string | number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 !bg-card/90 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium tabular-nums text-foreground">{entry.value}t</span>
        </div>
      ))}
    </div>
  );
};

type LegendEntry = {
  color?: string;
  value?: string;
};

type CustomLegendProps = {
  payload?: LegendEntry[];
};

const CustomLegend = ({ payload }: CustomLegendProps) => {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-5 mt-3">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: entry.color }} />
          <span className="text-[11px] text-muted-foreground/60">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

type WasteChartPoint = {
  mes: string;
  classeI: number;
  classeIIA: number;
  classeIIB: number;
};

type WasteChartProps = {
  data?: WasteChartPoint[];
};

export function WasteChart({ data = [] }: WasteChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-medium text-foreground">Volume de Resíduos</h3>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">Últimos 6 meses (toneladas)</p>
          </div>
        </div>
        <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground/70">
          Sem dados consolidados para exibir.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Volume de Resíduos</h3>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">Últimos 6 meses (toneladas)</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground/40 bg-white/[0.03] px-2 py-1 rounded-lg">Mensal</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 32%, 30%, 0.15)" vertical={false} />
          <XAxis
            dataKey="mes"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsla(215, 20%, 65%, 0.5)', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsla(215, 20%, 65%, 0.4)', fontSize: 10 }}
            tickFormatter={(v) => `${v}t`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(217, 32%, 30%, 0.1)', radius: 4 }} />
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="classeI"
            name="Classe I"
            fill="hsl(4, 74%, 55%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="classeIIA"
            name="Classe II-A"
            fill="hsl(161, 94%, 30%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="classeIIB"
            name="Classe II-B"
            fill="hsl(174, 75%, 41%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
