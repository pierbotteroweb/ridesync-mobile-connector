import { TelemetrySource } from "@/ports/telemetry-source";
import { useRideStore } from "@/store/rideStore";

export class RideTelemetryService {
    constructor(private telemetrySource: TelemetrySource){}

    start(){
        return this.telemetrySource.stream().subscribe(sample=>{
            useRideStore.getState().applyTelemetry(sample)
        })
    }
}