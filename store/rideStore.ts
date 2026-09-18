import { createStore } from "zustand/vanilla";

type RideStore = {
    speed: number;
    time: number;
    setTime: (newTime: number) => void;
    incrementTime: ()=> void;
}


export const useRideStore = createStore<RideStore>((set) => ({
    speed: 25.30,
    time: 1000,
    setTime: (newTime:number) => set({ time: newTime }),
    incrementTime: ()=>{
        set((state)=>({
            time: state.time + 1
        }))
    }
}))