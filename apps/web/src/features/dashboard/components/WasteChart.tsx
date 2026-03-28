import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { residuosMensais } from "@/lib/mock-data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 !bg-card/90 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
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

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-5 mt-3">
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: entry.color }} />
          <span className="text-[11px] text-muted-foreground/60">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function WasteChart() {
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
        <BarChart data={residuosMensais} barCategoryGap="20%">
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
