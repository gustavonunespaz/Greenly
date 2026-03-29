import { getApiErrorMessage } from "@/lib/http-error";

type ApiErrorShape = {
  message?: string;
  response?: {
    status?: number;
    headers?: {
      [key: string]: string | undefined;
    };
  };
};

export type ActionableFormError = {
  title: string;
  message: string;
  guidance: string;
  technicalFallback: string;
  actionLabel: string;
  actionKind: "retry" | "dismiss";
};

export function buildValidationFormError(message: string): ActionableFormError {
  return {
    title: "Revise os dados do formulário",
    message,
    guidance: "Corrija os campos obrigatórios e tente novamente.",
    technicalFallback: "Validação local bloqueou o envio para evitar dados inconsistentes.",
    actionLabel: "Corrigir dados",
    actionKind: "dismiss",
  };
}

export function buildActionableFormError(
  error: unknown,
  fallbackMessage: string,
): ActionableFormError {
  const status =
    typeof error === "object" && error !== null
      ? ((error as ApiErrorShape).response?.status ?? null)
      : null;
  const message = getApiErrorMessage(error, fallbackMessage);

  if (status === 400 || status === 422) {
    return {
      title: "Dados inválidos para envio",
      message,
      guidance: "Revise os campos preenchidos e corrija o que for necessário.",
      technicalFallback: `Resposta da API: HTTP ${status}.`,
      actionLabel: "Corrigir dados",
      actionKind: "dismiss",
    };
  }

  if (status === 401 || status === 403) {
    return {
      title: "Sessão sem permissão para esta ação",
      message,
      guidance: "Atualize sua sessão e tente novamente.",
      technicalFallback: `Resposta da API: HTTP ${status}.`,
      actionLabel: "Entendi",
      actionKind: "dismiss",
    };
  }

  if (status === 404 || status === 409) {
    return {
      title: "Não foi possível concluir a operação",
      message,
      guidance: "Atualize a tela e tente novamente com os dados mais recentes.",
      technicalFallback: `Resposta da API: HTTP ${status}.`,
      actionLabel: "Tentar novamente",
      actionKind: "retry",
    };
  }

  if (typeof status === "number" && status >= 500) {
    return {
      title: "Instabilidade temporária no servidor",
      message,
      guidance: "Aguarde alguns segundos e tente novamente.",
      technicalFallback: `Resposta da API: HTTP ${status}.`,
      actionLabel: "Tentar novamente",
      actionKind: "retry",
    };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    !(error as ApiErrorShape).response
  ) {
    return {
      title: "Falha de conexão com a API",
      message:
        "Não foi possível conectar ao servidor agora. Verifique a rede e tente novamente.",
      guidance: "Confirme sua conexão e repita a ação.",
      technicalFallback: "Sem resposta HTTP (timeout, rede indisponível ou API offline).",
      actionLabel: "Tentar novamente",
      actionKind: "retry",
    };
  }

  const technicalMessage =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as ApiErrorShape).message ?? "Erro desconhecido")
      : "Erro desconhecido";

  return {
    title: "Não foi possível concluir a operação",
    message,
    guidance: "Tente novamente. Se persistir, acione o suporte técnico.",
    technicalFallback: `Detalhe técnico: ${technicalMessage}`,
    actionLabel: "Tentar novamente",
    actionKind: "retry",
  };
}
