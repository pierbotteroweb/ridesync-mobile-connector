import { StyleSheet, Text, View } from "react-native";

export function SpeedData() {
  return (
    <View style={styles.flexContainer}>
      <View style={styles.subContainerOne}>
        <Text style={[styles.text, styles.dataText]}>14,00</Text>
        <Text style={[styles.text, styles.label]}>Avg Speed (km/h)</Text>
      </View>
      <View style={styles.subContainerOne}>
        <Text style={[styles.text, styles.dataText]}>15,00</Text>
        <Text style={[styles.text, styles.label]}>Max Speed (km/h)</Text>
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
