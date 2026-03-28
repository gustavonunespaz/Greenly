import api from '@/lib/api'
import { LoginDTO, LoginResponseDTO, RegisterDTO } from '@greenly/shared'

export const authService = {
  async login(dto: LoginDTO): Promise<LoginResponseDTO> {
    const { data } = await api.post<LoginResponseDTO>('/auth/login', dto)
    if (data.accessToken) {
      localStorage.setItem('greenly_token', data.accessToken)
    }
    return data
  },

  async register(dto: RegisterDTO): Promise<void> {
    await api.post('/auth/register', dto)
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('greenly_token')
  },

  async getProfile(): Promise<any> {
    const { data } = await api.get('/auth/me')
    return data
  }
}
