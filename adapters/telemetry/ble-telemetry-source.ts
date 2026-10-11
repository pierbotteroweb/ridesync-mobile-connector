import { TelemetrySample } from "@/domain/telemetry";
import { TelemetrySource } from "@/ports/telemetry-source";
import { Observable, Subject } from "rxjs";

import { useSensorStore } from "@/store/sensorStore";
import { Buffer } from "buffer";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const HEART_SENSOR_NAME = "57993-1";
const HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const HR_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";

export class BleTelemetrySource implements TelemetrySource {

    private telemetry$ = new Subject<TelemetrySample>()
    private manager = new BleManager()
    private paused = false
    private startingScan = false;
    private scanning = false;

    private heartDevice: Device | null = null;

    private latestTelemetry: TelemetrySample = {
        speed: 0,
        heartRate: 0,
        cadence: 0
    };
    



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

    stop(): void {
        this.paused = true

        this.stopScan()

        if(this.heartDevice){

            const deviceId = this.heartDevice.id

            this.heartDevice = null

            useSensorStore.getState().setHeartrate(false)

            void this.manager.cancelDeviceConnection(deviceId)
            .catch(error => {
                console.log(
                    "Erro ao desconectar sensor cardíaco:",
                    error
                );
            });

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

        const SCAN_TIMEOUT_MS = 30000;

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

                this.stopScan();
                void this.connectHeartDevice(device)

                return;
            }

            console.log("Dispositivo BLE encontrado:", deviceName, device.id);
        });

        setTimeout(() => {
            this.stopScan();
        }, SCAN_TIMEOUT_MS);
    }

    private stopScan(): void {
        this.manager.stopDeviceScan()
        this.scanning = false
    } 

    private async connectHeartDevice(device: Device): Promise<void> {
        try{
            console.log("conectado ao sensor cardíaco:", device.name)

            const connectedDevice = await this.manager.connectToDevice(device.id)

            await connectedDevice.discoverAllServicesAndCharacteristics()

            this.heartDevice = connectedDevice

            useSensorStore.getState().setHeartrate(true)

            console.log(
                "Sensor cardiaco conectado:",
                connectedDevice.name,
                connectedDevice.id
            )

            this.manager.onDeviceDisconnected(
                connectedDevice.id,() => {
                    console.log("Sensor cardiaco desconectado")

                    this.heartDevice = null

                    useSensorStore.getState().setHeartrate(false)
                }
            )
        

            this.monitorHeartRate(connectedDevice);

        } catch (error) {
            console.log(
                "Erro ao conectar ao sensor cardíaco:",
                error
            );

            this.heartDevice = null

            useSensorStore.getState().setHeartrate(false)
        }
    }

    private publish(sample: TelemetrySample): void {
        if (this.paused) {
            return;
        }

        this.telemetry$.next(sample);
    }
    
    private monitorHeartRate(device: Device): void {

        device.monitorCharacteristicForService(
            HR_SERVICE,
            HR_MEASUREMENT,
            (error, characteristic) => {

                if (error) {
                    console.log("Erro ao ler frequência cardíaca:", error);
                    return;
                }

                if (!characteristic?.value) {
                    return;
                }

                const raw = Buffer.from(
                    characteristic.value,
                    "base64"
                );

                if (raw.length < 2) {
                    return;
                }

                const flags = raw[0];

                const contactSupported = (flags & 0x04) !== 0;
                const contactDetected = (flags & 0x02) !== 0;

                console.log(
                    "Contato HR:",
                    {
                        contactSupported,
                        contactDetected,
                        flags
                    }
                );

                const heartRateIs16Bits =
                    (flags & 0x01) !== 0;

                const heartRate = heartRateIs16Bits
                    ? raw.readUInt16LE(1)
                    : raw[1];

                console.log("BPM:", heartRate);

                this.latestTelemetry = {
                    ...this.latestTelemetry,
                    heartRate
                };

                this.publish(this.latestTelemetry);
            }
        );
    }

}