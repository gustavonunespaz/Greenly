import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileCheck, AlertTriangle, Truck, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

const notificacoes = [
  { id: "1", titulo: "Licença LO-2190/2020 vencida", mensagem: "A licença do Frigorífico Oeste venceu há 230 dias. Ação imediata necessária.", tipo: "licenca", urgencia: "alta", lida: false, criadoEm: "2026-03-17T08:00:00" },
  { id: "2", titulo: "Condicionante atrasada — Cond. 3.1", mensagem: "Relatório de emissões atmosféricas da Mineradora Vale Norte está 17 dias atrasado.", tipo: "condicionante", urgencia: "alta", lida: false, criadoEm: "2026-03-16T14:30:00" },
  { id: "3", titulo: "MTR com divergência", mensagem: "MTR-PR-2026-00456 da Sanepar apresenta divergência nos dados de recebimento.", tipo: "mtr", urgencia: "media", lida: false, criadoEm: "2026-03-15T10:15:00" },
  { id: "4", titulo: "Licença LO-3892/2022 vence em 85 dias", mensagem: "Indústria Química Paraná — iniciar processo de renovação.", tipo: "licenca", urgencia: "media", lida: true, criadoEm: "2026-03-14T09:00:00" },
  { id: "5", titulo: "CDF emitido — MTR-PR-2026-00451", mensagem: "Certificado de Destinação Final da Indústria Química Paraná disponível.", tipo: "mtr", urgencia: "baixa", lida: true, criadoEm: "2026-01-20T16:45:00" },
  { id: "6", titulo: "Condicionante cumprida — PRAD", mensagem: "Plano de recuperação de área degradada da Sanepar ETE Norte foi cumprido.", tipo: "condicionante", urgencia: "baixa", lida: true, criadoEm: "2025-12-01T11:00:00" },
];

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
  return (
    <AppLayout title="Notificações">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {notificacoes.filter(n => !n.lida).length} não lida(s)
          </p>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Marcar todas como lidas
          </Button>
        </div>

        <div className="space-y-3">
          {notificacoes.map((notif, i) => {
            const Icon = iconMap[notif.tipo as keyof typeof iconMap] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`glass-card-hover cursor-pointer transition-all ${!notif.lida ? "border-l-2 border-l-primary" : "opacity-70"}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${urgenciaColors[notif.urgencia as keyof typeof urgenciaColors]}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${!notif.lida ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.titulo}
                        </p>
                        {!notif.lida && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notif.mensagem}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground/60">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {new Date(notif.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${urgenciaColors[notif.urgencia as keyof typeof urgenciaColors]}`}>
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
