import { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'A Greenly atende empresas com gestão ambiental interna ou só consultorias?',
    a: 'Atendemos ambos. A plataforma é projetada para consultorias ambientais, mas também serve empresas que fazem autogestão. Na configuração, você define o tipo de operação e a interface se adapta ao seu perfil.',
  },
  {
    q: 'Como funciona a integração com SINIR e SIGOR?',
    a: 'Temos adaptadores HTTP dedicados para cada sistema. O envio de MTRs e CDFs é feito pela plataforma com rastreabilidade completa: tentativas, retornos, reconciliação automática e DLQ para erros. Tudo auditável.',
  },
  {
    q: 'Preciso migrar todos os meus dados de uma vez?',
    a: 'Não. Nosso onboarding é assistido e gradual. Você pode começar com um cliente-piloto, validar os fluxos e depois migrar a carteira inteira. Fornecemos ferramentas de importação e suporte dedicado.',
  },
  {
    q: 'Os dados ficam seguros? Como funciona a segregação multi-tenant?',
    a: 'Cada consultoria opera em um tenant isolado com segregação lógica por consultoriaId em todas as operações. A autenticação usa JWT com refresh token persistido, e toda ação é rastreada em trilha de auditoria.',
  },
  {
    q: 'Quais documentos a plataforma processa automaticamente?',
    a: 'Licenças, requerimentos, MTRs, CDFs, documentos IBAMA/CTF/TCFA e mais. A classificação é automática por tipo, com extração de campos e revisão humana quando necessário. O sistema aprende com as correções.',
  },
  {
    q: 'Existe contrato de fidelidade ou período mínimo?',
    a: 'Não. Nossos planos são mensais e você pode cancelar a qualquer momento. Acreditamos que a permanência deve ser por valor entregue, não por obrigação contratual.',
  },
  {
    q: 'A plataforma funciona offline?',
    a: 'Estamos desenvolvendo o modo offline-first (PWA) para operações de campo. Na versão atual, a plataforma opera 100% online, com performance otimizada para conexões mais lentas.',
  },
  {
    q: 'Como funciona o suporte técnico?',
    a: 'Oferecemos suporte humanizado por chat e e-mail com SLA de resposta. Para planos Enterprise, incluímos gestor de conta dedicado e treinamento periódico da equipe.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="relative py-32 overflow-hidden bg-[#f8fafc]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Perguntas frequentes
          </span>
          <h2 className={`section-title mb-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Tudo que você precisa saber
          </h2>
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`glass-card overflow-hidden !bg-white shadow-sm border transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${openIndex === i ? 'border-greenly-200' : 'border-gray-100'}`}
              style={{ transitionDelay: `${200 + i * 60}ms` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-gray-900 font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180 text-greenly-600' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
