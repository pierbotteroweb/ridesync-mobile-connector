import { TelemetrySample } from "@/domain/telemetry";
import { createStore } from "zustand/vanilla";

type RideStatus = "idle" | "running" | "paused" | "finished"

type RideStore = {
    speed: number;
    time: number;
    heartRate: number;
    setTime: (newTime: number) => void;
    incrementTime: ()=> void;
    resetRide: ()=> void;
    status: RideStatus;
    setStatus: (newStatus: RideStatus) => void;
    applyTelemetry: (sample: TelemetrySample)=> void;
}


export const useRideStore = createStore<RideStore>((set) => ({
    speed: 25.30,
    heartRate:99,
    time: 1000,
    status: "idle",
    setTime: (newTime:number) => set({ time: newTime }),
    setStatus: (newStatus: RideStatus) => set({ status: newStatus }),
    resetRide: () => {
        set({
            status: "idle",
            time: 0
        })
    },
    incrementTime: ()=>{
        set((state)=>({
            time:  state.time + 1
        }))
    },

    applyTelemetry: (sample:TelemetrySample)=>{
        set({
            speed: sample.speed,
            heartRate: sample.heartRate
        })
        
    }


}))