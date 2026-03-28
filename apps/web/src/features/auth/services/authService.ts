import api from '@/lib/api'
import { LoginDTO, LoginResponseDTO, RegistrarUsuarioDTO } from '@greenly/shared'

export interface AuthUser {
  id: string
  nome: string
  email: string
  role: string
  consultoriaId?: string
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
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
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
