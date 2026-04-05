import { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'A Greenly atende apenas consultorias ambientais?',
    a: 'Não. O foco principal é consultoria ambiental, mas times internos de compliance também operam bem na plataforma com a mesma base de módulos.',
  },
  {
    q: 'Quais módulos já estão prontos hoje?',
    a: 'Licenças, condicionantes, resíduos (MTR/CDF), agenda e tarefas, saneamento, IBAMA, pipeline documental, notificações, auditoria e dashboards operacionais.',
  },
  {
    q: 'Como funciona a integração com SINIR e SIGOR na prática?',
    a: 'A integração já opera com envio, reconciliação e atualização de status. A arquitetura inclui retries, DLQ e webhook deduplicado para manter a operação resiliente.',
  },
  {
    q: 'Consigo importar dados sem parar a operação atual?',
    a: 'Sim. O onboarding é assistido e pode começar com uma carteira piloto. A migração é progressiva para evitar ruptura no processo do time.',
  },
  {
    q: 'Existe apoio para cadastro inicial de clientes?',
    a: 'Sim. O sistema tem consulta de CNPJ para autopreenchimento de dados e integração de localidade (estado, cidade e endereço) para reduzir retrabalho.',
  },
  {
    q: 'A plataforma tem rastreabilidade para auditorias?',
    a: 'Temos trilha de auditoria com eventos críticos, histórico de integrações e logs por entidade para sustentar fiscalização e governança interna.',
  },
  {
    q: 'Como funcionam alertas e prazos?',
    a: 'Os alertas são configuráveis por item (`notificacaoDias`) e chegam com ação direta para a tela certa, reduzindo risco de perda de prazo.',
  },
  {
    q: 'Qual é o modelo de contrato?',
    a: 'A contratação é mensal, com suporte de implantação. O escopo de acompanhamento varia conforme o plano acordado com o time comercial.',
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
        <div className="text-center mb-16">
          <span
            className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Perguntas frequentes
          </span>
          <h2
            className={`section-title mb-6 transition-all duration-700 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Dúvidas sobre o estado atual da plataforma
          </h2>
        </div>

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
