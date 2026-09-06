import cms from "@/mocks/cms.json";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function Controls() {
  let { start, pause, finish } = cms.controls;
  return (
    <View style={styles.flexContainer}>
      <Pressable style={styles.controlButton}>
        <Text style={styles.buttonText}>{start}</Text>
      </Pressable>
      <Pressable style={styles.controlButton}>
        <Text style={styles.buttonText}>{pause}</Text>
      </Pressable>
      <Pressable style={styles.controlButton}>
        <Text style={styles.buttonText}>{finish}</Text>
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
    marginTop: 100,
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

  buttonText: {
    color: "black",
    fontSize: 20,
    fontWeight: 700,
  },
});
