import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Gauge,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import type {
  DocumentoCampoExtraidoDTO,
  OrigemProcessamentoDocumento,
  StatusRevisaoDocumento,
} from "@greenly/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { documentoService } from "@/features/documentos/services/documentoService";
import { useDocumentoCrudSugestao } from "@/features/documentos/hooks/useDocumentoCrudSugestao";
import { useDocumentoRevisaoDetalhe } from "@/features/documentos/hooks/useDocumentoRevisaoDetalhe";
import { getApiErrorMessage } from "@/lib/http-error";

const ARQUIVOS_ACEITOS =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CampoRevisaoForm = DocumentoCampoExtraidoDTO & {
  valorFinal: string;
};

type ModuloExtracao = "LICENCA" | "MTR";

interface DocumentoExtracaoInlineProps {
  modulo: ModuloExtracao;
  clienteId?: string | null;
  clienteNome?: string | null;
  licencaId?: string | null;
}

function defaultCrudPayload(modulo: ModuloExtracao) {
  if (modulo === "LICENCA") {
    return {
      aplicarLicenca: true,
      aplicarMtr: false,
      aplicarCondicionantes: true,
    };
  }

  return {
    aplicarLicenca: false,
    aplicarMtr: true,
    aplicarCondicionantes: false,
  };
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
  switch (status) {
    case "PENDENTE_REVISAO":
      return "Pendente";
    case "APROVADO_SEM_AJUSTES":
      return "Aprovado sem ajustes";
    case "APROVADO_COM_AJUSTES":
      return "Aprovado com ajustes";
    case "REJEITADO":
      return "Rejeitado";
    default:
      return status;
  }
}

const CAMPO_CRUD_LABELS: Record<string, string> = {
  clienteId: "Cliente",
  orgaoAmbientalId: "Orgao ambiental",
  tipo: "Tipo",
  status: "Status",
  numeroProcesso: "Numero do processo",
  numeroLicenca: "Numero da licenca",
  dataEmissao: "Data de emissao",
  dataValidade: "Data de validade",
  municipioEmissor: "Municipio emissor",
  observacoes: "Observacoes",
  fonteGeradoraId: "Ponto de geracao",
  transportadoraId: "Transportadora",
  destinadorId: "Destinador",
  tipoDestinacao: "Metodo de destinacao",
  nomeMotorista: "Motorista",
  cpfMotorista: "CPF do motorista",
  placaVeiculo: "Placa do veiculo",
  dataTransporte: "Data do transporte",
  numeroMTR: "Numero do MTR",
};

function resumirCamposCrud(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload || {});
  if (!keys.length) return "Nenhum campo detectado automaticamente";

  const labels = keys.map((key) => CAMPO_CRUD_LABELS[key] || key);
  if (labels.length <= 4) return labels.join(", ");
  return `${labels.slice(0, 4).join(", ")} e +${labels.length - 4}`;
}

function origemPorModulo(modulo: ModuloExtracao): OrigemProcessamentoDocumento {
  return modulo === "LICENCA" ? "UPLOAD_LICENCA" : "UPLOAD_MTR";
}

function tituloModulo(modulo: ModuloExtracao): string {
  return modulo === "LICENCA" ? "Licencas" : "MTRs";
}

export function DocumentoExtracaoInline({
  modulo,
  clienteId,
  clienteNome,
  licencaId,
}: DocumentoExtracaoInlineProps) {
  const queryClient = useQueryClient();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const dialogOpenedAtRef = useRef<number | null>(null);

  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [processamentoSelecionado, setProcessamentoSelecionado] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crudDialogOpen, setCrudDialogOpen] = useState(false);
  const [camposForm, setCamposForm] = useState<CampoRevisaoForm[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [crudPayload, setCrudPayload] = useState(defaultCrudPayload(modulo));
  const [resultadoAplicacaoCrud, setResultadoAplicacaoCrud] = useState<{
    aplicacaoEm: string;
    resultados: Array<{
      aplicado: boolean;
      entidadeId: string | null;
      entidadeTipo: "LICENCA" | "MTR" | "CONDICIONANTE";
      camposAtualizados: string[];
      mensagem: string;
    }>;
    avisos: string[];
  } | null>(null);

  const detalheQuery = useDocumentoRevisaoDetalhe(dialogOpen ? processamentoSelecionado : null, {
    polling: dialogOpen,
    enabled: dialogOpen,
  });

  const sugestaoCrudQuery = useDocumentoCrudSugestao(
    crudDialogOpen ? processamentoSelecionado : null,
    crudDialogOpen,
  );

  const detalhe = detalheQuery.data;
  const sugestaoCrud = sugestaoCrudQuery.data;

  useEffect(() => {
    setCrudPayload(defaultCrudPayload(modulo));
  }, [modulo]);

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

  const ingestaoMutation = useMutation({
    mutationFn: ({
      arquivo,
      origem,
      clienteIdMetadata,
      licencaIdMetadata,
    }: {
      arquivo: File;
      origem: OrigemProcessamentoDocumento;
      clienteIdMetadata?: string;
      licencaIdMetadata?: string;
    }) =>
      documentoService.ingerirDocumento(arquivo, {
        origem,
        clienteId: clienteIdMetadata,
        licencaId: licencaIdMetadata,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos-revisao-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["documentos-qualidade"] });
    },
  });

  const revisarMutation = useMutation({
    mutationFn: ({
      processamentoDocumentoId,
      payload,
    }: {
      processamentoDocumentoId: string;
      payload: Parameters<typeof documentoService.revisarDocumento>[1];
    }) => documentoService.revisarDocumento(processamentoDocumentoId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documentos-revisao-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["documentos-qualidade"] });
      queryClient.invalidateQueries({
        queryKey: ["documentos-revisao-detalhe", variables.processamentoDocumentoId],
      });
    },
  });

  const aplicarCrudMutation = useMutation({
    mutationFn: ({
      processamentoDocumentoId,
      payload,
    }: {
      processamentoDocumentoId: string;
      payload: Parameters<typeof documentoService.aplicarCrud>[1];
    }) => documentoService.aplicarCrud(processamentoDocumentoId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documentos-revisao-pendentes"] });
      queryClient.invalidateQueries({
        queryKey: ["documentos-revisao-detalhe", variables.processamentoDocumentoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["documentos-sugestao-crud", variables.processamentoDocumentoId],
      });
      queryClient.invalidateQueries({ queryKey: ["documentos-qualidade"] });
      queryClient.invalidateQueries({ queryKey: ["licencas-consultoria"] });
      queryClient.invalidateQueries({ queryKey: ["mtrs"] });
      queryClient.invalidateQueries({ queryKey: ["cdfs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const camposCorrigidos = camposForm.filter(isCampoCorrigido).length;
  const acuraciaPreview =
    camposForm.length > 0
      ? Math.round(((camposForm.length - camposCorrigidos) / camposForm.length) * 100)
      : 0;
  const nenhumaOpcaoCrudSelecionada =
    !crudPayload.aplicarLicenca && !crudPayload.aplicarMtr && !crudPayload.aplicarCondicionantes;

  function selecionarArquivo(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setArquivoSelecionado(nextFile);
  }

  async function enviarParaExtracao() {
    if (!arquivoSelecionado) {
      toast.error("Selecione um arquivo PDF ou DOC para iniciar a extracao.");
      return;
    }

    try {
      const result = await ingestaoMutation.mutateAsync({
        arquivo: arquivoSelecionado,
        origem: origemPorModulo(modulo),
        clienteIdMetadata: clienteId && UUID_REGEX.test(clienteId) ? clienteId : undefined,
        licencaIdMetadata:
          modulo === "LICENCA" && licencaId && UUID_REGEX.test(licencaId)
            ? licencaId
            : undefined,
      });

      setProcessamentoSelecionado(result.processamentoDocumentoId);
      setResultadoAplicacaoCrud(null);
      setCrudPayload(defaultCrudPayload(modulo));
      setDialogOpen(true);
      setCrudDialogOpen(false);
      setArquivoSelecionado(null);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }

      if (result.duplicado) {
        toast.success(
          "Documento ja existente identificado. Abrindo revisao para validar e aplicar no CRUD.",
        );
      } else {
        toast.success("Arquivo enviado. A extracao sera exibida assim que o processamento concluir.");
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Nao foi possivel enviar o documento para extracao."));
    }
  }

  async function enviarRevisao(
    status: "APROVADO_SEM_AJUSTES" | "APROVADO_COM_AJUSTES" | "REJEITADO",
  ) {
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

      await revisarMutation.mutateAsync({
        processamentoDocumentoId: processamentoSelecionado,
        payload,
      });

      toast.success("Revisao documental registrada com sucesso.");
      setDialogOpen(false);
      setCamposForm([]);
      setObservacoes("");
      dialogOpenedAtRef.current = null;
      if (status !== "REJEITADO") {
        setResultadoAplicacaoCrud(null);
        setCrudPayload(defaultCrudPayload(modulo));
        setCrudDialogOpen(true);
      } else {
        setProcessamentoSelecionado(null);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Nao foi possivel registrar a revisao documental."));
    }
  }

  async function aplicarSugestaoCrud() {
    if (!processamentoSelecionado) return;

    try {
      const result = await aplicarCrudMutation.mutateAsync({
        processamentoDocumentoId: processamentoSelecionado,
        payload: crudPayload,
      });

      setResultadoAplicacaoCrud({
        aplicacaoEm: String(result.aplicacaoEm),
        resultados: result.resultados,
        avisos: result.avisos,
      });

      toast.success("Aplicacao no CRUD concluida.");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Nao foi possivel aplicar a sugestao no CRUD."));
    }
  }

  const contextoResumo = clienteNome ? `cliente ${clienteNome}` : "sem cliente vinculado";

  return (
    <>
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Extracao documental no CRUD de {tituloModulo(modulo)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Envie PDF/DOC, revise os campos extraidos e aplique direto no cadastro de{" "}
              {tituloModulo(modulo).toLowerCase()}.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] tracking-wide">
            Origem: {origemPorModulo(modulo)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          <div className="xl:col-span-3 space-y-2">
            <Label htmlFor={`document-upload-input-${modulo}`}>Arquivo</Label>
            <input
              id={`document-upload-input-${modulo}`}
              ref={uploadInputRef}
              type="file"
              accept={ARQUIVOS_ACEITOS}
              onChange={selecionarArquivo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-white/[0.14] bg-white/[0.02] p-4 text-left transition-colors hover:border-primary/35 hover:bg-primary/[0.05]"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Upload className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {arquivoSelecionado ? arquivoSelecionado.name : "Selecionar PDF, DOC ou DOCX"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {arquivoSelecionado
                      ? `${Math.max(1, Math.round(arquivoSelecionado.size / 1024))} KB`
                      : "Clique para escolher um arquivo e iniciar extracao estruturada."}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <Label>Contexto</Label>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground min-h-10 flex items-center">
              {contextoResumo}
            </div>
            {modulo === "LICENCA" ? (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground min-h-10 flex items-center">
                Licenca vinculada: {licencaId ? licencaId.slice(0, 8) : "nao vinculada"}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={enviarParaExtracao}
            disabled={ingestaoMutation.isPending || !arquivoSelecionado}
            className="gap-2"
          >
            {ingestaoMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4" />
            )}
            Extrair e abrir revisao
          </Button>
          <p className="text-xs text-muted-foreground">
            A revisao humana continua obrigatoria antes de aplicar no CRUD.
          </p>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen);
          if (!nextOpen) {
            setCamposForm([]);
            setObservacoes("");
            dialogOpenedAtRef.current = null;
            if (!crudDialogOpen) {
              setProcessamentoSelecionado(null);
            }
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

          {detalheQuery.isLoading && !detalhe ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando detalhes do documento...
            </div>
          ) : !detalhe ? (
            <p className="text-sm text-muted-foreground">
              Nenhum detalhe disponivel para o documento selecionado.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Documento</p>
                  <p className="text-sm text-foreground font-medium mt-1">{detalhe.documentoNome}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Tipo / Perfil
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {detalhe.tipo} · {detalhe.perfilCliente}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Confianca media
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {(detalhe.confiancaMediaExtracao * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Status pipeline
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {detalhe.statusProcessamento !== "CONCLUIDO" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-warning" />
                    ) : null}
                    <p className="text-sm text-foreground font-medium">{detalhe.statusProcessamento}</p>
                  </div>
                </div>
              </div>

              <div className="max-h-[45vh] overflow-auto border border-white/[0.08] rounded-xl">
                <table className="w-full min-w-[900px]">
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
                        <tr key={`${campo.campo}-${index}`} className="border-b border-white/[0.04] align-top">
                          <td className="px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {campo.campo}
                              </Badge>
                              {campo.obrigatorio ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-primary/30 text-primary"
                                >
                                  obrigatorio
                                </Badge>
                              ) : null}
                              {corrigido ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-warning/30 text-warning"
                                >
                                  ajustado
                                </Badge>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{campo.valor || "—"}</td>
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
                              disabled={detalhe.statusProcessamento !== "CONCLUIDO"}
                            />
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <Badge variant="outline" className={classeConfianca(campo.confianca)}>
                              {(campo.confianca * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground leading-relaxed min-w-[280px]">
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
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Campos avaliados
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">{camposForm.length}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Campos corrigidos
                  </p>
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
                  disabled={detalhe.statusProcessamento !== "CONCLUIDO"}
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
                  variant="secondary"
                  disabled={
                    !detalhe ||
                    detalhe.statusProcessamento !== "CONCLUIDO" ||
                    detalhe.revisaoStatus === "PENDENTE_REVISAO" ||
                    detalhe.revisaoStatus === "REJEITADO"
                  }
                  onClick={() => {
                    setResultadoAplicacaoCrud(null);
                    setCrudDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Pre-visualizar CRUD
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    revisarMutation.isPending || !detalhe || detalhe.statusProcessamento !== "CONCLUIDO"
                  }
                  onClick={() => enviarRevisao("REJEITADO")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    revisarMutation.isPending || !detalhe || detalhe.statusProcessamento !== "CONCLUIDO"
                  }
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

      <Dialog
        open={crudDialogOpen}
        onOpenChange={(nextOpen) => {
          setCrudDialogOpen(nextOpen);
          if (!nextOpen) {
            setResultadoAplicacaoCrud(null);
            if (!dialogOpen) {
              setProcessamentoSelecionado(null);
            }
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assistente de aplicacao no cadastro</DialogTitle>
            <DialogDescription>
              Escolha onde aplicar os dados extraidos para atualizar o CRUD deste modulo.
            </DialogDescription>
          </DialogHeader>

          {!processamentoSelecionado ? (
            <p className="text-sm text-muted-foreground">
              Nenhum processamento selecionado para aplicacao.
            </p>
          ) : sugestaoCrudQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando sugestao de CRUD...
            </div>
          ) : !sugestaoCrud ? (
            <p className="text-sm text-muted-foreground">
              Nao foi possivel carregar sugestoes para este documento.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Processamento
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {sugestaoCrud.processamentoDocumentoId.slice(0, 8)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Tipo detectado
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">{sugestaoCrud.tipoDocumento}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Origem dos dados
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">{sugestaoCrud.origemDados}</p>
                </div>
              </div>

              {modulo === "LICENCA" ? (
                <>
                  <div className="space-y-2 rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={crudPayload.aplicarLicenca}
                        onCheckedChange={(checked) =>
                          setCrudPayload((current) => ({
                            ...current,
                            aplicarLicenca: !!checked,
                          }))
                        }
                        disabled={!sugestaoCrud.licenca}
                      />
                      <p className="text-sm font-medium text-foreground">Aplicar atualizacao em Licenca</p>
                    </div>
                    {!sugestaoCrud.licenca ? (
                      <p className="text-xs text-muted-foreground pl-6">
                        Nenhuma sugestao de licenca disponivel para este documento.
                      </p>
                    ) : (
                      <div className="pl-6 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Licenca alvo: {sugestaoCrud.licenca.licencaId ?? "nao identificada"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Campos sugeridos: {resumirCamposCrud(sugestaoCrud.licenca.payloadAtualizacao)}
                        </p>
                        {sugestaoCrud.licenca.pendencias.length > 0 ? (
                          <p className="text-xs text-warning">
                            Pendencias: {sugestaoCrud.licenca.pendencias.join(" | ")}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={crudPayload.aplicarCondicionantes}
                        onCheckedChange={(checked) =>
                          setCrudPayload((current) => ({
                            ...current,
                            aplicarCondicionantes: !!checked,
                          }))
                        }
                        disabled={
                          !sugestaoCrud.licenca || sugestaoCrud.licenca.condicionantesSugeridas.length === 0
                        }
                      />
                      <p className="text-sm font-medium text-foreground">Criar condicionantes sugeridas</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Itens elegiveis: {sugestaoCrud.licenca?.condicionantesSugeridas.length ?? 0}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2 rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={crudPayload.aplicarMtr}
                      onCheckedChange={(checked) =>
                        setCrudPayload((current) => ({
                          ...current,
                          aplicarMtr: !!checked,
                        }))
                      }
                      disabled={!sugestaoCrud.mtr}
                    />
                    <p className="text-sm font-medium text-foreground">Aplicar atualizacao em MTR</p>
                  </div>
                  {!sugestaoCrud.mtr ? (
                    <p className="text-xs text-muted-foreground pl-6">
                      Nenhuma sugestao de MTR disponivel para este documento.
                    </p>
                  ) : (
                    <div className="pl-6 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        MTR alvo: {sugestaoCrud.mtr.mtrId ?? "nao identificado"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Campos sugeridos: {resumirCamposCrud(sugestaoCrud.mtr.payloadAtualizacao)}
                      </p>
                      {sugestaoCrud.mtr.pendencias.length > 0 ? (
                        <p className="text-xs text-warning">
                          Pendencias: {sugestaoCrud.mtr.pendencias.join(" | ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {sugestaoCrud.avisos.length > 0 ? (
                <div className="rounded-xl border border-warning/35 bg-warning/10 p-3 space-y-1">
                  <p className="text-xs font-medium text-warning">Avisos do motor de sugestao</p>
                  {sugestaoCrud.avisos.map((aviso, index) => (
                    <p key={`${aviso}-${index}`} className="text-xs text-warning/90">
                      {aviso}
                    </p>
                  ))}
                </div>
              ) : null}

              {resultadoAplicacaoCrud ? (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 space-y-2">
                  <p className="text-xs font-medium text-primary">Resultado da aplicacao</p>
                  {resultadoAplicacaoCrud.resultados.map((resultado, index) => (
                    <div
                      key={`${resultado.entidadeTipo}-${index}`}
                      className="rounded-lg border border-white/[0.12] bg-background/65 p-2"
                    >
                      <p className="text-xs font-medium text-foreground">
                        {resultado.entidadeTipo} · {resultado.aplicado ? "aplicado" : "sem aplicacao"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{resultado.mensagem}</p>
                      {resultado.camposAtualizados.length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Campos: {resultado.camposAtualizados.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter className="items-center">
            <div className="flex items-center w-full justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Recomendacao: manter revisao humana aprovada antes de aplicar no CRUD.
              </p>
              <Button
                onClick={aplicarSugestaoCrud}
                disabled={
                  aplicarCrudMutation.isPending ||
                  !processamentoSelecionado ||
                  !sugestaoCrud ||
                  nenhumaOpcaoCrudSelecionada
                }
                className="gap-2"
              >
                {aplicarCrudMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Aplicar no CRUD
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
