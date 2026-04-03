import { useState, useEffect } from 'react'
import { trackCTA } from '@/lib/tracking'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src="/logo-comp.png" 
              alt="Greenly — Gestão e Compliance Ambiental" 
              className="h-10 w-auto transition-all duration-300 transform group-hover:scale-105" 
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-greenly-700 rounded-lg hover:bg-greenly-50/80 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="http://localhost:8080/login"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-greenly-700 transition-colors"
            >
              Entrar
            </a>
            <a
              href="http://localhost:8080/register"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-greenly-700 transition-colors"
            >
              Criar conta
            </a>
            <a
              href="#contato"
              onClick={() => trackCTA('nav_demo', 'navbar')}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-greenly-600 to-greenly-500 rounded-xl hover:shadow-[0_0_30px_rgba(5,150,105,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Falar com especialista
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-96 border-b border-gray-200 shadow-sm' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-4 bg-white/95 backdrop-blur-md space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:text-greenly-700 hover:bg-greenly-50/80 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <a href="http://localhost:8080/login" className="block px-4 py-3 text-gray-700 hover:text-greenly-700 font-medium">
              Entrar
            </a>
            <a href="http://localhost:8080/register" className="block px-4 py-3 text-gray-700 hover:text-greenly-700 font-medium">
              Criar conta
            </a>
            <a
              href="#contato"
              onClick={() => { trackCTA('nav_demo_mobile', 'navbar'); setMobileOpen(false) }}
              className="block px-4 py-3 text-center font-semibold text-white bg-gradient-to-r from-greenly-600 to-greenly-500 rounded-xl"
            >
              Falar com especialista
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
