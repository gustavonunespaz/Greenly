import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface UrgencyWidgetProps {
  icon: LucideIcon
  label: string
  value: number | string
  variant: 'danger' | 'warning' | 'success' | 'neutral'
  subtitle?: string
  pulse?: boolean
  onClick?: () => void
}

const variantStyles = {
  danger: {
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/15',
    iconBg: 'bg-destructive/10 ring-1 ring-destructive/20',
    glow: '0 8px 32px -8px hsla(4, 74%, 55%, 0.25)',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/15',
    iconBg: 'bg-warning/10 ring-1 ring-warning/20',
    glow: '0 8px 32px -8px hsla(38, 92%, 50%, 0.25)',
  },
  success: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/15',
    iconBg: 'bg-primary/10 ring-1 ring-primary/20',
    glow: '0 8px 32px -8px hsla(161, 94%, 30%, 0.25)',
  },
  neutral: {
    text: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-white/[0.06]',
    iconBg: 'bg-white/[0.04] ring-1 ring-white/[0.06]',
    glow: 'none',
  },
}

/** Counter animation for numbers */
function AnimatedNumber({ value }: { value: number | string }) {
  const [display, setDisplay] = useState<string>('0')
  const prevRef = useRef<number>(0)

  useEffect(() => {
    if (typeof value === 'string') {
      setDisplay(value)
      return
    }

    const from = prevRef.current
    const to = value
    const duration = 800
    const steps = 30
    const increment = (to - from) / steps
    let current = from
    let step = 0

    const interval = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        current = to
        clearInterval(interval)
      }
      setDisplay(Math.round(current).toString())
    }, duration / steps)

    prevRef.current = to
    return () => clearInterval(interval)
  }, [value])

  return <>{display}</>
}

export function UrgencyWidget({
  icon: Icon,
  label,
  value,
  variant,
  subtitle,
  pulse,
  onClick,
}: UrgencyWidgetProps) {
  const styles = variantStyles[variant]

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`glass-card p-5 cursor-pointer ${pulse ? 'status-pulse' : ''} ${styles.border}`}
      style={{ boxShadow: styles.glow }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
          <Icon className={`h-5 w-5 ${styles.text}`} strokeWidth={1.5} />
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-semibold tabular-nums tracking-tight ${styles.text}`}>
          <AnimatedNumber value={value} />
        </p>
        <p className="text-[13px] text-muted-foreground/70 mt-1.5">{label}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground/40 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  )
}
