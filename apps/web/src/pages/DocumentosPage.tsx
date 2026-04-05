import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileUp,
  FileSearch,
  Filter,
  Gauge,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type {
  DocumentoCampoExtraidoDTO,
  OrigemProcessamentoDocumento,
  StatusRevisaoDocumento,
} from "@greenly/shared";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  SelectGroup,
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
import { useClienteContexto } from "@/features/clientes/components/ClienteContextProvider";
import { licencaService } from "@/features/licencas/services/licencaService";
import { useDocumentos } from "@/features/documentos/hooks/useDocumentos";
import { useDocumentoCrudSugestao } from "@/features/documentos/hooks/useDocumentoCrudSugestao";
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

const origemOptions: Array<{ value: OrigemProcessamentoDocumento; label: string }> = [
  { value: "UPLOAD_GERAL", label: "Upload geral" },
  { value: "UPLOAD_LICENCA", label: "Documento de licenca" },
  { value: "UPLOAD_MTR", label: "Documento de MTR" },
  { value: "UPLOAD_CDF", label: "Documento de CDF" },
];

const ARQUIVOS_ACEITOS = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  const { clienteId, clienteNome } = useClienteContexto();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const dialogOpenedAtRef = useRef<number | null>(null);

  const [statusRevisao, setStatusRevisao] = useState<StatusRevisaoDocumento>("PENDENTE_REVISAO");
  const [periodoDias, setPeriodoDias] = useState<number>(30);
  const [search, setSearch] = useState("");
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [origemUpload, setOrigemUpload] = useState<OrigemProcessamentoDocumento>("UPLOAD_GERAL");
  const [licencaSelecionada, setLicencaSelecionada] = useState<string>("none");
  const [processamentoSelecionado, setProcessamentoSelecionado] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crudDialogOpen, setCrudDialogOpen] = useState(false);
  const [crudPayload, setCrudPayload] = useState({
    aplicarLicenca: true,
    aplicarMtr: true,
    aplicarCondicionantes: true,
  });
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
  const [camposForm, setCamposForm] = useState<CampoRevisaoForm[]>([]);
  const [observacoes, setObservacoes] = useState("");

  const licencasQuery = useQuery({
    queryKey: ["licencas-cliente-contexto-upload", clienteId],
    queryFn: () => licencaService.listarPorCliente(clienteId as string),
    enabled: !!clienteId,
  });

  const {
    pendentes,
    isLoadingPendentes,
    qualidade,
    isLoadingQualidade,
    ingerirDocumento,
    isIngerindo,
    revisarDocumento,
    isRevisando,
    aplicarCrud,
    isAplicandoCrud,
  } = useDocumentos(statusRevisao, periodoDias);

  const detalheQuery = useDocumentoRevisaoDetalhe(dialogOpen ? processamentoSelecionado : null, {
    polling: dialogOpen,
  });
  const detalhe = detalheQuery.data;
  const sugestaoCrudQuery = useDocumentoCrudSugestao(
    crudDialogOpen ? processamentoSelecionado : null,
    crudDialogOpen,
  );
  const sugestaoCrud = sugestaoCrudQuery.data;

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

  useEffect(() => {
    if (!clienteId) {
      setLicencaSelecionada("none");
      return;
    }
    const licencas = licencasQuery.data ?? [];
    if (licencaSelecionada === "none") return;
    const existeLicenca = licencas.some((licenca) => licenca.id === licencaSelecionada);
    if (!existeLicenca) {
      setLicencaSelecionada("none");
    }
  }, [clienteId, licencaSelecionada, licencasQuery.data]);

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
  const nenhumaOpcaoCrudSelecionada =
    !crudPayload.aplicarLicenca && !crudPayload.aplicarMtr && !crudPayload.aplicarCondicionantes;

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
      setCamposForm([]);
      setObservacoes("");
      dialogOpenedAtRef.current = null;
      if (status !== "REJEITADO") {
        setResultadoAplicacaoCrud(null);
        setCrudPayload({
          aplicarLicenca: true,
          aplicarMtr: true,
          aplicarCondicionantes: true,
        });
        setCrudDialogOpen(true);
      } else {
        setProcessamentoSelecionado(null);
      }
    } catch (error: unknown) {
      trackFormError("documentos", "revisao_documental", "Falha ao registrar revisao", {
        statusRevisao: status,
      });
      toast.error(getApiErrorMessage(error, "Nao foi possivel registrar a revisao documental."));
    }
  }

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
      const result = await ingerirDocumento({
        arquivo: arquivoSelecionado,
        metadata: {
          origem: origemUpload,
          clienteId: clienteId && UUID_REGEX.test(clienteId) ? clienteId : undefined,
          licencaId:
            licencaSelecionada !== "none" && UUID_REGEX.test(licencaSelecionada)
              ? licencaSelecionada
              : undefined,
        },
      });

      setProcessamentoSelecionado(result.processamentoDocumentoId);
      setResultadoAplicacaoCrud(null);
      setCrudPayload({
        aplicarLicenca: true,
        aplicarMtr: true,
        aplicarCondicionantes: true,
      });
      setDialogOpen(true);
      setCrudDialogOpen(false);
      setArquivoSelecionado(null);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }

      trackFirstValidAction("documentos", "upload_documental_iniciado", {
        origem: origemUpload,
        statusInicial: result.status,
        duplicado: result.duplicado,
      });

      if (result.duplicado) {
        toast.success(
          "Documento ja existente identificado. Abrindo revisao para validar e aplicar no CRUD.",
        );
      } else {
        toast.success("Arquivo enviado. A extracao sera exibida assim que o processamento concluir.");
      }
    } catch (error: unknown) {
      trackFormError("documentos", "upload_documental", "Falha ao enviar documento", {
        origemUpload,
      });
      toast.error(getApiErrorMessage(error, "Nao foi possivel enviar o documento para extracao."));
    }
  }

  function abrirDialogCrud() {
    if (!processamentoSelecionado) return;
    setResultadoAplicacaoCrud(null);
    setCrudDialogOpen(true);
  }

  async function aplicarSugestaoCrud() {
    if (!processamentoSelecionado) return;

    try {
      const result = await aplicarCrud({
        processamentoDocumentoId: processamentoSelecionado,
        payload: crudPayload,
      });
      setResultadoAplicacaoCrud({
        aplicacaoEm: String(result.aplicacaoEm),
        resultados: result.resultados,
        avisos: result.avisos,
      });
      trackFlowCompleted("documentos", "crud_documental_aplicado", {
        aplicarLicenca: crudPayload.aplicarLicenca,
        aplicarMtr: crudPayload.aplicarMtr,
        aplicarCondicionantes: crudPayload.aplicarCondicionantes,
        totalResultados: result.resultados.length,
      });
      toast.success("Aplicacao no CRUD concluida.");
    } catch (error: unknown) {
      trackFormError("documentos", "crud_documental", "Falha ao aplicar sugestao de CRUD", {
        aplicarLicenca: crudPayload.aplicarLicenca,
        aplicarMtr: crudPayload.aplicarMtr,
        aplicarCondicionantes: crudPayload.aplicarCondicionantes,
      });
      toast.error(getApiErrorMessage(error, "Nao foi possivel aplicar a sugestao no CRUD."));
    }
  }

  return (
    <AppLayout title="Documentos">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-foreground">Upload e extracao documental</p>
              <p className="text-xs text-muted-foreground mt-1">
                Envie PDF/DOC, revise os campos extraidos e aplique no CRUD somente apos a validacao humana.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] tracking-wide">
              Fluxo: upload → revisao → aceite
            </Badge>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            <div className="xl:col-span-2 space-y-2">
              <Label htmlFor="document-upload-input">Arquivo</Label>
              <input
                id="document-upload-input"
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
                        : "Clique para escolher um arquivo e iniciar extração estruturada."}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={origemUpload}
                onValueChange={(value) => setOrigemUpload(value as OrigemProcessamentoDocumento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {origemOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Licenca vinculada (opcional)</Label>
              <Select
                value={licencaSelecionada}
                onValueChange={setLicencaSelecionada}
                disabled={!clienteId || licencasQuery.isLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !clienteId
                        ? "Selecione um cliente no contexto"
                        : licencasQuery.isLoading
                          ? "Carregando licencas..."
                          : "Vincular licenca"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">Nao vincular licenca</SelectItem>
                    {(licencasQuery.data ?? [])
                      .filter((licenca) => !!licenca.id && UUID_REGEX.test(licenca.id))
                      .map((licenca) => (
                        <SelectItem key={licenca.id} value={licenca.id}>
                          {licenca.numeroLicenca || licenca.tipo} · {licenca.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={enviarParaExtracao} disabled={isIngerindo || !arquivoSelecionado} className="gap-2">
              {isIngerindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
              Extrair e abrir revisao
            </Button>
            <p className="text-xs text-muted-foreground">
              Contexto atual: {clienteNome ? `cliente ${clienteNome}` : "sem cliente vinculado"}.
            </p>
          </div>
        </div>

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
            <p className="text-sm text-muted-foreground">Nenhum detalhe disponivel para o documento selecionado.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Status pipeline</p>
                  <div className="mt-1 flex items-center gap-2">
                    {detalhe.statusProcessamento !== "CONCLUIDO" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-warning" />
                    ) : null}
                    <p className="text-sm text-foreground font-medium">
                      {detalhe.statusProcessamento}
                    </p>
                  </div>
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

              {detalheQuery.isFetching ? (
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary/90 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  Atualizando progresso do processamento documental...
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
                              disabled={detalhe.statusProcessamento !== "CONCLUIDO"}
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
                  onClick={abrirDialogCrud}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Pre-visualizar CRUD
                </Button>
                <Button
                  variant="outline"
                  disabled={isRevisando || !detalhe || detalhe.statusProcessamento !== "CONCLUIDO"}
                  onClick={() => enviarRevisao("REJEITADO")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  disabled={isRevisando || !detalhe || detalhe.statusProcessamento !== "CONCLUIDO"}
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
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Aceite final e aplicacao no CRUD</DialogTitle>
            <DialogDescription>
              Revise as sugestoes geradas pelo documento e selecione quais entidades devem ser atualizadas.
            </DialogDescription>
          </DialogHeader>

          {!processamentoSelecionado ? (
            <p className="text-sm text-muted-foreground">Nenhum processamento selecionado para aplicacao.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Processamento</p>
                  <p className="text-sm text-foreground font-medium mt-1">{sugestaoCrud.processamentoDocumentoId.slice(0, 8)}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Tipo detectado</p>
                  <p className="text-sm text-foreground font-medium mt-1">{sugestaoCrud.tipoDocumento}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Origem dos dados</p>
                  <p className="text-sm text-foreground font-medium mt-1">{sugestaoCrud.origemDados}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Condicionantes sugeridas</p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {sugestaoCrud.licenca?.condicionantesSugeridas.length ?? 0}
                  </p>
                </div>
              </div>

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
                      Campos para atualizar:{" "}
                      {Object.keys(sugestaoCrud.licenca.payloadAtualizacao).length > 0
                        ? Object.keys(sugestaoCrud.licenca.payloadAtualizacao).join(", ")
                        : "nenhum campo valido detectado"}
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
                      Campos para atualizar:{" "}
                      {Object.keys(sugestaoCrud.mtr.payloadAtualizacao).length > 0
                        ? Object.keys(sugestaoCrud.mtr.payloadAtualizacao).join(", ")
                        : "nenhum campo valido detectado"}
                    </p>
                    {sugestaoCrud.mtr.pendencias.length > 0 ? (
                      <p className="text-xs text-warning">
                        Pendencias: {sugestaoCrud.mtr.pendencias.join(" | ")}
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
                    disabled={!sugestaoCrud.licenca || sugestaoCrud.licenca.condicionantesSugeridas.length === 0}
                  />
                  <p className="text-sm font-medium text-foreground">Criar condicionantes sugeridas</p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Itens elegiveis: {sugestaoCrud.licenca?.condicionantesSugeridas.length ?? 0}
                </p>
              </div>

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
                  {resultadoAplicacaoCrud.avisos.length > 0 ? (
                    <div className="rounded-lg border border-warning/35 bg-warning/10 p-2">
                      {resultadoAplicacaoCrud.avisos.map((aviso, index) => (
                        <p key={`${aviso}-${index}`} className="text-xs text-warning/90">
                          {aviso}
                        </p>
                      ))}
                    </div>
                  ) : null}
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
                  isAplicandoCrud ||
                  !processamentoSelecionado ||
                  !sugestaoCrud ||
                  nenhumaOpcaoCrudSelecionada
                }
                className="gap-2"
              >
                {isAplicandoCrud ? (
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
    </AppLayout>
  );
}
