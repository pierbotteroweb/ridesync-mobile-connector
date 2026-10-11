import { createStore } from "zustand/vanilla";

type SensorStore = {
    speed: boolean;
    cadence: boolean;
    heartrate: boolean;
    // switchSpeed: () => void;
    setSpeed: (connected: boolean) => void;
    // switchCadence: () => void;
    setCadence: (connected: boolean) => void;
    // switchHeartrate: () => void;
    setHeartrate: (connected:boolean) => void;
}

export const useSensorStore = createStore<SensorStore>((set) => ({
    speed: false,
    cadence: false,
    heartrate: false,

    setSpeed: (connected: boolean) => {
        set({
            speed: connected
        })
    },

    setCadence: (connected: boolean) => {
        set({
            cadence: connected
        })
    },
    setHeartrate: (connected: boolean) => {
        set({
            heartrate: connected
        })
    },
}))