export type UserRole = 'CONSULTORIA_ADMIN' | 'ANALISTA_AMBIENTAL' | 'CLIENTE_VIEWER'
export type UserStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE_CONFIRMACAO' | 'BLOQUEADO'

export interface UsuarioDTO {
  id: string
  nome: string
  email: string
  role: UserRole
  status: UserStatus
  consultoriaId: string
  avatarUrl?: string | null
  criadoEm: string
}
