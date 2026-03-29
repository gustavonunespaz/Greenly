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
  const sorted = [...condicionantes]
    .filter((c) => filter === 'TODAS' || c.status === filter)
    .sort((a, b) => {
      const aDias = a.diasRestantes ?? Number.POSITIVE_INFINITY
      const bDias = b.diasRestantes ?? Number.POSITIVE_INFINITY
      return aDias - bDias
    })

  const filters = ['TODAS', 'A_CUMPRIR', 'EM_ANDAMENTO', 'ATRASADA', 'CUMPRIDA']
  const hasCondicionantes = condicionantes.length > 0
  const hasFilterApplied = filter !== 'TODAS'
  const isCreateFormReady = !!novoForm.licencaId && !!novoForm.descricao.trim()
  useTrackViewLoaded('condicionantes')
  const clienteMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes])
  const licencasParaSelecao = useMemo(() => {
    return [...licencas].sort((a, b) => {
      const nomeA = (clienteMap.get(a.clienteId) || '').toLowerCase()
      const nomeB = (clienteMap.get(b.clienteId) || '').toLowerCase()
      return nomeA.localeCompare(nomeB)
    })
  }, [licencas, clienteMap])

  function applyTrackedFormError(nextError: ActionableFormError, source: 'validation' | 'api') {
    setFormError(nextError)
    trackFormError('condicionantes', 'condicionante_form', nextError, {
      source,
      tipo: novoForm.tipo,
    })
  }

  function openCreateDialog() {
    setNovoForm(defaultNovoCondicionanteForm)
    setFormError(null)
    setOpenCreate(true)
  }

  useEffect(() => {
    const quickAction = searchParams.get('quickAction')
    if (quickAction !== 'nova-condicionante') return

    openCreateDialog()
    const params = new URLSearchParams(searchParams)
    params.delete('quickAction')
    setSearchParams(params, { replace: true })
  }, [searchParams, setSearchParams])

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

    navigate('/condicionantes', { replace: true })
  }, [condicionanteIdParam, condicionantes, isLoading, navigate])

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
    <AppLayout title="Condicionantes">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
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

          <Button onClick={openCreateDialog} className="h-9 rounded-xl gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nova Condicionante
          </Button>
        </div>

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
              hasCondicionantes && hasFilterApplied ? () => setFilter('TODAS') : openCreateDialog
            }
          />
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
                        {c.prazo ? new Date(c.prazo).toLocaleDateString('pt-BR') : 'Não definido'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${
                            (c.diasRestantes ?? 999999) < 0
                              ? 'text-destructive'
                              : (c.diasRestantes ?? 999999) <= 30
                                ? 'text-warning'
                                : 'text-primary'
                          }`}
                        >
                          {c.diasRestantes === null || c.diasRestantes === undefined
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
          <p className="text-[11px] text-muted-foreground/70">
            Campos marcados com * são obrigatórios para salvar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="space-y-2 md:col-span-2">
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
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Descrição *</Label>
              <Input
                value={novoForm.descricao}
                onChange={(e) => setNovoForm((s) => ({ ...s, descricao: e.target.value }))}
                placeholder="Descreva o requisito da condicionante"
              />
            </div>

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

            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={novoForm.prazo}
                onChange={(e) => setNovoForm((s) => ({ ...s, prazo: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsável (cliente)</Label>
              <Input
                value={novoForm.responsavelCliente}
                onChange={(e) => setNovoForm((s) => ({ ...s, responsavelCliente: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarCondicionante} disabled={isCriando || !isCreateFormReady}>
              {isCriando ? 'Salvando...' : 'Salvar condicionante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
