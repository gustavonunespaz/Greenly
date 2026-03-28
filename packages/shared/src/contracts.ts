import { z } from 'zod'

// ─── Shared Validators ──────────────────
export const CnpjSchema = z.string().length(14).regex(/^\d+$/)
export const CpfSchema = z.string().length(11).regex(/^\d+$/)

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
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  setor: z.string().optional(),
  cnae: z.string().optional(),
  nomeResponsavel: z.string().optional(),
  emailResponsavel: z.string().email().optional(),
  telefoneResponsavel: z.string().optional(),
})
export type CriarClienteDTO = z.infer<typeof CriarClienteSchema>

export interface ClienteResponseDTO {
  id: string
  consultoriaId: string
  nome: string
  cnpj: string
  email?: string | null
  telefone?: string | null
  setor?: string | null
  cnae?: string | null
  ativo: boolean
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

export interface LicencaResponseDTO {
  id: string
  clienteId: string
  tipo: string
  status: string
  numeroLicenca?: string | null
  dataValidade?: Date | null
  diasAteVencimento?: number | null
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

// ─── Resíduos ───────────────────────────
export const EmitirMTRSchema = z.object({
  clienteId: z.string().uuid(),
  fonteGeradoraId: z.string().uuid(),
  transportadoraId: z.string().uuid(),
  destinadorId: z.string().uuid(),
  tipoDestinacao: z.string(),
  volume: z.number().positive(),
  unidadeMedida: z.string(),
  numeroMTR: z.string().optional(),
  placaVeiculo: z.string().optional(),
  nomeMotorista: z.string().optional(),
  cpfMotorista: CpfSchema.optional(),
  observacoes: z.string().optional(),
  criadoPorId: z.string().uuid().optional(),
})
export type EmitirMTRDTO = z.infer<typeof EmitirMTRSchema>

export interface MTRResponseDTO {
  id: string
  numeroMTR?: string | null
  status: string
  clienteId: string
  transportadoraId: string
  destinadorId: string
  volume: number
  unidadeMedida: string
  dataEmissao: Date
}

export const AvancarStatusMTRSchema = z.object({
  mtrId: z.string().uuid(),
  novoStatus: z.string(),
})
export type AvancarStatusMTRDTO = z.infer<typeof AvancarStatusMTRSchema>

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
