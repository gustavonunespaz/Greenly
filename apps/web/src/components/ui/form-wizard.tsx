import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
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
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const isPast = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => {
                  if (i < currentIndex) {
                    setDirection(-1)
                    setCurrentIndex(i)
                  }
                }}
                disabled={i > currentIndex}
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-all duration-200 ${
                  isCurrent
                    ? 'text-primary'
                    : isPast
                      ? 'text-primary/60 cursor-pointer hover:text-primary'
                      : 'text-muted-foreground/35'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-200 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/25'
                      : isPast
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white/[0.06] text-muted-foreground/40'
                  }`}
                >
                  {isPast ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="hidden sm:inline truncate">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px transition-all duration-300 ${
                    isPast ? 'bg-primary/40' : 'bg-white/[0.08]'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[250px] relative overflow-hidden">
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
