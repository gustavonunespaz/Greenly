import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileCheck, AlertTriangle, Truck, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificacoes } from "@/features/notificacoes/hooks/useNotificacoes";

const iconMap = {
  licenca: FileCheck,
  condicionante: AlertTriangle,
  mtr: Truck,
};

const urgenciaColors = {
  alta: "bg-destructive/15 text-destructive border-destructive/20",
  media: "bg-warning/15 text-warning border-warning/20",
  baixa: "bg-primary/15 text-primary border-primary/20",
};

export default function NotificacoesPage() {
  const { notificacoes, isLoading, marcarComoLida } = useNotificacoes();

  if (isLoading) {
    return (
      <AppLayout title="Notificações">
        <div className="flex items-center justify-center p-20">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Notificações">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {notificacoes?.filter(n => !n.lidaEm).length ?? 0} não lida(s)
          </p>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Marcar todas como lidas
          </Button>
        </div>

        <div className="space-y-3">
          {notificacoes?.map((notif, i) => {
            const Icon = (iconMap as any)[notif.tipo] || Bell;
            const lida = !!notif.lidaEm;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !lida && marcarComoLida(notif.id)}
              >
                <Card className={`glass-card-hover cursor-pointer transition-all ${!lida ? "border-l-2 border-l-primary" : "opacity-70"}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${urgenciaColors[notif.urgencia]}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${!lida ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.titulo}
                        </p>
                        {!lida && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notif.mensagem}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground/60">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {new Date(notif.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${urgenciaColors[notif.urgencia]}`}>
                      {notif.urgencia === "alta" ? "Urgente" : notif.urgencia === "media" ? "Atenção" : "Info"}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
