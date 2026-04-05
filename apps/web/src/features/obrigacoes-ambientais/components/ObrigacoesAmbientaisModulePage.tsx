import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import type {
  AtualizarObrigacaoAmbientalDTO,
  CriarObrigacaoAmbientalDTO,
  ObrigacaoAmbientalPadraoOficialDTO,
  ObrigacaoAmbientalResponseDTO,
} from '@greenly/shared'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { formatEnum } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/http-error'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { useClienteContexto } from '@/features/clientes/components/ClienteContextProvider'
import {
  ObrigacaoAmbientalModulo,
  obrigacaoAmbientalService,
} from '@/features/obrigacoes-ambientais/services/obrigacaoAmbientalService'
import { Plus, RefreshCcw, ExternalLink, CheckCircle2, Pencil } from 'lucide-react'

const OBRIGACAO_TIPO_VALUES = [
  'IBAMA_CTF',
  'IBAMA_TCFA',
  'IBAMA_RAPP',
  'SINIR_INVENTARIO_NACIONAL',
  'SINIR_DMR',
  'GEE_INVENTARIO',
  'IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS',
  'IAT_DECLARACAO_CARGA_POLUIDORA',
  'IAT_DECLARACAO_EMISSOES_ATMOSFERICAS',
  'OUTRA',
] as const
type ObrigacaoTipo = (typeof OBRIGACAO_TIPO_VALUES)[number]

const OBRIGACAO_STATUS_VALUES = [
  'PENDENTE',
  'EM_PREENCHIMENTO',
  'ENTREGUE',
  'ATRASADA',
  'DISPENSADA',
] as const
type ObrigacaoStatus = (typeof OBRIGACAO_STATUS_VALUES)[number]

const OBRIGACAO_PERIODICIDADE_VALUES = [
  'MENSAL',
  'TRIMESTRAL',
  'SEMESTRAL',
  'ANUAL',
  'BIENAL',
  'SOB_DEMANDA',
] as const
type ObrigacaoPeriodicidade = (typeof OBRIGACAO_PERIODICIDADE_VALUES)[number]

const MODULO_TIPOS: Record<ObrigacaoAmbientalModulo, Array<ObrigacaoTipo>> =
  {
    IBAMA: ['IBAMA_CTF', 'IBAMA_TCFA', 'IBAMA_RAPP'],
    RESIDUOS: ['SINIR_INVENTARIO_NACIONAL', 'SINIR_DMR', 'IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS'],
    EMISSOES_ATMOSFERICAS: [
      'GEE_INVENTARIO',
      'IAT_DECLARACAO_CARGA_POLUIDORA',
      'IAT_DECLARACAO_EMISSOES_ATMOSFERICAS',
    ],
    IAT: [
      'IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS',
      'IAT_DECLARACAO_CARGA_POLUIDORA',
      'IAT_DECLARACAO_EMISSOES_ATMOSFERICAS',
    ],
  }

function resolveModuloByTipo(
  tipo: ObrigacaoTipo,
  moduloFallback: ObrigacaoAmbientalModulo,
): ObrigacaoAmbientalModulo {
  switch (tipo) {
    case 'IBAMA_CTF':
    case 'IBAMA_TCFA':
    case 'IBAMA_RAPP':
      return 'IBAMA'
    case 'SINIR_INVENTARIO_NACIONAL':
    case 'SINIR_DMR':
    case 'IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS':
      return 'RESIDUOS'
    case 'GEE_INVENTARIO':
    case 'IAT_DECLARACAO_CARGA_POLUIDORA':
    case 'IAT_DECLARACAO_EMISSOES_ATMOSFERICAS':
      return 'EMISSOES_ATMOSFERICAS'
    default:
      return moduloFallback
  }
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDENTE: 'bg-amber-500/15 text-amber-200 border-amber-300/30',
  EM_PREENCHIMENTO: 'bg-sky-500/15 text-sky-200 border-sky-300/30',
  ENTREGUE: 'bg-emerald-500/15 text-emerald-200 border-emerald-300/30',
  ATRASADA: 'bg-rose-500/15 text-rose-200 border-rose-300/30',
  DISPENSADA: 'bg-zinc-500/15 text-zinc-200 border-zinc-300/30',
}

type Props = {
  modulo: ObrigacaoAmbientalModulo
  title: string
  subtitle: string
  tiposPermitidos?: ObrigacaoTipo[]
}

type FormState = {
  clienteId: string
  tipo: ObrigacaoTipo
  titulo: string
  periodicidade: ObrigacaoPeriodicidade
  dataLimite: string
  status: ObrigacaoStatus
  protocolo: string
  portalUrl: string
  observacoes: string
  competenciaAno: string
  competenciaMes: string
  competenciaTrimestre: string
}

function toDateInput(value?: Date | string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0] ?? ''
}

export function ObrigacoesAmbientaisModulePage({
  modulo,
  title,
  subtitle,
  tiposPermitidos,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const anoAtual = new Date().getFullYear()
  const { clientes = [] } = useClientes()
  const { clienteId: globalClienteId } = useClienteContexto()
  const [anoFiltro, setAnoFiltro] = useState<number>(anoAtual)
  const [clienteLocalId, setClienteLocalId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ObrigacaoAmbientalResponseDTO | null>(null)

  const clienteAtivoId = globalClienteId || clienteLocalId || ''

  const tiposDoModulo = tiposPermitidos?.length ? tiposPermitidos : MODULO_TIPOS[modulo]
  const tipoFromQuery = searchParams.get('tipo')
  const tipoFiltro =
    tipoFromQuery && tiposDoModulo.includes(tipoFromQuery as ObrigacaoTipo)
      ? (tipoFromQuery as ObrigacaoTipo)
      : undefined
  const defaultTipo = tipoFiltro ?? tiposDoModulo[0] ?? 'OUTRA'

  const [form, setForm] = useState<FormState>({
    clienteId: clienteAtivoId,
    tipo: defaultTipo,
    titulo: '',
    periodicidade: 'ANUAL',
    dataLimite: '',
    status: 'PENDENTE',
    protocolo: '',
    portalUrl: '',
    observacoes: '',
    competenciaAno: String(anoAtual),
    competenciaMes: '',
    competenciaTrimestre: '',
  })

  useEffect(() => {
    if (editing) return
    setForm((current) => ({
      ...current,
      clienteId: current.clienteId || clienteAtivoId,
    }))
  }, [clienteAtivoId, editing])

  useEffect(() => {
    if (editing) return
    setForm((current) => ({
      ...current,
      tipo: defaultTipo,
    }))
  }, [defaultTipo, editing])

  const { data: obrigacoesRaw = [], isLoading } = useQuery({
    queryKey: ['obrigacoes-ambientais', clienteAtivoId, anoFiltro],
    queryFn: () =>
      obrigacaoAmbientalService.listar({
        clienteId: clienteAtivoId || undefined,
        ano: anoFiltro,
      }),
  })

  const obrigacoes = useMemo(
    () =>
      obrigacoesRaw.filter(
        (item) => tiposDoModulo.includes(item.tipo as ObrigacaoTipo) && (!tipoFiltro || item.tipo === tipoFiltro),
      ),
    [obrigacoesRaw, tipoFiltro, tiposDoModulo],
  )

  const { data: padroesOficiaisRaw = [] } = useQuery({
    queryKey: ['obrigacoes-ambientais-padroes', anoFiltro],
    queryFn: () =>
      obrigacaoAmbientalService.listarPadroesOficiais({
        ano: anoFiltro,
      }),
  })

  const padroesOficiais = useMemo(
    () =>
      padroesOficiaisRaw.filter(
        (item) => tiposDoModulo.includes(item.tipo as ObrigacaoTipo) && (!tipoFiltro || item.tipo === tipoFiltro),
      ),
    [padroesOficiaisRaw, tipoFiltro, tiposDoModulo],
  )

  const resumo = useMemo(() => {
    const total = obrigacoes.length
    const entregues = obrigacoes.filter((o) => o.status === 'ENTREGUE').length
    const atrasadas = obrigacoes.filter((o) => o.status === 'ATRASADA').length
    const pendentes = obrigacoes.filter(
      (o) => o.status === 'PENDENTE' || o.status === 'EM_PREENCHIMENTO',
    ).length
    return {
      total,
      entregues,
      atrasadas,
      pendentes,
      taxa: total > 0 ? Number(((entregues / total) * 100).toFixed(1)) : 0,
    }
  }, [obrigacoes])

  const criarMutation = useMutation({
    mutationFn: (dto: CriarObrigacaoAmbientalDTO) => obrigacaoAmbientalService.criar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obrigacoes-ambientais'] })
    },
  })

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarObrigacaoAmbientalDTO }) =>
      obrigacaoAmbientalService.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obrigacoes-ambientais'] })
    },
  })

  const inicializarMutation = useMutation({
    mutationFn: ({ clienteId, ano }: { clienteId: string; ano: number }) =>
      obrigacaoAmbientalService.inicializarPadrao(clienteId, ano),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['obrigacoes-ambientais'] })
      toast.success(`${data.length} obrigação(ões) padrão criada(s).`)
    },
  })

  function resetForm() {
    const padraoDefault = padroesOficiaisRaw.find((item) => item.tipo === defaultTipo)
    setForm({
      clienteId: clienteAtivoId,
      tipo: defaultTipo,
      titulo: padraoDefault?.titulo ?? '',
      periodicidade: padraoDefault?.periodicidade ?? 'ANUAL',
      dataLimite: toDateInput(padraoDefault?.dataLimite),
      status: 'PENDENTE',
      protocolo: '',
      portalUrl: padraoDefault?.portalUrl ?? '',
      observacoes: '',
      competenciaAno: String(anoFiltro),
      competenciaMes: padraoDefault?.competenciaMes ? String(padraoDefault.competenciaMes) : '',
      competenciaTrimestre: padraoDefault?.competenciaTrimestre
        ? String(padraoDefault.competenciaTrimestre)
        : '',
    })
  }

  function openCreate() {
    setEditing(null)
    resetForm()
    setOpen(true)
  }

  function openEdit(item: ObrigacaoAmbientalResponseDTO) {
    setEditing(item)
    setForm({
      clienteId: item.clienteId,
      tipo: item.tipo,
      titulo: item.titulo,
      periodicidade: item.periodicidade,
      dataLimite: toDateInput(item.dataLimite),
      status: item.status,
      protocolo: item.protocolo || '',
      portalUrl: item.portalUrl || '',
      observacoes: item.observacoes || '',
      competenciaAno: String(item.competenciaAno ?? anoFiltro),
      competenciaMes: item.competenciaMes ? String(item.competenciaMes) : '',
      competenciaTrimestre: item.competenciaTrimestre ? String(item.competenciaTrimestre) : '',
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.clienteId) {
      toast.error('Selecione um cliente.')
      return
    }
    if (!form.titulo.trim()) {
      toast.error('Informe o título da obrigação.')
      return
    }

    try {
      if (editing) {
        await atualizarMutation.mutateAsync({
          id: editing.id,
          dto: {
            titulo: form.titulo,
            periodicidade: form.periodicidade,
            dataLimite: form.dataLimite ? new Date(form.dataLimite) : undefined,
            status: form.status,
            protocolo: form.protocolo || undefined,
            portalUrl: form.portalUrl || undefined,
            observacoes: form.observacoes || undefined,
            competenciaAno: Number(form.competenciaAno) || undefined,
            competenciaMes: Number(form.competenciaMes) || undefined,
            competenciaTrimestre: Number(form.competenciaTrimestre) || undefined,
          },
        })
        toast.success('Obrigação atualizada com sucesso.')
      } else {
        await criarMutation.mutateAsync({
          clienteId: form.clienteId,
          modulo: resolveModuloByTipo(form.tipo, modulo),
          tipo: form.tipo,
          titulo: form.titulo,
          periodicidade: form.periodicidade,
          dataLimite: form.dataLimite ? new Date(form.dataLimite) : undefined,
          status: form.status,
          protocolo: form.protocolo || undefined,
          portalUrl: form.portalUrl || undefined,
          observacoes: form.observacoes || undefined,
          competenciaAno: Number(form.competenciaAno) || undefined,
          competenciaMes: Number(form.competenciaMes) || undefined,
          competenciaTrimestre: Number(form.competenciaTrimestre) || undefined,
        })
        toast.success('Obrigação criada com sucesso.')
      }

      setOpen(false)
      setEditing(null)
      resetForm()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Não foi possível salvar a obrigação.'))
    }
  }

  async function handleMarcarEntregue(item: ObrigacaoAmbientalResponseDTO) {
    try {
      await atualizarMutation.mutateAsync({
        id: item.id,
        dto: {
          status: 'ENTREGUE',
          dataEntrega: new Date(),
        },
      })
      toast.success('Obrigação marcada como entregue.')
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Não foi possível atualizar o status.'))
    }
  }

  async function handleInicializarPadrao() {
    if (!clienteAtivoId) {
      toast.error('Selecione um cliente para inicializar as obrigações.')
      return
    }
    try {
      await inicializarMutation.mutateAsync({ clienteId: clienteAtivoId, ano: anoFiltro })
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Falha ao inicializar obrigações padrão.'))
    }
  }

  function renderCompetenciaPadrao(item: ObrigacaoAmbientalPadraoOficialDTO) {
    if (item.competenciaTrimestre) return `${item.competenciaTrimestre}º tri/${item.competenciaAno}`
    if (item.competenciaMes) return `${String(item.competenciaMes).padStart(2, '0')}/${item.competenciaAno}`
    return String(item.competenciaAno)
  }

  return (
    <AppLayout title={title}>
      <div className="space-y-5">
        <div className="glass-card p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground/70">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:items-end">
            <div className="space-y-1 min-w-0 xl:col-span-4">
              <Label>Cliente</Label>
              <Select
                value={clienteAtivoId || '__all'}
                disabled={!!globalClienteId}
                onValueChange={(v) => setClienteLocalId(v === '__all' ? '' : v)}
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Todos os clientes</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 min-w-0 xl:col-span-2">
              <Label>Ano</Label>
              <Input
                className="w-full"
                type="number"
                value={anoFiltro}
                onChange={(e) => setAnoFiltro(Number(e.target.value) || anoAtual)}
              />
            </div>

            <div className="space-y-1 min-w-0 xl:col-span-4">
              <Label>Submódulo</Label>
              <Select
                value={tipoFiltro ?? '__all'}
                onValueChange={(value) => {
                  const next = new URLSearchParams(searchParams)
                  if (value === '__all') {
                    next.delete('tipo')
                  } else {
                    next.set('tipo', value)
                  }
                  setSearchParams(next, { replace: true })
                }}
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Todos os submódulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Todos os submódulos</SelectItem>
                  {tiposDoModulo.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {formatEnum(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end xl:col-span-2 xl:justify-end">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={handleInicializarPadrao}
                disabled={inicializarMutation.isPending}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Inicializar padrão
              </Button>
              <Button className="w-full sm:w-auto" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova obrigação
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground/70">Total</p>
            <p className="text-2xl font-semibold">{resumo.total}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground/70">Pendentes</p>
            <p className="text-2xl font-semibold text-amber-200">{resumo.pendentes}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground/70">Atrasadas</p>
            <p className="text-2xl font-semibold text-rose-200">{resumo.atrasadas}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground/70">Taxa de conclusão</p>
            <p className="text-2xl font-semibold text-emerald-200">{resumo.taxa}%</p>
          </div>
        </div>

        <div className="glass-card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-medium">Padrão oficial ({anoFiltro})</p>
            <p className="text-xs text-muted-foreground/65 mt-0.5">
              Regras oficiais de emissão, prazos e portais de referência para este módulo.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="bg-white/[0.03] text-left">
                <tr className="text-xs uppercase tracking-[0.1em] text-muted-foreground/65">
                  <th className="px-4 py-3">Obrigação</th>
                  <th className="px-4 py-3">Periodicidade</th>
                  <th className="px-4 py-3">Competência</th>
                  <th className="px-4 py-3">Prazo oficial</th>
                  <th className="px-4 py-3">Portal</th>
                  <th className="px-4 py-3">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {padroesOficiais.map((item) => (
                  <tr key={`${item.tipo}-${item.competenciaTrimestre ?? 'na'}-${item.competenciaMes ?? 'na'}`} className="border-t border-white/[0.06]">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground/65">{item.baseLegal || item.orgao || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatEnum(item.periodicidade)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{renderCompetenciaPadrao(item)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">{item.regraPrazo}</p>
                      <p className="text-xs text-muted-foreground/65 mt-0.5">
                        {item.dataLimite ? `Data de referência: ${new Date(item.dataLimite).toLocaleDateString('pt-BR')}` : 'Sem data fixa única'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.portalUrl ? (
                        <a href={item.portalUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          Acessar portal
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/65">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {item.fontes.map((fonte) => (
                          <a
                            key={fonte.url}
                            href={fonte.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {fonte.titulo}
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {padroesOficiais.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground/65">
                      Sem padrões oficiais cadastrados para este módulo.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-white/[0.03] text-left">
                <tr className="text-xs uppercase tracking-[0.1em] text-muted-foreground/65">
                  <th className="px-4 py-3">Obrigação</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Competência</th>
                  <th className="px-4 py-3">Prazo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Protocolo</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && obrigacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground/65">
                      Nenhuma obrigação encontrada para os filtros atuais.
                    </td>
                  </tr>
                ) : null}

                {obrigacoes.map((item) => (
                  <tr key={item.id} className="border-t border-white/[0.06]">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground/65">{item.orgao || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatEnum(item.tipo)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.competenciaTrimestre ? `${item.competenciaTrimestre}º tri/${item.competenciaAno}` : null}
                      {!item.competenciaTrimestre && item.competenciaMes
                        ? `${String(item.competenciaMes).padStart(2, '0')}/${item.competenciaAno}`
                        : null}
                      {!item.competenciaTrimestre && !item.competenciaMes
                        ? (item.competenciaAno ?? '—')
                        : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.dataLimite ? new Date(item.dataLimite).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_BADGE_CLASS[item.status] || ''}>{formatEnum(item.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.protocolo || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {item.portalUrl ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.portalUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Portal
                            </a>
                          </Button>
                        ) : null}
                        {item.status !== 'ENTREGUE' ? (
                          <Button variant="outline" size="sm" onClick={() => handleMarcarEntregue(item)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Entregue
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar obrigação ambiental' : 'Nova obrigação ambiental'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Cliente</Label>
              <Select
                value={form.clienteId || '__none'}
                onValueChange={(v) => setForm((s) => ({ ...s, clienteId: v === '__none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Selecione</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((s) => ({ ...s, tipo: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposDoModulo.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {formatEnum(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Periodicidade</Label>
              <Select
                value={form.periodicidade}
                onValueChange={(v) => setForm((s) => ({ ...s, periodicidade: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBRIGACAO_PERIODICIDADE_VALUES.map((periodo) => (
                    <SelectItem key={periodo} value={periodo}>
                      {formatEnum(periodo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((s) => ({ ...s, status: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBRIGACAO_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatEnum(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.dataLimite}
                onChange={(e) => setForm((s) => ({ ...s, dataLimite: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Ano</Label>
              <Input
                type="number"
                value={form.competenciaAno}
                onChange={(e) => setForm((s) => ({ ...s, competenciaAno: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Mês</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={form.competenciaMes}
                onChange={(e) => setForm((s) => ({ ...s, competenciaMes: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Trimestre</Label>
              <Input
                type="number"
                min={1}
                max={4}
                value={form.competenciaTrimestre}
                onChange={(e) => setForm((s) => ({ ...s, competenciaTrimestre: e.target.value }))}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Portal URL</Label>
              <Input
                placeholder="https://..."
                value={form.portalUrl}
                onChange={(e) => setForm((s) => ({ ...s, portalUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Protocolo</Label>
              <Input
                value={form.protocolo}
                onChange={(e) => setForm((s) => ({ ...s, protocolo: e.target.value }))}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                rows={3}
                value={form.observacoes}
                onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setEditing(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={criarMutation.isPending || atualizarMutation.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
