import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { concatMap, concatWith, delay, from, Observable, of, repeat } from "rxjs";
import sensorStreamData from "../../mocks/sensorStreamData.json";

export class MockTelemetrySource implements TelemetrySource {

    stream(): Observable<TelemetrySample> {
        const startup$ = from(sensorStreamData.startup).pipe(
            concatMap(sample =>
            of(sample).pipe(delay(1000))
            )
        );

        const steady$ = from(sensorStreamData.steady).pipe(
            concatMap(sample =>
            of(sample).pipe(delay(1000))
            ),
            repeat()
        );

        return startup$.pipe(
            concatWith(steady$)
        );
    }

}