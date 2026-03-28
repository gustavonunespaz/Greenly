import api from '@/lib/api'
import { LoginDTO, LoginResponseDTO, RegistrarUsuarioDTO } from '@greenly/shared'

export interface AuthUser {
  id: string
  nome: string
  email: string
  role: string
  consultoriaId?: string
}

function parseConsultoriaIdFromToken(token: string | null): string | undefined {
  if (!token) return undefined
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.consultoriaId
  } catch {
    return undefined
  }
}

export const authService = {
  async login(dto: LoginDTO): Promise<LoginResponseDTO> {
    const { data } = await api.post<LoginResponseDTO>('/auth/login', dto)
    // Backend retorna { token, refreshToken, usuario }
    if (data.token) {
      localStorage.setItem('greenly_token', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('greenly_refresh', data.refreshToken)
    }

    const consultoriaId = parseConsultoriaIdFromToken(data.token)
    if (consultoriaId) {
      ;(data.usuario as AuthUser).consultoriaId = consultoriaId
    }

    localStorage.setItem('greenly_user', JSON.stringify(data.usuario))
    return data
  },

  async register(dto: RegistrarUsuarioDTO): Promise<void> {
    await api.post('/auth/register', dto)
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('greenly_refresh')
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // silently fail
    }
    localStorage.removeItem('greenly_token')
    localStorage.removeItem('greenly_refresh')
    localStorage.removeItem('greenly_user')
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await api.get<Partial<AuthUser>>('/auth/me')
    const stored = localStorage.getItem('greenly_user')
    const storedUser = stored ? (JSON.parse(stored) as Partial<AuthUser>) : {}
    const token = localStorage.getItem('greenly_token')

    const merged: AuthUser = {
      id: data.id || storedUser.id || '',
      nome: data.nome || storedUser.nome || 'Usuário',
      email: data.email || storedUser.email || '',
      role: data.role || storedUser.role || '',
      consultoriaId: data.consultoriaId || storedUser.consultoriaId || parseConsultoriaIdFromToken(token),
    }

    localStorage.setItem('greenly_user', JSON.stringify(merged))
    return merged
  },

  getStoredToken(): string | null {
    return localStorage.getItem('greenly_token')
  },

  isTokenValid(): boolean {
    const token = localStorage.getItem('greenly_token')
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }
}
