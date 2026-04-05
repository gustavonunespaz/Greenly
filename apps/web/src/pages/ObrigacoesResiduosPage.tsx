import { ObrigacoesAmbientaisModulePage } from '@/features/obrigacoes-ambientais/components/ObrigacoesAmbientaisModulePage'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'

export default function ObrigacoesResiduosPage() {
  useTrackViewLoaded('obrigacoes_residuos')

  return (
    <ObrigacoesAmbientaisModulePage
      modulo="RESIDUOS"
      title="Módulo Resíduos"
      subtitle="SINIR (Inventário e DMR) + Inventário de Resíduos Industriais do IAT."
      tiposPermitidos={[
        'SINIR_INVENTARIO_NACIONAL',
        'SINIR_DMR',
        'IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS',
      ]}
    />
  )
}
