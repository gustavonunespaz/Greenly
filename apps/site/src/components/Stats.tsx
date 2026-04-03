import { useInView } from '@/hooks/useInView'
import { useCountUp } from '@/hooks/useCountUp'

const stats = [
  { value: 94, suffix: '%', label: 'Taxa de conformidade dos clientes', description: 'Média de compliance ambiental das consultorias que usam a plataforma' },
  { value: 70, suffix: '%', label: 'Redução de tempo operacional', description: 'Menos tempo em processos manuais e mais tempo em análise estratégica' },
  { value: 120, suffix: ' dias', label: 'Antecedência em renovações', description: 'Alertas automáticos para renovação de licenças com margem confortável' },
  { value: 10, suffix: 'x', label: 'Mais clientes por analista', description: 'Capacidade ampliada com automação e rastreabilidade integrada' },
]

export default function Stats() {
  const { ref, isInView } = useInView({ threshold: 0.2 })
  const stat0 = useCountUp(stats[0]!.value, 2000)
  const stat1 = useCountUp(stats[1]!.value, 2000)
  const stat2 = useCountUp(stats[2]!.value, 2500)
  const stat3 = useCountUp(stats[3]!.value, 1500)
  const counters = [stat0, stat1, stat2, stat3]

  return (
    <section className="relative py-24 overflow-hidden bg-greenly-700">
      {/* Background with green accent */}
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
                  <span className="text-3xl lg:text-4xl font-bold text-greenly-200">{stat.suffix}</span>
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
