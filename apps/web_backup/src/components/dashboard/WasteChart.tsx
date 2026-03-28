import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { residuosMensais } from "@/lib/mock-data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 text-sm">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}: </span>
          <span className="text-foreground font-medium tabular-nums">{entry.value} ton</span>
        </div>
      ))}
    </div>
  );
};

export function WasteChart() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-1">Resíduos Processados</h3>
      <p className="text-xs text-muted-foreground mb-6">Volume mensal por classe (toneladas)</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={residuosMensais} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 32%, 17%, 0.5)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 65%)" }}
          />
          <Bar dataKey="classeI" name="Classe I" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="classeIIA" name="Classe II-A" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="classeIIB" name="Classe II-B" fill="hsl(161, 94%, 30%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
