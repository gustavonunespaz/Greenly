import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/8 rounded-full blur-[128px]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background))_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-16 w-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 emerald-glow"
          >
            <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Greenly</h1>
          <p className="text-sm text-muted-foreground mt-1">Compliance ambiental inteligente</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <LoginForm />

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-muted-foreground">
              Não tem uma conta?{" "}
              <button className="text-primary hover:text-primary/80 transition-colors font-medium">
                Solicite acesso
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-8">
          © 2026 Greenly — Compliance Ambiental
        </p>
      </motion.div>
    </div>
  );
}
