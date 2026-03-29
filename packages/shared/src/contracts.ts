import { z } from 'zod'
import {
  campoDocumentoAmbientalValues,
  categoriaDocumentoAmbientalValues,
  origemProcessamentoDocumentoValues,
  perfilDocumentoClienteValues,
  statusRevisaoDocumentoValues,
  tipoDocumentoAmbientalValues,
} from './types/documento.types'

// ─── Shared Validators ──────────────────
export const CnpjSchema = z.string().length(14).regex(/^\d+$/)
export const CpfSchema = z.string().length(11).regex(/^\d+$/)

export const tipoCadastroClienteValues = [
  'GERADOR_RESIDUO',
  'PRESTADOR_SERVICO',
  'TRANSPORTADOR',
  'DESTINADOR',
  'MULTI_PAPEL',
  'OUTRO',
] as const
export const TipoCadastroClienteSchema = z.enum(tipoCadastroClienteValues)

export const papelClienteParceiroValues = [
  'TRANSPORTADORA',
  'DESTINADOR_FINAL',
  'PRESTADOR_SERVICO',
  'OUTRO',
] as const
export const PapelClienteParceiroSchema = z.enum(papelClienteParceiroValues)

export type { UserRole } from './types/usuario.types'

// ─── Auth ───────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})
export type LoginDTO = z.infer<typeof LoginSchema>

export interface LoginResponseDTO {
  usuario: {
    id: string
    nome: string
    email: string
    role: string
  }
  token: string
  refreshToken: string
}

export const RegistrarUsuarioSchema = z.object({
  consultoriaId: z.string().uuid(),
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  role: z.enum(['ADMIN', 'CONSULTOR', 'CLIENTE']),
})
export type RegistrarUsuarioDTO = z.infer<typeof RegistrarUsuarioSchema>

export interface UsuarioResponseDTO {
  id: string
  nome: string
  email: string
  role: string
  status: string
}

export interface RefreshTokenDTO {
  refreshToken: string
}

// ─── Consultoria ────────────────────────
export const CriarConsultoriaSchema = z.object({
  nome: z.string().min(2),
  cnpj: CnpjSchema,
  email: z.string().email(),
  telefone: z.string().optional(),
  site: z.string().optional(),
  slug: z.string().optional(),
})
export type CriarConsultoriaDTO = z.infer<typeof CriarConsultoriaSchema>

export interface ConsultoriaResponseDTO {
  id: string
  nome: string
  cnpj: string
  email: string
  slug: string
  ativo: boolean
  plano: string
  cidade?: string
  estado?: string
}

export const AtualizarConsultoriaSchema = z.object({
  nome: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  site: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})
export type AtualizarConsultoriaDTO = z.infer<typeof AtualizarConsultoriaSchema>

// ─── Cliente ────────────────────────────
export const CriarClienteSchema = z.object({
  consultoriaId: z.string().uuid(),
  nome: z.string().min(2),
  cnpj: CnpjSchema,
  tipoCadastro: TipoCadastroClienteSchema.optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  setor: z.string().optional(),
  cnae: z.string().optional(),
  nomeResponsavel: z.string().optional(),
  emailResponsavel: z.string().email().optional(),
  telefoneResponsavel: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
})
export type CriarClienteDTO = z.infer<typeof CriarClienteSchema>

export const AtualizarClienteSchema = z.object({
  nome: z.string().min(2).optional(),
  cnpj: CnpjSchema.optional(),
  tipoCadastro: TipoCadastroClienteSchema.optional(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  setor: z.string().optional().nullable(),
  cnae: z.string().optional().nullable(),
  nomeResponsavel: z.string().optional().nullable(),
  emailResponsavel: z.string().email().optional().nullable(),
  telefoneResponsavel: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
  cep: z.string().optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().max(2).optional().nullable(),
})
export type AtualizarClienteDTO = z.infer<typeof AtualizarClienteSchema>

export interface ClienteResponseDTO {
  id: string
  consultoriaId: string
  nome: string
  cnpj: string
  tipoCadastro: (typeof tipoCadastroClienteValues)[number]
  email?: string | null
  telefone?: string | null
  setor?: string | null
  cnae?: string | null
  ativo: boolean
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
}

export const CriarInstalacaoSchema = z.object({
  clienteId: z.string().uuid(),
  nome: z.string().min(2),
  cnpj: CnpjSchema.optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})
export type CriarInstalacaoDTO = z.infer<typeof CriarInstalacaoSchema>

export interface InstalacaoResponseDTO {
  id: string
  clienteId: string
  nome: string
  cnpj?: string | null
  cidade?: string | null
  estado?: string | null
  ativa: boolean
}

// ─── Documentos ────────────────────────
export const CategoriaDocumentoAmbientalSchema = z.enum(categoriaDocumentoAmbientalValues)
export const TipoDocumentoAmbientalSchema = z.enum(tipoDocumentoAmbientalValues)
export const CampoDocumentoAmbientalSchema = z.enum(campoDocumentoAmbientalValues)

export const ClassificarDocumentoSchema = z.object({
  nomeArquivo: z.string().min(3),
  caminhoArquivo: z.string().optional(),
  mimeType: z.string().optional(),
})
export type ClassificarDocumentoDTO = z.infer<typeof ClassificarDocumentoSchema>

export const OrigemProcessamentoDocumentoSchema = z.enum(origemProcessamentoDocumentoValues)
export const IngerirDocumentoMetadataSchema = z.object({
  clienteId: z.string().uuid().optional(),
  licencaId: z.string().uuid().optional(),
  origem: OrigemProcessamentoDocumentoSchema.default('UPLOAD_GERAL'),
  tipoDeclarado: TipoDocumentoAmbientalSchema.optional(),
  categoriaDeclarada: CategoriaDocumentoAmbientalSchema.optional(),
})

export const PerfilDocumentoClienteSchema = z.enum(perfilDocumentoClienteValues)
export const ListarContratoExtracaoDocumentoSchema = z.object({
  perfilCliente: PerfilDocumentoClienteSchema.default('GLOBAL'),
})
export type ListarContratoExtracaoDocumentoDTO = z.infer<typeof ListarContratoExtracaoDocumentoSchema>

export const ValidarPacoteGeoespacialSchema = z.object({
  arquivos: z.array(z.string().min(1)).min(1),
})
export type ValidarPacoteGeoespacialDTO = z.infer<typeof ValidarPacoteGeoespacialSchema>

export const StatusRevisaoDocumentoSchema = z.enum(statusRevisaoDocumentoValues)

export const ListarPendentesRevisaoDocumentoSchema = z.object({
  statusRevisao: StatusRevisaoDocumentoSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})
export type ListarPendentesRevisaoDocumentoDTO = z.infer<
  typeof ListarPendentesRevisaoDocumentoSchema
>

export const RevisarDocumentoCampoSchema = z.object({
  campo: CampoDocumentoAmbientalSchema,
  valorFinal: z.string().trim().max(500).nullable(),
})

export const RevisarDocumentoSchema = z.object({
  statusRevisao: z.enum(['APROVADO_SEM_AJUSTES', 'APROVADO_COM_AJUSTES', 'REJEITADO']),
  tempoRevisaoSegundos: z.coerce.number().int().min(0).max(86400).optional(),
  observacoes: z.string().trim().max(1000).optional(),
  campos: z.array(RevisarDocumentoCampoSchema).min(1),
})
export type RevisarDocumentoDTO = z.infer<typeof RevisarDocumentoSchema>

export const DocumentoQualidadeQuerySchema = z.object({
  periodoDias: z.coerce.number().int().min(1).max(365).default(30),
})
export type DocumentoQualidadeQueryDTO = z.infer<typeof DocumentoQualidadeQuerySchema>

// ─── Licença ────────────────────────────
export const CriarLicencaSchema = z.object({
  clienteId: z.string().uuid(),
  instalacaoId: z.string().uuid().optional(),
  orgaoAmbientalId: z.string().uuid(),
  tipo: z.string().min(1),
  numeroProcesso: z.string().optional(),
  numeroLicenca: z.string().optional(),
  nomeEmpreendimento: z.string().optional(),
  atividadeLicenciada: z.string().optional(),
  dataEmissao: z.coerce.date().optional(),
  dataValidade: z.coerce.date().optional(),
  observacoes: z.string().optional(),
  criadoPorId: z.string().uuid().optional(),
})
export type CriarLicencaDTO = z.infer<typeof CriarLicencaSchema>

export const AtualizarLicencaSchema = z.object({
  clienteId: z.string().uuid().optional(),
  instalacaoId: z.string().uuid().optional().nullable(),
  orgaoAmbientalId: z.string().uuid().optional(),
  tipo: z.string().min(1).optional(),
  status: z.string().optional(),
  numeroProcesso: z.string().optional().nullable(),
  numeroLicenca: z.string().optional().nullable(),
  nomeEmpreendimento: z.string().optional().nullable(),
  atividadeLicenciada: z.string().optional().nullable(),
  dataEmissao: z.coerce.date().optional().nullable(),
  dataValidade: z.coerce.date().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})
export type AtualizarLicencaDTO = z.infer<typeof AtualizarLicencaSchema>

export interface LicencaResponseDTO {
  id: string
  clienteId: string
  tipo: string
  status: string
  numeroLicenca?: string | null
  dataValidade?: Date | null
  diasAteVencimento?: number | null
}

export interface OrgaoAmbientalResponseDTO {
  id: string
  sigla: string
  nome: string
  esfera: string
  estado?: string | null
}

export const CriarCondicionanteSchema = z.object({
  licencaId: z.string().uuid(),
  descricao: z.string().min(1),
  tipo: z.string(),
  prazo: z.coerce.date().optional(),
  codigo: z.string().optional(),
  periodicidade: z.string().optional(),
  diaVencimento: z.number().optional(),
  inicioPeriodicidade: z.coerce.date().optional(),
  responsavelId: z.string().uuid().optional(),
  responsavelCliente: z.string().optional(),
  observacoes: z.string().optional(),
  criadoPorId: z.string().uuid().optional(),
})
export type CriarCondicionanteDTO = z.infer<typeof CriarCondicionanteSchema>

export interface CondicionanteResponseDTO {
  id: string
  licencaId: string
  descricao: string
  tipo: string
  status: string
  prazo?: Date | null
  proximoPrazo?: Date | null
}

export const AtualizarStatusCondicionanteSchema = z.object({
  status: z.enum(['A_CUMPRIR', 'EM_ANDAMENTO', 'CUMPRIDA', 'ATRASADA', 'DISPENSADA']),
  dataCumprimento: z.coerce.date().optional(),
})
export type AtualizarStatusCondicionanteDTO = z.infer<typeof AtualizarStatusCondicionanteSchema>

export interface CondicionanteListItemDTO {
  id: string
  licencaId: string
  clienteId: string
  clienteNome: string
  licencaTipo: string
  codigo?: string | null
  descricao: string
  tipo: string
  status: string
  prazo?: Date | null
  proximoPrazo?: Date | null
  dataCumprimento?: Date | null
  responsavelCliente?: string | null
  diasRestantes?: number | null
}

// ─── Resíduos ───────────────────────────
export const MTRResiduoItemSchema = z.object({
  tipoResiduoId: z.string().uuid().optional(),
  codigoIbama: z.string().optional(),
  descricao: z.string().min(1),
  quantidade: z.number().positive(),
  unidadeMedida: z.string().min(1),
})
export type MTRResiduoItemDTO = z.infer<typeof MTRResiduoItemSchema>

export const EmitirMTRSchema = z.object({
  clienteId: z.string().uuid(),
  fonteGeradoraId: z.string().uuid(),
  transportadoraId: z.string().uuid(),
  destinadorId: z.string().uuid(),
  tipoDestinacao: z.string(),
  volume: z.number().positive().optional(),
  unidadeMedida: z.string().optional(),
  numeroMTR: z.string().optional(),
  placaVeiculo: z.string().optional(),
  nomeMotorista: z.string().optional(),
  cpfMotorista: CpfSchema.optional(),
  observacoes: z.string().optional(),
  residuos: z.array(MTRResiduoItemSchema).min(1).optional(),
  criadoPorId: z.string().uuid().optional(),
})
export type EmitirMTRDTO = z.infer<typeof EmitirMTRSchema>

export const AtualizarMTRSchema = z.object({
  clienteId: z.string().uuid().optional(),
  fonteGeradoraId: z.string().uuid().optional(),
  transportadoraId: z.string().uuid().optional(),
  destinadorId: z.string().uuid().optional(),
  tipoDestinacao: z.string().optional(),
  volume: z.number().positive().optional(),
  unidadeMedida: z.string().optional(),
  numeroMTR: z.string().optional().nullable(),
  placaVeiculo: z.string().optional().nullable(),
  nomeMotorista: z.string().optional().nullable(),
  cpfMotorista: CpfSchema.optional().nullable(),
  observacoes: z.string().optional().nullable(),
  residuos: z.array(MTRResiduoItemSchema).min(1).optional(),
})
export type AtualizarMTRDTO = z.infer<typeof AtualizarMTRSchema>

export interface MTRResponseDTO {
  id: string
  numeroMTR?: string | null
  status: string
  clienteId: string
  fonteGeradoraId: string
  transportadoraId: string
  destinadorId: string
  tipoDestinacao: string
  volume: number
  unidadeMedida: string
  dataEmissao: Date
  dataColeta?: Date | null
  dataRecebimento?: Date | null
  placaVeiculo?: string | null
  nomeMotorista?: string | null
  cpfMotorista?: string | null
  observacoes?: string | null
  residuos?: MTRResiduoItemDTO[]
}

export const AvancarStatusMTRSchema = z.object({
  mtrId: z.string().uuid(),
  novoStatus: z.string(),
})
export type AvancarStatusMTRDTO = z.infer<typeof AvancarStatusMTRSchema>

export const EmitirCDFSchema = z.object({
  clienteId: z.string().uuid(),
  destinadorId: z.string().uuid(),
  mtrIds: z.array(z.string().uuid()).min(1),
  sistema: z.enum(['SINIR', 'SIGOR']).optional(),
  numeroCdf: z.string().optional(),
  numeroCdfExterno: z.string().optional(),
  dataEmissao: z.coerce.date().optional(),
  observacoes: z.string().optional(),
  criadoPorId: z.string().uuid().optional(),
})
export type EmitirCDFDTO = z.infer<typeof EmitirCDFSchema>

export interface CDFResponseDTO {
  id: string
  clienteId: string
  destinadorId: string
  sistema: 'SINIR' | 'SIGOR'
  status: string
  numeroCdf: string
  numeroCdfExterno?: string | null
  dataEmissao: Date
  observacoes?: string | null
  mtrIds: string[]
}

export const CriarFonteGeradoraSchema = z.object({
  clienteId: z.string().uuid(),
  instalacaoId: z.string().uuid().optional(),
  tipoResiduoId: z.string().uuid(),
  descricao: z.string().optional(),
  volumeEstimadoMes: z.number().optional(),
  unidadeMedida: z.string(),
})
export type CriarFonteGeradoraDTO = z.infer<typeof CriarFonteGeradoraSchema>

export interface FonteGeradoraResponseDTO {
  id: string
  clienteId: string
  descricao?: string | null
  ativa: boolean
}

export interface FonteGeradoraOptionDTO {
  id: string
  clienteId: string
  descricao?: string | null
  unidadeMedida: string
  ativa: boolean
}

export interface ParceiroResponseDTO {
  id: string
  nome: string
  tipo: string
  licencaAtiva: boolean
  licencaValidade?: Date | null
  sistemaPrincipal?: 'SINIR' | 'SIGOR'
  sinirHabilitado?: boolean
  sinirCadastroId?: string | null
  sigorHabilitado?: boolean
  sigorCadastroId?: string | null
  tipoServico?: string | null
}

export const CriarParceiroSchema = z.object({
  nome: z.string().min(2),
  cnpj: CnpjSchema,
  tipo: z.enum(['TRANSPORTADORA', 'DESTINADOR_FINAL', 'TRANSPORTADORA_E_DESTINADOR']),
  sistemaPrincipal: z.enum(['SINIR', 'SIGOR']).optional(),
  sinirHabilitado: z.boolean().optional(),
  sinirCadastroId: z.string().optional(),
  sigorHabilitado: z.boolean().optional(),
  sigorCadastroId: z.string().optional(),
  tipoServico: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  licencaNumero: z.string().optional(),
  licencaValidade: z.coerce.date().optional(),
  licencaUrl: z.string().optional(),
  licencaAtiva: z.boolean().optional(),
})
export type CriarParceiroDTO = z.infer<typeof CriarParceiroSchema>

export const VincularParceiroClienteSchema = z.object({
  clienteId: z.string().uuid(),
  parceiroId: z.string().uuid(),
  papel: PapelClienteParceiroSchema,
  sistemaIntegracao: z.enum(['SINIR', 'SIGOR']).optional(),
  codigoCadastroExterno: z.string().optional(),
  observacoes: z.string().optional(),
})
export type VincularParceiroClienteDTO = z.infer<typeof VincularParceiroClienteSchema>

export interface ClienteParceiroVinculoResponseDTO {
  id: string
  clienteId: string
  parceiroId: string
  papel: (typeof papelClienteParceiroValues)[number]
  sistemaIntegracao: 'SINIR' | 'SIGOR'
  codigoCadastroExterno?: string | null
  observacoes?: string | null
  ativo: boolean
  parceiro: ParceiroResponseDTO
}

export interface TipoResiduoOptionDTO {
  id: string
  codigoIbama?: string | null
  descricao: string
  classe: string
  estadoFisico: string
  perigoso: boolean
}
