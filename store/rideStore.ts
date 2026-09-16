import { createStore } from "zustand/vanilla";

type RideStore = {
    speed: number;
}


export const useRideStore = createStore<RideStore>(() => ({
    speed: 25.30
}))