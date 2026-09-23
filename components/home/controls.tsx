import { useRideStore } from "@/store/rideStore";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, View } from "react-native";
import { useStore } from "zustand";

export function Controls() {
  const setStatus = useStore(useRideStore, (state) => state.setStatus);
  const rideStatus = useStore(useRideStore, (state) => state.status);

  const startRide = () => setStatus("running");
  const pauseRide = () => setStatus("paused");
  const resetRide = () => setStatus("idle");
  const endRide = () => setStatus("finished");

  function PlayPauseButtons() {
    return rideStatus == "finished" ? (
      <View style={styles.controlButton}>
        <Entypo name="controller-play" size={72} color="grey" />
      </View>
    ) : rideStatus == "paused" || rideStatus === "idle" ? (
      <Pressable onPress={startRide} style={styles.controlButton}>
        <Entypo name="controller-play" size={72} color="black" />
      </Pressable>
    ) : (
      <Pressable onPress={pauseRide} style={styles.controlButton}>
        <FontAwesome name="pause" size={52} color="black" />
      </Pressable>
    );
  }

  return (
    <View style={styles.flexContainer}>
      <PlayPauseButtons />

      {rideStatus === "paused" ? (
        <Pressable onPress={resetRide} style={styles.controlButton}>
          <MaterialIcons name="restart-alt" size={64} color="black" />
        </Pressable>
      ) : (
        <View style={styles.controlButton}>
          <MaterialIcons name="restart-alt" size={64} color="grey" />
        </View>
      )}
      <Pressable onPress={endRide} style={styles.controlButton}>
        <MaterialCommunityIcons name="flag-checkered" size={52} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    paddingTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    textAlign: "center",
    marginTop: 20,
  },

  controlButton: {
    width: 100,
    height: 100,
    display: "flex",
    borderRadius: 50,
    verticalAlign: "middle",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 30,
    backgroundColor: "orange",
  },
});
