import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, ExternalLink } from 'lucide-react'
import { DashboardTraceabilityRow } from '../hooks/useDashboardIntelligence'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'

interface TraceabilityPanelProps {
  rows: DashboardTraceabilityRow[]
  selectedMonthKey: string
}

type TraceabilityFilter = 'TODOS' | 'COM_CDF' | 'SEM_CDF' | 'DIVERGENCIA'

const filterLabels: Record<TraceabilityFilter, string> = {
  TODOS: 'Todos',
  COM_CDF: 'Com CDF',
  SEM_CDF: 'Sem CDF',
  DIVERGENCIA: 'Com divergência',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatDate(value: Date | null) {
  if (!value) return '—'
  return value.toLocaleDateString('pt-BR')
}

export function TraceabilityPanel({ rows, selectedMonthKey }: TraceabilityPanelProps) {
  const [filter, setFilter] = useState<TraceabilityFilter>('TODOS')

  const rowsByMonth = useMemo(
    () => rows.filter((row) => row.monthKey === selectedMonthKey),
    [rows, selectedMonthKey],
  )

  const filtered = useMemo(() => {
    if (filter === 'COM_CDF') {
      return rowsByMonth.filter((row) => !!row.cdfId)
    }

    if (filter === 'SEM_CDF') {
      return rowsByMonth.filter((row) => !row.cdfId)
    }

    if (filter === 'DIVERGENCIA') {
      return rowsByMonth.filter((row) => row.status === 'COM_DIVERGENCIA')
    }

    return rowsByMonth
  }, [filter, rowsByMonth])

  const volumeTotal = filtered.reduce((sum, row) => sum + row.volumeTon, 0)
  const custoTotal = filtered.reduce((sum, row) => sum + row.custoEstimado, 0)

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium">
            Rastreabilidade Interativa
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-1">
            Do KPI para os documentos de origem
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Navegação direta para MTRs e vínculo com CDF para comprovação de custo, status e destinação.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/55">Resumo do filtro</p>
          <p className="text-sm text-foreground tabular-nums">
            {filtered.length} itens • {volumeTotal.toFixed(1)} ton • {formatCurrency(custoTotal)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(filterLabels) as TraceabilityFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
              filter === key
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-white/[0.1] bg-white/[0.02] text-muted-foreground hover:text-foreground'
            }`}
          >
            {filterLabels[key]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Sem registros para o mês/filtro"
          description="Ajuste o mês no gráfico de tendência ou altere o filtro de rastreabilidade."
          compact
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  Referência
                </th>
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  Cliente
                </th>
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  Data
                </th>
                <th className="px-3 py-2 text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                  Volume
                </th>
                <th className="px-3 py-2 text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                  Custo estimado
                </th>
                <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  CDF vinculado
                </th>
                <th className="px-3 py-2 text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-white/[0.08] hover:bg-white/[0.02]">
                  <td className="px-3 py-2 align-top">
                    <p className="font-medium text-foreground">{row.referencia}</p>
                    <p className="text-xs text-muted-foreground/65">{row.tipoDestinacao}</p>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.cliente}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(row.dataMovimento)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">
                    {row.volumeTon.toFixed(2)} ton
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">
                    {formatCurrency(row.custoEstimado)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.cdfNumero ? row.cdfNumero : 'Pendente'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={row.destino}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Abrir origem
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
