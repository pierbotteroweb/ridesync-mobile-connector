import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { concatMap, concatWith, delay, from, Observable, of, repeat } from "rxjs";
import sensorStreamData from "../../mocks/sensorStreamData.json";

export class MockTelemetrySource implements TelemetrySource {
    stream(): Observable<TelemetrySample> {

        const startup$:Observable<TelemetrySample> = 
        from(sensorStreamData.startup)

        const steady$:Observable<TelemetrySample> = 
        from(sensorStreamData.steady).pipe(repeat())

        const delayedStartup$:Observable<TelemetrySample> =
        startup$.pipe(
            concatMap(sample=>
                of(sample).pipe(
                    delay(1000)
                )
            )
        )

        const delayedSteady$:Observable<TelemetrySample> =
        steady$.pipe(
            concatMap(sample=>
                of(sample).pipe(
                    delay(1000)
                )
            )
        )

        const contatedStream$:Observable<TelemetrySample> =
        delayedStartup$.pipe(
            concatWith(delayedSteady$)
        )


        return contatedStream$
    }

}