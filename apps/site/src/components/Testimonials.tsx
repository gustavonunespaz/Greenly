import { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Ana Beatriz Mendes',
    role: 'Diretora Técnica',
    company: 'EcoTech Consultoria Ambiental',
    content: 'Antes da Greenly, gerenciávamos mais de 200 licenças em planilhas. Já perdemos prazos de condicionantes que geraram multas desnecessárias. Com a plataforma, nunca mais aconteceu. Os alertas automáticos são excepcionais.',
    rating: 5,
  },
  {
    name: 'Ricardo Fernandes',
    role: 'Gestor Ambiental',
    company: 'Grupo Sustentare',
    content: 'A visão micro por cliente mudou completamente nosso atendimento. Quando o cliente liga, em 5 segundos tenho toda a situação dele na tela: licenças, condicionantes, MTRs, documentos. Isso é profissionalismo.',
    rating: 5,
  },
  {
    name: 'Carla Souza Oliveira',
    role: 'Coordenadora de Compliance',
    company: 'Verde Solutions Ltda.',
    content: 'O pipeline documental é um divisor de águas. Antes levávamos 2 horas para classificar e arquivar documentos de um único cliente. Hoje a Greenly faz a classificação e pré-extração — revisamos em minutos.',
    rating: 5,
  },
  {
    name: 'Marcos Andrade',
    role: 'CEO',
    company: 'MA Ambiental',
    content: 'Conseguimos triplicar nossa carteira de clientes sem contratar mais gente. A automação de alertas e a integração com SINIR nos deu uma eficiência que antes achávamos impossível para uma consultoria do nosso porte.',
    rating: 5,
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const prev = () => setActive((p) => (p === 0 ? testimonials.length - 1 : p - 1))
  const next = () => setActive((p) => (p === testimonials.length - 1 ? 0 : p + 1))

  const t = testimonials[active]!

  return (
    <section id="depoimentos" className="relative py-32 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Quem já usa
          </span>
          <h2 className={`section-title mb-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            A palavra de quem{' '}
            <span className="gradient-text">confia</span> na Greenly
          </h2>
        </div>

        {/* Testimonial card */}
        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="glass-card p-10 md:p-14 relative !bg-white shadow-sm border border-gray-100">
            {/* Quote icon */}
            <Quote className="absolute top-8 left-8 w-12 h-12 text-greenly-500/10" />
            
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Content */}
            <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 font-light">
              "{t.content}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-greenly-500 to-greenly-600 flex items-center justify-center text-white font-bold text-lg">
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-greenly-600 hover:border-greenly-200 hover:bg-greenly-50 transition-all"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-greenly-600 hover:border-greenly-200 hover:bg-greenly-50 transition-all"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-8 bg-greenly-500' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={`Depoimento ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
