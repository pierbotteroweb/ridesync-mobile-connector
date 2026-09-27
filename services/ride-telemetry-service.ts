import { TelemetrySource } from "@/ports/telemetry-source";

export class RideTelemetryService {
    constructor(private telemetrySource: TelemetrySource){}

    start(){
        this.telemetrySource.stream().subscribe(sample=>{
            console.log("Sample",sample)
        })
    }
}