import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { LoginDTO } from '@greenly/shared'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: authService.getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDTO) => authService.login(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      navigate('/')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth-user'], null)
      navigate('/login')
    }
  })

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isAuthenticated: !!user
  }
}
