import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSearch,
  Filter,
  Gauge,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { DocumentoCampoExtraidoDTO, StatusRevisaoDocumento } from "@greenly/shared";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useTrackViewLoaded } from "@/hooks/use-track-view-loaded";
import {
  trackFirstValidAction,
  trackFlowCompleted,
  trackFormError,
} from "@/lib/telemetry";
import { getApiErrorMessage } from "@/lib/http-error";
import { useDocumentos } from "@/features/documentos/hooks/useDocumentos";
import { useDocumentoRevisaoDetalhe } from "@/features/documentos/hooks/useDocumentoRevisaoDetalhe";

const statusOptions: Array<{ value: StatusRevisaoDocumento; label: string }> = [
  { value: "PENDENTE_REVISAO", label: "Pendentes" },
  { value: "APROVADO_SEM_AJUSTES", label: "Aprovados sem ajustes" },
  { value: "APROVADO_COM_AJUSTES", label: "Aprovados com ajustes" },
  { value: "REJEITADO", label: "Rejeitados" },
];

const periodOptions = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

type CampoRevisaoForm = DocumentoCampoExtraidoDTO & {
  valorFinal: string;
};

function formatarData(valor: string | Date | null | undefined): string {
  if (!valor) return "—";
  const date = new Date(valor);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

function normalizarValor(valor: string | null | undefined): string {
  if (!valor) return "";
  return valor.trim().replace(/\s+/g, " ");
}

function isCampoCorrigido(campo: CampoRevisaoForm): boolean {
  return normalizarValor(campo.valor) !== normalizarValor(campo.valorFinal);
}

function classeConfianca(confianca: number): string {
  if (confianca >= 0.8) return "bg-primary/12 text-primary border-primary/30";
  if (confianca >= 0.55) return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/12 text-destructive border-destructive/30";
}

function labelStatus(status: StatusRevisaoDocumento): string {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

export default function DocumentosPage() {
  useTrackViewLoaded("documentos");

  const [statusRevisao, setStatusRevisao] = useState<StatusRevisaoDocumento>("PENDENTE_REVISAO");
  const [periodoDias, setPeriodoDias] = useState<number>(30);
  const [search, setSearch] = useState("");
  const [processamentoSelecionado, setProcessamentoSelecionado] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [camposForm, setCamposForm] = useState<CampoRevisaoForm[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const dialogOpenedAtRef = useRef<number | null>(null);

  const {
    pendentes,
    isLoadingPendentes,
    qualidade,
    isLoadingQualidade,
    revisarDocumento,
    isRevisando,
  } = useDocumentos(statusRevisao, periodoDias);

  const detalheQuery = useDocumentoRevisaoDetalhe(dialogOpen ? processamentoSelecionado : null);
  const detalhe = detalheQuery.data;

  useEffect(() => {
    if (!detalhe) return;
    setCamposForm(
      detalhe.campos.map((campo) => ({
        ...campo,
        valorFinal: campo.valor ?? "",
      })),
    );
    setObservacoes("");
    dialogOpenedAtRef.current = Date.now();
  }, [detalhe]);

  const pendentesFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return pendentes;
    return pendentes.filter((item) => {
      return (
        item.documentoNome.toLowerCase().includes(termo) ||
        item.tipo.toLowerCase().includes(termo) ||
        item.categoria.toLowerCase().includes(termo) ||
        item.perfilCliente.toLowerCase().includes(termo)
      );
    });
  }, [pendentes, search]);

  const camposCorrigidos = camposForm.filter(isCampoCorrigido).length;
  const acuraciaPreview =
    camposForm.length > 0 ? Math.round(((camposForm.length - camposCorrigidos) / camposForm.length) * 100) : 0;

  function abrirRevisao(processamentoDocumentoId: string) {
    setProcessamentoSelecionado(processamentoDocumentoId);
    setDialogOpen(true);
    trackFirstValidAction("documentos", "abrir_revisao_documental", {
      processamentoDocumentoId,
    });
  }

  async function enviarRevisao(status: "APROVADO_SEM_AJUSTES" | "APROVADO_COM_AJUSTES" | "REJEITADO") {
    if (!processamentoSelecionado) return;

    try {
      const elapsedSeconds =
        dialogOpenedAtRef.current !== null
          ? Math.max(0, Math.round((Date.now() - dialogOpenedAtRef.current) / 1000))
          : undefined;

      const payload = {
        statusRevisao: status,
        tempoRevisaoSegundos: elapsedSeconds,
        observacoes: observacoes.trim() || undefined,
        campos: camposForm.map((campo) => ({
          campo: campo.campo,
          valorFinal: normalizarValor(campo.valorFinal) || null,
        })),
      } as const;

      await revisarDocumento({
        processamentoDocumentoId: processamentoSelecionado,
        payload,
      });

      trackFlowCompleted("documentos", "revisao_documental_finalizada", {
        statusRevisao: status,
        camposAvaliados: camposForm.length,
        camposCorrigidos,
        acuraciaPreview,
      });

      toast.success("Revisao documental registrada com sucesso.");
      setDialogOpen(false);
      setProcessamentoSelecionado(null);
      setCamposForm([]);
      setObservacoes("");
    } catch (error: unknown) {
      trackFormError("documentos", "revisao_documental", "Falha ao registrar revisao", {
        statusRevisao: status,
      });
      toast.error(getApiErrorMessage(error, "Nao foi possivel registrar a revisao documental."));
    }
  }

  return (
    <AppLayout title="Documentos">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="glass-card p-4 space-y-1">
            <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">
              Revisados no periodo
            </p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {isLoadingQualidade ? "..." : qualidade?.revisadosTotal ?? 0}
            </p>
          </div>
          <div className="glass-card p-4 space-y-1">
            <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">
              Acuracia media
            </p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {isLoadingQualidade ? "..." : `${qualidade?.acuraciaMediaPct ?? 0}%`}
            </p>
          </div>
          <div className="glass-card p-4 space-y-1">
            <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">
              Retrabalho
            </p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {isLoadingQualidade ? "..." : `${qualidade?.taxaRetrabalhoPct ?? 0}%`}
            </p>
          </div>
          <div className="glass-card p-4 space-y-1">
            <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">
              Tempo medio revisao
            </p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {isLoadingQualidade ? "..." : `${qualidade?.tempoMedioRevisaoSegundos ?? 0}s`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground/50" />
            <Select
              value={statusRevisao}
              onValueChange={(value) => setStatusRevisao(value as StatusRevisaoDocumento)}
            >
              <SelectTrigger className="w-[230px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-muted-foreground/50" />
            <Select value={String(periodoDias)} onValueChange={(value) => setPeriodoDias(Number(value))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative ml-auto w-full sm:w-[280px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, tipo ou perfil..."
              className="pl-8"
            />
          </div>
        </div>

        {isLoadingPendentes ? (
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground">Carregando documentos...</p>
          </div>
        ) : pendentesFiltrados.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="Nenhum documento encontrado"
            description="Nao ha itens para o filtro atual. Ajuste o status de revisao ou o termo de busca."
            actionLabel="Ver pendentes"
            onAction={() => setStatusRevisao("PENDENTE_REVISAO")}
          />
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[1080px]">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Documento
                    </th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Tipo
                    </th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Perfil
                    </th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Confianca
                    </th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Pendencias obrigatorias
                    </th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Status revisao
                    </th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Atualizado em
                    </th>
                    <th className="text-right text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendentesFiltrados.map((item) => (
                    <tr
                      key={item.processamentoDocumentoId}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-foreground">{item.documentoNome}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {item.processamentoDocumentoId.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="font-mono text-[10px] tracking-wide">
                          {item.tipo}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.perfilCliente}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={classeConfianca(item.confiancaMediaExtracao)}>
                          {(item.confiancaMediaExtracao * 100).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {item.camposObrigatoriosPendentes} / {item.camposObrigatoriosTotal}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {labelStatus(item.revisaoStatus)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {formatarData(item.atualizadoEm)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirRevisao(item.processamentoDocumentoId)}
                          >
                            Revisar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen);
          if (!nextOpen) {
            setProcessamentoSelecionado(null);
            setCamposForm([]);
            setObservacoes("");
            dialogOpenedAtRef.current = null;
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Revisao humana da extracao</DialogTitle>
            <DialogDescription>
              Revise os campos sugeridos, ajuste quando necessario e confirme o status final.
            </DialogDescription>
          </DialogHeader>

          {detalheQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando detalhes do documento...</p>
          ) : !detalhe ? (
            <p className="text-sm text-muted-foreground">Nenhum detalhe disponivel para o documento selecionado.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Documento</p>
                  <p className="text-sm text-foreground font-medium mt-1">{detalhe.documentoNome}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Tipo / Perfil</p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {detalhe.tipo} · {detalhe.perfilCliente}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Confianca media</p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {(detalhe.confiancaMediaExtracao * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {detalhe.textoSnippet ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">
                    Trecho extraido
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {detalhe.textoSnippet}
                  </p>
                </div>
              ) : null}

              <div className="max-h-[45vh] overflow-auto border border-white/[0.08] rounded-xl">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 py-2">
                        Campo
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 py-2">
                        Valor sugerido
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 py-2">
                        Valor final
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 py-2">
                        Confianca
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 py-2">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {camposForm.map((campo, index) => {
                      const corrigido = isCampoCorrigido(campo);
                      return (
                        <tr
                          key={`${campo.campo}-${index}`}
                          className="border-b border-white/[0.04] align-top"
                        >
                          <td className="px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {campo.campo}
                              </Badge>
                              {campo.obrigatorio ? (
                                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                  obrigatorio
                                </Badge>
                              ) : null}
                              {corrigido ? (
                                <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">
                                  ajustado
                                </Badge>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {campo.valor || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={campo.valorFinal}
                              onChange={(event) =>
                                setCamposForm((current) =>
                                  current.map((item, idx) =>
                                    idx === index ? { ...item, valorFinal: event.target.value } : item,
                                  ),
                                )
                              }
                              placeholder="Informe valor final"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <Badge variant="outline" className={classeConfianca(campo.confianca)}>
                              {(campo.confianca * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground leading-relaxed min-w-[320px]">
                            {campo.motivo}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Campos avaliados</p>
                  <p className="text-lg font-semibold text-foreground mt-1">{camposForm.length}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Campos corrigidos</p>
                  <p className="text-lg font-semibold text-warning mt-1">{camposCorrigidos}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Acuracia estimada
                  </p>
                  <p className="text-lg font-semibold text-primary mt-1">{acuraciaPreview}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observacoes da revisao</Label>
                <Textarea
                  value={observacoes}
                  onChange={(event) => setObservacoes(event.target.value)}
                  placeholder="Contexto da revisao, ajustes aplicados e observacoes para calibragem."
                />
              </div>
            </div>
          )}

          <DialogFooter className="items-center">
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                Ajustes ajudam a calibrar o modelo por tipo e perfil.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={isRevisando || !detalhe}
                  onClick={() => enviarRevisao("REJEITADO")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  disabled={isRevisando || !detalhe}
                  onClick={() =>
                    enviarRevisao(
                      camposCorrigidos > 0 ? "APROVADO_COM_AJUSTES" : "APROVADO_SEM_AJUSTES",
                    )
                  }
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovar
                </Button>
              </div>
            </div>
          </DialogFooter>

          {detalhe && detalhe.statusProcessamento !== "CONCLUIDO" ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning/90 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Documento ainda nao esta concluido no pipeline. A revisao pode ser inconsistente.
            </div>
          ) : null}

          {detalhe && detalhe.revisaoStatus !== "PENDENTE_REVISAO" ? (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary/90 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Documento ja possui revisao anterior: {labelStatus(detalhe.revisaoStatus)}.
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
