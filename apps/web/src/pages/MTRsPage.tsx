import { AppLayout } from '@/components/layout/AppLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Truck, Plus, Pencil, Trash2, Save, Link2, Activity, RefreshCcw, Send } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useResiduos } from '@/features/residuos/hooks/useResiduos'
import { residuoService } from '@/features/residuos/services/residuoService'
import { integracaoGovernoService } from '@/features/residuos/services/integracaoGovernoService'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { toast } from '@/components/ui/sonner'
import type { CriarParceiroDTO, GovResourceIntegrationSummaryDTO, MTRResponseDTO } from '@greenly/shared'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '@/lib/http-error'
import { EmptyState } from '@/components/ui/empty-state'
import { FormErrorCallout } from '@/components/ui/form-error-callout'
import {
  ActionableFormError,
  buildActionableFormError,
  buildValidationFormError,
} from '@/lib/form-actionable-error'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { trackFirstValidAction, trackFlowCompleted, trackFormError } from '@/lib/telemetry'

const statusOptions = [
  'EMITIDO',
  'EM_TRANSITO',
  'RECEBIDO',
  'CDF_EMITIDO',
  'CANCELADO',
  'COM_DIVERGENCIA',
]
const unidadeOptions = ['KG', 'TON', 'LITRO', 'M3', 'UNIDADE']
const tipoDestinacaoOptions = [
  'ATERRO_SANITARIO',
  'ATERRO_INDUSTRIAL',
  'INCINERACAO',
  'COPROCESSAMENTO',
  'RECICLAGEM',
  'COMPOSTAGEM',
  'TRATAMENTO_BIOLOGICO',
  'TRATAMENTO_QUIMICO',
  'TRATAMENTO_FISICO',
  'REUTILIZACAO',
  'LOGISTICA_REVERSA',
  'OUTRO',
]

type FormState = {
  clienteId: string
  fonteGeradoraId: string
  transportadoraId: string
  destinadorId: string
  tipoDestinacao: string
  volume: string
  unidadeMedida: string
  numeroMTR: string
  placaVeiculo: string
  nomeMotorista: string
  cpfMotorista: string
  observacoes: string
  status: string
}

const defaultForm: FormState = {
  clienteId: '',
  fonteGeradoraId: '',
  transportadoraId: '',
  destinadorId: '',
  tipoDestinacao: 'INCINERACAO',
  volume: '',
  unidadeMedida: 'KG',
  numeroMTR: '',
  placaVeiculo: '',
  nomeMotorista: '',
  cpfMotorista: '',
  observacoes: '',
  status: 'EMITIDO',
}

function SkeletonMTR() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 w-1/2">
              <div className="flex items-center gap-3">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-5 w-20 rounded-full" />
              </div>
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-32" />
            </div>
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center">
                  <div className="skeleton h-7 w-7 rounded-full" />
                  {j < 3 && <div className="skeleton h-[2px] w-8 mx-[-2px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatIntegracaoFase(fase?: GovResourceIntegrationSummaryDTO['fase'] | null) {
  switch (fase) {
    case 'ENFILEIRADO':
      return 'Na fila'
    case 'PROCESSANDO':
      return 'Processando'
    case 'AGUARDANDO_RECONCILIACAO':
      return 'Aguardando retorno'
    case 'SINCRONIZADO':
      return 'Sincronizado'
    case 'FALHA':
      return 'Falha'
    case 'DLQ':
      return 'DLQ'
    default:
      return 'Sem envio'
  }
}

function integrationBadgeClass(fase?: GovResourceIntegrationSummaryDTO['fase'] | null) {
  switch (fase) {
    case 'SINCRONIZADO':
      return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
    case 'AGUARDANDO_RECONCILIACAO':
    case 'PROCESSANDO':
    case 'ENFILEIRADO':
      return 'bg-amber-500/15 text-amber-100 border-amber-400/30'
    case 'DLQ':
    case 'FALHA':
      return 'bg-rose-500/15 text-rose-100 border-rose-400/30'
    default:
      return 'bg-muted/40 text-muted-foreground border-white/10'
  }
}

export default function MTRsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id: mtrIdParam } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const ultimoMtrDeepLinkProcessado = useRef<string | null>(null)
  const { clientes = [] } = useClientes()
  const {
    mtrs,
    isLoading,
    emitirMTR,
    atualizarMTR,
    avancarStatusMTR,
    removerMTR,
    isEmitindo,
    isAtualizando,
    isRemovendo,
    isAvancandoStatus,
  } = useResiduos()

  const [open, setOpen] = useState(false)
  const [openVinculo, setOpenVinculo] = useState(false)
  const [openNovoParceiro, setOpenNovoParceiro] = useState(false)
  const [openIntegracaoDetalhe, setOpenIntegracaoDetalhe] = useState(false)
  const [integracaoDetalheId, setIntegracaoDetalheId] = useState<string | null>(null)
  const [editing, setEditing] = useState<MTRResponseDTO | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [formError, setFormError] = useState<ActionableFormError | null>(null)
  const clienteIdFilter = searchParams.get('clienteId')
  const [novoParceiro, setNovoParceiro] = useState<{
    nome: string
    cnpj: string
    tipo: 'TRANSPORTADORA' | 'DESTINADOR_FINAL' | 'TRANSPORTADORA_E_DESTINADOR'
    sinirHabilitado: boolean
    sinirCadastroId: string
  }>({
    nome: '',
    cnpj: '',
    tipo: 'TRANSPORTADORA',
    sinirHabilitado: true,
    sinirCadastroId: '',
  })
  const [vinculoForm, setVinculoForm] = useState<{
    clienteId: string
    parceiroId: string
    papel: 'TRANSPORTADORA' | 'DESTINADOR_FINAL'
    sistemaIntegracao: 'SINIR' | 'SIGOR'
    codigoCadastroExterno: string
  }>({
    clienteId: '',
    parceiroId: '',
    papel: 'TRANSPORTADORA',
    sistemaIntegracao: 'SINIR',
    codigoCadastroExterno: '',
  })

  const { data: fontesGeradoras = [], isLoading: isLoadingFontes } = useQuery({
    queryKey: ['fontes-geradoras', form.clienteId],
    queryFn: () => residuoService.listarFontesGeradoras(form.clienteId),
    enabled: !!form.clienteId,
  })

  const { data: vinculosTransportadora = [], isLoading: isLoadingTransportadoras } = useQuery({
    queryKey: ['cliente-parceiros', form.clienteId, 'TRANSPORTADORA'],
    queryFn: () => residuoService.listarParceirosCliente(form.clienteId, 'TRANSPORTADORA'),
    enabled: !!form.clienteId,
  })

  const { data: vinculosDestinador = [], isLoading: isLoadingDestinadores } = useQuery({
    queryKey: ['cliente-parceiros', form.clienteId, 'DESTINADOR_FINAL'],
    queryFn: () => residuoService.listarParceirosCliente(form.clienteId, 'DESTINADOR_FINAL'),
    enabled: !!form.clienteId,
  })

  const { data: parceirosGlobais = [] } = useQuery({
    queryKey: ['parceiros', 'todos'],
    queryFn: () => residuoService.listarParceiros(),
  })

  const { data: govDashboard } = useQuery({
    queryKey: ['gov-dashboard', 24],
    queryFn: () => integracaoGovernoService.getDashboard(24),
  })

  const { data: integracaoDetalhe, isLoading: isLoadingIntegracaoDetalhe } = useQuery({
    queryKey: ['gov-mtr-detail', integracaoDetalheId],
    queryFn: () => integracaoGovernoService.getMtrDetail(integracaoDetalheId!),
    enabled: openIntegracaoDetalhe && !!integracaoDetalheId,
  })

  const reenviarIntegracaoMutation = useMutation({
    mutationFn: (mtrId: string) => integracaoGovernoService.reenviarMtr(mtrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs'] })
      queryClient.invalidateQueries({ queryKey: ['gov-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['gov-mtr-detail'] })
    },
  })

  const reconciliarIntegracaoMutation = useMutation({
    mutationFn: (mtrId: string) => integracaoGovernoService.reconciliarMtr(mtrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs'] })
      queryClient.invalidateQueries({ queryKey: ['gov-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['gov-mtr-detail'] })
    },
  })

  const transportadoras = useMemo(
    () => vinculosTransportadora.map((v) => v.parceiro),
    [vinculosTransportadora],
  )
  const destinadores = useMemo(
    () => vinculosDestinador.map((v) => v.parceiro),
    [vinculosDestinador],
  )

  const vincularParceiroMutation = useMutation({
    mutationFn: () =>
      residuoService.vincularParceiroCliente({
        clienteId: vinculoForm.clienteId,
        parceiroId: vinculoForm.parceiroId,
        papel: vinculoForm.papel,
        sistemaIntegracao: vinculoForm.sistemaIntegracao,
        codigoCadastroExterno: vinculoForm.codigoCadastroExterno || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-parceiros'] })
      toast.success('Parceiro vinculado ao cliente com sucesso.')
      setOpenVinculo(false)
    },
  })

  const criarParceiroMutation = useMutation({
    mutationFn: async () => {
      const dto: CriarParceiroDTO = {
        nome: novoParceiro.nome.trim(),
        cnpj: novoParceiro.cnpj.replace(/\D/g, ''),
        tipo: novoParceiro.tipo,
        sistemaPrincipal: 'SINIR',
        sinirHabilitado: novoParceiro.sinirHabilitado,
        sinirCadastroId: novoParceiro.sinirCadastroId || undefined,
      }
      return residuoService.criarParceiro(dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] })
      toast.success('Parceiro cadastrado com sucesso.')
      setOpenNovoParceiro(false)
      setNovoParceiro({
        nome: '',
        cnpj: '',
        tipo: 'TRANSPORTADORA',
        sinirHabilitado: true,
        sinirCadastroId: '',
      })
    },
  })

  const clientMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes])
  const clienteFiltroNome = clienteIdFilter ? clientMap.get(clienteIdFilter) || 'Cliente' : null
  const partnerMap = useMemo(() => {
    const map = new Map<string, string>()
    parceirosGlobais.forEach((p) => map.set(p.id, p.nome))
    return map
  }, [parceirosGlobais])
  const mtrsFiltrados = useMemo(
    () => (mtrs || []).filter((mtr) => !clienteIdFilter || mtr.clienteId === clienteIdFilter),
    [clienteIdFilter, mtrs],
  )

  const volumeNumber = Number(form.volume)
  const isFormReady =
    !!form.clienteId &&
    !!form.fonteGeradoraId &&
    !!form.transportadoraId &&
    !!form.destinadorId &&
    Number.isFinite(volumeNumber) &&
    volumeNumber > 0
  const isSaving = isEmitindo || isAtualizando || isAvancandoStatus
  const isLoadingParceirosCliente = isLoadingTransportadoras || isLoadingDestinadores
  useTrackViewLoaded('mtrs')

  function applyTrackedFormError(nextError: ActionableFormError, source: 'validation' | 'api') {
    setFormError(nextError)
    trackFormError('mtrs', 'mtr_form', nextError, {
      mode: editing ? 'edit' : 'create',
      source,
    })
  }

  function openCreate(initialClienteId?: string | null) {
    setEditing(null)
    setForm({
      ...defaultForm,
      clienteId: initialClienteId || '',
    })
    setFormError(null)
    setOpen(true)
  }

  function openIntegracao(mtr: MTRResponseDTO) {
    setIntegracaoDetalheId(mtr.id)
    setOpenIntegracaoDetalhe(true)
  }

  function abrirDialogVinculo() {
    setVinculoForm((prev) => ({
      ...prev,
      clienteId: form.clienteId || prev.clienteId,
    }))
    setOpenVinculo(true)
  }

  useEffect(() => {
    const quickAction = searchParams.get('quickAction')
    if (quickAction !== 'novo-mtr') return

    openCreate(clienteIdFilter)
    const params = new URLSearchParams(searchParams)
    params.delete('quickAction')
    setSearchParams(params, { replace: true })
  }, [clienteIdFilter, searchParams, setSearchParams])

  useEffect(() => {
    if (!form.clienteId) return
    setVinculoForm((prev) => ({ ...prev, clienteId: form.clienteId }))
  }, [form.clienteId])

  useEffect(() => {
    if (!mtrIdParam || isLoading) return
    if (ultimoMtrDeepLinkProcessado.current === mtrIdParam) return

    ultimoMtrDeepLinkProcessado.current = mtrIdParam
    const mtr = (mtrs || []).find((item) => item.id === mtrIdParam)

    if (!mtr) {
      toast.error('O MTR deste alerta não está mais disponível.')
      navigate('/mtrs', { replace: true })
      return
    }

    openEdit(mtr)
    const query = searchParams.toString()
    navigate(query ? `/mtrs?${query}` : '/mtrs', { replace: true })
  }, [mtrIdParam, isLoading, mtrs, navigate, searchParams])

  function openEdit(mtr: MTRResponseDTO) {
    setEditing(mtr)
    setForm({
      clienteId: mtr.clienteId,
      fonteGeradoraId: mtr.fonteGeradoraId,
      transportadoraId: mtr.transportadoraId,
      destinadorId: mtr.destinadorId,
      tipoDestinacao: mtr.tipoDestinacao,
      volume: String(mtr.volume),
      unidadeMedida: mtr.unidadeMedida,
      numeroMTR: mtr.numeroMTR || '',
      placaVeiculo: mtr.placaVeiculo || '',
      nomeMotorista: mtr.nomeMotorista || '',
      cpfMotorista: mtr.cpfMotorista || '',
      observacoes: mtr.observacoes || '',
      status: mtr.status,
    })
    setFormError(null)
    setOpen(true)
  }

  async function handleSave() {
    try {
      setFormError(null)
      if (
        !form.clienteId ||
        !form.fonteGeradoraId ||
        !form.transportadoraId ||
        !form.destinadorId
      ) {
        applyTrackedFormError(
          buildValidationFormError(
            'Preencha cliente, fonte geradora, transportadora e destinador.',
          ),
          'validation',
        )
        return
      }

      const volume = Number(form.volume)
      if (!Number.isFinite(volume) || volume <= 0) {
        applyTrackedFormError(
          buildValidationFormError('Informe um volume válido maior que zero.'),
          'validation',
        )
        return
      }

      if (editing) {
        await atualizarMTR({
          id: editing.id,
          dto: {
            clienteId: form.clienteId,
            fonteGeradoraId: form.fonteGeradoraId,
            transportadoraId: form.transportadoraId,
            destinadorId: form.destinadorId,
            tipoDestinacao: form.tipoDestinacao,
            volume,
            unidadeMedida: form.unidadeMedida,
            numeroMTR: form.numeroMTR || undefined,
            placaVeiculo: form.placaVeiculo || undefined,
            nomeMotorista: form.nomeMotorista || undefined,
            cpfMotorista: form.cpfMotorista || undefined,
            observacoes: form.observacoes || undefined,
          },
        })

        if (form.status !== editing.status) {
          await avancarStatusMTR({ id: editing.id, novoStatus: form.status })
        }

        toast.success('MTR atualizado com sucesso.')
        trackFirstValidAction('mtrs', 'editar_mtr')
        trackFlowCompleted('mtrs', 'mtr_atualizado', {
          status: form.status,
          tipoDestinacao: form.tipoDestinacao,
        })
      } else {
        await emitirMTR({
          clienteId: form.clienteId,
          fonteGeradoraId: form.fonteGeradoraId,
          transportadoraId: form.transportadoraId,
          destinadorId: form.destinadorId,
          tipoDestinacao: form.tipoDestinacao,
          volume,
          unidadeMedida: form.unidadeMedida,
          numeroMTR: form.numeroMTR || undefined,
          placaVeiculo: form.placaVeiculo || undefined,
          nomeMotorista: form.nomeMotorista || undefined,
          cpfMotorista: form.cpfMotorista || undefined,
          observacoes: form.observacoes || undefined,
        })
        toast.success('MTR emitido com sucesso.')
        trackFirstValidAction('mtrs', 'emitir_mtr')
        trackFlowCompleted('mtrs', 'mtr_emitido', {
          status: form.status,
          tipoDestinacao: form.tipoDestinacao,
        })
      }

      setFormError(null)
      setOpen(false)
    } catch (error: unknown) {
      applyTrackedFormError(
        buildActionableFormError(error, 'Não foi possível salvar o MTR.'),
        'api',
      )
    }
  }

  async function handleDelete(mtr: MTRResponseDTO) {
    const confirmed = window.confirm(`Excluir o MTR ${mtr.numeroMTR || mtr.id.substring(0, 8)}?`)
    if (!confirmed) return

    try {
      await removerMTR(mtr.id)
      toast.success('MTR excluído com sucesso.')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Não foi possível excluir o MTR.')
      toast.error(message)
    }
  }

  async function handleReenviarIntegracao(mtr: MTRResponseDTO) {
    try {
      await reenviarIntegracaoMutation.mutateAsync(mtr.id)
      toast.success('Reenvio da integração enfileirado.')
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Não foi possível reenviar a integração.'))
    }
  }

  async function handleReconciliarIntegracao(mtr: MTRResponseDTO) {
    try {
      await reconciliarIntegracaoMutation.mutateAsync(mtr.id)
      toast.success('Reconciliação enfileirada com sucesso.')
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Não foi possível reconciliar o MTR.'))
    }
  }

  async function handleCriarParceiro() {
    if (!novoParceiro.nome.trim()) {
      toast.error('Informe o nome do parceiro.')
      return
    }

    if (novoParceiro.cnpj.replace(/\D/g, '').length !== 14) {
      toast.error('CNPJ do parceiro inválido.')
      return
    }

    try {
      await criarParceiroMutation.mutateAsync()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Não foi possível cadastrar o parceiro.'))
    }
  }

  async function handleVincularParceiro() {
    if (!vinculoForm.clienteId || !vinculoForm.parceiroId) {
      toast.error('Selecione cliente e parceiro para criar o vínculo.')
      return
    }

    try {
      await vincularParceiroMutation.mutateAsync()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Não foi possível vincular o parceiro ao cliente.'))
    }
  }

  return (
    <AppLayout title="Manifestos de Transporte (MTR)">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="glass-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Fila Gov
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {govDashboard?.fila.waiting ?? 0}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {govDashboard?.fila.active ?? 0} ativos, {govDashboard?.fila.delayed ?? 0} delayed
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Aguardando retorno
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-100">
              {govDashboard?.totais.aguardandoReconciliacao ?? 0}
            </p>
            <p className="text-xs text-muted-foreground/70">polling e webhooks pendentes</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Sincronizados
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-100">
              {govDashboard?.totais.sincronizados ?? 0}
            </p>
            <p className="text-xs text-muted-foreground/70">últimas 24h de estado consolidado</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Falhas / DLQ
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-100">
              {(govDashboard?.totais.falhas ?? 0) + (govDashboard?.totais.dlq ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground/70">
              DLQ: {govDashboard?.totais.dlq ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground/70">
            Acompanhamento em tempo real das movimentações.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setOpenNovoParceiro(true)}
              className="gap-2 h-9 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Novo parceiro
            </Button>
            <Button variant="outline" onClick={abrirDialogVinculo} className="gap-2 h-9 rounded-xl">
              <Link2 className="h-4 w-4" />
              Vincular parceiro
            </Button>
            <Button onClick={() => openCreate(clienteIdFilter)} className="gap-2 h-9 rounded-xl">
              <Plus className="h-4 w-4" />
              Novo MTR
            </Button>
          </div>
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
                setSearchParams(params, { replace: true })
              }}
              className="rounded-xl"
            >
              Ver todos
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonMTR />
        ) : mtrsFiltrados.length === 0 ? (
          <EmptyState
            icon={Truck}
            title={clienteIdFilter ? 'Nenhum MTR para este cliente' : 'Nenhum MTR emitido'}
            description={
              clienteIdFilter
                ? 'Este cliente ainda não possui manifestos emitidos.'
                : 'Emita o primeiro manifesto para iniciar o controle.'
            }
            actionLabel="Novo MTR"
            onAction={() => openCreate(clienteIdFilter)}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        MTR
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Carga
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Transportadora
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Destinador
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Integração
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mtrsFiltrados.map((mtr, i) => (
                      <motion.tr
                        key={mtr.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                        className="border-t border-white/[0.06] hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-xs text-foreground font-mono">
                          {mtr.numeroMTR || `MTR-${mtr.id.substring(0, 8)}`}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={mtr.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {clientMap.get(mtr.clienteId) || mtr.clienteId}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {mtr.volume} {mtr.unidadeMedida}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {partnerMap.get(mtr.transportadoraId) || mtr.transportadoraId}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {partnerMap.get(mtr.destinadorId) || mtr.destinadorId}
                        </td>
                        <td className="px-4 py-3">
                          {mtr.integracao ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="border-white/10 text-[10px]">
                                  {mtr.integracao.sistema}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${integrationBadgeClass(mtr.integracao.fase)}`}
                                >
                                  {formatIntegracaoFase(mtr.integracao.fase)}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground/70">
                                {mtr.integracao.providerStatus || 'Aguardando primeiro retorno'}
                              </p>
                              {mtr.integracao.ultimoErro ? (
                                <p className="text-[11px] text-rose-200">
                                  {mtr.integracao.ultimoErro}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">
                              Sem integração registrada
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openIntegracao(mtr)}
                              title="Detalhes da integração"
                            >
                              <Activity className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleReconciliarIntegracao(mtr)}
                              disabled={reconciliarIntegracaoMutation.isPending}
                              title="Reconciliar status"
                            >
                              <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleReenviarIntegracao(mtr)}
                              disabled={reenviarIntegracaoMutation.isPending}
                              title="Reenviar integração"
                            >
                              <Send className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEdit(mtr)}
                            >
                              <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(mtr)}
                              disabled={isRemovendo}
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Dialog
        open={openIntegracaoDetalhe}
        onOpenChange={(nextOpen) => {
          setOpenIntegracaoDetalhe(nextOpen)
          if (!nextOpen) setIntegracaoDetalheId(null)
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhe da integração governamental</DialogTitle>
            <DialogDescription>
              Timeline técnica de envio, polling, webhook e retries do manifesto.
            </DialogDescription>
          </DialogHeader>

          {isLoadingIntegracaoDetalhe ? (
            <div className="space-y-3 py-4">
              <div className="skeleton h-14 w-full" />
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-24 w-full" />
            </div>
          ) : !integracaoDetalhe ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-muted-foreground/70">
              Nenhum detalhe de integração disponível para este MTR.
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{integracaoDetalhe.resumo?.sistema ?? 'N/D'}</Badge>
                  <Badge
                    variant="outline"
                    className={integrationBadgeClass(integracaoDetalhe.resumo?.fase ?? null)}
                  >
                    {formatIntegracaoFase(integracaoDetalhe.resumo?.fase ?? null)}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs text-muted-foreground/80">
                  <div>
                    <span className="text-muted-foreground/60">Provider status:</span>{' '}
                    {integracaoDetalhe.resumo?.providerStatus ?? 'N/D'}
                  </div>
                  <div>
                    <span className="text-muted-foreground/60">Protocolo:</span>{' '}
                    {integracaoDetalhe.resumo?.protocolo ?? 'N/D'}
                  </div>
                  <div>
                    <span className="text-muted-foreground/60">Tentativas:</span>{' '}
                    {integracaoDetalhe.resumo?.tentativas ?? 0}
                  </div>
                  <div>
                    <span className="text-muted-foreground/60">Número externo:</span>{' '}
                    {integracaoDetalhe.resumo?.numeroExterno ?? 'N/D'}
                  </div>
                </div>
                {integracaoDetalhe.resumo?.ultimoErro ? (
                  <p className="mt-3 text-xs text-rose-200">
                    Último erro: {integracaoDetalhe.resumo.ultimoErro}
                  </p>
                ) : null}
              </div>

              {integracaoDetalhe.documentosOrigem.length > 0 ? (
                <div className="glass-card p-4">
                  <p className="text-xs font-medium text-foreground">Documentos vinculados</p>
                  <div className="mt-3 space-y-2">
                    {integracaoDetalhe.documentosOrigem.map((documento) => (
                      <div
                        key={documento.id}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground/80"
                      >
                        <div className="font-medium text-foreground">{documento.documentoNome}</div>
                        <div>
                          {documento.tipoDocumento} · {documento.origem}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                {integracaoDetalhe.eventos.map((evento) => (
                  <div key={evento.id} className="glass-card p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{evento.operacao}</Badge>
                        <Badge
                          variant="outline"
                          className={integrationBadgeClass(
                            evento.etapa === 'FAILED' || evento.etapa === 'DLQ'
                              ? 'FALHA'
                              : evento.etapa === 'PROVIDER_ACK' || evento.etapa === 'RECONCILED'
                                ? 'SINCRONIZADO'
                                : 'PROCESSANDO',
                          )}
                        >
                          {evento.etapa}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground/70">
                        tentativa {evento.tentativa}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{evento.mensagem}</p>
                    {evento.providerStatus ? (
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        Provider status: {evento.providerStatus}
                      </p>
                    ) : null}
                    {evento.erro ? (
                      <p className="mt-1 text-xs text-rose-200">{evento.erro}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setFormError(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar MTR' : 'Novo MTR'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Atualize os dados do manifesto selecionado.'
                : 'Emita um novo manifesto de transporte de resíduos.'}
            </DialogDescription>
          </DialogHeader>

          <FormErrorCallout
            error={formError}
            onAction={() => {
              if (!formError) return
              if (formError.actionKind === 'retry') {
                void handleSave()
                return
              }
              setFormError(null)
            }}
          />
          <p className="text-[11px] text-muted-foreground/70">
            Campos marcados com * são obrigatórios para salvar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={form.clienteId}
                onValueChange={(v) =>
                  setForm((s) => ({
                    ...s,
                    clienteId: v,
                    fonteGeradoraId: '',
                    transportadoraId: '',
                    destinadorId: '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fonte Geradora *</Label>
              <Select
                value={form.fonteGeradoraId}
                onValueChange={(v) => setForm((s) => ({ ...s, fonteGeradoraId: v }))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingFontes ? 'Carregando fontes...' : 'Selecione a fonte'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {fontesGeradoras.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.descricao || `Fonte ${f.id.substring(0, 6)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transportadora *</Label>
              <Select
                value={form.transportadoraId}
                onValueChange={(v) => setForm((s) => ({ ...s, transportadoraId: v }))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.clienteId
                        ? 'Selecione um cliente primeiro'
                        : isLoadingParceirosCliente
                          ? 'Carregando vínculos...'
                          : 'Selecione a transportadora'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {form.transportadoraId &&
                  !transportadoras.some((parceiro) => parceiro.id === form.transportadoraId) ? (
                    <SelectItem value={form.transportadoraId}>
                      {partnerMap.get(form.transportadoraId) || 'Transportadora legado'}
                    </SelectItem>
                  ) : null}
                  {transportadoras.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destinador *</Label>
              <Select
                value={form.destinadorId}
                onValueChange={(v) => setForm((s) => ({ ...s, destinadorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.clienteId
                        ? 'Selecione um cliente primeiro'
                        : isLoadingParceirosCliente
                          ? 'Carregando vínculos...'
                          : 'Selecione o destinador'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {form.destinadorId &&
                  !destinadores.some((parceiro) => parceiro.id === form.destinadorId) ? (
                    <SelectItem value={form.destinadorId}>
                      {partnerMap.get(form.destinadorId) || 'Destinador legado'}
                    </SelectItem>
                  ) : null}
                  {destinadores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.clienteId && (!transportadoras.length || !destinadores.length) ? (
              <div className="md:col-span-2 rounded-lg border border-dashed border-primary/35 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                Este cliente ainda não possui vínculos completos de parceiro para MTR.
                <button
                  type="button"
                  onClick={abrirDialogVinculo}
                  className="ml-1 text-primary hover:underline"
                >
                  Vincular agora
                </button>
                .
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Tipo de Destinação</Label>
              <Select
                value={form.tipoDestinacao}
                onValueChange={(v) => setForm((s) => ({ ...s, tipoDestinacao: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipoDestinacaoOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Volume *</Label>
              <Input
                value={form.volume}
                onChange={(e) => setForm((s) => ({ ...s, volume: e.target.value }))}
                placeholder="0.000"
              />
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select
                value={form.unidadeMedida}
                onValueChange={(v) => setForm((s) => ({ ...s, unidadeMedida: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidadeOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número do MTR</Label>
              <Input
                value={form.numeroMTR}
                onChange={(e) => setForm((s) => ({ ...s, numeroMTR: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Placa do Veículo</Label>
              <Input
                value={form.placaVeiculo}
                onChange={(e) =>
                  setForm((s) => ({ ...s, placaVeiculo: e.target.value.toUpperCase() }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Motorista</Label>
              <Input
                value={form.nomeMotorista}
                onChange={(e) => setForm((s) => ({ ...s, nomeMotorista: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>CPF do Motorista</Label>
              <Input
                value={form.cpfMotorista}
                onChange={(e) => setForm((s) => ({ ...s, cpfMotorista: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !isFormReady} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openVinculo} onOpenChange={setOpenVinculo}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Vincular Parceiro ao Cliente</DialogTitle>
            <DialogDescription>
              Defina o papel operacional do parceiro para habilitar emissão de MTR.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-2 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={vinculoForm.clienteId}
                onValueChange={(value) => setVinculoForm((prev) => ({ ...prev, clienteId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parceiro *</Label>
              <Select
                value={vinculoForm.parceiroId}
                onValueChange={(value) =>
                  setVinculoForm((prev) => ({ ...prev, parceiroId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um parceiro cadastrado" />
                </SelectTrigger>
                <SelectContent>
                  {parceirosGlobais.map((parceiro) => (
                    <SelectItem key={parceiro.id} value={parceiro.id}>
                      {parceiro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Papel no cliente *</Label>
              <Select
                value={vinculoForm.papel}
                onValueChange={(value: 'TRANSPORTADORA' | 'DESTINADOR_FINAL') =>
                  setVinculoForm((prev) => ({ ...prev, papel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSPORTADORA">Transportadora</SelectItem>
                  <SelectItem value="DESTINADOR_FINAL">Destinador Final</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Código externo (opcional)</Label>
              <Input
                value={vinculoForm.codigoCadastroExterno}
                onChange={(event) =>
                  setVinculoForm((prev) => ({
                    ...prev,
                    codigoCadastroExterno: event.target.value,
                  }))
                }
                placeholder="ID no SINIR/SIGOR"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenVinculo(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleVincularParceiro}
              disabled={vincularParceiroMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {vincularParceiroMutation.isPending ? 'Vinculando...' : 'Vincular parceiro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openNovoParceiro} onOpenChange={setOpenNovoParceiro}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo Parceiro Operacional</DialogTitle>
            <DialogDescription>
              Cadastre transportadora ou destinador e depois vincule ao cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-2 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={novoParceiro.nome}
                onChange={(event) =>
                  setNovoParceiro((prev) => ({ ...prev, nome: event.target.value }))
                }
                placeholder="Razão social do parceiro"
              />
            </div>

            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input
                value={novoParceiro.cnpj}
                onChange={(event) =>
                  setNovoParceiro((prev) => ({ ...prev, cnpj: event.target.value }))
                }
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de parceiro *</Label>
              <Select
                value={novoParceiro.tipo}
                onValueChange={(
                  value: 'TRANSPORTADORA' | 'DESTINADOR_FINAL' | 'TRANSPORTADORA_E_DESTINADOR',
                ) => setNovoParceiro((prev) => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSPORTADORA">Transportadora</SelectItem>
                  <SelectItem value="DESTINADOR_FINAL">Destinador final</SelectItem>
                  <SelectItem value="TRANSPORTADORA_E_DESTINADOR">
                    Transportadora e destinador
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ID SINIR (opcional)</Label>
              <Input
                value={novoParceiro.sinirCadastroId}
                onChange={(event) =>
                  setNovoParceiro((prev) => ({
                    ...prev,
                    sinirCadastroId: event.target.value,
                  }))
                }
                placeholder="Código de cadastro no SINIR"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNovoParceiro(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCriarParceiro}
              disabled={criarParceiroMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {criarParceiroMutation.isPending ? 'Salvando...' : 'Salvar parceiro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
