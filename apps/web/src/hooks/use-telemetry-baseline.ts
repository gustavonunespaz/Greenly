import { useCallback, useEffect, useState } from "react";
import { clearTelemetryEvents, getTelemetryEvents } from "@/lib/telemetry";
import { computeTelemetryBaseline, type TelemetryBaselineReport } from "@/lib/telemetry-baseline";

const TELEMETRY_STORAGE_PREFIX = "greenly_telemetry_";

export function useTelemetryBaseline(windowDays = 7) {
  const [report, setReport] = useState<TelemetryBaselineReport>(() =>
    computeTelemetryBaseline(getTelemetryEvents(), { windowDays }),
  );

  const refresh = useCallback(() => {
    setReport(computeTelemetryBaseline(getTelemetryEvents(), { windowDays }));
  }, [windowDays]);

  const clear = useCallback(() => {
    clearTelemetryEvents();
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(refresh, 15000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (!event.key || !event.key.startsWith(TELEMETRY_STORAGE_PREFIX)) return;
      refresh();
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  return {
    report,
    refresh,
    clear,
  };
}
