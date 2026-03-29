import { useQuery } from '@tanstack/react-query'
import { DashboardMetricKey, dashboardService } from '../services/dashboardService'

export function useDashboard() {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  })

  return {
    metrics,
    isLoading,
    error,
  }
}

export function useDashboardMetricDetails(metricKey?: DashboardMetricKey | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metric-details', metricKey],
    queryFn: () => dashboardService.getMetricDetails(metricKey as DashboardMetricKey),
    enabled: !!metricKey,
  })

  return {
    details: data ?? [],
    isLoading,
    error,
  }
}
