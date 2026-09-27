import { TelemetrySource } from "@/ports/telemetry-source";

export class TelemetryService {
    constructor(private telemetrySource: TelemetrySource){}
}