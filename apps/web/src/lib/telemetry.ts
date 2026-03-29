export type TelemetryEventName =
  | "view_loaded"
  | "first_valid_action"
  | "flow_completed"
  | "form_error";

export type TelemetryScreen =
  | "dashboard"
  | "licencas"
  | "condicionantes"
  | "mtrs"
  | "clientes"
  | "notificacoes"
  | "configuracoes"
  | "login"
  | "unknown";

export type TelemetryMetadata = Record<string, unknown>;

export type TelemetryEvent = {
  id: string;
  name: TelemetryEventName;
  screen: TelemetryScreen;
  path: string;
  timestamp: string;
  sessionId: string;
  action?: string;
  flow?: string;
  metadata?: TelemetryMetadata;
};

type TrackTelemetryInput = {
  name: TelemetryEventName;
  screen: TelemetryScreen;
  action?: string;
  flow?: string;
  metadata?: TelemetryMetadata;
};

type FormErrorLike = {
  title?: string;
  message?: string;
  technicalFallback?: string;
  actionKind?: string;
};

const TELEMETRY_STORAGE_KEY = "greenly_telemetry_events";
const TELEMETRY_SESSION_KEY = "greenly_telemetry_session_id";
const TELEMETRY_FIRST_ACTION_PREFIX = "greenly_telemetry_first_action";
const TELEMETRY_MAX_EVENTS = 250;

const runtimeBuffer: TelemetryEvent[] = [];
const telemetryEnabled = import.meta.env.VITE_TELEMETRY_ENABLED !== "false";

function isBrowser() {
  return typeof window !== "undefined";
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  if (!isBrowser()) return "server";

  const existing = window.sessionStorage.getItem(TELEMETRY_SESSION_KEY);
  if (existing) return existing;

  const sessionId = createEventId();
  window.sessionStorage.setItem(TELEMETRY_SESSION_KEY, sessionId);
  return sessionId;
}

function getCurrentPath() {
  if (!isBrowser()) return "/";
  return window.location.pathname + window.location.search;
}

function parseStoredEvents(raw: string | null): TelemetryEvent[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TelemetryEvent[];
  } catch {
    return [];
  }
}

function readStoredEvents() {
  if (!isBrowser()) return [];
  return parseStoredEvents(window.localStorage.getItem(TELEMETRY_STORAGE_KEY));
}

function persistEvent(event: TelemetryEvent) {
  runtimeBuffer.push(event);
  if (runtimeBuffer.length > TELEMETRY_MAX_EVENTS) {
    runtimeBuffer.splice(0, runtimeBuffer.length - TELEMETRY_MAX_EVENTS);
  }

  if (!isBrowser()) return;

  try {
    const next = [...readStoredEvents(), event];
    const bounded = next.slice(-TELEMETRY_MAX_EVENTS);
    window.localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(bounded));
  } catch {
    // Keep runtime buffer as fallback when localStorage is not available.
  }
}

function mergeEventBuffers() {
  const merged = new Map<string, TelemetryEvent>();
  const stored = readStoredEvents();

  [...stored, ...runtimeBuffer].forEach((event) => {
    merged.set(event.id, event);
  });

  return Array.from(merged.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function firstActionKey(screen: TelemetryScreen) {
  return `${TELEMETRY_FIRST_ACTION_PREFIX}:${screen}`;
}

export function trackTelemetryEvent(input: TrackTelemetryInput): TelemetryEvent | null {
  if (!telemetryEnabled || !isBrowser()) return null;

  const event: TelemetryEvent = {
    id: createEventId(),
    name: input.name,
    screen: input.screen,
    path: getCurrentPath(),
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    action: input.action,
    flow: input.flow,
    metadata: input.metadata,
  };

  persistEvent(event);

  if (import.meta.env.DEV) {
    console.debug("[telemetry]", event.name, event);
  }

  return event;
}

export function trackViewLoaded(screen: TelemetryScreen, metadata?: TelemetryMetadata) {
  return trackTelemetryEvent({
    name: "view_loaded",
    screen,
    metadata,
  });
}

export function trackFirstValidAction(
  screen: TelemetryScreen,
  action: string,
  metadata?: TelemetryMetadata,
) {
  if (!telemetryEnabled || !isBrowser()) return null;

  const key = firstActionKey(screen);
  if (window.sessionStorage.getItem(key) === "1") {
    return null;
  }

  window.sessionStorage.setItem(key, "1");
  return trackTelemetryEvent({
    name: "first_valid_action",
    screen,
    action,
    metadata,
  });
}

export function trackFlowCompleted(
  screen: TelemetryScreen,
  flow: string,
  metadata?: TelemetryMetadata,
) {
  return trackTelemetryEvent({
    name: "flow_completed",
    screen,
    flow,
    metadata,
  });
}

export function trackFormError(
  screen: TelemetryScreen,
  form: string,
  error: FormErrorLike | string,
  metadata?: TelemetryMetadata,
) {
  const normalizedError =
    typeof error === "string"
      ? { message: error }
      : {
          title: error.title,
          message: error.message,
          technicalFallback: error.technicalFallback,
          actionKind: error.actionKind,
        };

  return trackTelemetryEvent({
    name: "form_error",
    screen,
    action: form,
    metadata: {
      form,
      ...metadata,
      errorTitle: normalizedError.title,
      errorMessage: normalizedError.message,
      errorActionKind: normalizedError.actionKind,
      errorTechnicalFallback: normalizedError.technicalFallback,
    },
  });
}

export function getTelemetryEvents() {
  return mergeEventBuffers();
}

export function clearTelemetryEvents() {
  runtimeBuffer.length = 0;
  if (!isBrowser()) return;

  window.localStorage.removeItem(TELEMETRY_STORAGE_KEY);

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key && key.startsWith(TELEMETRY_FIRST_ACTION_PREFIX)) {
      window.sessionStorage.removeItem(key);
    }
  }
}
