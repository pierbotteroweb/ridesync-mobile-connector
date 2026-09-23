import { useRideStore } from "@/store/rideStore";
import { useEffect } from "react";
import { interval } from "rxjs";
import { useStore } from "zustand";

export function useRideTimer(){

    const incrementTime = useStore(useRideStore, (state) => state.incrementTime)
    const status = useStore(useRideStore, (state) => state.status)

    useEffect(() => {

        if(status !== "running"){
            return
        }

        const subscription = interval(1000)
        .subscribe(() => {
            incrementTime()
        });

        return () => {
        subscription.unsubscribe();
        };



    },[status,incrementTime])

}