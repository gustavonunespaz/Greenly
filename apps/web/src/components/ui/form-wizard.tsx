import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export interface WizardStep {
  id: string
  label: string
  content: ReactNode
  isValid?: boolean
}

interface FormWizardProps {
  steps: WizardStep[]
  onComplete: () => void
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function FormWizard({
  steps,
  onComplete,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Salvar',
}: FormWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const step = steps[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1
  const canAdvance = step?.isValid !== false
  const progressPercent = Math.round(((currentIndex + 1) / steps.length) * 100)

  function goNext() {
    if (!canAdvance || isLast) return
    setDirection(1)
    setCurrentIndex(i => i + 1)
  }

  function goBack() {
    if (isFirst) return
    setDirection(-1)
    setCurrentIndex(i => i - 1)
  }

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d < 0 ? 80 : -80,
      opacity: 0,
    }),
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{step.label}</p>
          <p className="text-[11px] text-muted-foreground">
            Etapa {currentIndex + 1} de {steps.length}
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          Preencha apenas os campos desta etapa para avançar.
        </p>
      </div>

      {/* Step content */}
      <div className="min-h-[220px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {step.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <div>
          {isFirst ? (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Voltar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/40">
            {currentIndex + 1} de {steps.length}
          </span>
          {isLast ? (
            <button
              onClick={onComplete}
              disabled={!canAdvance || isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Salvando...' : submitLabel}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canAdvance}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Próximo
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
