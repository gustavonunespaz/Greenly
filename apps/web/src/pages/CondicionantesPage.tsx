import { AppLayout } from '@/components/layout/AppLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { CheckCircle2, ClipboardList, Filter, PlayCircle, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCondicionantes } from '@/features/licencas/hooks/useCondicionantes'
import { useLicencas } from '@/features/licencas/hooks/useLicencas'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { toast } from '@/components/ui/sonner'
import type { StatusCondicionante } from '@greenly/shared'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/empty-state'
import { getApiErrorMessage } from '@/lib/http-error'
import { FormErrorCallout } from '@/components/ui/form-error-callout'
import {
  ActionableFormError,
  buildActionableFormError,
  buildValidationFormError,
} from '@/lib/form-actionable-error'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { trackFirstValidAction, trackFlowCompleted, trackFormError } from '@/lib/telemetry'
import { useClienteContexto } from '@/features/clientes/components/ClienteContextProvider'
import { FormWizard, type WizardStep } from '@/components/ui/form-wizard'
import { ViewToggle, useViewMode } from '@/components/ui/view-toggle'
import { ChevronRight } from 'lucide-react'

const filterLabels: Record<string, string> = {
  TODAS: 'Todas',
  A_CUMPRIR: 'A Cumprir',
  EM_ANDAMENTO: 'Em Andamento',
  ATRASADA: 'Atrasadas',
  CUMPRIDA: 'Cumpridas',
}

type NovoCondicionanteForm = {
  licencaId: string
  descricao: string
  tipo: 'PONTUAL' | 'PERIODICA'
  codigo: string
  prazo: string
  responsavelCliente: string
}

const defaultNovoCondicionanteForm: NovoCondicionanteForm = {
  licencaId: '',
  descricao: '',
  tipo: 'PONTUAL',
  codigo: '',
  prazo: '',
  responsavelCliente: '',
}

export default function CondicionantesPage() {
  const navigate = useNavigate()
  const { id: condicionanteIdParam } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const ultimoDeepLinkProcessado = useRef<string | null>(null)
  const {
    condicionantes,
    isLoading,
    criarCondicionante,
    atualizarStatusCondicionante,
    isCriando,
    isAtualizandoStatus,
    condicionanteAtualizandoId,
  } = useCondicionantes()
  const { licencas = [] } = useLicencas()
  const { clientes = [] } = useClientes()
  const [filter, setFilter] = useState('TODAS')
  const [openCreate, setOpenCreate] = useState(false)
  const [condicionanteDestacadaId, setCondicionanteDestacadaId] = useState<string | null>(null)
  const [novoForm, setNovoForm] = useState<NovoCondicionanteForm>(defaultNovoCondicionanteForm)
  const [formError, setFormError] = useState<ActionableFormError | null>(null)
  
  const { clienteId: globalClienteId, clienteNome: globalClienteNome } = useClienteContexto()
  const rawClienteIdFilter = searchParams.get('clienteId')
  const clienteIdFilter = globalClienteId || rawClienteIdFilter
  const licencaIdPrefill = searchParams.get('licencaId')

  // View mode
  const [viewMode] = useViewMode('condicionantes', 'cards')

  const sorted = [...condicionantes]
    .filter((c) => !clienteIdFilter || c.clienteId === clienteIdFilter)
    .filter((c) => filter === 'TODAS' || c.status === filter)
    .sort((a, b) => {
      const aDias = a.diasRestantes ?? Number.POSITIVE_INFINITY
      const bDias = b.diasRestantes ?? Number.POSITIVE_INFINITY
      return aDias - bDias
    })

  const filters = ['TODAS', 'A_CUMPRIR', 'EM_ANDAMENTO', 'ATRASADA', 'CUMPRIDA']
  const hasCondicionantes = condicionantes.length > 0
  const hasFilterApplied = filter !== 'TODAS' || !!clienteIdFilter
  const isCreateFormReady = !!novoForm.licencaId && !!novoForm.descricao.trim()
  useTrackViewLoaded('condicionantes')
  const clienteMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes])
  const clienteFiltroNome = globalClienteId ? globalClienteNome : (clienteIdFilter ? clienteMap.get(clienteIdFilter) || 'Cliente' : null)
  const licencasParaSelecao = useMemo(() => {
    return [...licencas]
      .filter((licenca) => !clienteIdFilter || licenca.clienteId === clienteIdFilter)
      .sort((a, b) => {
      const nomeA = (clienteMap.get(a.clienteId) || '').toLowerCase()
      const nomeB = (clienteMap.get(b.clienteId) || '').toLowerCase()
      return nomeA.localeCompare(nomeB)
    })
  }, [licencas, clienteIdFilter, clienteMap])

  function applyTrackedFormError(nextError: ActionableFormError, source: 'validation' | 'api') {
    setFormError(nextError)
    trackFormError('condicionantes', 'condicionante_form', nextError, {
      source,
      tipo: novoForm.tipo,
    })
  }

  function openCreateDialog(initialLicencaId?: string | null) {
    setNovoForm({
      ...defaultNovoCondicionanteForm,
      licencaId: initialLicencaId || '',
    })
    setFormError(null)
    setOpenCreate(true)
  }

  useEffect(() => {
    const quickAction = searchParams.get('quickAction')
    if (quickAction !== 'nova-condicionante') return

    openCreateDialog(licencaIdPrefill)
    const params = new URLSearchParams(searchParams)
    params.delete('quickAction')
    setSearchParams(params, { replace: true })
  }, [licencaIdPrefill, searchParams, setSearchParams])

  useEffect(() => {
    if (!condicionanteIdParam || isLoading) return
    if (ultimoDeepLinkProcessado.current === condicionanteIdParam) return

    ultimoDeepLinkProcessado.current = condicionanteIdParam
    const condicionante = condicionantes.find((item) => item.id === condicionanteIdParam)

    if (!condicionante) {
      toast.error('A condicionante deste alerta não está mais disponível.')
      navigate('/condicionantes', { replace: true })
      return
    }

    setFilter('TODAS')
    setCondicionanteDestacadaId(condicionante.id)

    window.setTimeout(() => {
      const elemento = document.getElementById(`condicionante-${condicionante.id}`)
      elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)

    const query = searchParams.toString()
    navigate(query ? `/condicionantes?${query}` : '/condicionantes', { replace: true })
  }, [condicionanteIdParam, condicionantes, isLoading, navigate, searchParams])

  useEffect(() => {
    if (!condicionanteDestacadaId) return

    const timer = window.setTimeout(() => {
      setCondicionanteDestacadaId(null)
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [condicionanteDestacadaId])

  async function handleCriarCondicionante() {
    try {
      setFormError(null)
      if (!novoForm.licencaId) {
        applyTrackedFormError(
          buildValidationFormError('Selecione uma licença para vincular a condicionante.'),
          'validation',
        )
        return
      }

      if (!novoForm.descricao.trim()) {
        applyTrackedFormError(
          buildValidationFormError('Descreva a condicionante antes de salvar.'),
          'validation',
        )
        return
      }

      await criarCondicionante({
        licencaId: novoForm.licencaId,
        dto: {
          licencaId: novoForm.licencaId,
          descricao: novoForm.descricao.trim(),
          tipo: novoForm.tipo,
          codigo: novoForm.codigo || undefined,
          prazo: novoForm.prazo ? new Date(`${novoForm.prazo}T12:00:00`) : undefined,
          responsavelCliente: novoForm.responsavelCliente || undefined,
        },
      })

      toast.success('Condicionante cadastrada com sucesso.')
      trackFirstValidAction('condicionantes', 'criar_condicionante')
      trackFlowCompleted('condicionantes', 'condicionante_criada', {
        tipo: novoForm.tipo,
      })
      setFormError(null)
      setOpenCreate(false)
    } catch (error: unknown) {
      applyTrackedFormError(
        buildActionableFormError(error, 'Não foi possível cadastrar a condicionante.'),
        'api',
      )
    }
  }

  async function handleAtualizarStatus(id: string, status: StatusCondicionante) {
    try {
      await atualizarStatusCondicionante({
        id,
        dto: {
          status,
          dataCumprimento: status === 'CUMPRIDA' ? new Date() : undefined,
        },
      })
      toast.success('Status da condicionante atualizado.')
      trackFirstValidAction('condicionantes', 'atualizar_status_condicionante')
      trackFlowCompleted('condicionantes', 'condicionante_status_atualizado', {
        status,
      })
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar o status.')
      toast.error(message)
    }
  }

  return (
    <AppLayout title="Condicionantes Ambientais">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <ViewToggle storageKey="condicionantes" defaultMode="cards" />
            <div className="h-4 w-px bg-white/[0.08] mx-1" />
            <Filter className="h-3.5 w-3.5 text-muted-foreground/40 mr-1" strokeWidth={1.5} />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filter === f
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                {filterLabels[f]}
                {f === 'ATRASADA' && (
                  <span className="ml-1.5 text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">
                    {condicionantes.filter((c) => c.status === 'ATRASADA').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Button onClick={() => openCreateDialog(licencaIdPrefill)} className="h-9 rounded-xl gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nova Condicionante
          </Button>
        </div>

        {clienteFiltroNome ? (
          <div className="glass-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground/80">
              Exibindo visão micro de <span className="text-foreground font-medium">{clienteFiltroNome}</span>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.delete('clienteId')
                params.delete('licencaId')
                setSearchParams(params, { replace: true })
              }}
              className="rounded-xl"
            >
              Ver todas
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-4 w-full max-w-[540px]" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={
              hasCondicionantes && hasFilterApplied
                ? 'Nenhuma condicionante para o filtro atual'
                : 'Nenhuma condicionante encontrada'
            }
            description={
              hasCondicionantes && hasFilterApplied
                ? "Volte para 'Todas' para revisar o backlog completo."
                : 'Cadastre a primeira condicionante para iniciar o acompanhamento.'
            }
            actionLabel={hasCondicionantes && hasFilterApplied ? 'Ver todas' : 'Nova condicionante'}
            onAction={
              hasCondicionantes && hasFilterApplied
                ? () => {
                    setFilter('TODAS')
                    if (clienteIdFilter) {
                      const params = new URLSearchParams(searchParams)
                      params.delete('clienteId')
                      params.delete('licencaId')
                      setSearchParams(params, { replace: true })
                    }
                  }
                : () => openCreateDialog(licencaIdPrefill)
            }
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sorted.map((c, i) => {
              const isContinuo = !c.prazo;
              const perc = isContinuo ? 100 : c.diasRestantes !== null && c.diasRestantes !== undefined && c.diasRestantes > 0
                ? Math.min(100, Math.max(0, (1 - (c.diasRestantes / 180)) * 100))
                : 100

              const alertColor = isContinuo
                ? 'bg-blue-500/50'
                : (c.diasRestantes ?? 999999) < 0 || c.status === 'ATRASADA'
                ? 'bg-destructive'
                : (c.diasRestantes ?? 999999) <= 30
                ? 'bg-warning'
                : 'bg-primary'

              return (
                <motion.div
                  key={c.id}
                  id={`condicionante-${c.id}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`glass-card hover:bg-white/[0.03] transition-colors p-5 flex flex-col relative overflow-hidden group ${
                    condicionanteDestacadaId === c.id ? 'ring-1 ring-primary/40 bg-primary/5' : ''
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${alertColor}`} />
                  
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-mono font-medium text-muted-foreground/70 bg-white/[0.06] px-1.5 py-0.5 rounded">
                          {c.codigo || `ID-${c.id.substring(0, 8)}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {c.tipo === 'PERIODICA' ? 'Periódica' : 'Pontual'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2" title={c.descricao}>
                        {c.descricao}
                      </h3>
                      <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-1 flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0">
                          {c.clienteNome?.charAt(0) || '-'}
                        </span>
                        {c.clienteNome}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="mb-5 bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                        Prazo
                      </span>
                      <span className={`text-[11px] font-semibold ${
                        isContinuo ? 'text-blue-400' :
                        (c.diasRestantes ?? 999999) < 0
                          ? 'text-destructive'
                          : (c.diasRestantes ?? 999999) <= 30
                          ? 'text-warning'
                          : 'text-foreground'
                      }`}>
                        {isContinuo
                          ? 'Contínuo'
                          : c.diasRestantes === null || c.diasRestantes === undefined
                          ? '—'
                          : c.diasRestantes < 0
                          ? `${Math.abs(c.diasRestantes)}d atrasado`
                          : `${c.diasRestantes}d restantes`}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${alertColor}`} 
                        style={{ width: `${perc}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-muted-foreground/60">
                        {isContinuo ? 'Sem expiração' : c.prazo ? new Date(c.prazo).toLocaleDateString('pt-BR') : 'Não definido'}
                      </p>
                      {c.responsavelCliente && (
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                          R: {c.responsavelCliente.split(' ')[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-end gap-1.5 pt-3 border-t border-white/[0.06]">
                    {c.status === 'A_CUMPRIR' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAtualizarStatus(c.id, 'EM_ANDAMENTO')}
                        disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                        className="h-7 text-[11px] px-2.5 rounded-lg"
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Iniciar
                      </Button>
                    ) : null}
                    {c.status !== 'CUMPRIDA' && c.status !== 'DISPENSADA' ? (
                      <Button
                        size="sm"
                        onClick={() => handleAtualizarStatus(c.id, 'CUMPRIDA')}
                        disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                        className="h-7 text-[11px] px-2.5 rounded-lg"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Cumprir
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 hover:bg-white/[0.08]" onClick={() => navigate(`/condicionantes/${c.id}`)}>
                      Detalhes <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[940px]">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Prazo
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Dias
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      id={`condicionante-${c.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className={`border-t border-white/[0.06] hover:bg-white/[0.02] ${
                        condicionanteDestacadaId === c.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {c.codigo || `ID-${c.id.substring(0, 8)}`}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{c.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.tipo === 'PERIODICA' ? 'Periódica' : 'Pontual'} · Responsável:{' '}
                          {c.responsavelCliente || 'Não definido'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.clienteNome}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {!c.prazo ? 'Contínuo' : new Date(c.prazo).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${
                            !c.prazo 
                              ? 'text-blue-400' 
                              : (c.diasRestantes ?? 999999) < 0
                              ? 'text-destructive'
                              : (c.diasRestantes ?? 999999) <= 30
                                ? 'text-warning'
                                : 'text-primary'
                          }`}
                        >
                          {!c.prazo
                            ? '∞'
                            : c.diasRestantes === null || c.diasRestantes === undefined
                            ? '—'
                            : `${c.diasRestantes}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === 'A_CUMPRIR' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAtualizarStatus(c.id, 'EM_ANDAMENTO')}
                              disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                              className="h-8"
                            >
                              <PlayCircle className="h-3.5 w-3.5 mr-1" />
                              Iniciar
                            </Button>
                          ) : null}
                          {c.status !== 'CUMPRIDA' && c.status !== 'DISPENSADA' ? (
                            <Button
                              size="sm"
                              onClick={() => handleAtualizarStatus(c.id, 'CUMPRIDA')}
                              disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                              className="h-8"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Cumprir
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <Dialog
        open={openCreate}
        onOpenChange={(nextOpen) => {
          setOpenCreate(nextOpen)
          if (!nextOpen) {
            setFormError(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Condicionante</DialogTitle>
            <DialogDescription>
              Cadastre uma condicionante e direcione a responsabilidade para execução imediata.
            </DialogDescription>
          </DialogHeader>

          <FormErrorCallout
            error={formError}
            onAction={() => {
              if (!formError) return
              if (formError.actionKind === 'retry') {
                void handleCriarCondicionante()
                return
              }
              setFormError(null)
            }}
          />
          <FormWizard
            isSubmitting={isCriando}
            onCancel={() => setOpenCreate(false)}
            onComplete={handleCriarCondicionante}
            steps={[
              {
                id: 'step1',
                label: 'Origem',
                isValid: !!novoForm.licencaId,
                content: (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Licença vinculada *</Label>
                      <Select
                        value={novoForm.licencaId}
                        onValueChange={(value) => setNovoForm((s) => ({ ...s, licencaId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma licença" />
                        </SelectTrigger>
                        <SelectContent>
                          {licencasParaSelecao.map((licenca) => (
                            <SelectItem key={licenca.id} value={licenca.id}>
                              {clienteMap.get(licenca.clienteId) || 'Cliente'} -{' '}
                              {licenca.numeroLicenca || licenca.tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        Se a licença não estiver na lista, é preciso cadastrá-la primeiro em "Licenças".
                      </p>
                    </div>
                  </div>
                )
              },
              {
                id: 'step2',
                label: 'Descrição',
                isValid: !!novoForm.descricao.trim(),
                content: (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={novoForm.tipo}
                          onValueChange={(value: 'PONTUAL' | 'PERIODICA') =>
                            setNovoForm((s) => ({ ...s, tipo: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PONTUAL">Pontual</SelectItem>
                            <SelectItem value="PERIODICA">Periódica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Código</Label>
                        <Input
                          value={novoForm.codigo}
                          onChange={(e) => setNovoForm((s) => ({ ...s, codigo: e.target.value }))}
                          placeholder="Ex: COND-01"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição da Exigência *</Label>
                      <Input
                        value={novoForm.descricao}
                        onChange={(e) => setNovoForm((s) => ({ ...s, descricao: e.target.value }))}
                        placeholder="Descreva o requisito da condicionante"
                      />
                    </div>
                  </div>
                )
              },
              {
                id: 'step3',
                label: 'Prazo & Responsável',
                content: (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prazo de atendimento</Label>
                        <Input
                          type="date"
                          value={novoForm.prazo}
                          onChange={(e) => setNovoForm((s) => ({ ...s, prazo: e.target.value }))}
                        />
                        <p className="text-[11px] text-muted-foreground/70">Deixe em branco para <strong className="font-medium text-foreground">Monitoramento Contínuo</strong>.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Responsável (cliente)</Label>
                        <Input
                          value={novoForm.responsavelCliente}
                          onChange={(e) => setNovoForm((s) => ({ ...s, responsavelCliente: e.target.value }))}
                          placeholder="Nome do responsável (opcional)"
                        />
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
