import { useEffect, useRef } from "react";
import { trackViewLoaded, type TelemetryMetadata, type TelemetryScreen } from "@/lib/telemetry";

export function useTrackViewLoaded(screen: TelemetryScreen, metadata?: TelemetryMetadata) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackViewLoaded(screen, metadata);
  }, [metadata, screen]);
}
