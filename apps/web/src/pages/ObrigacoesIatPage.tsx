import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { Navigate } from 'react-router-dom'

export default function ObrigacoesIatPage() {
  useTrackViewLoaded('obrigacoes_iat')

  return <Navigate to="/obrigacoes/residuos?tipo=IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS" replace />
}
