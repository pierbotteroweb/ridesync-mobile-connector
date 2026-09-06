import cms from "@/mocks/cms.json";
import { StyleSheet, Text, View } from "react-native";

export function SpeedData() {
  let { avgSpeedLabel, maxSpeedLabel, mockedAvgSpeedData, mockedMaxSpeedData } =
    cms.speedData;

  return (
    <View style={styles.flexContainer}>
      <View style={styles.subContainerOne}>
        <Text style={[styles.text, styles.dataText]}>{mockedAvgSpeedData}</Text>
        <Text style={[styles.text, styles.label]}>{avgSpeedLabel}</Text>
      </View>
      <View style={styles.subContainerOne}>
        <Text style={[styles.text, styles.dataText]}>{mockedMaxSpeedData}</Text>
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
