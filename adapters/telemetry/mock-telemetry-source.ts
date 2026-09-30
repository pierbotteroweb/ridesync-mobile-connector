import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { BehaviorSubject, concatMap, concatWith, delay, filter, from, map, Observable, of, repeat, switchMap, take } from "rxjs";
import sensorStreamData from "../../mocks/sensorStreamData.json";

export class MockTelemetrySource implements TelemetrySource {

    private paused$ = new BehaviorSubject<boolean>(false)

    stream(): Observable<TelemetrySample> {
        const startup$ = from(sensorStreamData.startup).pipe(
            concatMap(sample =>
                of(sample).pipe(
                    delay(1000),
                    switchMap(() =>

                        this.paused$.pipe(
                            filter(paused => !paused),
                            take(1),
                            map(() => sample)
                        )

                    )

                )
            )

        );

        const steady$ = from(sensorStreamData.steady).pipe(
            concatMap(sample =>
                of(sample).pipe(
                    delay(1000),
                    switchMap(() =>

                        this.paused$.pipe(
                            filter(paused => !paused),
                            take(1),
                            map(() => sample)
                        )
                    )

                )
            ),
            repeat()
        );

        return startup$.pipe(
            concatWith(steady$)
        );
    }

    pause(): void {
        this.paused$.next(true)
    }

    resume(): void {
        this.paused$.next(false)
    }

}