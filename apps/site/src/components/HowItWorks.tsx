import { useInView } from '@/hooks/useInView'
import { DatabaseZap, Rocket, ShieldCheck, Users } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Users,
    title: 'Kickoff operacional',
    description: 'Mapeamos carteira, responsabilidades e prioridades para configurar o tenant da consultoria.',
  },
  {
    number: '02',
    icon: DatabaseZap,
    title: 'Onboarding de dados',
    description: 'Importamos clientes, licenças e documentos. Cadastro ganha aceleração com busca de CNPJ e CEP.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Operação integrada',
    description: 'Time passa a operar licenças, condicionantes, resíduos, agenda e documentos em fluxo único.',
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Governança contínua',
    description: 'Alertas, auditoria, dashboards e integrações governamentais sustentam evolução com segurança.',
  },
]

export default function HowItWorks() {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  return (
    <section id="como-funciona" className="relative py-32 overflow-hidden bg-[#f8fafc]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span
            className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Implementação guiada
          </span>
          <h2
            className={`section-title mb-6 transition-all duration-700 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Como colocamos sua operação no
            <span className="gradient-text"> modo Greenly</span>
          </h2>
          <p
            className={`section-subtitle mx-auto transition-all duration-700 delay-200 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Fluxo direto para entrar em produção rápido, sem perder histórico e sem travar o time no meio da migração.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ number, icon: Icon, title, description }, i) => (
            <div
              key={number}
              className={`relative transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-greenly-200 to-transparent" />
                </div>
              )}

              <div className="glass-card p-7 h-full hover:border-greenly-300 !bg-white shadow-sm transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-4xl font-black text-greenly-100 group-hover:text-greenly-200 transition-colors">
                    {number}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-greenly-50 border border-greenly-100 flex items-center justify-center group-hover:bg-greenly-100 transition-colors">
                    <Icon className="w-5 h-5 text-greenly-600" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
