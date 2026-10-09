import { TelemetrySample } from "@/domain/telemetry";
import { createStore } from "zustand/vanilla";

type RideStatus = "idle" | "running" | "paused" | "finished"

type RideStore = {
    speed: number;
    avgSpeed: number;
    maxSpeed: number;
    speedRegisters: number[];
    time: number;
    heartRate: number;
    distance: number;
    setTime: (newTime: number) => void;
    incrementTime: ()=> void;
    findAverageSpeed: ()=> void;
    findMaxSpeed: ()=> void;
    calculateDistance: ()=> void;
    resetRide: ()=> void;
    status: RideStatus;
    setStatus: (newStatus: RideStatus) => void;
    applyTelemetry: (sample: TelemetrySample)=> void;
}


export const useRideStore = createStore<RideStore>((set) => ({
    speed: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    speedRegisters: [0],
    heartRate:0,
    time: 0,
    distance: 0,
    status: "idle",
    setTime: (newTime:number) => set({ time: newTime }),
    setStatus: (newStatus: RideStatus) => set({ status: newStatus }),
    resetRide: () => {
        set({
            status: "idle",
            time: 0,
            speed: 0,
            avgSpeed: 0,
            maxSpeed: 0,
            speedRegisters: [0],
            distance: 0,
            heartRate: 0
        })
    },
    incrementTime: ()=>{
        set((state)=>({
            time:  state.time + 1
        }))
    },

    applyTelemetry: (sample:TelemetrySample)=>{
        set((state)=>({
            speed: sample.speed,
            heartRate: sample.heartRate,
            speedRegisters: [...state.speedRegisters, sample.speed]
        }))
    },

    findAverageSpeed: () => {
        set((state)=>({
            avgSpeed: state.speedRegisters.length
            ? state.speedRegisters.reduce((sum, value) => sum + value, 0) / state.speedRegisters.length
            : 0
        }))

    },

    findMaxSpeed: () => {
        set((state) => ({
            maxSpeed: Math.max(...state.speedRegisters),
        }));

    },
    calculateDistance: () => {
        set((state) => ({
            distance: state.distance + state.speed / 3600,
        }));
    },



}))