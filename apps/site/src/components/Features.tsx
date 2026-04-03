import { useInView } from '@/hooks/useInView'
import {
  FileCheck, ShieldCheck, Recycle, BarChart3,
  Bell, FileText, Globe, Eye,
} from 'lucide-react'

const features = [
  {
    icon: FileCheck,
    title: 'Licenciamento ambiental',
    description: 'Controle completo de licenças, renovações automáticas com 120 dias de antecedência e vínculo direto com condicionantes.',
    color: 'greenly',
  },
  {
    icon: ShieldCheck,
    title: 'Condicionantes',
    description: 'Pontuais e periódicas, com prazos monitorados, alertas proativos e histórico de cumprimento auditável.',
    color: 'greenly',
  },
  {
    icon: Recycle,
    title: 'Resíduos e MTRs',
    description: 'Fontes geradoras, parceiros, MTRs e CDFs com rastreabilidade ponta a ponta. Integração com SINIR e SIGOR.',
    color: 'cyan',
  },
  {
    icon: FileText,
    title: 'Pipeline documental',
    description: 'Ingestão, classificação e extração com revisão humana. Templates por perfil de cliente e métricas de qualidade.',
    color: 'cyan',
  },
  {
    icon: BarChart3,
    title: 'Dashboard inteligente',
    description: 'KPIs de conformidade, sustentabilidade e vencimentos em tempo real. Visão consolidada com ações rápidas.',
    color: 'violet',
  },
  {
    icon: Bell,
    title: 'Alertas proativos',
    description: 'Notificações acionáveis com deep links para a tela certa. Nunca mais perca um prazo crítico.',
    color: 'violet',
  },
  {
    icon: Globe,
    title: 'Integrações governamentais',
    description: 'Adaptadores SINIR e SIGOR com envio, retorno de status, reconciliação automática e DLQ para resiliência.',
    color: 'amber',
  },
  {
    icon: Eye,
    title: 'Visão micro por cliente',
    description: 'Cockpit completo por empresa: licenças, condicionantes, MTRs, documentos, instalações e indicadores de risco.',
    color: 'amber',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  greenly: { bg: 'bg-greenly-50', border: 'border-greenly-100', icon: 'text-greenly-600' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'text-cyan-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'text-violet-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600' },
}

export default function Features() {
  const { ref, isInView } = useInView({ threshold: 0.05 })

  return (
    <section id="funcionalidades" className="relative py-32 overflow-hidden bg-white">
      <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2074" alt="Nature" className="absolute inset-0 w-full h-full object-cover opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-greenly-50/50 to-white" />
      <div className="gradient-orb w-[500px] h-[500px] bg-greenly-500/10 -right-60 top-40 blur-3xl" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Tudo em um só lugar
          </span>
          <h2 className={`section-title mb-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Funcionalidades que{' '}
            <span className="gradient-text">transformam</span> sua operação
          </h2>
          <p className={`section-subtitle mx-auto transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Cada módulo foi desenhado para resolver uma dor real de consultorias ambientais. 
            Sem complexidade desnecessária, com rastreabilidade completa.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, color }, i) => {
            const colors = colorMap[color] ?? colorMap['greenly']!
            return (
              <div
                key={title}
                className={`glass-card-hover p-6 group transition-all duration-700 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${300 + i * 80}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
