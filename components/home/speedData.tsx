import cms from "@/mocks/cms.json";
import { useRideStore } from "@/store/rideStore";
import { StyleSheet, Text, View } from "react-native";
import { useStore } from "zustand";

export function SpeedData() {
  const avgSpeed = useStore(useRideStore, (state) => state.avgSpeed);
  const maxSpeed = useStore(useRideStore, (state) => state.maxSpeed);

  function formatData(data: number, decimals: number): string {
    return Number(data).toFixed(decimals);
  }

  let { avgSpeedLabel, maxSpeedLabel } = cms.speedData;

  return (
    <View style={styles.flexContainer}>
      <View style={styles.subContainerOne}>
        <Text style={[styles.text, styles.dataText]}>
          {formatData(avgSpeed, 1)}
        </Text>
        <Text style={[styles.text, styles.label]}>{avgSpeedLabel}</Text>
      </View>
      <View style={styles.subContainerOne}>
        <Text style={[styles.text, styles.dataText]}>
          {formatData(maxSpeed, 1)}
        </Text>
        <Text style={[styles.text, styles.label]}>{maxSpeedLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  text: {
    textAlign: "center",
    color: "orange",
    fontSize: 30,
  },

  label: {
    fontSize: 20,
    lineHeight: 20,
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
