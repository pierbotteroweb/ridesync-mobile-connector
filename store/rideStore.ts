import { createStore } from "zustand/vanilla";

type RideStatus = "idle" | "running" | "paused" | "finished"

type RideStore = {
    speed: number;
    time: number;
    setTime: (newTime: number) => void;
    incrementTime: ()=> void;
    status: RideStatus;
    setStatus: (newStatus: RideStatus) => void;
}


export const useRideStore = createStore<RideStore>((set) => ({
    speed: 25.30,
    time: 1000,
    status: "idle",
    setTime: (newTime:number) => set({ time: newTime }),
    setStatus: (newStatus: RideStatus) => set({ status: newStatus }),
    incrementTime: ()=>{
        set((state)=>({
            time:  state.status == "running" ? state.time + 1 : 
            (state.status == "paused" ? state.time : 0)
        }))
    }
}))