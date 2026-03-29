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
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from '@/components/ui/sonner'
import type { ClienteResponseDTO } from '@greenly/shared'
import { useSearchParams } from 'react-router-dom'
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
  const [isBuscandoCep, setIsBuscandoCep] = useState(false)
  const hasClientes = (clientes || []).length > 0
  const hasSearchApplied = !!search.trim()
  useTrackViewLoaded('clientes')

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
                        className="border-t border-white/[0.06] hover:bg-white/[0.02]"
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
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ${
                              cliente.ativo
                                ? 'bg-primary/10 text-primary ring-primary/20'
                                : 'bg-muted/50 text-muted-foreground/70 ring-border'
                            }`}
                          >
                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Atualize as informações do cliente selecionado.'
                : 'Cadastre um cliente para vinculá-lo a licenças e MTRs.'}
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
            <div className="space-y-2 md:col-span-2">
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
                placeholder="Razão social / nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input
                value={form.cnpj}
                onChange={(e) => setForm((s) => ({ ...s, cnpj: formatCnpjInput(e.target.value) }))}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de cadastro *</Label>
              <Select
                value={form.tipoCadastro}
                onValueChange={(value: ClienteFormState['tipoCadastro']) =>
                  setForm((s) => ({ ...s, tipoCadastro: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo do cliente" />
                </SelectTrigger>
                <SelectContent>
                  {tipoCadastroOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setor</Label>
              <Select
                value={form.setor || undefined}
                onValueChange={(value) => setForm((s) => ({ ...s, setor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setorFormOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm((s) => ({ ...s, telefone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label>CNAE</Label>
              <Input
                value={form.cnae}
                onChange={(e) => setForm((s) => ({ ...s, cnae: e.target.value }))}
                placeholder="0000-0/00"
              />
            </div>

            <div className="space-y-2">
              <Label>CEP</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={form.cep}
                  onChange={(e) => setForm((s) => ({ ...s, cep: formatCepInput(e.target.value) }))}
                  placeholder="00000-000"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-2"
                  onClick={() => void handleBuscarCep()}
                  disabled={isBuscandoCep}
                >
                  {isBuscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Buscar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Select
                value={form.estado || undefined}
                onValueChange={(value) =>
                  setForm((s) => ({
                    ...s,
                    estado: value,
                    cidade: '',
                  }))
                }
                disabled={isLoadingEstados}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingEstados ? 'Carregando estados...' : 'Selecione o estado'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {estadoFormOptions.map((estado) => (
                    <SelectItem key={`${estado.id}-${estado.sigla}`} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Cidade</Label>
              <Select
                value={form.cidade || undefined}
                onValueChange={(value) => setForm((s) => ({ ...s, cidade: value }))}
                disabled={!form.estado || isLoadingCidades}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.estado
                        ? 'Selecione o estado primeiro'
                        : isLoadingCidades
                          ? 'Carregando cidades...'
                          : 'Selecione a cidade'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cidadeFormOptions.map((cidade) => (
                    <SelectItem key={`${cidade.id}-${cidade.nome}`} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Logradouro</Label>
              <Input
                value={form.logradouro}
                onChange={(e) => setForm((s) => ({ ...s, logradouro: e.target.value }))}
                placeholder="Rua, avenida..."
              />
            </div>

            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={form.numero}
                onChange={(e) => setForm((s) => ({ ...s, numero: e.target.value }))}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input
                value={form.bairro}
                onChange={(e) => setForm((s) => ({ ...s, bairro: e.target.value }))}
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Complemento</Label>
              <Input
                value={form.complemento}
                onChange={(e) => setForm((s) => ({ ...s, complemento: e.target.value }))}
                placeholder="Sala, bloco, referência..."
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 md:col-span-2">
              <div>
                <p className="text-sm font-medium text-foreground">Cliente ativo</p>
                <p className="text-xs text-muted-foreground">
                  Use inativo para ocultar sem perder histórico.
                </p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(checked) => setForm((s) => ({ ...s, ativo: checked }))}
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
    </AppLayout>
  )
}
