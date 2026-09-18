import { createStore } from "zustand/vanilla";

type SensorStore = {
    speed: boolean;
    cadence: boolean;
    heartbeat: boolean;
    switchSpeed: () => void;
    switchCadence: () => void;
    switchHeartbeat: () => void;
}

export const useSensorStore = createStore<SensorStore>((set) => ({
    speed: false,
    cadence: false,
    heartbeat: false,
    switchSpeed: () => {
        set((state) => ({
            speed: !state.speed
        }))
    },
    switchCadence: () => {
        set((state) => ({
            cadence: !state.cadence
        }))
    },
    switchHeartbeat: () => {
        set((state) => ({
            heartbeat: !state.heartbeat
        }))
    },
}))