import { useInView } from '@/hooks/useInView'
import { useCountUp } from '@/hooks/useCountUp'

const stats = [
  {
    value: 4000,
    suffix: '+',
    label: 'Órgãos ambientais no catálogo',
    description: 'Base nacional para seleção de órgãos federais, estaduais e municipais.',
  },
  {
    value: 2500,
    suffix: '+',
    label: 'Tipos de resíduos (NBR 10.004)',
    description: 'Catálogo técnico para emissão de MTR com padronização operacional.',
  },
  {
    value: 120,
    suffix: ' dias',
    label: 'Antecedência padrão de renovação',
    description: 'Margem automática para monitoramento de prazos críticos de licença.',
  },
  {
    value: 6,
    suffix: ' etapas',
    label: 'Wizard operacional de MTR',
    description: 'Fluxo guiado para emissão com múltiplos itens e rastreabilidade.',
  },
]

export default function Stats() {
  const { ref, isInView } = useInView({ threshold: 0.2 })
  const stat0 = useCountUp(stats[0]!.value, 1800)
  const stat1 = useCountUp(stats[1]!.value, 1800)
  const stat2 = useCountUp(stats[2]!.value, 2200)
  const stat3 = useCountUp(stats[3]!.value, 1400)
  const counters = [stat0, stat1, stat2, stat3]

  return (
    <section className="relative py-24 overflow-hidden bg-greenly-700">
      <div className="absolute inset-0 bg-gradient-to-r from-greenly-800 via-greenly-700 to-greenly-800" />
      <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => {
            const counter = counters[i]!
            return (
              <div
                key={stat.label}
                className={`text-center transition-all duration-700 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="mb-3">
                  <span ref={counter.ref} className="text-5xl lg:text-6xl font-extrabold text-white tabular-nums">
                    {counter.count}
                  </span>
                  <span className="text-2xl lg:text-3xl font-bold text-greenly-200">{stat.suffix}</span>
                </div>
                <p className="text-white font-semibold mb-1">{stat.label}</p>
                <p className="text-greenly-100/80 text-sm">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
