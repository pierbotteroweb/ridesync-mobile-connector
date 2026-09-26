import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { Observable, of } from "rxjs";

export class MockTelemetrySource implements TelemetrySource {
    stream(): Observable<TelemetrySample | any> {
        return of("x")
    }

}