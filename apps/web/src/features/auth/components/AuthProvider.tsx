import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService, type AuthUser } from '../services/authService'
import type { LoginDTO } from '@greenly/shared'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (dto: LoginDTO) => Promise<void>
  logout: () => Promise<void>
  loginError: string | null
  isLoggingIn: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const queryClient = useQueryClient()

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isTokenValid()) {
        setIsLoading(false)
        return
      }
      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        localStorage.removeItem('greenly_token')
        localStorage.removeItem('greenly_refresh')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = useCallback(async (dto: LoginDTO) => {
    setLoginError(null)
    setIsLoggingIn(true)
    try {
      const response = await authService.login(dto)
      setUser(response.usuario as AuthUser)
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
    } catch (err: any) {
      const message = err.response?.data?.error || 'E-mail ou senha inválidos'
      setLoginError(message)
      throw err
    } finally {
      setIsLoggingIn(false)
    }
  }, [queryClient])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      loginError,
      isLoggingIn,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
