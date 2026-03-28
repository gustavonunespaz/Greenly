import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export function useDashboard() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  })

  return {
    metrics,
    isLoading,
    error
  }
}
