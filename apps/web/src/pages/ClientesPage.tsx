import { AppLayout } from '@/components/layout/AppLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Building2, Pencil, Trash2, Save, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { useClientePainel } from '@/features/clientes/hooks/useClientePainel'
import { ClientePainel } from '@/features/clientes/components/ClientePainel'
import {
  clienteService,
  type CnpjLookupResponseDTO,
} from '@/features/clientes/services/clienteService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from '@/components/ui/sonner'
import type { ClienteResponseDTO } from '@greenly/shared'
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
import { DocumentoExtracaoInline } from '@/features/documentos/components/DocumentoExtracaoInline'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  CidadeOption,
  EstadoOption,
  localidadeService,
} from '@/features/clientes/services/localidadeService'

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

type ClienteFormState = {
  nome: string
  cnpj: string
  tipoCadastro:
    | 'GERADOR_RESIDUO'
    | 'PRESTADOR_SERVICO'
    | 'TRANSPORTADOR'
    | 'DESTINADOR'
    | 'MULTI_PAPEL'
    | 'OUTRO'
  email: string
  telefone: string
  setor: string
  cnae: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  ativo: boolean
}

const defaultForm: ClienteFormState = {
  nome: '',
  cnpj: '',
  tipoCadastro: 'GERADOR_RESIDUO',
  email: '',
  telefone: '',
  setor: '',
  cnae: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  ativo: true,
}

const tipoCadastroOptions: Array<{
  value: ClienteFormState['tipoCadastro']
  label: string
}> = [
  { value: 'GERADOR_RESIDUO', label: 'Gerador de Resíduo' },
  { value: 'PRESTADOR_SERVICO', label: 'Prestador de Serviço' },
  { value: 'TRANSPORTADOR', label: 'Transportador' },
  { value: 'DESTINADOR', label: 'Destinador' },
  { value: 'MULTI_PAPEL', label: 'Multi Papel' },
  { value: 'OUTRO', label: 'Outro' },
]

const tipoCadastroLabelMap = new Map(
  tipoCadastroOptions.map((option) => [option.value, option.label]),
)

const setorOptions: Array<{ value: string; label: string }> = [
  { value: 'AGRONEGOCIO', label: 'Agronegócio' },
  { value: 'ALIMENTOS_BEBIDAS', label: 'Alimentos e Bebidas' },
  { value: 'CONSTRUCAO_CIVIL', label: 'Construção Civil' },
  { value: 'ENERGIA', label: 'Energia' },
  { value: 'HOSPITALAR_SAUDE', label: 'Hospitalar e Saúde' },
  { value: 'INDUSTRIA', label: 'Indústria' },
  { value: 'LOGISTICA_TRANSPORTE', label: 'Logística e Transporte' },
  { value: 'MINERACAO', label: 'Mineração' },
  { value: 'QUIMICO_PETROQUIMICO', label: 'Químico e Petroquímico' },
  { value: 'SANEAMENTO', label: 'Saneamento' },
  { value: 'SERVICOS', label: 'Serviços' },
  { value: 'OUTRO', label: 'Outro' },
]

const setorLabelMap = new Map(setorOptions.map((option) => [option.value, option.label]))

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function formatCnpj(value?: string | null) {
  const digits = digitsOnly(value || '')
  if (digits.length !== 14) return value || '—'
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function formatCnpjInput(value: string) {
  const digits = digitsOnly(value).slice(0, 14)
  const p1 = digits.slice(0, 2)
  const p2 = digits.slice(2, 5)
  const p3 = digits.slice(5, 8)
  const p4 = digits.slice(8, 12)
  const p5 = digits.slice(12, 14)

  if (!p2) return p1
  if (!p3) return `${p1}.${p2}`
  if (!p4) return `${p1}.${p2}.${p3}`
  if (!p5) return `${p1}.${p2}.${p3}/${p4}`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

function formatCepInput(value: string) {
  const digits = digitsOnly(value).slice(0, 8)
  const p1 = digits.slice(0, 5)
  const p2 = digits.slice(5, 8)
  if (!p2) return p1
  return `${p1}-${p2}`
}

function inferSetorPorCnae(input?: CnpjLookupResponseDTO | null): string | undefined {
  const content = `${input?.cnaeDescricao || ''} ${input?.cnae || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (!content) return undefined
  if (content.includes('agro') || content.includes('pecuaria') || content.includes('cultivo'))
    return 'AGRONEGOCIO'
  if (content.includes('alimento') || content.includes('bebida')) return 'ALIMENTOS_BEBIDAS'
  if (content.includes('construcao') || content.includes('obra')) return 'CONSTRUCAO_CIVIL'
  if (content.includes('energia') || content.includes('eletric')) return 'ENERGIA'
  if (content.includes('hospital') || content.includes('saude') || content.includes('clinica'))
    return 'HOSPITALAR_SAUDE'
  if (content.includes('logistica') || content.includes('transporte')) return 'LOGISTICA_TRANSPORTE'
  if (content.includes('miner') || content.includes('extracao')) return 'MINERACAO'
  if (content.includes('quimic') || content.includes('petro')) return 'QUIMICO_PETROQUIMICO'
  if (content.includes('saneamento') || content.includes('esgoto') || content.includes('agua'))
    return 'SANEAMENTO'
  if (
    content.includes('industria') ||
    content.includes('industrial') ||
    content.includes('fabrica')
  )
    return 'INDUSTRIA'
  if (content.includes('servico')) return 'SERVICOS'
  return undefined
}

function SkeletonList() {
  return (
    <div className="glass-card overflow-hidden p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-4 w-44" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-4 w-20 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export default function ClientesPage() {
  const navigate = useNavigate()
  const { id: clienteIdParam } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const {
    clientes,
    isLoading,
    criarCliente,
    atualizarCliente,
    removerCliente,
    isCriando,
    isAtualizando,
    isRemovendo,
  } = useClientes()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ClienteResponseDTO | null>(null)
  const [form, setForm] = useState<ClienteFormState>(defaultForm)
  const [formError, setFormError] = useState<ActionableFormError | null>(null)
  const [estados, setEstados] = useState<EstadoOption[]>([])
  const [cidades, setCidades] = useState<CidadeOption[]>([])
  const [isLoadingEstados, setIsLoadingEstados] = useState(false)
  const [isLoadingCidades, setIsLoadingCidades] = useState(false)

  const handleAutoFill = (data: any) => {
    setForm(prev => ({
      ...prev,
      nome: data.nome_razao_social || data.nome || prev.nome,
      cnpj: data.cnpj || data.cpf || prev.cnpj,
      email: data.email || prev.email,
      telefone: data.telefone || prev.telefone,
      cep: data.cep || prev.cep,
      logradouro: data.logradouro || prev.logradouro,
      numero: data.numero || prev.numero,
      complemento: data.complemento || prev.complemento,
      bairro: data.bairro || prev.bairro,
      estado: data.estado || prev.estado,
      cidade: data.cidade || prev.cidade,
    }))
  }
  const [isBuscandoCnpj, setIsBuscandoCnpj] = useState(false)
  const [isBuscandoCep, setIsBuscandoCep] = useState(false)
  const hasClientes = (clientes || []).length > 0
  const hasSearchApplied = !!search.trim()
  useTrackViewLoaded('clientes')
  const clienteSelecionado = clientes?.find((cliente) => cliente.id === clienteIdParam) ?? null
  const painelClienteQuery = useClientePainel(clienteIdParam)

  const setorFormOptions = useMemo(() => {
    if (!form.setor || setorLabelMap.has(form.setor)) return setorOptions
    return [...setorOptions, { value: form.setor, label: `Outro (${form.setor})` }]
  }, [form.setor])

  const estadoFormOptions = useMemo(() => {
    if (!form.estado || estados.some((estado) => estado.sigla === form.estado)) return estados
    return [{ id: -1, sigla: form.estado, nome: form.estado }, ...estados]
  }, [estados, form.estado])

  const cidadeFormOptions = useMemo(() => {
    if (!form.cidade || cidades.some((cidade) => cidade.nome === form.cidade)) return cidades
    return [{ id: -1, nome: form.cidade }, ...cidades]
  }, [cidades, form.cidade])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return (clientes || []).filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        (setorLabelMap.get(c.setor || '') || c.setor || '').toLowerCase().includes(term) ||
        (c.cnpj || '').includes(digitsOnly(term)),
    )
  }, [clientes, search])

  const isSaving = isCriando || isAtualizando
  const isFormReady = !!form.nome.trim() && digitsOnly(form.cnpj).length === 14

  function applyTrackedFormError(nextError: ActionableFormError, source: 'validation' | 'api') {
    setFormError(nextError)
    trackFormError('clientes', 'cliente_form', nextError, {
      mode: editing ? 'edit' : 'create',
      source,
    })
  }

  function openNew() {
    setEditing(null)
    setForm(defaultForm)
    setCidades([])
    setFormError(null)
    setOpen(true)
  }

  useEffect(() => {
    const quickAction = searchParams.get('quickAction')
    if (quickAction !== 'novo-cliente') return

    openNew()
    const params = new URLSearchParams(searchParams)
    params.delete('quickAction')
    setSearchParams(params, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    let isCancelled = false

    async function loadEstados() {
      setIsLoadingEstados(true)
      try {
        const data = await localidadeService.listarEstados()
        if (!isCancelled) {
          setEstados(data)
        }
      } catch {
        if (!isCancelled) {
          toast.error('Não foi possível carregar estados da base oficial do IBGE.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingEstados(false)
        }
      }
    }

    void loadEstados()
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!clienteIdParam || isLoading) return
    if (clienteSelecionado) return

    toast.error('O cliente selecionado não está mais disponível.')
    navigate('/clientes', { replace: true })
  }, [clienteIdParam, clienteSelecionado, isLoading, navigate])

  useEffect(() => {
    if (!form.estado) {
      setCidades([])
      return
    }

    let isCancelled = false
    async function loadCidades() {
      setIsLoadingCidades(true)
      try {
        const data = await localidadeService.listarCidadesPorUf(form.estado)
        if (!isCancelled) {
          setCidades(data)
        }
      } catch {
        if (!isCancelled) {
          toast.error('Não foi possível carregar cidades para o estado selecionado.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCidades(false)
        }
      }
    }

    void loadCidades()
    return () => {
      isCancelled = true
    }
  }, [form.estado])

  function openEdit(cliente: ClienteResponseDTO) {
    setEditing(cliente)
    setForm({
      nome: cliente.nome || '',
      cnpj: formatCnpj(cliente.cnpj),
      tipoCadastro:
        cliente.tipoCadastro &&
        tipoCadastroLabelMap.has(cliente.tipoCadastro as ClienteFormState['tipoCadastro'])
          ? (cliente.tipoCadastro as ClienteFormState['tipoCadastro'])
          : 'GERADOR_RESIDUO',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      setor: cliente.setor || '',
      cnae: cliente.cnae || '',
      cep: formatCepInput(cliente.cep || ''),
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      estado: (cliente.estado || '').toUpperCase(),
      ativo: cliente.ativo,
    })
    setFormError(null)
    setOpen(true)
  }

  async function handleSave() {
    try {
      setFormError(null)
      const consultoriaId = user?.consultoriaId
      const cnpj = digitsOnly(form.cnpj)

      if (!form.nome.trim()) {
        applyTrackedFormError(buildValidationFormError('Informe o nome do cliente.'), 'validation')
        return
      }

      if (cnpj.length !== 14) {
        applyTrackedFormError(
          buildValidationFormError('CNPJ inválido. Informe 14 dígitos.'),
          'validation',
        )
        return
      }

      if (!editing && !consultoriaId) {
        applyTrackedFormError(
          buildValidationFormError('Consultoria não identificada no usuário autenticado.'),
          'validation',
        )
        return
      }

      const payload = {
        nome: form.nome.trim(),
        cnpj,
        tipoCadastro: form.tipoCadastro,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
        setor: form.setor || undefined,
        cnae: form.cnae || undefined,
        cep: digitsOnly(form.cep).length === 8 ? digitsOnly(form.cep) : undefined,
        logradouro: form.logradouro || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado.toUpperCase() || undefined,
        ativo: form.ativo,
      }

      if (editing) {
        await atualizarCliente({ id: editing.id, dto: payload })
        toast.success('Cliente atualizado com sucesso.')
        trackFirstValidAction('clientes', 'editar_cliente')
        trackFlowCompleted('clientes', 'cliente_atualizado', {
          ativo: payload.ativo,
          setor: payload.setor ?? null,
        })
      } else {
        await criarCliente({
          consultoriaId: consultoriaId!,
          nome: payload.nome,
          cnpj: payload.cnpj,
          tipoCadastro: payload.tipoCadastro,
          email: payload.email,
          telefone: payload.telefone,
          setor: payload.setor,
          cnae: payload.cnae,
          cep: payload.cep,
          logradouro: payload.logradouro,
          numero: payload.numero,
          complemento: payload.complemento,
          bairro: payload.bairro,
          cidade: payload.cidade,
          estado: payload.estado,
        })

        if (payload.cidade || payload.estado) {
          toast.success('Cliente criado. Você pode editar para completar mais dados.')
        } else {
          toast.success('Cliente criado com sucesso.')
        }
        trackFirstValidAction('clientes', 'criar_cliente')
        trackFlowCompleted('clientes', 'cliente_criado', {
          ativo: payload.ativo,
          setor: payload.setor ?? null,
        })
      }

      setFormError(null)
      setOpen(false)
    } catch (error: unknown) {
      applyTrackedFormError(
        buildActionableFormError(error, 'Não foi possível salvar o cliente.'),
        'api',
      )
    }
  }

  async function handleBuscarCnpj() {
    const normalizedCnpj = digitsOnly(form.cnpj)
    if (normalizedCnpj.length !== 14) {
      applyTrackedFormError(
        buildValidationFormError('Informe um CNPJ válido com 14 dígitos para consultar.'),
        'validation',
      )
      return
    }

    setFormError(null)
    setIsBuscandoCnpj(true)

    try {
      const empresa = await clienteService.buscarCnpj(normalizedCnpj)
      const setorInferido = inferSetorPorCnae(empresa)

      setForm((state) => ({
        ...state,
        cnpj: formatCnpjInput(empresa.cnpj || normalizedCnpj),
        nome: empresa.razaoSocial || empresa.nomeFantasia || state.nome,
        email: empresa.email || state.email,
        telefone: empresa.telefone || state.telefone,
        cnae: empresa.cnae || state.cnae,
        setor: setorInferido || state.setor,
        cep: empresa.cep ? formatCepInput(empresa.cep) : state.cep,
        logradouro: empresa.logradouro || state.logradouro,
        numero: empresa.numero || state.numero,
        complemento: empresa.complemento || state.complemento,
        bairro: empresa.bairro || state.bairro,
        cidade: empresa.cidade || state.cidade,
        estado: (empresa.estado || state.estado || '').toUpperCase(),
      }))

      trackFirstValidAction('clientes', 'consultar_cnpj')
      trackFlowCompleted('clientes', 'cnpj_autopreenchido', {
        estado: empresa.estado ?? null,
        cidade: empresa.cidade ?? null,
        cnae: empresa.cnae ?? null,
      })

      toast.success('Dados preenchidos automaticamente a partir do CNPJ.')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Falha ao consultar CNPJ agora. Tente novamente.')
      toast.error(message)
    } finally {
      setIsBuscandoCnpj(false)
    }
  }

  async function handleBuscarCep() {
    const normalizedCep = digitsOnly(form.cep)
    if (normalizedCep.length !== 8) {
      applyTrackedFormError(
        buildValidationFormError('Informe um CEP válido com 8 dígitos para buscar endereço.'),
        'validation',
      )
      return
    }

    setFormError(null)
    setIsBuscandoCep(true)

    try {
      const endereco = await localidadeService.buscarCep(normalizedCep)
      if (!endereco) {
        toast.error('CEP não encontrado na base de consulta.')
        return
      }

      setForm((state) => ({
        ...state,
        cep: formatCepInput(endereco.cep),
        logradouro: endereco.logradouro || state.logradouro,
        bairro: endereco.bairro || state.bairro,
        complemento: endereco.complemento || state.complemento,
        cidade: endereco.cidade || state.cidade,
        estado: (endereco.estado || state.estado || '').toUpperCase(),
      }))
      toast.success('Endereço preenchido com os dados do CEP.')
    } catch {
      toast.error('Falha ao consultar CEP agora. Tente novamente em instantes.')
    } finally {
      setIsBuscandoCep(false)
    }
  }

  async function handleDelete(cliente: ClienteResponseDTO) {
    const confirmed = window.confirm(`Excluir o cliente "${cliente.nome}"?`)
    if (!confirmed) return

    try {
      await removerCliente(cliente.id)
      if (clienteIdParam === cliente.id) {
        navigate('/clientes', { replace: true })
      }
      toast.success('Cliente excluído com sucesso.')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Não foi possível excluir o cliente.')
      toast.error(message)
    }
  }

  return (
    <AppLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full sm:flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40"
              strokeWidth={1.5}
            />
            <Input
              placeholder="Buscar cliente, setor ou CNPJ..."
              className="pl-10 h-10 bg-white/[0.03] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={openNew} className="h-10 px-4 rounded-xl gap-2">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Novo Cliente
          </Button>
        </div>

        {isLoading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={
              hasClientes && hasSearchApplied
                ? 'Nenhum cliente para a busca atual'
                : 'Nenhum cliente cadastrado'
            }
            description={
              hasClientes && hasSearchApplied
                ? 'Limpe a busca para visualizar todos os clientes já cadastrados.'
                : 'Cadastre o primeiro cliente para iniciar a gestão de licenças e MTRs.'
            }
            actionLabel={hasClientes && hasSearchApplied ? 'Limpar busca' : 'Novo cliente'}
            onAction={hasClientes && hasSearchApplied ? () => setSearch('') : openNew}
          />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        CNPJ
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Contato
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Local
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
                    {filtered.map((cliente) => (
                      <motion.tr
                        key={cliente.id}
                        variants={item}
                        className={`border-t border-white/[0.06] hover:bg-white/[0.02] ${
                          clienteIdParam === cliente.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{cliente.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {setorLabelMap.get(cliente.setor || '') || cliente.setor || 'Sem setor'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {tipoCadastroLabelMap.get(
                            (cliente.tipoCadastro as ClienteFormState['tipoCadastro']) ??
                              'GERADOR_RESIDUO',
                          ) ?? 'Gerador de Resíduo'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatCnpj(cliente.cnpj)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <p>{cliente.email || '—'}</p>
                          <p>{cliente.telefone || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {cliente.cidade || '—'} / {cliente.estado || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={cliente.ativo ? "default" : "secondary"}
                            className="rounded-full text-[10px] font-medium"
                          >
                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => navigate(`/clientes/${cliente.id}`)}
                              title="Abrir visão do cliente"
                            >
                              Abrir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEdit(cliente)}
                              title="Editar cliente"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(cliente)}
                              disabled={isRemovendo}
                              title="Excluir cliente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

        {clienteIdParam ? (
          painelClienteQuery.isLoading ? (
            <div className="glass-card p-6">
              <div className="space-y-3">
                <div className="skeleton h-6 w-52" />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="skeleton h-28 rounded-2xl" />
                  ))}
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="skeleton h-56 rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : painelClienteQuery.data ? (
            <ClientePainel
              painel={painelClienteQuery.data}
              onEditarCliente={() => {
                if (clienteSelecionado) {
                  openEdit(clienteSelecionado)
                }
              }}
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="Não foi possível carregar o contexto do cliente"
              description="Tente novamente ou volte para a lista geral."
              actionLabel="Voltar para clientes"
              onAction={() => navigate('/clientes', { replace: true })}
            />
          )
        ) : hasClientes ? (
          <EmptyState
            icon={Building2}
            title="Selecione um cliente para ver a visão micro"
            description="Abra um cliente para acompanhar licenças, condicionantes, MTRs, CDFs, documentos e atividade recente no mesmo lugar."
            actionLabel="Abrir primeiro cliente"
            onAction={() => {
              const primeiroCliente = filtered[0] || clientes?.[0]
              if (primeiroCliente) {
                navigate(`/clientes/${primeiroCliente.id}`)
              }
            }}
          />
        ) : null}
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setFormError(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-foreground">
          <div className="p-6 pb-2 shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-4">
                <span>{editing ? 'Editar Cliente' : 'Novo Cliente'}</span>
                {!editing && (
                  <DocumentoExtracaoInline 
                    modulo="LICENCA"
                    variant="mini"
                    onAutoFill={handleAutoFill}
                  />
                )}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Atualize os dados cadastrais do cliente selecionado.'
                  : 'Cadastre um novo cliente para iniciar a gestão ambiental.'}
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
          </div>

          <div className="flex-1 overflow-y-auto px-6 min-h-0 bg-white/[0.01]">
            <div className="space-y-8 py-4">
              {/* Seção 1: Identificação */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-[10px]">1</Badge>
                  <h3 className="text-sm font-semibold">Identificação e Atividade</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ / CPF *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={form.cnpj}
                        onChange={(e) => setForm((s) => ({ ...s, cnpj: formatCnpjInput(e.target.value) }))}
                        className="rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={handleBuscarCnpj}
                        disabled={isBuscandoCnpj || digitsOnly(form.cnpj).length !== 14}
                        className="shrink-0 rounded-xl"
                        title="Consultar dados da Receita Federal"
                      >
                        {isBuscandoCnpj ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome / Razão Social *</Label>
                    <Input
                      id="nome"
                      placeholder="Nome oficial da empresa"
                      value={form.nome}
                      onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Cadastro *</Label>
                    <Select
                      value={form.tipoCadastro}
                      onValueChange={(v: ClienteFormState['tipoCadastro']) =>
                        setForm((s) => ({ ...s, tipoCadastro: v }))
                      }
                    >
                      <SelectTrigger id="tipo" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tipoCadastroOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor Principal</Label>
                    <Select
                      value={form.setor}
                      onValueChange={(v) => setForm((s) => ({ ...s, setor: v }))}
                    >
                      <SelectTrigger id="setor" className="rounded-xl">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {setorFormOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnae">CNAE Principal</Label>
                    <Input
                      id="cnae"
                      placeholder="Ex: 38.11-4-00"
                      value={form.cnae}
                      onChange={(e) => setForm((s) => ({ ...s, cnae: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Seção 2: Contato */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-[10px]">2</Badge>
                  <h3 className="text-sm font-semibold">Contato</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Comercial</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="empresa@exemplo.com.br"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      value={form.telefone}
                      onChange={(e) => setForm((s) => ({ ...s, telefone: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Seção 3: Localização */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-[10px]">3</Badge>
                  <h3 className="text-sm font-semibold">Endereço</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cep"
                          placeholder="00000-000"
                          value={form.cep}
                          onChange={(e) => setForm((s) => ({ ...s, cep: formatCepInput(e.target.value) }))}
                          className="rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={handleBuscarCep}
                          disabled={isBuscandoCep || digitsOnly(form.cep).length !== 8}
                          className="shrink-0 rounded-xl"
                        >
                          {isBuscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="logradouro">Rua / Logradouro</Label>
                      <Input
                        id="logradouro"
                        value={form.logradouro}
                        onChange={(e) => setForm((s) => ({ ...s, logradouro: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={form.numero}
                        onChange={(e) => setForm((s) => ({ ...s, numero: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={form.complemento}
                        onChange={(e) => setForm((s) => ({ ...s, complemento: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={form.bairro}
                        onChange={(e) => setForm((s) => ({ ...s, bairro: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={form.estado}
                        onValueChange={(v) => setForm((s) => ({ ...s, estado: v, cidade: '' }))}
                      >
                        <SelectTrigger id="estado" className="rounded-xl">
                          <SelectValue placeholder={isLoadingEstados ? '...' : 'Selecione'} />
                        </SelectTrigger>
                        <SelectContent>
                          {estadoFormOptions.map((uf) => (
                            <SelectItem key={uf.sigla} value={uf.sigla}>
                              {uf.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Select
                        value={form.cidade}
                        onValueChange={(v) => setForm((s) => ({ ...s, cidade: v }))}
                        disabled={!form.estado || isLoadingCidades}
                      >
                        <SelectTrigger id="cidade" className="rounded-xl">
                          <SelectValue placeholder={isLoadingCidades ? '...' : 'Selecione'} />
                        </SelectTrigger>
                        <SelectContent>
                          {cidadeFormOptions.map((cid) => (
                            <SelectItem key={cid.id} value={cid.nome}>
                              {cid.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Seção 4: Configurações */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-[10px]">4</Badge>
                  <h3 className="text-sm font-semibold">Configurações de Acesso</h3>
                </div>
                <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                  <div className="space-y-1">
                    <Label htmlFor="ativo-switch" className="text-sm font-medium">Status da Conta</Label>
                    <p className="text-xs text-muted-foreground">Clientes inativos não podem emitir MTRs ou gerir licenças.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-medium ${form.ativo ? 'text-primary' : 'text-muted-foreground'}`}>
                      {form.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                    <Switch
                      id="ativo-switch"
                      checked={form.ativo}
                      onCheckedChange={(v) => setForm((s) => ({ ...s, ativo: v }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-white/[0.06] shrink-0">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSaving} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !isFormReady} className="rounded-xl gap-2 min-w-[120px]">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
