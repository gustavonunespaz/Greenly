import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileCheck, AlertTriangle, Truck, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificacoes } from "@/features/notificacoes/hooks/useNotificacoes";

const iconMap = {
  licenca: FileCheck,
  condicionante: AlertTriangle,
  mtr: Truck,
};

const urgenciaColors = {
  alta: "bg-destructive/10 text-destructive border-destructive/20 ring-1 ring-destructive/20",
  media: "bg-warning/10 text-warning border-warning/20 ring-1 ring-warning/20",
  baixa: "bg-primary/10 text-primary border-primary/20 ring-1 ring-primary/20",
};

function SkeletonNotificacoes() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-start gap-4">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-3 w-full max-w-md" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton h-5 w-16 xl:block hidden rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
      <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.2} />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">Nenhuma notificação</h3>
      <p className="text-sm text-muted-foreground/50 max-w-sm">
        Você está em dia com todos os alertas do sistema
      </p>
    </div>
  );
}

export default function NotificacoesPage() {
  const { notificacoes, isLoading, marcarComoLida } = useNotificacoes();

  const naoLidas = notificacoes?.filter(n => !n.lidaEm).length ?? 0;

  return (
    <AppLayout title="Notificações">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center emerald-glow">
              <Bell className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Alertas Ativos</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {naoLidas} {naoLidas === 1 ? 'notificação não lida' : 'notificações não lidas'}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" className="text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-foreground transition-all duration-200 gap-1.5 h-9 rounded-lg px-3">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Marcar todas como lidas</span>
            <span className="sm:hidden">Lidas</span>
          </Button>
        </div>

        {isLoading ? <SkeletonNotificacoes /> : (!notificacoes || notificacoes.length === 0) ? <EmptyState /> : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notificacoes.map((notif, i) => {
                const Icon = (iconMap as any)[notif.tipo] || Bell;
                const lida = !!notif.lidaEm;
                
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.04, duration: 0.4, ease: "easeOut" }}
                    onClick={() => !lida && marcarComoLida(notif.id)}
                  >
                    <div className={`glass-card p-4 flex items-start gap-4 transition-all duration-300 ${
                      !lida 
                        ? "border-l-[3px] border-l-primary shadow-[0_4px_24px_-8px_hsla(161,94%,30%,0.2)] hover:border-white/[0.12] cursor-pointer cursor-interactive" 
                        : "opacity-60 grayscale-[0.2]"
                    }`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${urgenciaColors[notif.urgencia]}`}>
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className={`text-sm font-medium leading-none ${!lida ? "text-foreground" : "text-muted-foreground"}`}>
                            {notif.titulo}
                          </p>
                          {!lida && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                          )}
                        </div>
                        
                        <p className={`text-[13px] leading-relaxed line-clamp-2 ${!lida ? "text-muted-foreground/80" : "text-muted-foreground/50"}`}>
                          {notif.mensagem}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground/50 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" strokeWidth={1.5} />
                            {new Date(notif.criadoEm).toLocaleDateString("pt-BR", { 
                              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                            })}
                          </span>
                        </div>
                      </div>

                      <Badge variant="outline" className={`text-[9px] uppercase tracking-wider shrink-0 hidden sm:flex ${urgenciaColors[notif.urgencia]}`}>
                        {notif.urgencia === "alta" ? "Urgente" : notif.urgencia === "media" ? "Atenção" : "Info"}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
