import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { Observable, Subject } from "rxjs";

import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

export class BleTelemetrySource implements TelemetrySource {

    private telemetry$ = new Subject<TelemetrySample>()
    private manager = new BleManager()
    private paused = false

    stream(): Observable<TelemetrySample> {

        return this.telemetry$.asObservable()

    }

    pause(): void {
        this.paused = true

    }

    resume(): void {
        this.paused = false

    }

    private async requestPermissions(): Promise<boolean> {

        if (Platform.OS !== "android") {
            return true;
        }

        if (Number(Platform.Version) < 31) {
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            return result === PermissionsAndroid.RESULTS.GRANTED;
        }


        const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        return (
            result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
    }

    private async startScan(): Promise<void> {
        const hasPermissions = await this.requestPermissions();

        if (!hasPermissions) {
            console.log("Permissão Bluetooth negada.");
            return;
        }

        const bluetoothState = await this.manager.state();

        if (bluetoothState !== "PoweredOn") {
            console.log("Bluetooth não está ligado.");
            return;
        }

        this.manager.startDeviceScan(null, null, (error, device) => {
            
            if (error) {
                console.log("Erro durante o scan BLE:", error);
                this.manager.stopDeviceScan();
                return;
            }

            if (!device) {
                return;
            }

            const deviceName = device.name ?? device.localName;

            if (!deviceName) {
                return;
            }

            console.log("Dispositivo BLE encontrado:", deviceName, device.id);
        });
    }

}