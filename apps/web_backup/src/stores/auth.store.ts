import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsuarioDTO, UserRole } from '@greenly/shared'

interface AuthState {
  user: UsuarioDTO | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: UsuarioDTO, token: string) => void
  clearAuth: () => void
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      hasRole: (role) => get().user?.role === role,
    }),
    { name: 'greenly:auth' },
  ),
)
