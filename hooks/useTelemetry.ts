import { MockTelemetrySource } from "@/adapters/telemetry/mock-telemetry-source";
import { RideTelemetryService } from "@/services/ride-telemetry-service";
import { useRideStore } from "@/store/rideStore";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";

export function useTelemetry(){

    const status = useStore(useRideStore, (state) => state.status)
    const telemetryServiceRef = useRef<RideTelemetryService | null>(null);
    const previousStatusRef = useRef(status);

    useEffect(() => {

        const mockTelemetrySource = new MockTelemetrySource()

        const telemetryService = new RideTelemetryService(mockTelemetrySource)

        telemetryServiceRef.current = telemetryService

    },[])

    useEffect(() => {
        const telemetryService = telemetryServiceRef.current
        const previousStatus = previousStatusRef.current

        if (!telemetryService) return

        if (previousStatus === "idle" && status === "running") {
            telemetryService.start();
        }

        if (previousStatus === "running" && status === "paused") {
            telemetryService.pause();
        }

        if (previousStatus === "paused" && status === "running") {
            telemetryService.resume();
        }

        if ((previousStatus === "running" || previousStatus === "paused")
            && status == "finished") {
            telemetryService.finish();
        }

        if (previousStatus === "paused" && status === "idle") {
            telemetryService.reset();
        }

        previousStatusRef.current = status
    },[status])

}