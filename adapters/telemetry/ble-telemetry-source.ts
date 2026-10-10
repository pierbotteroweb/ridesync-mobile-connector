import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { Observable, Subject } from "rxjs";

import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const HEART_SENSOR_NAME = "57993-1";

export class BleTelemetrySource implements TelemetrySource {

    private telemetry$ = new Subject<TelemetrySample>()
    private manager = new BleManager()
    private paused = false
    private startingScan = false;
    private scanning = false;

    private heartDevice: Device | null = null;

    stream(): Observable<TelemetrySample> {

        return this.telemetry$.asObservable()

    }

    pause(): void {
        this.paused = true

    }

    resume(): void {
        this.paused = false

        if (!this.startingScan && !this.scanning) {
            void this.startScan();
        }

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

        if (this.startingScan || this.scanning) {
            return;
        }

        this.startingScan = true;

        const hasPermissions = await this.requestPermissions();

        if (!hasPermissions) {
            this.startingScan = false;
            console.log("Permissão Bluetooth negada.");
            return;
        }

        const bluetoothState = await this.manager.state();

        if (bluetoothState !== "PoweredOn") {
            this.startingScan = false;
            console.log("Bluetooth não está ligado.");
            return;
        }

        this.startingScan = false;
        this.scanning = true;

        this.manager.startDeviceScan(null, null, (error, device) => {
            
            if (error) {
                console.log("Erro durante o scan BLE:", error);
                this.stopScan();
                return;
            }

            if (!device) {
                return;
            }

            const deviceName = device.name ?? device.localName;

            if (!deviceName) {
                return;
            }

            if (deviceName === HEART_SENSOR_NAME) {
                console.log("Sensor cardíaco encontrado:", deviceName, device.id);

                this.heartDevice = device;
                this.stopScan();

                return;
            }

            console.log("Dispositivo BLE encontrado:", deviceName, device.id);
        });

        setTimeout(() => {
            this.stopScan();
        }, 10000);
    }

    private stopScan(): void {
        this.manager.stopDeviceScan()
        this.scanning = false
    } 

}