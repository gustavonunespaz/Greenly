import { ObrigacoesAmbientaisModulePage } from '@/features/obrigacoes-ambientais/components/ObrigacoesAmbientaisModulePage'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'

export default function ObrigacoesEmissoesPage() {
  useTrackViewLoaded('obrigacoes_emissoes')

  return (
    <ObrigacoesAmbientaisModulePage
      modulo="EMISSOES_ATMOSFERICAS"
      title="Módulo Emissões Atmosféricas"
      subtitle="Inventário de GEE + declarações do IAT de carga poluidora e emissões atmosféricas."
      tiposPermitidos={[
        'GEE_INVENTARIO',
        'IAT_DECLARACAO_CARGA_POLUIDORA',
        'IAT_DECLARACAO_EMISSOES_ATMOSFERICAS',
      ]}
    />
  )
}
