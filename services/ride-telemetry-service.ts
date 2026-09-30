import { TelemetrySource } from "@/ports/telemetry-source";
import { useRideStore } from "@/store/rideStore";
import { Subscription } from "rxjs";

export class RideTelemetryService {
    constructor(private telemetrySource: TelemetrySource){}

    private subscription: Subscription | null = null

    private stop():void {
        this.subscription?.unsubscribe()
        this.subscription = null
    }

    start(): void {
        
        if (this.subscription && !this.subscription.closed) {
            return;
        }
        this.telemetrySource.resume()
        
        this.subscription = this.telemetrySource.stream().subscribe(sample => {
            useRideStore.getState().applyTelemetry(sample);
        });
    }
    pause(){
        this.telemetrySource.pause()
    }

    resume(){
        this.telemetrySource.resume()
    }

    finish():void{
        this.stop()
    }

    reset():void{
        this.stop()
    }
    


}