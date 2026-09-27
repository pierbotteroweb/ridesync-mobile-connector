import { TelemetrySource } from "@/ports/telemetry-source";

export class RideTelemetryService {
    constructor(private telemetrySource: TelemetrySource){}

    start(){
        return this.telemetrySource.stream().subscribe(sample=>{
            console.log("Sample",sample)
        })
    }
}