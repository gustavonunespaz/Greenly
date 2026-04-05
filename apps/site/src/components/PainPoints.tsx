import { useInView } from '@/hooks/useInView'
import { CalendarCheck2, FileCheck2, Globe2, Layers3, Radar, Workflow } from 'lucide-react'

const painPoints = [
  {
    icon: Workflow,
    title: 'Operação ponta a ponta',
    description: 'Cliente, licença, condicionante, MTR/CDF, documento, tarefa e alerta conectados no mesmo fluxo.',
  },
  {
    icon: CalendarCheck2,
    title: 'Agenda híbrida',
    description: 'Compromissos ambientais em calendário e tarefas em Kanban com drag-and-drop e antecedência configurável.',
  },
  {
    icon: Globe2,
    title: 'Integração governamental resiliente',
    description: 'SINIR e SIGOR com envio, reconciliação, webhook deduplicado, retry e DLQ para falhas definitivas.',
  },
  {
    icon: Radar,
    title: 'Visão micro + dashboard executivo',
    description: 'Drill-down de risco, vencimentos e rastreabilidade com navegação direta para o item operacional de origem.',
  },
  {
    icon: Layers3,
    title: 'Base regulatória pronta',
    description: 'Mais de 4k órgãos ambientais e 2.5k tipos de resíduos (NBR 10.004) disponíveis no onboarding.',
  },
  {
    icon: FileCheck2,
    title: 'Documento que gera ação',
    description: 'Pipeline com classificação, revisão por campo, reprocessamento com SLA e sugestão automática de condicionantes.',
  },
]

export default function PainPoints() {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  return (
    <section id="diferenciais" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-100 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Diferenciais do produto
          </span>
          <h2 className={`section-title mb-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            O que torna a Greenly
            <span className="gradient-text"> diferente hoje</span>
          </h2>
          <p className={`section-subtitle mx-auto transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Foco em execução operacional com confiabilidade técnica e governança regulatória no mesmo ambiente.
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
              <div className="w-12 h-12 rounded-xl bg-greenly-50 border border-greenly-100 flex items-center justify-center mb-5 group-hover:bg-greenly-100 transition-colors">
                <Icon className="w-6 h-6 text-greenly-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-greenly-200 to-transparent" />
          <span className="text-greenly-600 font-medium">Vantagem operacional real</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-greenly-200 to-transparent" />
        </div>
      </div>
    </section>
  )
}
