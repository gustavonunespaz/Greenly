import { useInView } from '@/hooks/useInView'
import { AlertTriangle, Clock, FileX, ShieldAlert, TrendingDown, Users } from 'lucide-react'

const painPoints = [
  {
    icon: FileX,
    title: 'Planilhas espalhadas',
    description: 'Licenças, condicionantes e MTRs em dezenas de planilhas sem conexão. Informação fragmentada multiplica erros.',
  },
  {
    icon: Clock,
    title: 'Prazos perdidos',
    description: 'Condicionantes e renovações vencem sem aviso. Quando percebe, já é multa ou embargo.',
  },
  {
    icon: AlertTriangle,
    title: 'Risco de autuação',
    description: 'Sem rastreabilidade, qualquer fiscalização vira emergência. Documentos desatualizados, provas difíceis de localizar.',
  },
  {
    icon: ShieldAlert,
    title: 'Compliance manual',
    description: 'Verificação regulatória feita "no olho". A equipe depende de memória, não de um processo confiável.',
  },
  {
    icon: TrendingDown,
    title: 'Produtividade baixa',
    description: 'Horas gastas preenchendo formulários repetitivos, reconciliando dados e montando relatórios manuais.',
  },
  {
    icon: Users,
    title: 'Escala inviável',
    description: 'Cada novo cliente significa mais planilhas, mais risco e mais trabalho braçal. A consultoria não cresce.',
  },
]

export default function PainPoints() {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  return (
    <section id="solucoes" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className={`inline-block px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            O problema que resolvemos
          </span>
          <h2 className={`section-title mb-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Sua consultoria opera assim?
          </h2>
          <p className={`section-subtitle mx-auto transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Se você reconhece um ou mais desses cenários, a Greenly foi feita para resolver cada um deles.
          </p>
        </div>

        {/* Pain points grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={`glass-card-hover p-7 group transition-all duration-700 !bg-white border-gray-100 shadow-sm ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 group-hover:bg-red-100 transition-colors">
                <Icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Transition line */}
        <div className="mt-20 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />
          <span className="text-red-400 font-medium">Chega de improvisar</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />
        </div>
      </div>
    </section>
  )
}
