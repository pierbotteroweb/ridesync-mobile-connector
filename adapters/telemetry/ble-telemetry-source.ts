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

const SPEED_SENSOR_NAME = "Cycplus S3 26429";
const CSC_SERVICE = "00001816-0000-1000-8000-00805f9b34fb";
const CSC_MEASUREMENT = "00002a5b-0000-1000-8000-00805f9b34fb";

const WHEEL_CIRCUMFERENCE_METERS = 2.105;

const CADENCE_SENSOR_NAME = "12494-85";

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

    private heartDisconnectSubscription: { remove: () => void } | null = null;

    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    
    private connectingHeart = false;

    private scanTimeout: ReturnType<typeof setTimeout> | null = null;

    private stopped = true;

    private speedDevice: Device | null = null;
    
    private connectingSpeed = false;

    private speedDisconnectSubscription:
        { remove: () => void } | null = null;

    private lastWheelRevolutions: number | null = null;

    private lastWheelEventTime: number | null = null;

    private cadenceDevice: Device | null = null;

    private connectingCadence = false;

    private cadenceDisconnectSubscription:
        { remove: () => void } | null = null;

    private lastCrankRevolutions: number | null = null;
    
    private lastCrankEventTime: number | null = null;
    
    private cadenceStopTimeout:
        ReturnType<typeof setTimeout> | null = null;



    stream(): Observable<TelemetrySample> {

        return this.telemetry$.asObservable()

    }

    pause(): void {
        this.paused = true

    }

    resume(): void {
        this.stopped = false;
        this.paused = false;

        if (
            !this.heartDevice &&
            !this.connectingHeart &&
            !this.startingScan &&
            !this.scanning
        ) {
            void this.startScan();
        }

    }

    stop(): void {
        this.stopped = true;
        this.paused = true;

        this.stopScan()

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.cadenceStopTimeout) {
            clearTimeout(this.cadenceStopTimeout);
            this.cadenceStopTimeout = null;
        }

        if(this.heartDevice){

            const deviceId = this.heartDevice.id

            this.heartDevice = null

            useSensorStore.getState().setHeartrate(false)

            this.heartDisconnectSubscription?.remove();
            this.heartDisconnectSubscription = null;

            console.log("Desconectando sensor cardíaco ao finalizar corrida");
            void this.manager.cancelDeviceConnection(deviceId)
            .catch(error => {
                console.log(
                    "Erro ao desconectar sensor cardíaco:",
                    error
                );
            });

        }

        if (this.speedDevice) {
            const deviceId = this.speedDevice.id;

            this.speedDevice = null;

            useSensorStore.getState().setSpeed(false);

            this.speedDisconnectSubscription?.remove();
            this.speedDisconnectSubscription = null;

            console.log(
                "Desconectando sensor de velocidade ao finalizar corrida"
            );

            void this.manager
                .cancelDeviceConnection(deviceId)
                .catch(error => {
                    console.log(
                        "Erro ao desconectar sensor de velocidade:",
                        error
                    );
                });
        }

        if (this.cadenceDevice) {
            const deviceId = this.cadenceDevice.id;

            this.cadenceDevice = null;

            useSensorStore.getState().setCadence(false);

            this.cadenceDisconnectSubscription?.remove();
            this.cadenceDisconnectSubscription = null;

            console.log(
                "Desconectando sensor de cadência ao finalizar corrida"
            );

            void this.manager
                .cancelDeviceConnection(deviceId)
                .catch(error => {
                    console.log(
                        "Erro ao desconectar sensor de cadência:",
                        error
                    );
                });
        }

        this.lastWheelRevolutions = null;
        this.lastWheelEventTime = null;

        this.lastCrankRevolutions = null;
        this.lastCrankEventTime = null;

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
        
        if (
            this.connectingHeart ||
            this.startingScan ||
            this.scanning
        ) {
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

            if (
                deviceName === HEART_SENSOR_NAME &&
                !this.heartDevice &&
                !this.connectingHeart
            ) {
                console.log("Sensor cardíaco encontrado:", deviceName, device.id);

                this.stopScan();
                void this.connectHeartDevice(device)

                return;
            }

            if (deviceName === SPEED_SENSOR_NAME &&
                !this.speedDevice &&
                !this.connectingSpeed) {
                console.log(
                    "Sensor de velocidade encontrado:", deviceName, device.id);

                this.stopScan();
                void this.connectSpeedDevice(device);

                return;
            }

            if (
                deviceName === CADENCE_SENSOR_NAME &&
                !this.cadenceDevice &&
                !this.connectingCadence
            ) {
                console.log(
                    "Sensor de cadência encontrado:",
                    deviceName,
                    device.id
                );

                this.stopScan();
                void this.connectCadenceDevice(device);

                return;
            }

            console.log("Dispositivo BLE encontrado:", deviceName, device.id);
        });

        this.scanTimeout = setTimeout(() => {
                this.scanTimeout = null;

                this.stopScan();

                if (!this.heartDevice && !this.paused) {
                    this.scheduleReconnect();
                }
        }, SCAN_TIMEOUT_MS);
    }

    private stopScan(): void {
        this.manager.stopDeviceScan()
        this.scanning = false

        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }
    } 

    private async connectHeartDevice(device: Device): Promise<void> {

        if (this.connectingHeart || this.heartDevice) {
            return;
        }

        this.connectingHeart = true;

        try{
            console.log("conectado ao sensor cardíaco:", device.name)

            const connectedDevice = await this.manager.connectToDevice(device.id)

            if (this.stopped) {
                this.connectingHeart = false;

                await this.manager
                    .cancelDeviceConnection(connectedDevice.id)
                    .catch(() => undefined);

                return;
            }

            await connectedDevice.discoverAllServicesAndCharacteristics()

            if (this.stopped) {
                this.connectingHeart = false;

                await this.manager
                    .cancelDeviceConnection(connectedDevice.id)
                    .catch(() => undefined);

                return;
            }

            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }

            this.connectingHeart = false;
            this.heartDevice = connectedDevice;

            useSensorStore.getState().setHeartrate(true)

            console.log(
                "Sensor cardiaco conectado:",
                connectedDevice.name,
                connectedDevice.id
            )
            
            this.heartDisconnectSubscription?.remove();

            this.heartDisconnectSubscription =
            this.manager.onDeviceDisconnected(
                connectedDevice.id,() => {
                    console.log("Sensor cardiaco desconectado")

                    this.heartDevice = null

                    useSensorStore.getState().setHeartrate(false)

                    this.latestTelemetry = {
                        ...this.latestTelemetry,
                        heartRate: 0
                    };

                    this.publish(this.latestTelemetry);

                    if (!this.paused) {
                        void this.startScan();
                    }
                }
            )
        

            this.monitorHeartRate(connectedDevice);

            if (!this.speedDevice && !this.paused) {
                void this.startScan();
            }

        } catch (error) {
            console.log(
                "Erro ao conectar ao sensor cardíaco:",
                error
            );

            this.connectingHeart = false;
            this.heartDevice = null

            useSensorStore.getState().setHeartrate(false)
        }
    }

    private async connectSpeedDevice(device: Device): Promise<void> {

        if (this.connectingSpeed || this.speedDevice) {
            return;
        }

        this.connectingSpeed = true;

        try {
            const connectedDevice =
                await this.manager.connectToDevice(device.id);

            await connectedDevice
                .discoverAllServicesAndCharacteristics();

            this.connectingSpeed = false;
            this.speedDevice = connectedDevice;

            useSensorStore.getState().setSpeed(true);

            console.log(
                "Sensor de velocidade conectado:",
                connectedDevice.name,
                connectedDevice.id
            );

            this.speedDisconnectSubscription?.remove();

            this.speedDisconnectSubscription =
                this.manager.onDeviceDisconnected(
                    connectedDevice.id,
                    () => {
                        console.log(
                            "Sensor de velocidade desconectado"
                        );

                        this.speedDevice = null;

                        useSensorStore
                            .getState()
                            .setSpeed(false);

                        this.latestTelemetry = {
                            ...this.latestTelemetry,
                            speed: 0
                        };

                        this.publish(this.latestTelemetry);

                        if (!this.paused) {
                            void this.startScan();
                        }
                    }
                );

                this.monitorSpeed(connectedDevice);

                if (!this.heartDevice && !this.paused) {
                    void this.startScan();
                }

        } catch (error) {
            this.connectingSpeed = false;
            this.speedDevice = null;

            useSensorStore.getState().setSpeed(false);

            console.log(
                "Erro ao conectar sensor de velocidade:",
                error
            );
        }
    }

    private async connectCadenceDevice(device: Device): Promise<void> {

        if (this.connectingCadence || this.cadenceDevice) {
            return;
        }

        this.connectingCadence = true;

        try {
            const connectedDevice =
                await this.manager.connectToDevice(device.id);

            await connectedDevice
                .discoverAllServicesAndCharacteristics();

            this.connectingCadence = false;
            this.cadenceDevice = connectedDevice;

            useSensorStore
                .getState()
                .setCadence(true);

            console.log(
                "Sensor de cadência conectado:",
                connectedDevice.name,
                connectedDevice.id
            );

            this.cadenceDisconnectSubscription?.remove();

            this.cadenceDisconnectSubscription =
                this.manager.onDeviceDisconnected(
                    connectedDevice.id,
                    () => {
                        console.log(
                            "Sensor de cadência desconectado"
                        );

                        this.cadenceDevice = null;

                        useSensorStore
                            .getState()
                            .setCadence(false);

                        if (!this.paused) {
                            void this.startScan();
                        }
                    }
                );
            
            this.monitorCadence(connectedDevice);

        } catch (error) {
            this.connectingCadence = false;
            this.cadenceDevice = null;

            useSensorStore
                .getState()
                .setCadence(false);

            console.log(
                "Erro ao conectar sensor de cadência:",
                error
            );
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

                if (contactSupported && !contactDetected) {
                    this.latestTelemetry = {
                        ...this.latestTelemetry,
                        heartRate: 0
                    };

                    this.publish(this.latestTelemetry);

                    return;
                }

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

    private scheduleReconnect(): void {

        if (
            this.paused ||
            this.heartDevice ||
            this.connectingHeart
        ) {
            return;
        }

        if (this.reconnectTimeout) {
            return;
        }

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            
            if (
                !this.paused &&
                !this.heartDevice &&
                !this.connectingHeart
            ) {
                void this.startScan();
            }

        }, 5000);
    }

    private monitorSpeed(device: Device): void {

        device.monitorCharacteristicForService(
            CSC_SERVICE,
            CSC_MEASUREMENT,
            (error, characteristic) => {

                if (error) {
                    console.log(
                        "Erro ao ler sensor de velocidade:",
                        error
                    );

                    return;
                }

                if (!characteristic?.value) {
                    return;
                }

                const raw = Buffer.from(
                    characteristic.value,
                    "base64"
                );

                if (raw.length < 7) {
                    return;
                }

                const flags = raw[0];

                const hasWheelData =
                    (flags & 0x01) !== 0;

                if (!hasWheelData) {
                    return;
                }

                const wheelRevolutions =
                    raw.readUInt32LE(1);

                const eventTime =
                    raw.readUInt16LE(5);

                if (
                    this.lastWheelRevolutions === null ||
                    this.lastWheelEventTime === null
                ) {
                    this.lastWheelRevolutions = wheelRevolutions;
                    this.lastWheelEventTime = eventTime;
                    return;
                }

                const deltaRevolutions =
                    wheelRevolutions - this.lastWheelRevolutions;

                let deltaTime =
                    eventTime - this.lastWheelEventTime;

                if (deltaTime < 0) {
                    deltaTime += 65536;
                }

                this.lastWheelRevolutions = wheelRevolutions;
                this.lastWheelEventTime = eventTime;

                const seconds = deltaTime / 1024;

                if (deltaRevolutions <= 0 || seconds <= 0) {
                    return;
                }

                const metersPerSecond =
                    (deltaRevolutions * WHEEL_CIRCUMFERENCE_METERS)
                    / seconds;

                const speed = metersPerSecond * 3.6;

                console.log("Velocidade:", speed, "km/h");

                this.latestTelemetry = {
                    ...this.latestTelemetry,
                    speed
                };

                this.publish(this.latestTelemetry);

                console.log(
                    "Dados velocidade:",
                    {
                        wheelRevolutions,
                        eventTime,
                        flags
                    }
                );
            }
        );
    }

    private monitorCadence(device: Device): void {

        device.monitorCharacteristicForService(
            CSC_SERVICE,
            CSC_MEASUREMENT,
            (error, characteristic) => {

                if (error) {
                    console.log(
                        "Erro ao ler sensor de cadência:",
                        error
                    );

                    return;
                }

                if (!characteristic?.value) {
                    return;
                }

                const raw = Buffer.from(
                    characteristic.value,
                    "base64"
                );

                if (raw.length < 5) {
                    return;
                }

                const flags = raw[0];

                const hasCrankData =
                    (flags & 0x02) !== 0;

                if (!hasCrankData) {
                    return;
                }

                let offset = 1;

                // Se o mesmo pacote também tiver dados da roda,
                // esses 6 bytes vêm antes dos dados do pedivela.
                const hasWheelData =
                    (flags & 0x01) !== 0;

                if (hasWheelData) {
                    offset += 6;
                }

                if (raw.length < offset + 4) {
                    return;
                }

                const crankRevolutions =
                    raw.readUInt16LE(offset);

                const eventTime =
                    raw.readUInt16LE(offset + 2);

                if (
                    this.lastCrankRevolutions === null ||
                    this.lastCrankEventTime === null
                ) {
                    this.lastCrankRevolutions = crankRevolutions;
                    this.lastCrankEventTime = eventTime;
                    return;
                }

                let deltaRevolutions =
                    crankRevolutions - this.lastCrankRevolutions;

                if (deltaRevolutions < 0) {
                    deltaRevolutions += 65536;
                }

                let deltaTime =
                    eventTime - this.lastCrankEventTime;

                if (deltaTime < 0) {
                    deltaTime += 65536;
                }

                if (deltaRevolutions === 0) {
                    return;
                }

                this.lastCrankRevolutions = crankRevolutions;
                this.lastCrankEventTime = eventTime;

                const seconds = deltaTime / 1024;

                if (seconds <= 0) {
                    return;
                }

                const cadence =
                    (deltaRevolutions / seconds) * 60;

                console.log("Cadência:", cadence, "RPM");

                this.latestTelemetry = {
                    ...this.latestTelemetry,
                    cadence
                };

                this.publish(this.latestTelemetry);

                if (this.cadenceStopTimeout) {
                    clearTimeout(this.cadenceStopTimeout);
                }

                this.cadenceStopTimeout = setTimeout(() => {
                    this.latestTelemetry = {
                        ...this.latestTelemetry,
                        cadence: 0
                    };

                    this.publish(this.latestTelemetry);

                    console.log("Cadência: 0 RPM");
                }, 2000);

                console.log(
                    "Dados cadência:",
                    {
                        crankRevolutions,
                        eventTime,
                        flags
                    }
                );
            }
        );
    }

    

}