import { motion } from "framer-motion";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useMemo } from "react";

/** Generate CSS-only floating leaf particles */
function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 8,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      hue: 140 + Math.random() * 40,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="floating-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: `hsl(${p.hue}, 70%, 50%)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Organic leaf pattern SVG for the decorative side */
function LeafPattern() {
  return (
    <svg className="w-full h-full opacity-[0.04]" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M200 50C200 50 280 120 280 220C280 320 200 380 200 380C200 380 120 320 120 220C120 120 200 50 200 50Z" stroke="currentColor" strokeWidth="1" className="text-primary" />
      <path d="M200 100C200 100 260 150 260 230C260 310 200 350 200 350C200 350 140 310 140 230C140 150 200 100 200 100Z" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
      <path d="M200 380L200 550" stroke="currentColor" strokeWidth="1" className="text-primary" />
      <path d="M100 200C100 200 160 180 200 220C240 260 260 320 260 320" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
      <path d="M300 150C300 150 240 170 200 220C160 270 140 340 140 340" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
      {/* Smaller leaves */}
      <path d="M80 400C80 400 120 370 130 340C140 370 100 420 80 400Z" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
      <path d="M320 450C320 450 280 420 270 390C260 420 300 470 320 450Z" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
      <path d="M150 500C150 500 180 480 190 460C200 480 170 520 150 500Z" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
      {/* Dots / spores */}
      <circle cx="160" cy="180" r="2" fill="currentColor" className="text-primary" opacity="0.3" />
      <circle cx="240" cy="280" r="2" fill="currentColor" className="text-primary" opacity="0.3" />
      <circle cx="180" cy="300" r="1.5" fill="currentColor" className="text-accent" opacity="0.3" />
      <circle cx="220" cy="160" r="1.5" fill="currentColor" className="text-accent" opacity="0.3" />
      <circle cx="200" cy="240" r="3" fill="currentColor" className="text-primary" opacity="0.15" />
    </svg>
  );
}

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Already logged in → redirect
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] animate-gradient" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-accent/6 rounded-full blur-[140px] animate-gradient" style={{ animationDelay: '3s' }} />
      <div className="absolute top-3/4 left-1/3 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[100px]" />

      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-80 h-[480px]"
        >
          <LeafPattern />
          
          {/* Centered branding over the pattern */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 animate-leaf-sway h-[120px] w-[300px] overflow-hidden flex items-center justify-center">
                <img
                  src="/logo-comp.png"
                  alt="Logo Greenly"
                  className="h-full w-full object-contain scale-[1.55] dark:brightness-[1.3] dark:contrast-110"
                />
              </div>
              <p className="text-muted-foreground/60 text-sm max-w-[240px] leading-relaxed">
                Plataforma inteligente de compliance e gestão ambiental
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom stats on left panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-12 left-12 right-12"
        >
          <div className="flex items-center gap-6 justify-center">
            {[
              { value: "100%", label: "Compliance" },
              { value: "24/7", label: "Monitoramento" },
              { value: "0", label: "Riscos legais" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-semibold text-primary tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center relative">
        {/* Subtle left border glow */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm px-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 h-[84px] w-[220px] overflow-hidden flex items-center justify-center"
            >
              <img
                src="/logo-comp.png"
                alt="Logo Greenly"
                className="h-full w-full object-contain scale-[1.45] dark:brightness-[1.3] dark:contrast-110"
              />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-1">Compliance ambiental inteligente</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-primary uppercase tracking-[0.15em] font-medium mb-2">Acesso à plataforma</p>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Bem-vindo de volta</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Entre com suas credenciais para continuar</p>
            </motion.div>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="glass-card p-7 gradient-border"
          >
            <LoginForm />

            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-xs text-muted-foreground/60">
                Não tem uma conta?{" "}
                <button className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Solicite acesso
                </button>
              </p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-[11px] text-muted-foreground/30 mt-8"
          >
            © 2026 Greenly — Compliance Ambiental
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
