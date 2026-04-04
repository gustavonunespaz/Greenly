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
import { Truck, Plus, Pencil, Trash2, Save, Link2, Activity, RefreshCcw, Send, Package, AlertTriangle, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useResiduos } from '@/features/residuos/hooks/useResiduos'
import { residuoService } from '@/features/residuos/services/residuoService'
import { integracaoGovernoService } from '@/features/residuos/services/integracaoGovernoService'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { toast } from '@/components/ui/sonner'
import type { CriarParceiroDTO, GovResourceIntegrationSummaryDTO, MTRResponseDTO, MTRResiduoItemDTO, TipoResiduoOptionDTO } from '@greenly/shared'
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
import { useClienteContexto } from '@/features/clientes/components/ClienteContextProvider'
import { FormWizard, type WizardStep } from '@/components/ui/form-wizard'
import { ViewToggle, useViewMode } from '@/components/ui/view-toggle'
import { ChevronRight } from 'lucide-react'
import { formatEnum } from '@/lib/utils'


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
const estadoFisicoOptions = ['SOLIDO', 'LIQUIDO', 'SEMI_SOLIDO', 'GASOSO', 'PASTOSO']
const classeOptions = ['CLASSE_I_PERIGOSO', 'CLASSE_II_A_NAO_INERTE', 'CLASSE_II_B_INERTE']
const acondicionamentoOptions = ['TAMBOR', 'BIG_BAG', 'CACAMBA', 'CONTAINER', 'GRANEL', 'BOMBONA', 'FARDO', 'SACO', 'CAIXA', 'OUTRO']
const grupoEmbalagemOptions = ['I', 'II', 'III']

const formatClasseResiduo = (c: string) => {
  switch (c) {
    case 'CLASSE_I_PERIGOSO': return 'Classe I – Perigoso'
    case 'CLASSE_II_A_NAO_INERTE': return 'Classe II-A – Não Inerte'
    case 'CLASSE_II_B_INERTE': return 'Classe II-B – Inerte'
    default: return formatEnum(c)
  }
}

const isLicencaExpirada = (p: any) => {
  if (!p.licencaAtiva) return true
  if (!p.licencaValidade) return false
  return new Date(p.licencaValidade) < new Date()
}

type ResiduoFormItem = {
  tipoResiduoId: string
  codigoIbama: string
  descricao: string
  quantidade: string
  unidadeMedida: string
  densidade: string
  estadoFisico: string
  classe: string
  acondicionamento: string
  tecnologiaTratamento: string
  numeroOnu: string
  classeRisco: string
  nomeEmbarque: string
  grupoEmbalagem: string
  codigoInterno: string
  descricaoInterna: string
}

const defaultResiduoItem: ResiduoFormItem = {
  tipoResiduoId: '',
  codigoIbama: '',
  descricao: '',
  quantidade: '',
  unidadeMedida: 'KG',
  densidade: '',
  estadoFisico: '',
  classe: '',
  acondicionamento: '',
  tecnologiaTratamento: '',
  numeroOnu: '',
  classeRisco: '',
  nomeEmbarque: '',
  grupoEmbalagem: '',
  codigoInterno: '',
  descricaoInterna: '',
}

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
  usaArmazenamentoTemporario: boolean
  armazenadorTemporarioId: string
  dataTransporte: string
  residuos: ResiduoFormItem[]
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
  usaArmazenamentoTemporario: false,
  armazenadorTemporarioId: '',
  dataTransporte: '',
  residuos: [],
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
  
  const { clienteId: globalClienteId, clienteNome: globalClienteNome } = useClienteContexto()
  const rawClienteIdFilter = searchParams.get('clienteId')
  const clienteIdFilter = globalClienteId || rawClienteIdFilter

  const [viewMode] = useViewMode('mtrs', 'cards')

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

  const { data: tiposResiduo = [] } = useQuery({
    queryKey: ['tipos-residuo'],
    queryFn: () => residuoService.listarTiposResiduo(),
  })

  const [openResiduoForm, setOpenResiduoForm] = useState(false)
  const [editingResiduoIdx, setEditingResiduoIdx] = useState<number | null>(null)
  const [residuoForm, setResiduoForm] = useState<ResiduoFormItem>(defaultResiduoItem)
  const [residuoSearch, setResiduoSearch] = useState('')

  const filteredTiposResiduo = useMemo(() => {
    if (!residuoSearch.trim()) return tiposResiduo.slice(0, 20)
    const q = residuoSearch.toLowerCase()
    return tiposResiduo.filter(t =>
      t.descricao.toLowerCase().includes(q) ||
      (t.codigoIbama && t.codigoIbama.toLowerCase().includes(q))
    ).slice(0, 20)
  }, [tiposResiduo, residuoSearch])

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

  useTrackViewLoaded('mtrs')

  const clientMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes])
  const clienteFiltroNome = globalClienteId ? globalClienteNome : (clienteIdFilter ? clientMap.get(clienteIdFilter) || 'Cliente' : null)
  const partnerMap = useMemo(() => {
    const map = new Map<string, string>()
    parceirosGlobais.forEach((p) => map.set(p.id, p.nome))
    return map
  }, [parceirosGlobais])
  const mtrsFiltrados = useMemo(
    () => (mtrs || []).filter((mtr) => !clienteIdFilter || mtr.clienteId === clienteIdFilter),
    [clienteIdFilter, mtrs],
  )

  const isFormReady =
    !!form.clienteId &&
    !!form.fonteGeradoraId &&
    !!form.transportadoraId &&
    !!form.destinadorId &&
    form.residuos.length > 0
  const isSaving = isEmitindo || isAtualizando || isAvancandoStatus
  const isLoadingParceirosCliente = isLoadingTransportadoras || isLoadingDestinadores

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
    const residuosForm: ResiduoFormItem[] = (mtr.residuos || []).map(r => ({
      tipoResiduoId: r.tipoResiduoId || '',
      codigoIbama: r.codigoIbama || '',
      descricao: r.descricao || '',
      quantidade: String(r.quantidade),
      unidadeMedida: r.unidadeMedida || 'KG',
      densidade: r.densidade ? String(r.densidade) : '',
      estadoFisico: r.estadoFisico || '',
      classe: r.classe || '',
      acondicionamento: r.acondicionamento || '',
      tecnologiaTratamento: r.tecnologiaTratamento || '',
      numeroOnu: r.numeroOnu || '',
      classeRisco: r.classeRisco || '',
      nomeEmbarque: r.nomeEmbarque || '',
      grupoEmbalagem: r.grupoEmbalagem || '',
      codigoInterno: r.codigoInterno || '',
      descricaoInterna: r.descricaoInterna || '',
    }))
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
      usaArmazenamentoTemporario: mtr.usaArmazenamentoTemporario ?? false,
      armazenadorTemporarioId: mtr.armazenadorTemporarioId || '',
      dataTransporte: mtr.dataTransporte ? new Date(mtr.dataTransporte).toISOString().split('T')[0] : '',
      residuos: residuosForm,
    })
    setFormError(null)
    setOpen(true)
  }

  function buildResiduoDTOs(): MTRResiduoItemDTO[] {
    return form.residuos.map(r => ({
      tipoResiduoId: r.tipoResiduoId || undefined,
      codigoIbama: r.codigoIbama || undefined,
      descricao: r.descricao,
      quantidade: Number(r.quantidade),
      unidadeMedida: r.unidadeMedida,
      densidade: r.densidade ? Number(r.densidade) : undefined,
      estadoFisico: (r.estadoFisico || undefined) as MTRResiduoItemDTO['estadoFisico'],
      classe: (r.classe || undefined) as MTRResiduoItemDTO['classe'],
      acondicionamento: (r.acondicionamento || undefined) as MTRResiduoItemDTO['acondicionamento'],
      tecnologiaTratamento: r.tecnologiaTratamento || undefined,
      numeroOnu: r.numeroOnu || undefined,
      classeRisco: r.classeRisco || undefined,
      nomeEmbarque: r.nomeEmbarque || undefined,
      grupoEmbalagem: (r.grupoEmbalagem || undefined) as MTRResiduoItemDTO['grupoEmbalagem'],
      codigoInterno: r.codigoInterno || undefined,
      descricaoInterna: r.descricaoInterna || undefined,
    }))
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

      if (form.residuos.length === 0) {
        applyTrackedFormError(
          buildValidationFormError('Adicione ao menos um resíduo ao manifesto.'),
          'validation',
        )
        return
      }

      const residuos = buildResiduoDTOs()

      if (editing) {
        await atualizarMTR({
          id: editing.id,
          dto: {
            clienteId: form.clienteId,
            fonteGeradoraId: form.fonteGeradoraId,
            transportadoraId: form.transportadoraId,
            destinadorId: form.destinadorId,
            tipoDestinacao: form.tipoDestinacao,
            numeroMTR: form.numeroMTR || undefined,
            placaVeiculo: form.placaVeiculo || undefined,
            nomeMotorista: form.nomeMotorista || undefined,
            cpfMotorista: form.cpfMotorista || undefined,
            observacoes: form.observacoes || undefined,
            residuos,
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
          numeroMTR: form.numeroMTR || undefined,
          placaVeiculo: form.placaVeiculo || undefined,
          nomeMotorista: form.nomeMotorista || undefined,
          cpfMotorista: form.cpfMotorista || undefined,
          observacoes: form.observacoes || undefined,
          residuos,
          usaArmazenamentoTemporario: form.usaArmazenamentoTemporario || undefined,
          armazenadorTemporarioId: form.armazenadorTemporarioId || undefined,
          dataTransporte: form.dataTransporte ? new Date(form.dataTransporte) : undefined,
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
          <div className="flex items-center gap-2">
            <ViewToggle storageKey="mtrs" defaultMode="cards" />
            <div className="hidden md:block h-4 w-px bg-white/[0.08]" />
            <p className="hidden md:block text-sm text-muted-foreground/70 ml-1">
              Acompanhamento em tempo real das movimentações.
            </p>
          </div>
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
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {mtrsFiltrados.map((mtr, i) => {
              const hasAlert = 
                mtr.status === 'CANCELADO' || 
                mtr.status === 'COM_DIVERGENCIA' || 
                mtr.integracao?.fase === 'FALHA' || 
                mtr.integracao?.fase === 'DLQ'
                
              const alertColor = hasAlert ? 'bg-destructive' : 'bg-primary'
              
              return (
                <motion.div
                  key={mtr.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="glass-card hover:bg-white/[0.03] transition-colors p-5 flex flex-col relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${alertColor}`} />
                  
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {mtr.numeroMTR || `MTR-${mtr.id.substring(0, 8)}`}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1" title={clientMap.get(mtr.clienteId)}>
                        {clientMap.get(mtr.clienteId) || "Cliente desconhecido"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        Carga: {mtr.volume} {mtr.unidadeMedida}
                      </p>
                    </div>
                    <StatusBadge status={mtr.status} />
                  </div>

                  <div className="mb-5 space-y-2">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground uppercase tracking-wider font-medium">T:</span>
                        <span className="text-foreground truncate pl-2 max-w-[200px]" title={partnerMap.get(mtr.transportadoraId)}>
                          {partnerMap.get(mtr.transportadoraId) || mtr.transportadoraId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground uppercase tracking-wider font-medium">D:</span>
                        <span className="text-foreground truncate pl-2 max-w-[200px]" title={partnerMap.get(mtr.destinadorId)}>
                          {partnerMap.get(mtr.destinadorId) || mtr.destinadorId}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
                      {mtr.integracao ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                              Integração {mtr.integracao.sistema}
                            </span>
                            <Badge variant="outline" className={`h-5 text-[9px] px-1.5 border-0 ${integrationBadgeClass(mtr.integracao.fase)}`}>
                              {formatIntegracaoFase(mtr.integracao.fase)}
                            </Badge>
                          </div>
                          {mtr.integracao.ultimoErro ? (
                            <p className="text-[10px] text-rose-300 leading-tight line-clamp-2">
                              Er: {mtr.integracao.ultimoErro}
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/60 leading-tight">
                              St: {mtr.integracao.providerStatus || 'Aguardando'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/50 py-1">Sem integração registrada</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-end gap-1.5 pt-3 border-t border-white/[0.06]">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openIntegracao(mtr)} title="Detalhes da integração">
                      <Activity className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleReconciliarIntegracao(mtr)} disabled={reconciliarIntegracaoMutation.isPending} title="Reconciliar status">
                      <RefreshCcw className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(mtr)}>
                      <Pencil className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(mtr)} disabled={isRemovendo}>
                      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 hover:bg-white/[0.08]" onClick={() => navigate(`/mtrs/${mtr.id}`)}>
                      Ver MTR <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto max-w-full">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Info
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Gerador
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/mtrs/${mtr.id}`)}>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
          <FormWizard
            isSubmitting={isSaving}
            onCancel={() => setOpen(false)}
            onComplete={handleSave}
            submitLabel="Emitir MTR"
            steps={[
              {
                id: 'step-at',
                label: 'AT',
                isValid: true,
                content: (
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground/80 mb-2">
                      Conforme SINIR, informe se este manifesto utilizará Armazenamento Temporário. Se sim, apenas 1 resíduo será permitido por MTR.
                    </p>
                    <div className="glass-card p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="usaAT"
                          checked={form.usaArmazenamentoTemporario}
                          onChange={(e) => {
                            const usa = e.target.checked
                            setForm(s => ({
                              ...s,
                              usaArmazenamentoTemporario: usa,
                              armazenadorTemporarioId: usa ? s.armazenadorTemporarioId : '',
                              residuos: usa && s.residuos.length > 1 ? [s.residuos[0]] : s.residuos,
                            }))
                          }}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
                        />
                        <Label htmlFor="usaAT" className="cursor-pointer">
                          Este MTR utiliza Armazenamento Temporário (AT)
                        </Label>
                      </div>
                      {form.usaArmazenamentoTemporario && (
                        <div className="space-y-2 pl-7">
                          <Label>Armazenador Temporário (parceiro)</Label>
                          <Select
                            value={form.armazenadorTemporarioId}
                            onValueChange={(v) => setForm(s => ({ ...s, armazenadorTemporarioId: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o armazenador temporário" />
                            </SelectTrigger>
                            <SelectContent>
                              {parceirosGlobais.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-amber-300/80 flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            Com AT, apenas 1 resíduo é permitido por manifesto.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              },
              {
                id: 'step-residuos',
                label: 'Resíduos',
                isValid: form.residuos.length > 0,
                content: (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground/80">
                        Adicione os resíduos que compõem este manifesto. Limite SINIR: 45 toneladas por MTR.
                      </p>
                      <Button
                        size="sm"
                        className="gap-1.5 h-8 rounded-xl"
                        onClick={() => {
                          setEditingResiduoIdx(null)
                          setResiduoForm(defaultResiduoItem)
                          setResiduoSearch('')
                          setOpenResiduoForm(true)
                        }}
                        disabled={form.usaArmazenamentoTemporario && form.residuos.length >= 1}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar
                      </Button>
                    </div>

                    {form.residuos.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                        <Package className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground/60">Nenhum resíduo adicionado.</p>
                        <p className="text-xs text-muted-foreground/40 mt-1">Clique em "Adicionar" para incluir resíduos ao manifesto.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {form.residuos.map((r, idx) => (
                          <div key={idx} className="glass-card p-3 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {r.codigoIbama && (
                                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    {r.codigoIbama}
                                  </span>
                                )}
                                {r.classe && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.classe === 'CLASSE_I_PERIGOSO' ? 'bg-rose-500/15 text-rose-200' : 'bg-white/[0.06] text-muted-foreground'}`}>
                                    {formatClasseResiduo(r.classe)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground font-medium truncate">{r.descricao || 'Sem descrição'}</p>
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                {r.quantidade} {formatEnum(r.unidadeMedida)}
                                {r.estadoFisico && ` · ${formatEnum(r.estadoFisico)}`}
                                {r.acondicionamento && ` · ${formatEnum(r.acondicionamento)}`}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                                setEditingResiduoIdx(idx)
                                setResiduoForm(r)
                                setResiduoSearch(r.descricao)
                                setOpenResiduoForm(true)
                              }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => {
                                setForm(s => ({ ...s, residuos: s.residuos.filter((_, i) => i !== idx) }))
                              }}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="text-[11px] text-muted-foreground/50 text-right pt-1">
                          Total: {form.residuos.reduce((acc, r) => acc + Number(r.quantidade || 0), 0).toFixed(3)} {formatEnum(form.residuos[0]?.unidadeMedida) || 'kg'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'step-gerador',
                label: 'Gerador',
                isValid: !!form.clienteId && !!form.fonteGeradoraId,
                content: (
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground/80 mb-2">
                       Defina quem está gerando o resíduo e onde ele está sendo gerado.
                    </p>
                    <div className="space-y-2">
                      <Label>Gerador (Cliente) *</Label>
                      <Select
                        value={form.clienteId}
                        disabled={!!globalClienteId}
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
                      <Label>Ponto de Geração (Origem) *</Label>
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
                  </div>
                )
              },
              {
                id: 'step-cadeia',
                label: 'Destinação',
                isValid: (() => {
                  const t = transportadoras.find(p => p.id === form.transportadoraId)
                  const d = destinadores.find(p => p.id === form.destinadorId)
                  const tValida = t ? !isLicencaExpirada(t) : true
                  const dValida = d ? !isLicencaExpirada(d) : true
                  return !!form.transportadoraId && !!form.destinadorId && !!form.tipoDestinacao && tValida && dValida
                })(),
                content: (
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground/80 mb-2">
                       Especifique como o resíduo será transportado e qual será seu destino final.
                    </p>
                    {form.clienteId && (!transportadoras.length || !destinadores.length) ? (
                      <div className="rounded-lg border border-dashed border-primary/35 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                        Este cliente não possui parceiros suficientes cadastrados.
                        <button
                          type="button"
                          onClick={() => { setOpen(false); abrirDialogVinculo(); }}
                          className="ml-1 text-primary hover:underline"
                        >
                          Vincular agora
                        </button>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    ? 'Carregando...'
                                    : 'Selecionar'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {form.transportadoraId &&
                            !transportadoras.some((parceiro) => parceiro.id === form.transportadoraId) ? (
                              <SelectItem value={form.transportadoraId}>
                                {partnerMap.get(form.transportadoraId) || 'Logística Legado'}
                              </SelectItem>
                            ) : null}
                            {transportadoras.map((p) => {
                              const expirada = isLicencaExpirada(p)
                              return (
                                <SelectItem key={p.id} value={p.id} className={expirada ? 'opacity-70' : ''}>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{p.name || p.nome}</span>
                                    {expirada && (
                                      <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase">Vencida</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              )
                            })}
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
                                    ? 'Carregando...'
                                    : 'Selecionar'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {form.destinadorId &&
                            !destinadores.some((parceiro) => parceiro.id === form.destinadorId) ? (
                              <SelectItem value={form.destinadorId}>
                                {partnerMap.get(form.destinadorId) || 'Destinador Legado'}
                              </SelectItem>
                            ) : null}
                            {destinadores.map((p) => {
                              const expirada = isLicencaExpirada(p)
                              return (
                                <SelectItem key={p.id} value={p.id} className={expirada ? 'opacity-70' : ''}>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{p.name || p.nome}</span>
                                    {expirada && (
                                      <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase">Vencida</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Método de Destinação *</Label>
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
                              {formatEnum(item)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              },
              {
                id: 'step-motorista',
                label: 'Transporte',
                content: (
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground/80 mb-2">
                       (Opcional) Informe os dados do motorista, veículo e data prevista para o transporte.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Motorista</Label>
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
                          placeholder="000.000.000-00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Placa do Veículo</Label>
                        <Input
                          value={form.placaVeiculo}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, placaVeiculo: e.target.value.toUpperCase() }))
                          }
                          placeholder="ABC-1234"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Data do Transporte</Label>
                        <Input
                          type="date"
                          value={form.dataTransporte}
                          onChange={(e) => setForm((s) => ({ ...s, dataTransporte: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'step-final',
                label: 'Envio',
                content: (
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground/80 mb-2">
                       Observações finais e dados do documento gerado no sistema ambiental.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número do MTR</Label>
                        <Input
                          value={form.numeroMTR}
                          onChange={(e) => setForm((s) => ({ ...s, numeroMTR: e.target.value }))}
                          placeholder="Auto-gerado pelo SINIR"
                        />
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
                                {formatEnum(item)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Observações adicionais</Label>
                      <Textarea
                        value={form.observacoes}
                        onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )
              }
            ]}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openResiduoForm} onOpenChange={setOpenResiduoForm}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResiduoIdx !== null ? 'Editar Resíduo' : 'Adicionar Resíduo'}
            </DialogTitle>
            <DialogDescription>
              Informe os dados do resíduo e sua classificação.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2 space-y-2">
              <Label>Tipo de Resíduo (Catálogo) *</Label>
              <Select
                value={residuoForm.tipoResiduoId}
                onValueChange={(val) => {
                  const t = tiposResiduo.find(x => x.id === val)
                  if (!t) return
                  setResiduoForm(s => ({
                    ...s,
                    tipoResiduoId: t.id,
                    descricao: t.descricao,
                    codigoIbama: t.codigoIbama || '',
                    classe: t.classe || '',
                    estadoFisico: t.estadoFisico || '',
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Busque pelo resíduo..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-white/10">
                    <Input 
                      placeholder="Pesquisar..." 
                      value={residuoSearch} 
                      onChange={e => setResiduoSearch(e.target.value)} 
                      className="h-8"
                      onKeyDown={e => e.stopPropagation()} 
                    />
                  </div>
                  {filteredTiposResiduo.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.codigoIbama ? `[${t.codigoIbama}] ` : ''}{t.descricao}
                    </SelectItem>
                  ))}
                  {filteredTiposResiduo.length === 0 && (
                    <div className="p-2 text-sm text-center text-muted-foreground">Nenhum resíduo encontrado.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Descrição (Caso o catálogo não possua)</Label>
              <Input
                value={residuoForm.descricao}
                onChange={e => setResiduoForm(s => ({ ...s, descricao: e.target.value }))}
                placeholder="Ex: Lodo de ETE"
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                value={residuoForm.quantidade}
                onChange={e => setResiduoForm(s => ({ ...s, quantidade: e.target.value }))}
                placeholder="0.000"
              />
            </div>

            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Select
                value={residuoForm.unidadeMedida}
                onValueChange={(v) => {
                  if (form.residuos.length > 0 && v !== form.residuos[0].unidadeMedida) {
                    toast.error(`Atenção: A unidade de medida deve ser obrigatoriamente ${form.residuos[0].unidadeMedida} como os demais.`)
                  }
                  setResiduoForm(s => ({ ...s, unidadeMedida: v }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidadeOptions.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado Físico</Label>
              <Select
                value={residuoForm.estadoFisico}
                onValueChange={(v) => setResiduoForm(s => ({ ...s, estadoFisico: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_EMPTY_"><em>Não informado</em></SelectItem>
                  {estadoFisicoOptions.map((item) => (
                    <SelectItem key={item} value={item}>{formatEnum(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Acondicionamento</Label>
              <Select
                value={residuoForm.acondicionamento}
                onValueChange={(v) => setResiduoForm(s => ({ ...s, acondicionamento: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_EMPTY_"><em>Não informado</em></SelectItem>
                  {acondicionamentoOptions.map((item) => (
                    <SelectItem key={item} value={item}>{formatEnum(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Classe</Label>
              <Select
                value={residuoForm.classe}
                onValueChange={(v) => setResiduoForm(s => ({ ...s, classe: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_EMPTY_"><em>Não informado</em></SelectItem>
                  {classeOptions.map((item) => (
                    <SelectItem key={item} value={item}>{formatClasseResiduo(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tratamento Previsto</Label>
              <Select
                value={residuoForm.tecnologiaTratamento}
                onValueChange={(v) => setResiduoForm((s) => ({ ...s, tecnologiaTratamento: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_EMPTY_"><em>Não informado</em></SelectItem>
                  {tipoDestinacaoOptions.map((item) => (
                    <SelectItem key={item} value={item}>{formatEnum(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(residuoForm.unidadeMedida === 'LITRO' || residuoForm.unidadeMedida === 'M3') && (
              <div className="space-y-2 md:col-span-2">
                <Label>Densidade (obrigatório para volume)</Label>
                <Input
                  type="number"
                  value={residuoForm.densidade}
                  onChange={e => setResiduoForm(s => ({ ...s, densidade: e.target.value }))}
                  placeholder="0.000"
                />
              </div>
            )}

            {residuoForm.classe === 'CLASSE_I_PERIGOSO' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-rose-500/5 p-4 mt-2 rounded-xl border border-rose-500/20">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-rose-400">Classificação ONU (Obrigatório para Classe I)</Label>
                </div>
                <div className="space-y-2">
                  <Label>Número ONU *</Label>
                  <Input
                    value={residuoForm.numeroOnu}
                    onChange={e => setResiduoForm(s => ({ ...s, numeroOnu: e.target.value }))}
                    placeholder="Ex: 1230"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Classe de Risco *</Label>
                  <Input
                    value={residuoForm.classeRisco}
                    onChange={e => setResiduoForm(s => ({ ...s, classeRisco: e.target.value }))}
                    placeholder="Ex: 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome de Embarque *</Label>
                  <Input
                    value={residuoForm.nomeEmbarque}
                    onChange={e => setResiduoForm(s => ({ ...s, nomeEmbarque: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grupo Embalagem</Label>
                  <Select
                    value={residuoForm.grupoEmbalagem}
                    onValueChange={(v) => setResiduoForm(s => ({ ...s, grupoEmbalagem: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_EMPTY_"><em>Não informado</em></SelectItem>
                      {grupoEmbalagemOptions.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenResiduoForm(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!residuoForm.descricao || !residuoForm.quantidade) {
                  toast.error('Preencha a descrição e a quantidade do resíduo.')
                  return
                }
                const nRes = Number(residuoForm.quantidade)
                if (!Number.isFinite(nRes) || nRes <= 0) {
                  toast.error('Quantidade deve ser maior que zero.')
                  return
                }
                if (form.residuos.length > 0 && form.residuos[0].unidadeMedida !== residuoForm.unidadeMedida) {
                  toast.error(`A unidade informada precisa ser ${form.residuos[0].unidadeMedida} igual ao primeiro item.`)
                  return
                }
                if ((residuoForm.unidadeMedida === 'LITRO' || residuoForm.unidadeMedida === 'M3')) {
                   const d = Number(residuoForm.densidade)
                   if (!Number.isFinite(d) || d <= 0) {
                     toast.error('Densidade é obrigatória quando unidade for Litro ou M³.')
                     return
                   }
                }
                if (residuoForm.classe === 'CLASSE_I_PERIGOSO') {
                  if (!residuoForm.numeroOnu || !residuoForm.classeRisco || !residuoForm.nomeEmbarque) {
                    toast.error('Preencha os dados da ONU para resíduos da Classe I - Perigosos.')
                    return
                  }
                }

                // Cleanup nulls from selects
                const clean = {
                  ...residuoForm,
                  estadoFisico: residuoForm.estadoFisico === '_EMPTY_' ? '' : residuoForm.estadoFisico,
                  acondicionamento: residuoForm.acondicionamento === '_EMPTY_' ? '' : residuoForm.acondicionamento,
                  classe: residuoForm.classe === '_EMPTY_' ? '' : residuoForm.classe,
                  tecnologiaTratamento: residuoForm.tecnologiaTratamento === '_EMPTY_' ? '' : residuoForm.tecnologiaTratamento,
                  grupoEmbalagem: residuoForm.grupoEmbalagem === '_EMPTY_' ? '' : residuoForm.grupoEmbalagem,
                }

                setForm(s => {
                  const arr = [...s.residuos]
                  if (editingResiduoIdx !== null) {
                    arr[editingResiduoIdx] = clean
                  } else {
                    arr.push(clean)
                  }
                  return { ...s, residuos: arr }
                })
                setOpenResiduoForm(false)
              }}
            >
              Confirmar
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
                  <SelectItem value="TRANSPORTADORA">{formatEnum('TRANSPORTADORA')}</SelectItem>
                  <SelectItem value="DESTINADOR_FINAL">{formatEnum('DESTINADOR_FINAL')}</SelectItem>
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
                  <SelectItem value="TRANSPORTADORA">{formatEnum('TRANSPORTADORA')}</SelectItem>
                  <SelectItem value="DESTINADOR_FINAL">{formatEnum('DESTINADOR_FINAL')}</SelectItem>
                  <SelectItem value="TRANSPORTADORA_E_DESTINADOR">
                    {formatEnum('TRANSPORTADORA_E_DESTINADOR')}
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
