import { TelemetrySample } from "@/domain/telemetry";
import { Observable } from "rxjs";

export interface TelemetrySource {
    stream(): Observable<TelemetrySample>
}