import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { Observable, of } from "rxjs";

export class BleTelemetrySource implements TelemetrySource {

    stream(): Observable<TelemetrySample> {

        return of({})
        
    }

    pause(): void {
        
    }

    resume(): void {
        
    }

}