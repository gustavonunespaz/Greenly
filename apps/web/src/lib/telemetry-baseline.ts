import type { TelemetryEvent, TelemetryScreen } from "@/lib/telemetry";

export type TelemetryWeeklyTargets = {
  ttfvAvgSeconds: number;
  completionRatePct: number;
  errorsPerSession: number;
};

export type BaselineTargetStatus = "on_track" | "off_track" | "insufficient_data";

export type ScreenBaselineMetrics = {
  screen: TelemetryScreen;
  label: string;
  views: number;
  firstValidActions: number;
  flowCompleted: number;
  formErrors: number;
  ttfvAvgSeconds: number | null;
  completionRatePct: number | null;
};

export type FlowBaselineMetrics = {
  flow: string;
  completed: number;
  sharePct: number;
};

export type TelemetryBaselineSummary = {
  totalEvents: number;
  sessionCount: number;
  ttfvAvgSeconds: number | null;
  ttfvMedianSeconds: number | null;
  completionRatePct: number | null;
  errorsPerSession: number | null;
  statuses: {
    ttfv: BaselineTargetStatus;
    completion: BaselineTargetStatus;
    errors: BaselineTargetStatus;
  };
};

export type TelemetryBaselineReport = {
  generatedAt: string;
  windowDays: number;
  targets: TelemetryWeeklyTargets;
  summary: TelemetryBaselineSummary;
  screens: ScreenBaselineMetrics[];
  flows: FlowBaselineMetrics[];
};

type BaselineOptions = {
  windowDays?: number;
  targets?: Partial<TelemetryWeeklyTargets>;
};

const DEFAULT_WINDOW_DAYS = 7;
const SCREEN_ORDER: TelemetryScreen[] = [
  "dashboard",
  "licencas",
  "condicionantes",
  "mtrs",
  "clientes",
  "notificacoes",
  "configuracoes",
];

const SCREEN_LABELS: Record<TelemetryScreen, string> = {
  dashboard: "Dashboard",
  licencas: "Licenças",
  condicionantes: "Condicionantes",
  mtrs: "MTRs",
  clientes: "Clientes",
  notificacoes: "Notificações",
  configuracoes: "Configurações",
  login: "Login",
  unknown: "Desconhecida",
};

export const DEFAULT_WEEKLY_TARGETS: TelemetryWeeklyTargets = {
  ttfvAvgSeconds: 45,
  completionRatePct: 70,
  errorsPerSession: 1.5,
};

function toMilliseconds(isoString: string) {
  const value = Date.parse(isoString);
  if (Number.isNaN(value)) return null;
  return value;
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function completionRate(completed: number, started: number) {
  if (started <= 0) return null;
  return (completed / started) * 100;
}

function statusFromMetric(
  value: number | null,
  target: number,
  mode: "lte" | "gte",
): BaselineTargetStatus {
  if (value === null) return "insufficient_data";

  if (mode === "lte") {
    return value <= target ? "on_track" : "off_track";
  }

  return value >= target ? "on_track" : "off_track";
}

function getScreenAccumulator(screen: TelemetryScreen) {
  return {
    screen,
    label: SCREEN_LABELS[screen],
    views: 0,
    firstValidActions: 0,
    flowCompleted: 0,
    formErrors: 0,
    ttfvSamples: [] as number[],
  };
}

function statusLabel(status: BaselineTargetStatus) {
  if (status === "on_track") return "Na meta";
  if (status === "off_track") return "Fora da meta";
  return "Dados insuficientes";
}

export function computeTelemetryBaseline(
  events: TelemetryEvent[],
  options: BaselineOptions = {},
): TelemetryBaselineReport {
  const windowDays = options.windowDays ?? DEFAULT_WINDOW_DAYS;
  const targets: TelemetryWeeklyTargets = {
    ...DEFAULT_WEEKLY_TARGETS,
    ...options.targets,
  };
  const threshold = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  const scopedEvents = events
    .map((event) => ({ event, ms: toMilliseconds(event.timestamp) }))
    .filter((item) => item.ms !== null && (item.ms as number) >= threshold)
    .sort((a, b) => (a.ms as number) - (b.ms as number));

  const screens = new Map<TelemetryScreen, ReturnType<typeof getScreenAccumulator>>();
  SCREEN_ORDER.forEach((screen) => screens.set(screen, getScreenAccumulator(screen)));

  const sessions = new Set<string>();
  const flowCounter = new Map<string, number>();
  const sessionScreenState = new Map<string, { firstViewMs: number | null; ttfvCaptured: boolean }>();
  const ttfvSamples: number[] = [];

  for (const { event, ms } of scopedEvents) {
    const eventMs = ms as number;
    sessions.add(event.sessionId);

    if (!screens.has(event.screen)) {
      screens.set(event.screen, getScreenAccumulator(event.screen));
    }

    const screenEntry = screens.get(event.screen)!;
    const key = `${event.sessionId}:${event.screen}`;
    const state = sessionScreenState.get(key) ?? { firstViewMs: null, ttfvCaptured: false };

    if (event.name === "view_loaded") {
      screenEntry.views += 1;
      if (state.firstViewMs === null) {
        state.firstViewMs = eventMs;
      }
    }

    if (event.name === "first_valid_action") {
      screenEntry.firstValidActions += 1;
      if (state.firstViewMs !== null && !state.ttfvCaptured && eventMs >= state.firstViewMs) {
        const diffSeconds = (eventMs - state.firstViewMs) / 1000;
        screenEntry.ttfvSamples.push(diffSeconds);
        ttfvSamples.push(diffSeconds);
        state.ttfvCaptured = true;
      }
    }

    if (event.name === "flow_completed") {
      screenEntry.flowCompleted += 1;
      const flowName = event.flow || `${event.screen}_flow`;
      flowCounter.set(flowName, (flowCounter.get(flowName) ?? 0) + 1);
    }

    if (event.name === "form_error") {
      screenEntry.formErrors += 1;
    }

    sessionScreenState.set(key, state);
  }

  const screenList = Array.from(screens.values()).map((screen) => ({
    screen: screen.screen,
    label: screen.label,
    views: screen.views,
    firstValidActions: screen.firstValidActions,
    flowCompleted: screen.flowCompleted,
    formErrors: screen.formErrors,
    ttfvAvgSeconds:
      screen.ttfvSamples.length > 0 ? round(average(screen.ttfvSamples) as number, 1) : null,
    completionRatePct:
      screen.firstValidActions > 0
        ? round(completionRate(screen.flowCompleted, screen.firstValidActions) as number, 1)
        : null,
  }));

  const totalFirstValidActions = screenList.reduce((sum, item) => sum + item.firstValidActions, 0);
  const totalFlowCompleted = screenList.reduce((sum, item) => sum + item.flowCompleted, 0);
  const totalFormErrors = screenList.reduce((sum, item) => sum + item.formErrors, 0);
  const sessionCount = sessions.size;

  const completionRatePct =
    totalFirstValidActions > 0
      ? round(completionRate(totalFlowCompleted, totalFirstValidActions) as number, 1)
      : null;
  const ttfvAvgSeconds = ttfvSamples.length ? round(average(ttfvSamples) as number, 1) : null;
  const ttfvMedianSeconds = ttfvSamples.length ? round(median(ttfvSamples) as number, 1) : null;
  const errorsPerSession = sessionCount > 0 ? round(totalFormErrors / sessionCount, 2) : null;

  const flows = Array.from(flowCounter.entries())
    .map(([flow, completed]) => ({
      flow,
      completed,
      sharePct:
        totalFlowCompleted > 0 ? round((completed / totalFlowCompleted) * 100, 1) : 0,
    }))
    .sort((a, b) => b.completed - a.completed);

  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    targets,
    summary: {
      totalEvents: scopedEvents.length,
      sessionCount,
      ttfvAvgSeconds,
      ttfvMedianSeconds,
      completionRatePct,
      errorsPerSession,
      statuses: {
        ttfv: statusFromMetric(ttfvAvgSeconds, targets.ttfvAvgSeconds, "lte"),
        completion: statusFromMetric(completionRatePct, targets.completionRatePct, "gte"),
        errors: statusFromMetric(errorsPerSession, targets.errorsPerSession, "lte"),
      },
    },
    screens: screenList,
    flows,
  };
}

export function formatTelemetryBaselineMarkdown(report: TelemetryBaselineReport) {
  const summary = report.summary;
  const activeScreens = report.screens.filter(
    (screen) =>
      screen.views > 0 ||
      screen.firstValidActions > 0 ||
      screen.flowCompleted > 0 ||
      screen.formErrors > 0,
  );
  const topFlows = report.flows.slice(0, 5);

  const lines: string[] = [];
  lines.push(`## Snapshot Baseline Sprint 3 (${report.windowDays} dias)`);
  lines.push(`Gerado em: ${new Date(report.generatedAt).toLocaleString("pt-BR")}`);
  lines.push("");
  lines.push("### Resumo");
  lines.push(`- Sessões analisadas: ${summary.sessionCount}`);
  lines.push(`- Eventos analisados: ${summary.totalEvents}`);
  lines.push(
    `- TTFV médio: ${summary.ttfvAvgSeconds === null ? "Sem dados" : `${summary.ttfvAvgSeconds.toFixed(1)}s`} (meta <= ${report.targets.ttfvAvgSeconds}s | ${statusLabel(summary.statuses.ttfv)})`,
  );
  lines.push(
    `- Taxa de conclusão: ${summary.completionRatePct === null ? "Sem dados" : `${summary.completionRatePct.toFixed(1)}%`} (meta >= ${report.targets.completionRatePct}% | ${statusLabel(summary.statuses.completion)})`,
  );
  lines.push(
    `- Erros por sessão: ${summary.errorsPerSession === null ? "Sem dados" : summary.errorsPerSession.toFixed(2)} (meta <= ${report.targets.errorsPerSession} | ${statusLabel(summary.statuses.errors)})`,
  );
  lines.push("");
  lines.push("### Leitura por tela");

  if (activeScreens.length === 0) {
    lines.push("- Sem dados de tela no período.");
  } else {
    activeScreens.forEach((screen) => {
      lines.push(
        `- ${screen.label}: views=${screen.views}, ações=${screen.firstValidActions}, conclusões=${screen.flowCompleted}, erros=${screen.formErrors}, TTFV=${screen.ttfvAvgSeconds === null ? "Sem dados" : `${screen.ttfvAvgSeconds.toFixed(1)}s`}, conclusão=${screen.completionRatePct === null ? "Sem dados" : `${screen.completionRatePct.toFixed(1)}%`}`,
      );
    });
  }

  lines.push("");
  lines.push("### Fluxos com maior conclusão");
  if (topFlows.length === 0) {
    lines.push("- Sem fluxos concluídos no período.");
  } else {
    topFlows.forEach((flow) => {
      lines.push(`- ${flow.flow}: ${flow.completed} conclusão(ões) (${flow.sharePct.toFixed(1)}%)`);
    });
  }

  return lines.join("\n");
}
