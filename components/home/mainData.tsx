import cms from "@/mocks/cms.json";
import { useRideStore } from "@/store/rideStore";
import { StyleSheet, Text, View } from "react-native";
import { useStore } from "zustand";

export function MainData() {
  function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0) {
      return "99:99:99";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }
  const homeCms = cms.home;

  const speed = useStore(useRideStore, (state) => state.speed);
  const time = useStore(useRideStore, (state) => state.time);

  return (
    <View style={styles.flexContainerVertical}>
      <Text style={[styles.text, styles.time]}>{formatTime(time)}</Text>
      <Text style={[styles.text, styles.speed]}>{speed}</Text>
      <Text style={[styles.text, styles.label]}>{homeCms.speedLabel}</Text>
      <View style={styles.flexContainer}>
        <View style={styles.subContainerOne}>
          <Text style={[styles.text, styles.dataText]}>{homeCms.distance}</Text>
          <Text style={[styles.text, styles.label]}>
            {homeCms.distanceLabel}
          </Text>
        </View>
        <View style={styles.subContainerOne}>
          <Text style={[styles.text, styles.dataText]}>{homeCms.heart}</Text>
          <Text style={[styles.text, styles.label]}>{homeCms.heartLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    color: "orange",
    fontSize: 30,
  },

  time: {
    fontSize: 70,
    fontFamily: "Orbitron",
  },

  speed: {
    fontSize: 100,
    lineHeight: 180,
    fontFamily: "Orbitron",
    transform: [{ scaleY: 1.5 }],
  },

  label: {
    fontSize: 20,
    lineHeight: 20,
  },

  flexContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    textAlign: "center",
  },

  flexContainerVertical: {
    display: "flex",
    justifyContent: "flex-end",
  },

  subContainerOne: {
    alignItems: "center",
    marginTop: 20,
  },

  dataText: {
    fontSize: 60,
    lineHeight: 60,
    fontFamily: "Orbitron",
  },
});
