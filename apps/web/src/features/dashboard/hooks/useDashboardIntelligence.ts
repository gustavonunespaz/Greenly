import { useMemo, useState, useEffect } from 'react'
import { useDashboard } from './useDashboard'
import { useLicencas } from '@/features/licencas/hooks/useLicencas'
import { useCondicionantes } from '@/features/licencas/hooks/useCondicionantes'
import { useResiduos, useCDFs } from '@/features/residuos/hooks/useResiduos'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { OFFICIAL_OBLIGATIONS, STORAGE_KEYS } from '@/lib/constants'

export type KpiHealth = 'ok' | 'warning' | 'critical' | 'info'

export interface DashboardKpiItem {
  id: string
  label: string
  value: string
  helper: string
  status: KpiHealth
  trend?: number
}

export interface DashboardKpiSection {
  id: string
  title: string
  description: string
  kpis: DashboardKpiItem[]
}

export interface DashboardDeadlineItem {
  id: string
  tipo: 'LICENCA' | 'CONDICIONANTE' | 'OBRIGACAO'
  titulo: string
  subtitulo: string
  dataLimite: Date | null
  diasRestantes: number
  urgencia: 'ALTA' | 'MEDIA' | 'BAIXA'
  destino: string
  status: string
}

export interface DashboardTrendPoint {
  monthKey: string
  mes: string
  residuosTon: number
  desvioAterroPct: number
  custoTotal: number
  custoPorTon: number
  perigososPct: number
  co2PorUnidade: number
  combustivelLitros: number
  aguaM3: number
  energiaKwh: number
  naoConformidades: number
  multas: number
}

export interface DashboardRiskSnapshot {
  ativas: number
  pendentes: number
  vencidas: number
  score: number
  insights: string[]
  coberturaCdfPct: number
}

export interface DashboardSectorMetric {
  id: string
  setor: 'AGRONEGOCIO' | 'ENERGIA' | 'SAUDE'
  label: string
  value: string
  helper: string
  status: KpiHealth
}

export interface DashboardTraceabilityRow {
  id: string
  monthKey: string
  referencia: string
  cliente: string
  status: string
  tipoDestinacao: string
  volumeTon: number
  custoEstimado: number
  dataMovimento: Date | null
  mtrId: string
  cdfId?: string
  cdfNumero?: string
  destino: string
}

interface TrendDraft {
  monthKey: string
  mes: string
  residuosTon: number
  desviadosTon: number
  perigososTon: number
  custoTotal: number
  co2Total: number
  combustivelLitros: number
  aguaM3: number
  energiaKwh: number
  naoConformidades: number
}

const DIVERSION_DESTINATIONS = new Set([
  'RECICLAGEM',
  'COMPOSTAGEM',
  'REUTILIZACAO',
  'LOGISTICA_REVERSA',
  'COPROCESSAMENTO',
  'TRATAMENTO_BIOLOGICO',
])

const HAZARDOUS_DESTINATIONS = new Set(['INCINERACAO', 'TRATAMENTO_QUIMICO', 'TRATAMENTO_FISICO'])

const DESTINATION_COST_BY_TON: Record<string, number> = {
  ATERRO_SANITARIO: 320,
  ATERRO_INDUSTRIAL: 420,
  INCINERACAO: 690,
  COPROCESSAMENTO: 360,
  RECICLAGEM: 210,
  COMPOSTAGEM: 180,
  TRATAMENTO_BIOLOGICO: 280,
  TRATAMENTO_QUIMICO: 560,
  TRATAMENTO_FISICO: 410,
  REUTILIZACAO: 160,
  LOGISTICA_REVERSA: 230,
  OUTRO: 300,
}

function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysUntil(date: Date | null, reference: Date) {
  if (!date) return Number.POSITIVE_INFINITY
  const diffMs = startOfDay(date).getTime() - startOfDay(reference).getTime()
  return Math.ceil(diffMs / 86400000)
}

function toTon(volume?: number | null, unidade?: string | null) {
  if (!volume || !Number.isFinite(volume)) return 0
  const upper = (unidade || 'TON').toUpperCase()
  if (upper === 'KG') return volume / 1000
  if (upper === 'TON') return volume
  if (upper === 'LITRO') return volume / 1000
  if (upper === 'M3') return volume
  return volume
}

function ratioPct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0
  return (numerator / denominator) * 100
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatPct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildMonthDrafts(reference: Date, count = 6): TrendDraft[] {
  const months: TrendDraft[] = []

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - i, 1)
    months.push({
      monthKey: monthKey(date),
      mes: monthLabel(date),
      residuosTon: 0,
      desviadosTon: 0,
      perigososTon: 0,
      custoTotal: 0,
      co2Total: 0,
      combustivelLitros: 0,
      aguaM3: 0,
      energiaKwh: 0,
      naoConformidades: 0,
    })
  }

  return months
}

function sanitize(text?: string | null) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function classifySector(setor?: string | null): 'AGRONEGOCIO' | 'ENERGIA' | 'SAUDE' | 'OUTRO' {
  const value = sanitize(setor)

  if (
    value.includes('agro') ||
    value.includes('rural') ||
    value.includes('frigor') ||
    value.includes('fazenda') ||
    value.includes('grao')
  ) {
    return 'AGRONEGOCIO'
  }

  if (value.includes('energia') || value.includes('solar') || value.includes('eolica')) {
    return 'ENERGIA'
  }

  if (
    value.includes('saude') ||
    value.includes('hospital') ||
    value.includes('clinica') ||
    value.includes('laboratorio')
  ) {
    return 'SAUDE'
  }

  return 'OUTRO'
}

function normalizeDestinacao(value?: string | null) {
  return (value || 'OUTRO').toUpperCase()
}

function isHazardousMtr(
  tipoDestinacao?: string | null,
  residuos?: Array<{ descricao?: string; codigoIbama?: string }>,
) {
  if (HAZARDOUS_DESTINATIONS.has(normalizeDestinacao(tipoDestinacao))) return true

  if (!residuos?.length) return false

  return residuos.some((residuo) => {
    const raw = `${residuo.descricao || ''} ${residuo.codigoIbama || ''}`
    const text = sanitize(raw)
    return (
      text.includes('infectante') ||
      text.includes('oleo') ||
      text.includes('solvente') ||
      text.includes('contamin') ||
      text.includes('quimic')
    )
  })
}

function kpiStatusFromPct(value: number, warningThreshold: number, criticalThreshold: number): KpiHealth {
  if (value <= criticalThreshold) return 'critical'
  if (value <= warningThreshold) return 'warning'
  return 'ok'
}

function inverseKpiStatusFromPct(
  value: number,
  warningThreshold: number,
  criticalThreshold: number,
): KpiHealth {
  if (value >= criticalThreshold) return 'critical'
  if (value >= warningThreshold) return 'warning'
  return 'ok'
}

export function useDashboardIntelligence() {
  const [dismissedFederalIds, setDismissedFederalIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.DISMISSED_FEDERAL_OBLIGATIONS)
      if (saved) setDismissedFederalIds(JSON.parse(saved))
    }
  }, [])

  const { metrics, isLoading: isLoadingDashboard } = useDashboard()
  const { licencas = [], isLoading: isLoadingLicencas } = useLicencas()
  const { condicionantes = [], isLoading: isLoadingCondicionantes } = useCondicionantes()
  const { mtrs = [], isLoading: isLoadingMtrs } = useResiduos()
  const { cdfs, isLoading: isLoadingCdfs } = useCDFs()
  const { clientes = [], isLoading: isLoadingClientes } = useClientes()
  const { tasks = [], isLoading: isLoadingTasks } = useTasks()

  return useMemo(() => {
    const now = new Date()

    const clientMap = new Map(clientes.map((cliente) => [cliente.id, cliente]))

    const licenseSummary = licencas.reduce(
      (acc, licenca) => {
        const dias =
          typeof licenca.diasAteVencimento === 'number'
            ? licenca.diasAteVencimento
            : daysUntil(parseDate(licenca.dataValidade), now)

        const isExpired = licenca.status === 'VENCIDA' || dias < 0
        const isPending =
          !isExpired && (licenca.status === 'EM_RENOVACAO' || licenca.status === 'AGUARDANDO_EMISSAO' || dias <= 120)

        if (isExpired) {
          acc.vencidas += 1
        } else if (isPending) {
          acc.pendentes += 1
        } else {
          acc.ativas += 1
        }

        return acc
      },
      { ativas: 0, pendentes: 0, vencidas: 0 },
    )

    const condAtrasadas = condicionantes.filter((item) => item.status === 'ATRASADA').length
    const condAvaliadas = condicionantes.filter((item) => ['CUMPRIDA', 'ATRASADA'].includes(item.status))

    const condicionantesNoPrazo = condAvaliadas.filter((item) => {
      if (item.status !== 'CUMPRIDA') return false
      if (typeof item.diasRestantes !== 'number') return true
      return item.diasRestantes >= 0
    }).length

    const taxaCondicionantesNoPrazo = ratioPct(condicionantesNoPrazo, condAvaliadas.length || 1)

    const mtrsDivergentes = mtrs.filter((mtr) => mtr.status === 'COM_DIVERGENCIA').length

    const obgFederaisAtrasadas = 3 - dismissedFederalIds.length
    const naoConformidades =
      metrics?.pendenciasCriticas ?? (licenseSummary.vencidas + condAtrasadas + mtrsDivergentes + (obgFederaisAtrasadas > 0 ? obgFederaisAtrasadas : 0))

    const universoConformidade = Math.max(licencas.length + condicionantes.length + mtrs.length, 1)
    const indiceNaoConformidades = ratioPct(naoConformidades, universoConformidade)

    const drafts = buildMonthDrafts(now, 6)
    const draftMap = new Map(drafts.map((item) => [item.monthKey, item]))

    const cdfByMtr = new Map<string, (typeof cdfs)[number]>()
    cdfs.forEach((cdf) => {
      cdf.mtrIds.forEach((mtrId) => {
        cdfByMtr.set(mtrId, cdf)
      })
    })

    const traceabilityRows: DashboardTraceabilityRow[] = []

    mtrs.forEach((mtr) => {
      const mtrDate = parseDate(mtr.dataEmissao)
      const key = mtrDate ? monthKey(mtrDate) : ''
      const draft = draftMap.get(key)

      const volumeTon = toTon(mtr.volume, mtr.unidadeMedida)
      const destinacao = normalizeDestinacao(mtr.tipoDestinacao)
      const unitCost = DESTINATION_COST_BY_TON[destinacao] ?? DESTINATION_COST_BY_TON.OUTRO
      const surcharge = mtr.status === 'COM_DIVERGENCIA' ? 1.12 : 1
      const cost = volumeTon * unitCost * surcharge

      const combustivel = volumeTon * (destinacao === 'ATERRO_INDUSTRIAL' ? 14 : 11.5)
      const co2 = combustivel * 2.68 / 1000
      const agua = volumeTon * 0.82
      const energia = volumeTon * 26.4

      if (draft) {
        draft.residuosTon += volumeTon
        draft.custoTotal += cost
        draft.combustivelLitros += combustivel
        draft.co2Total += co2
        draft.aguaM3 += agua
        draft.energiaKwh += energia

        if (DIVERSION_DESTINATIONS.has(destinacao)) {
          draft.desviadosTon += volumeTon
        }

        if (isHazardousMtr(mtr.tipoDestinacao, mtr.residuos)) {
          draft.perigososTon += volumeTon
        }

        if (mtr.status === 'COM_DIVERGENCIA') {
          draft.naoConformidades += 1
        }
      }

      const relatedCdf = cdfByMtr.get(mtr.id)

      traceabilityRows.push({
        id: mtr.id,
        monthKey: key,
        referencia: mtr.numeroMTR || `MTR-${mtr.id.substring(0, 8)}`,
        cliente: clientMap.get(mtr.clienteId)?.nome || 'Cliente não identificado',
        status: mtr.status,
        tipoDestinacao: mtr.tipoDestinacao,
        volumeTon,
        custoEstimado: cost,
        dataMovimento: mtrDate,
        mtrId: mtr.id,
        cdfId: relatedCdf?.id,
        cdfNumero: relatedCdf?.numeroCdf,
        destino: `/mtrs/${mtr.id}`,
      })
    })

    condicionantes
      .filter((item) => item.status === 'ATRASADA')
      .forEach((item) => {
        const referenceDate = parseDate(item.prazo) || parseDate(item.proximoPrazo)
        if (!referenceDate) return
        const draft = draftMap.get(monthKey(referenceDate))
        if (draft) {
          draft.naoConformidades += 1
        }
      })

    licencas
      .filter((item) => item.status === 'VENCIDA')
      .forEach((item) => {
        const referenceDate = parseDate(item.dataValidade)
        if (!referenceDate) return
        const draft = draftMap.get(monthKey(referenceDate))
        if (draft) {
          draft.naoConformidades += 1
        }
      })

    const trendPoints: DashboardTrendPoint[] = drafts.map((draft) => {
      const desvioAterroPct = ratioPct(draft.desviadosTon, draft.residuosTon || 1)
      const perigososPct = ratioPct(draft.perigososTon, draft.residuosTon || 1)
      const custoPorTon = draft.residuosTon > 0 ? draft.custoTotal / draft.residuosTon : 0
      const co2PorUnidade = draft.residuosTon > 0 ? draft.co2Total / draft.residuosTon : 0

      return {
        monthKey: draft.monthKey,
        mes: draft.mes,
        residuosTon: Number(draft.residuosTon.toFixed(2)),
        desvioAterroPct: Number(desvioAterroPct.toFixed(1)),
        custoTotal: Number(draft.custoTotal.toFixed(2)),
        custoPorTon: Number(custoPorTon.toFixed(2)),
        perigososPct: Number(perigososPct.toFixed(1)),
        co2PorUnidade: Number(co2PorUnidade.toFixed(3)),
        combustivelLitros: Number(draft.combustivelLitros.toFixed(1)),
        aguaM3: Number(draft.aguaM3.toFixed(1)),
        energiaKwh: Number(draft.energiaKwh.toFixed(1)),
        naoConformidades: draft.naoConformidades,
        multas: Math.max(0, Math.round(draft.naoConformidades * 0.35)),
      }
    })

    const current = trendPoints[trendPoints.length - 1] || {
      monthKey: monthKey(now),
      mes: monthLabel(now),
      residuosTon: 0,
      desvioAterroPct: 0,
      custoTotal: 0,
      custoPorTon: 0,
      perigososPct: 0,
      co2PorUnidade: 0,
      combustivelLitros: 0,
      aguaM3: 0,
      energiaKwh: 0,
      naoConformidades: 0,
      multas: 0,
    }

    const previous = trendPoints[trendPoints.length - 2] || current

    const totalLicencasMonitoradas =
      licenseSummary.ativas + licenseSummary.pendentes + licenseSummary.vencidas

    const licencasValidasPct = ratioPct(licenseSummary.ativas, totalLicencasMonitoradas || 1)
    const licencasAVencerPct = ratioPct(licenseSummary.pendentes, totalLicencasMonitoradas || 1)

    const multasHistoricas = trendPoints.reduce((acc, item) => acc + item.multas, 0)

    const coberturaCdfPct = ratioPct(
      traceabilityRows.filter((row) => row.cdfId).length,
      Math.max(traceabilityRows.length, 1),
    )

    const riskScore = clamp(
      Math.round(
        ratioPct(
          licenseSummary.vencidas * 2 + condAtrasadas + mtrsDivergentes,
          Math.max(totalLicencasMonitoradas + condicionantes.length + mtrs.length, 1),
        ),
      ),
      0,
      100,
    )

    const insights: string[] = []

    if (licenseSummary.vencidas > 0) {
      insights.push(
        `${licenseSummary.vencidas} licença(s) vencida(s): priorizar renovação para evitar autuações e embargo operacional.`,
      )
    }

    if (taxaCondicionantesNoPrazo < 85) {
      insights.push(
        `Taxa de condicionantes no prazo em ${taxaCondicionantesNoPrazo.toFixed(1)}%: recomendar plano de recuperação com responsáveis por etapa.`,
      )
    }

    if (current.desvioAterroPct < 55) {
      insights.push(
        `Desvio de aterro em ${current.desvioAterroPct.toFixed(1)}% no mês: há oportunidade de ganho com reciclagem e compostagem.`,
      )
    }

    if (coberturaCdfPct < 70) {
      insights.push(
        `Cobertura de rastreabilidade MTR→CDF em ${coberturaCdfPct.toFixed(1)}%: consolidar emissão de CDF para fechar trilha documental.`,
      )
    }

    if (!insights.length) {
      insights.push('Operação estável no mês atual. Manter cadência de revisão para sustentar conformidade.')
    }

    const complianceSection: DashboardKpiSection = {
      id: 'compliance',
      title: 'Conformidade Legal e Obrigações',
      description: 'Segurança jurídica, cumprimento de condicionantes e exposição regulatória IBAMA.',
      kpis: [
        {
          id: 'licencas-validas',
          label: 'Licenças válidas vs. a vencer',
          value: `${formatPct(licencasValidasPct)} / ${formatPct(licencasAVencerPct)}`,
          helper: `${licenseSummary.ativas} ativas, ${licenseSummary.pendentes} a vencer, ${licenseSummary.vencidas} vencidas`,
          status: kpiStatusFromPct(licencasValidasPct, 88, 75),
        },
        {
          id: 'condicionantes-prazo',
          label: 'Condicionantes atendidas no prazo',
          value: formatPct(taxaCondicionantesNoPrazo),
          helper: `${condicionantesNoPrazo}/${condAvaliadas.length || 0} condicionantes concluídas no prazo`,
          status: kpiStatusFromPct(taxaCondicionantesNoPrazo, 85, 70),
          trend: Number((taxaCondicionantesNoPrazo - ratioPct(previous.naoConformidades, 10)).toFixed(1)),
        },
        {
          id: 'nao-conformidades',
          label: 'Índice de não conformidades',
          value: formatPct(indiceNaoConformidades),
          helper: `${naoConformidades} ocorrências críticas sobre ${universoConformidade} itens monitorados`,
          status: inverseKpiStatusFromPct(indiceNaoConformidades, 8, 14),
        },
        {
          id: 'multas-historico',
          label: 'Risco Financeiro (Multas Previstas)',
          value: `R$ ${(multasHistoricas * 4500).toLocaleString('pt-BR')}`,
          helper: 'Estimativa baseada na severidade das não conformidades mensais monitoradas',
          status: multasHistoricas > 6 ? 'warning' : 'info',
        },
      ],
    }

    const wasteSection: DashboardKpiSection = {
      id: 'waste',
      title: 'Economia Circular e Resíduos',
      description: 'Volume gerado, métricas de desvio de aterro e custo de destinação.',
      kpis: [
        {
          id: 'volume-total',
          label: 'Volume total de resíduos',
          value: `${current.residuosTon.toFixed(1)} ton`,
          helper: `Movimentação consolidada em ${current.mes}`,
          status: 'info',
          trend: Number((current.residuosTon - previous.residuosTon).toFixed(1)),
        },
        {
          id: 'desvio-aterro',
          label: 'Taxa de desvio de aterro',
          value: formatPct(current.desvioAterroPct),
          helper: 'Percentual destinado a reciclagem, compostagem, coprocessamento e rotas de valorização',
          status: kpiStatusFromPct(current.desvioAterroPct, 60, 45),
        },
        {
          id: 'custo-logistico',
          label: 'Custo logístico por tonelada',
          value: `R$ ${current.custoPorTon.toFixed(0)}/ton`,
          helper: 'Estimativa com base na rota de destinação, volume e ocorrências com divergência',
          status: inverseKpiStatusFromPct(current.custoPorTon, 420, 520),
        },
        {
          id: 'residuos-perigosos',
          label: 'Percentual de resíduos perigosos',
          value: formatPct(current.perigososPct),
          helper: 'Classificação por tipo de destinação e descrição técnica do resíduo',
          status: inverseKpiStatusFromPct(current.perigososPct, 22, 35),
        },
      ],
    }

    const emissionsSection: DashboardKpiSection = {
      id: 'emissions',
      title: 'Sustentabilidade e Recursos (ESG)',
      description: 'Emissões evitadas/geradas e acompanhamento de recursos.',
      kpis: [
        {
          id: 'co2-intensidade',
          label: 'Emissão de CO2 por unidade produzida',
          value: `${current.co2PorUnidade.toFixed(3)} tCO2e/ton`,
          helper: 'Intensidade estimada com base no volume movimentado e perfil de destinação',
          status: inverseKpiStatusFromPct(current.co2PorUnidade, 0.85, 1.05),
        },
        {
          id: 'combustivel-frota',
          label: 'Consumo de combustíveis fósseis',
          value: `${current.combustivelLitros.toFixed(0)} L`,
          helper: 'Consumo logístico mensal da frota vinculada às remessas de resíduos',
          status: inverseKpiStatusFromPct(current.combustivelLitros, 1800, 2600),
          trend: Number((current.combustivelLitros - previous.combustivelLitros).toFixed(1)),
        },
        {
          id: 'consumo-hidrico',
          label: 'Uso racional de recursos hídricos',
          value: `${current.aguaM3.toFixed(1)} m3`,
          helper: 'Indicador mensal proxy para priorização de medidas de redução de consumo',
          status: inverseKpiStatusFromPct(current.aguaM3, 120, 190),
        },
        {
          id: 'consumo-energetico',
          label: 'Uso racional de energia',
          value: `${current.energiaKwh.toFixed(0)} kWh`,
          helper: 'Consumo estimado para suportar comparativos históricos de eficiência operacional',
          status: inverseKpiStatusFromPct(current.energiaKwh, 3500, 5200),
        },
      ],
    }

    const sectorMtrs = {
      AGRONEGOCIO: { total: 0, perigosos: 0 },
      ENERGIA: { total: 0, perigosos: 0 },
      SAUDE: { total: 0, perigosos: 0 },
    }

    mtrs.forEach((mtr) => {
      const cliente = clientMap.get(mtr.clienteId)
      const setor = classifySector(cliente?.setor)
      if (setor === 'OUTRO') return

      const volumeTon = toTon(mtr.volume, mtr.unidadeMedida)
      const perigoso = isHazardousMtr(mtr.tipoDestinacao, mtr.residuos)
      sectorMtrs[setor].total += volumeTon
      if (perigoso) {
        sectorMtrs[setor].perigosos += volumeTon
      }
    })

    const sectorPresence = {
      AGRONEGOCIO: clientes.some((cliente) => classifySector(cliente.setor) === 'AGRONEGOCIO'),
      ENERGIA: clientes.some((cliente) => classifySector(cliente.setor) === 'ENERGIA'),
      SAUDE: clientes.some((cliente) => classifySector(cliente.setor) === 'SAUDE'),
    }

    const agronegocioDefensivos = sectorPresence.AGRONEGOCIO
      ? clamp(1.2 + ratioPct(sectorMtrs.AGRONEGOCIO.perigosos, sectorMtrs.AGRONEGOCIO.total || 1) / 40, 0.8, 3.4)
      : 0

    const energiaRenovavel = sectorPresence.ENERGIA
      ? clamp(52 + current.desvioAterroPct * 0.38, 35, 96)
      : 0

    const saudeInfectantes = sectorPresence.SAUDE
      ? ratioPct(sectorMtrs.SAUDE.perigosos, sectorMtrs.SAUDE.total || 1)
      : 0

    const sectorMetrics: DashboardSectorMetric[] = [
      {
        id: 'setor-agro',
        setor: 'AGRONEGOCIO',
        label: 'Uso de defensivos por hectare',
        value: sectorPresence.AGRONEGOCIO ? `${agronegocioDefensivos.toFixed(2)} L/ha` : 'Sem base setorial',
        helper: sectorPresence.AGRONEGOCIO
          ? 'Estimativa calibrada pela periculosidade e perfil de geração do cliente agro'
          : 'Cadastre clientes do agronegócio para habilitar o indicador',
        status: sectorPresence.AGRONEGOCIO ? inverseKpiStatusFromPct(agronegocioDefensivos, 2, 2.8) : 'info',
      },
      {
        id: 'setor-energia',
        setor: 'ENERGIA',
        label: 'Percentual de matriz renovável',
        value: sectorPresence.ENERGIA ? formatPct(energiaRenovavel) : 'Sem base setorial',
        helper: sectorPresence.ENERGIA
          ? 'Proxy da matriz limpa considerando recuperação e reuso ao longo do ciclo operacional'
          : 'Cadastre clientes de energia para habilitar o indicador',
        status: sectorPresence.ENERGIA ? kpiStatusFromPct(energiaRenovavel, 65, 48) : 'info',
      },
      {
        id: 'setor-saude',
        setor: 'SAUDE',
        label: 'Resíduos infectantes vs comuns',
        value: sectorPresence.SAUDE ? formatPct(saudeInfectantes) : 'Sem base setorial',
        helper: sectorPresence.SAUDE
          ? 'Percentual de resíduos infectantes em relação ao total de resíduos da carteira de saúde'
          : 'Cadastre clientes do setor de saúde para habilitar o indicador',
        status: sectorPresence.SAUDE ? inverseKpiStatusFromPct(saudeInfectantes, 25, 40) : 'info',
      },
    ]

    const obrigacoesOficiais: DashboardDeadlineItem[] = OFFICIAL_OBLIGATIONS.map(ob => {
      const limitDate = new Date(now.getFullYear(), ob.mes, ob.dia)
      // Ajuste para TCFA4 que vence no ano seguinte
      if (ob.id === 'tcfa4' && now.getMonth() >= 9) {
        limitDate.setFullYear(now.getFullYear() + 1)
      }
      
      const dias = daysUntil(limitDate, now)
      let urgencia: DashboardDeadlineItem['urgencia'] = 'BAIXA'
      if (dias <= 15) urgencia = 'ALTA'
      else if (dias <= 45) urgencia = 'MEDIA'
      
      return { 
        id: ob.id,
        tipo: 'OBRIGACAO' as const,
        titulo: ob.titulo,
        subtitulo: ob.subtitulo,
        dataLimite: limitDate,
        diasRestantes: dias,
        urgencia,
        destino: '/agenda',
        status: dias < 0 ? 'ATRASADA' : 'PENDENTE'
      }
    }).filter(ob => 
      ob.diasRestantes > -30 && 
      ob.diasRestantes <= (ob.notificacaoPadraoDias ?? 45) && 
      !dismissedFederalIds.includes(ob.id)
    )

    const deadlines: DashboardDeadlineItem[] = [
      ...obrigacoesOficiais,
      ...licencas
        .map((licenca) => {
          const date = parseDate(licenca.dataValidade)
          const dias =
            typeof licenca.diasAteVencimento === 'number'
              ? licenca.diasAteVencimento
              : daysUntil(date, now)

          if (!Number.isFinite(dias)) return null

          if (dias > 180 && !['VENCIDA', 'EM_RENOVACAO', 'AGUARDANDO_EMISSAO'].includes(licenca.status)) {
            return null
          }

          let urgencia: DashboardDeadlineItem['urgencia'] = 'BAIXA'
          if (dias <= 15) urgencia = 'ALTA'
          else if (dias <= 45) urgencia = 'MEDIA'

          return {
            id: licenca.id,
            tipo: 'LICENCA' as const,
            titulo: `${licenca.tipo} ${licenca.numeroLicenca ? `• ${licenca.numeroLicenca}` : ''}`,
            subtitulo: clientMap.get(licenca.clienteId)?.nome || 'Cliente não identificado',
            dataLimite: date,
            diasRestantes: dias,
            urgencia,
            destino: `/licencas/${licenca.id}`,
            status: licenca.status,
          }
        })
        .filter((item): item is DashboardDeadlineItem => item !== null),
      ...condicionantes
        .map((condicionante) => {
          const date = parseDate(condicionante.prazo) || parseDate(condicionante.proximoPrazo)
          const dias =
            typeof condicionante.diasRestantes === 'number'
              ? condicionante.diasRestantes
              : daysUntil(date, now)

          if (!Number.isFinite(dias)) return null

          // Usar notificacaoDias se definido, caso contrário default de 30 dias
          const showThreshold = (condicionante as any).notificacaoDias ?? 30
          if (dias > showThreshold && condicionante.status !== 'ATRASADA') {
            return null
          }

          let urgencia: DashboardDeadlineItem['urgencia'] = 'BAIXA'
          if (dias <= 10) urgencia = 'ALTA'
          else if (dias <= 30) urgencia = 'MEDIA'

          return {
            id: condicionante.id,
            tipo: 'CONDICIONANTE' as const,
            titulo: condicionante.descricao,
            subtitulo: condicionante.clienteNome,
            dataLimite: date,
            diasRestantes: dias,
            urgencia,
            destino: `/condicionantes/${condicionante.id}`,
            status: condicionante.status,
          }
        })
        .filter((item): item is DashboardDeadlineItem => item !== null),
      ...tasks
        .map((task) => {
          const date = parseDate(task.dataPrazo)
          const dias = daysUntil(date, now)

          if (!Number.isFinite(dias)) return null

          // Só mostra se estiver NO prazo de notificação ou se estiver ATRASADO (e não concluído)
          // Default de 5 dias para tarefas se não definido
          const showThreshold = task.notificacaoDias ?? 5
          if (dias > showThreshold && task.status !== 'ATRASADO' && task.status !== 'A_FAZER') {
            return null
          }

          if (task.status === 'CONCLUIDO') return null

          let urgencia: DashboardDeadlineItem['urgencia'] = 'BAIXA'
          if (dias <= 2) urgencia = 'ALTA'
          else if (dias <= 5) urgencia = 'MEDIA'

          return {
            id: task.id,
            tipo: 'CONDICIONANTE' as any, // Reusing icon/style for now or map to a new category
            titulo: task.titulo,
            subtitulo: 'Tarefa Pessoal',
            dataLimite: date,
            diasRestantes: dias,
            urgencia,
            destino: '/agenda',
            status: task.status,
          }
        })
        .filter((item): item is DashboardDeadlineItem => item !== null),
    ]
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 12)

    const loading =
      isLoadingDashboard ||
      isLoadingLicencas ||
      isLoadingCondicionantes ||
      isLoadingMtrs ||
      isLoadingCdfs ||
      isLoadingClientes ||
      isLoadingTasks

    return {
      isLoading: loading,
      legacyMetrics: metrics,
      sections: [complianceSection, wasteSection, emissionsSection],
      sectorMetrics,
      risk: {
        ativas: licenseSummary.ativas,
        pendentes: licenseSummary.pendentes,
        vencidas: licenseSummary.vencidas,
        score: riskScore,
        insights,
        coberturaCdfPct,
      } as DashboardRiskSnapshot,
      deadlines,
      trendPoints,
      traceabilityRows: traceabilityRows.sort((a, b) => {
        const aTs = a.dataMovimento ? a.dataMovimento.getTime() : 0
        const bTs = b.dataMovimento ? b.dataMovimento.getTime() : 0
        return bTs - aTs
      }),
      monthOptions: trendPoints.map((point) => ({
        monthKey: point.monthKey,
        label: point.mes,
      })),
      defaultMonthKey: current.monthKey,
    }
  }, [
    cdfs,
    clientes,
    condicionantes,
    isLoadingCdfs,
    isLoadingClientes,
    isLoadingCondicionantes,
    isLoadingDashboard,
    isLoadingLicencas,
    isLoadingMtrs,
    licencas,
    metrics,
    mtrs,
    tasks,
  ])
}
