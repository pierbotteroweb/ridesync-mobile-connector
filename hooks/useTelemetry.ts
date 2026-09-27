import { MockTelemetrySource } from "@/adapters/telemetry/mock-telemetry-source";
import { RideTelemetryService } from "@/services/ride-telemetry-service";
import { useEffect } from "react";

export function useTelemetry(){

    useEffect(() => {

        const mockTelemetrySource = new MockTelemetrySource()
        const telemetryService = new RideTelemetryService(mockTelemetrySource)

        const subscription = telemetryService.start()

        return ()=>{
            subscription.unsubscribe()
        }

    },[])

}