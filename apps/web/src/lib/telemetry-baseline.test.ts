import { describe, expect, it } from "vitest";
import {
  computeTelemetryBaseline,
  formatTelemetryBaselineMarkdown,
} from "@/lib/telemetry-baseline";
import type { TelemetryEvent } from "@/lib/telemetry";

function makeEvent(overrides: Partial<TelemetryEvent>): TelemetryEvent {
  return {
    id: overrides.id || "evt-1",
    name: overrides.name || "view_loaded",
    screen: overrides.screen || "dashboard",
    path: overrides.path || "/",
    timestamp: overrides.timestamp || new Date().toISOString(),
    sessionId: overrides.sessionId || "session-1",
    action: overrides.action,
    flow: overrides.flow,
    metadata: overrides.metadata,
  };
}

describe("computeTelemetryBaseline", () => {
  it("computes summary and target status from telemetry events", () => {
    const now = Date.now();
    const events: TelemetryEvent[] = [
      makeEvent({
        id: "v1",
        name: "view_loaded",
        screen: "dashboard",
        sessionId: "session-1",
        timestamp: new Date(now).toISOString(),
      }),
      makeEvent({
        id: "a1",
        name: "first_valid_action",
        screen: "dashboard",
        sessionId: "session-1",
        timestamp: new Date(now + 10_000).toISOString(),
      }),
      makeEvent({
        id: "c1",
        name: "flow_completed",
        screen: "dashboard",
        flow: "quick_action_navigation",
        sessionId: "session-1",
        timestamp: new Date(now + 12_000).toISOString(),
      }),
      makeEvent({
        id: "v2",
        name: "view_loaded",
        screen: "licencas",
        sessionId: "session-2",
        timestamp: new Date(now + 20_000).toISOString(),
      }),
      makeEvent({
        id: "a2",
        name: "first_valid_action",
        screen: "licencas",
        sessionId: "session-2",
        timestamp: new Date(now + 50_000).toISOString(),
      }),
      makeEvent({
        id: "e2",
        name: "form_error",
        screen: "licencas",
        action: "licenca_form",
        sessionId: "session-2",
        timestamp: new Date(now + 52_000).toISOString(),
      }),
    ];

    const report = computeTelemetryBaseline(events, { windowDays: 7 });

    expect(report.summary.sessionCount).toBe(2);
    expect(report.summary.totalEvents).toBe(6);
    expect(report.summary.ttfvAvgSeconds).toBe(20);
    expect(report.summary.completionRatePct).toBe(50);
    expect(report.summary.errorsPerSession).toBe(0.5);
    expect(report.summary.statuses.completion).toBe("off_track");
    expect(report.flows[0]).toMatchObject({
      flow: "quick_action_navigation",
      completed: 1,
    });
  });

  it("filters events outside the time window", () => {
    const now = Date.now();
    const old = now - 20 * 24 * 60 * 60 * 1000;

    const events: TelemetryEvent[] = [
      makeEvent({
        id: "old-view",
        name: "view_loaded",
        screen: "dashboard",
        sessionId: "session-old",
        timestamp: new Date(old).toISOString(),
      }),
      makeEvent({
        id: "recent-view",
        name: "view_loaded",
        screen: "clientes",
        sessionId: "session-new",
        timestamp: new Date(now).toISOString(),
      }),
    ];

    const report = computeTelemetryBaseline(events, { windowDays: 7 });
    expect(report.summary.totalEvents).toBe(1);
    expect(report.summary.sessionCount).toBe(1);
  });

  it("exports a readable markdown snapshot", () => {
    const now = Date.now();
    const events: TelemetryEvent[] = [
      makeEvent({
        id: "v1",
        name: "view_loaded",
        screen: "dashboard",
        sessionId: "session-1",
        timestamp: new Date(now).toISOString(),
      }),
      makeEvent({
        id: "a1",
        name: "first_valid_action",
        screen: "dashboard",
        sessionId: "session-1",
        timestamp: new Date(now + 5000).toISOString(),
      }),
      makeEvent({
        id: "c1",
        name: "flow_completed",
        screen: "dashboard",
        flow: "quick_action_navigation",
        sessionId: "session-1",
        timestamp: new Date(now + 6000).toISOString(),
      }),
    ];

    const report = computeTelemetryBaseline(events, { windowDays: 7 });
    const markdown = formatTelemetryBaselineMarkdown(report);

    expect(markdown).toContain("Snapshot Baseline Sprint 3");
    expect(markdown).toContain("Leitura por tela");
    expect(markdown).toContain("Fluxos com maior conclusão");
    expect(markdown).toContain("quick_action_navigation");
  });
});
