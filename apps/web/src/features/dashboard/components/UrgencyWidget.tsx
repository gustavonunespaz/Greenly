import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface UrgencyWidgetProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  variant: "danger" | "warning" | "success" | "neutral";
  subtitle?: string;
  pulse?: boolean;
}

const variantStyles = {
  danger: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    glow: "0 0 30px -8px hsla(0, 84%, 60%, 0.3)",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    glow: "0 0 30px -8px hsla(38, 92%, 50%, 0.3)",
  },
  success: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "0 0 30px -8px hsla(161, 94%, 30%, 0.3)",
  },
  neutral: {
    text: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-white/[0.06]",
    glow: "none",
  },
};

export function UrgencyWidget({ icon: Icon, label, value, variant, subtitle, pulse }: UrgencyWidgetProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`glass-card p-5 cursor-pointer ${pulse ? "status-pulse" : ""} ${styles.border}`}
      style={{ boxShadow: styles.glow }}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${styles.bg}`}>
          <Icon className={`h-5 w-5 ${styles.text}`} strokeWidth={1.5} />
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-semibold tabular-nums tracking-tight ${styles.text}`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${styles.text}/70`}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
