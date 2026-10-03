import { useRideStore } from "@/store/rideStore";
import { useEffect } from "react";
import { interval, tap } from "rxjs";
import { useStore } from "zustand";

export function useRideTimer(){

    const incrementTime = useStore(useRideStore, (state) => state.incrementTime)
    const calculateDistance = useStore(useRideStore, (state) => state.calculateDistance)
    const findAverageSpeed = useStore(useRideStore, (state) => state.findAverageSpeed)
    const findMaxSpeed = useStore(useRideStore, (state) => state.findMaxSpeed)
    const status = useStore(useRideStore, (state) => state.status)

    useEffect(() => {

        if(status !== "running"){
            return
        }

        const subscription = interval(1000).pipe(
            tap(()=> incrementTime()),
            tap(()=> calculateDistance()),
            tap(()=> findAverageSpeed()),
            tap(()=> findMaxSpeed()),
        ).subscribe();

        return () => {
        subscription.unsubscribe();
        };



    },[status,incrementTime])

}