import { ObrigacoesAmbientaisModulePage } from '@/features/obrigacoes-ambientais/components/ObrigacoesAmbientaisModulePage'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'

export default function ObrigacoesIbamaPage() {
  useTrackViewLoaded('obrigacoes_ibama')

  return (
    <ObrigacoesAmbientaisModulePage
      modulo="IBAMA"
      title="Módulo IBAMA"
      subtitle="CTF, TCFA e RAPP em um fluxo único de controle e entrega."
      tiposPermitidos={['IBAMA_CTF', 'IBAMA_TCFA', 'IBAMA_RAPP']}
    />
  )
}
