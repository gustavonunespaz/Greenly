import { useEffect } from 'react'
import { initTracking } from '@/lib/tracking'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import PainPoints from '@/components/PainPoints'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import ContactCTA from '@/components/ContactCTA'
import Footer from '@/components/Footer'

export default function App() {
  useEffect(() => {
    initTracking()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navbar />

      {/* Sections */}
      <main>
        <Hero />
        <PainPoints />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <ContactCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
