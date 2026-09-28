import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { BehaviorSubject, concatMap, concatWith, delay, filter, from, map, Observable, repeat, take } from "rxjs";
import sensorStreamData from "../../mocks/sensorStreamData.json";

export class MockTelemetrySource implements TelemetrySource {

    private paused$ = new BehaviorSubject<boolean>(false)

    stream(): Observable<TelemetrySample> {
        const startup$ = from(sensorStreamData.startup).pipe(
            concatMap(sample =>
                this.paused$.pipe(
                    filter(paused=>!paused),
                    take(1),
                    delay(1000),
                    map(()=>sample)
                )
            )
        );

        const steady$ = from(sensorStreamData.steady).pipe(
            concatMap(sample =>
                this.paused$.pipe(
                    filter(paused=>!paused),
                    take(1),
                    delay(1000),
                    map(()=>sample)
                )
            ),
            repeat()
        );

        return startup$.pipe(
            concatWith(steady$)
        );
    }

    pause():void{
        this.paused$.next(true)
    }

    resume():void{
        this.paused$.next(false)
    }

}